import zod from "zod";

import { PostWithRelationsSchema } from "../../prisma/generated/zod";
import { type Post } from "../types/post";

const postActivity = zod.array(
    zod.object({
        object: PostWithRelationsSchema,
    })
);

export const parsePosts = (json: unknown): Post[] => {
    const activities = postActivity.parse(json);
    return activities.map((activity) => activity.object as Post);
};
