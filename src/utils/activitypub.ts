import { PutObjectCommand } from "@aws-sdk/client-s3";
import probe from "probe-image-size";
import { v4 as uuidv4 } from "uuid";

import { env } from "../env.mjs";
import { prisma } from "../server/db";
import { s3Server } from "../server/s3";
import { postInclude } from "../types/post";

type WebFingerResponse = {
    links?: Array<{
        rel?: string;
        type?: string;
        href?: string;
    }>;
};

type ActorResponse = {
    id: string;
    name: string;
    summary: string;
    published: string;
    preferredUsername: string;
    outbox: string;
    icon?: {
        url: string;
    };
    image?: {
        url: string;
    };
};

type OutboxResponse = {
    first: string;
};

type OutboxPageResponse = {
    orderedItems: Array<{
        object: {
            id: string;
            attributedTo: string;
            content: string;
            published: string;
        };
    }>;
};

const fetchRemoteActor = async (
    username: string,
    domain: string
): Promise<ActorResponse> => {
    const address = `${username}@${domain}`;

    // TODO: Make HTTPS
    const webFingerResponse = await fetch(
        `https://${domain}/.well-known/webfinger?resource=acct:${address}`
    );

    const webFinger = (await webFingerResponse.json()) as WebFingerResponse;

    const selfUrl: string | undefined = webFinger?.links?.find(
        (link) =>
            link?.rel === "self" && link?.type === "application/activity+json"
    )?.href;

    if (!selfUrl) {
        throw new Error("Invalid WebFinger response for " + address);
    }

    const actorResponse = await fetch(selfUrl, {
        headers: {
            Accept: "application/activity+json",
        },
    });

    return (await actorResponse.json()) as ActorResponse;
};

export const upsertRemoteProfile = async (username: string, domain: string) => {
    const profile = await prisma.profile.findUnique({
        where: {
            username_domain: {
                username,
                domain,
            },
        },
        include: {
            avatar: true,
            header: true,
        },
    });

    if (profile) {
        return profile;
    }

    const actor = await fetchRemoteActor(username, domain);

    // TODO: Remove duplicated code by creating a function to upload files to S3
    let header = {};
    if (actor.image) {
        const image = await fetch(actor.image.url);
        const body = await image.arrayBuffer();
        const type = await probe(actor.image.url);
        const uuid = uuidv4();
        const name = uuid + "." + type.type;

        await s3Server.send(
            new PutObjectCommand({
                Body: Buffer.from(body),
                Bucket: env.S3_BUCKET,
                Key: name,
            })
        );

        const file = await prisma.file.create({
            data: {
                type: "IMAGE",
                url: env.S3_WEB_ENDPOINT + "/" + name,
                mime: type.mime,
                extension: type.type,
                name,
                size: body.byteLength,
                width: type.height,
                height: type.width,
            },
        });

        header = {
            headerId: file.id,
        };
    }

    let avatar = {};
    if (actor.icon) {
        const image = await fetch(actor.icon.url);
        const body = await image.arrayBuffer();
        const type = await probe(actor.icon.url);
        const uuid = uuidv4();
        const name = uuid + "." + type.type;

        await s3Server.send(
            new PutObjectCommand({
                Body: Buffer.from(body),
                Bucket: env.S3_BUCKET,
                Key: name,
            })
        );

        const file = await prisma.file.create({
            data: {
                type: "IMAGE",
                url: env.S3_WEB_ENDPOINT + "/" + name,
                mime: type.mime,
                extension: type.type,
                name,
                size: body.byteLength,
                width: type.height,
                height: type.width,
            },
        });

        avatar = {
            avatarId: file.id,
        };
    }

    const data = {
        // TODO: Use proper actor id by having getByProfileId support it
        ...header,
        ...avatar,
        id: `${username}@${domain}`,
        name: actor.name,
        domain: domain,
        username: actor.preferredUsername,
        summary: actor.summary,
        createdAt: new Date(actor.published),
    };

    return await prisma.profile.upsert({
        where: {
            username_domain: {
                username,
                domain,
            },
        },
        update: data,
        create: data,
        include: {
            avatar: true,
            header: true,
        },
    });
};

export const upsertRemotePosts = async (username: string, domain: string) => {
    const actor = await fetchRemoteActor(username, domain);

    const outboxResponse = await fetch(actor.outbox, {
        headers: {
            Accept: "application/activity+json",
        },
    });

    const outbox = (await outboxResponse.json()) as OutboxResponse;

    const outboxPageResponse = await fetch(outbox.first, {
        headers: {
            Accept: "application/activity+json",
        },
    });

    const outboxPage = (await outboxPageResponse.json()) as OutboxPageResponse;

    const profile = await upsertRemoteProfile(username, domain);

    const posts = [];
    for (const item of outboxPage.orderedItems) {
        const data = {
            id: item.object.id,
            profileId: profile.id,
            content: item.object.content,
            createdAt: new Date(item.object.published),
            updatedAt: new Date(item.object.published),
        };

        // TODO: Bulk upsert
        const post = await prisma.post.upsert({
            where: {
                id: data.id,
            },
            update: data,
            create: data,
            include: postInclude,
        });

        posts.push(post);
    }

    return posts;
};
