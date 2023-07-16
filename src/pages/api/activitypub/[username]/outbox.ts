import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "../../../../env.mjs";
import { prisma } from "../../../../server/db";
import { postInclude } from "../../../../types/post";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username } = req.query;

    const posts = await prisma.post.findMany({
        where: {
            profile: {
                username: username as string,
            },
        },
        include: postInclude,
    });

    const activities = posts.map((post) => {
        return {
            "@context": "https://www.w3.org/ns/activitystreams",
            type: "Create",
            id: `${env.WEB_URL}/post/${post.id}`,
            to: ["https://www.w3.org/ns/activitystreams#Public"],
            actor: `${env.WEB_URL}/activitypub/${username as string}`,
            object: post,
        };
    });

    res.status(200).json(activities);
};

export default handler;
