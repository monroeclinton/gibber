import zod from "zod";

import { PostWithRelationsSchema } from "../../prisma/generated/zod";
import { type Post } from "../types/post";

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

export const fetchRemoteProfile = async (username: string, domain: string) => {
    const actor = await fetchRemoteActor(username, domain);

    // TODO: Clean up and persist profile
    return {
        isFollowing: false,
        // TODO: Use proper actor id by having getByProfileId support it
        id: `${username}@${domain}`,
        userId: null,
        headerId: null,
        avatarId: null,
        name: actor.name,
        domain: domain,
        username: actor.preferredUsername,
        summary: actor.summary,
        followingCount: 0,
        followersCount: 0,
        createdAt: new Date(actor.published),
        updatedAt: null,
        header: actor.image && {
            url: actor.image.url,
        },
        avatar: actor.icon && {
            url: actor.icon?.url,
        },
    };
};

export const fetchRemotePosts = async (username: string, domain: string) => {
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

    const profile = await fetchRemoteProfile(username, domain);

    const posts = [];
    for (const item of outboxPage.orderedItems) {
        // TODO: Clean up and post
        posts.push({
            isReblogged: false,
            isFavorited: false,
            id: item.object.id,
            profileId: item.object.attributedTo,
            inReplyToId: null,
            reblogId: null,
            content: item.object.content,
            repliesCount: 0,
            reblogsCount: 0,
            favoritesCount: 0,
            createdAt: new Date(item.object.published),
            updatedAt: new Date(item.object.published),
            profile,
            attachments: [],
            reblog: null,
        });
    }

export const parsePosts = (json: unknown): Post[] => {
    const activities = postActivity.parse(json);
    return activities.map((activity) => activity.object as Post);
};
