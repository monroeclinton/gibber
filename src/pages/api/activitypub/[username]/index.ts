import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "../../../../env.mjs";
import { prisma } from "../../../../server/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username } = req.query;

    const profile = await prisma.profile.findUniqueOrThrow({
        where: {
            username: username as string,
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
    });
};

export default handler;
