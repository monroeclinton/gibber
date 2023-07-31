import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "../../../../env.mjs";
import { prisma } from "../../../../server/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username } = req.query;

    const profile = await prisma.profile.findUniqueOrThrow({
        where: {
            username_domain: {
                username: username as string,
                domain: env.WEB_URL,
            },
        },
        include: {
            avatar: true,
            header: true,
        },
    });

    res.status(200).json({
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        id: `${env.WEB_URL}/api/activitypub/${profile.username}`,
        name: profile.name,
        username: profile.username,
        summary: profile.summary,
        outbox: `${env.WEB_URL}/api/activitypub/${profile.username}/outbox`,
        published: profile.createdAt,
        url: `${env.WEB_URL}/${profile.username}`,
        ...(profile.avatar && {
            icon: {
                type: "Image",
                mediaType: profile.avatar.mime,
                url: profile.avatar.url,
            },
        }),
        ...(profile.header && {
            image: {
                type: "Image",
                mediaType: profile.header.mime,
                url: profile.header.url,
            },
        }),
    });
};

export default handler;
