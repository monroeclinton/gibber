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
    icon?: {
        url: string;
    };
    image?: {
        url: string;
    };
};

export const fetchRemoteProfile = async (username: string, domain: string) => {
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

    const actor = (await actorResponse.json()) as ActorResponse;

    return {
        isFollowing: false,
        id: actor.id,
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

const postActivity = zod.array(
    zod.object({
        object: PostWithRelationsSchema,
    })
);

export const parsePosts = (json: unknown): Post[] => {
    const activities = postActivity.parse(json);
    return activities.map((activity) => activity.object as Post);
};
