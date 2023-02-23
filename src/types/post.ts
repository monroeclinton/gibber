import type { Prisma } from "@prisma/client";

export const basePostInclude = {
    profile: {
        include: {
            header: true,
            avatar: true,
        },
    },
    attachments: {
        include: {
            file: true,
        },
    },
};

export const postInclude = {
    ...basePostInclude,
    reblog: {
        include: basePostInclude,
    },
};

export type BasePost = Prisma.PostGetPayload<{
    include: typeof postInclude;
}>;

export type WithInteractions<T> = T & {
    isReblogged?: boolean;
    isFavorited?: boolean;
};

export type WithReblog<T> = T & {
    reblog: WithReblog<T> | null;
};

export type Post = WithReblog<WithInteractions<BasePost>>;
