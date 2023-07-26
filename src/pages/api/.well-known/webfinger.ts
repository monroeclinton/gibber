import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "../../../env.mjs";
import { prisma } from "../../../server/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { resource } = req.query;

    const profile = await prisma.profile.findUniqueOrThrow({
        where: {
            username: resource as string,
        },
    });

    res.status(200).json({
        subject: resource,
        aliases: [
            `${env.WEB_URL}/${profile.username}`,
            `${env.WEB_URL}/api/activitypub/${profile.username}`,
        ],
        links: [
            {
                rel: "http://webfinger.net/rel/profile-page",
                type: "text/html",
                href: `${env.WEB_URL}/${profile.username}`,
            },
            {
                rel: "self",
                type: "application/activity+json",
                href: `${env.WEB_URL}/api/activitypub/${profile.username}`,
            },
        ],
    });
};

export default handler;
