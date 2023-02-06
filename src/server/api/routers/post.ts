import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import probe from "probe-image-size";
import type { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { env } from "../../../env/server.mjs";
import { s3Client, s3Server } from "../../s3";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const basePostInclude = {
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

const postInclude = {
    ...basePostInclude,
    reblog: {
        include: basePostInclude,
    },
};

export const postRouter = createTRPCRouter({
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUniqueOrThrow({
                where: {
                    id: input.id,
                },
                include: postInclude,
            });

            const reblogs = await ctx.prisma.post.findMany({
                where: {
                    id: input.id,
                    content: null,
                    NOT: {
                        reblogId: null,
                    },
                },
            });

            const favorites = await ctx.prisma.favorite.findMany({
                where: {
                    id: input.id,
                },
            });

            const reblogIds = reblogs.map((reblog) => reblog.reblogId);
            const favoriteIds = favorites.map((favorite) => favorite.postId);

            let reblog = {};
            if (post.reblog) {
                const isReblogged = reblogIds.includes(post.reblog.id);
                const isFavorited = favoriteIds.includes(post.reblog.id);

                reblog = {
                    reblog: {
                        isReblogged,
                        isFavorited,
                        ...post.reblog,
                    },
                };
            }

            const isReblogged = reblogIds.includes(post.id);
            const isFavorited = favoriteIds.includes(post.id);

            return { isReblogged, isFavorited, ...post, ...reblog };
        }),
    getByProfileId: publicProcedure
        .input(z.object({ profileId: z.string() }))
        .query(async ({ ctx, input }) => {
            // TODO: Filter on account
            const posts = await ctx.prisma.post.findMany({
                where: {
                    profileId: input.profileId,
                },
                orderBy: [
                    {
                        createdAt: "desc",
                    },
                ],
                include: postInclude,
            });

            const reblogs = await ctx.prisma.post.findMany({
                where: {
                    profileId: input.profileId,
                    content: null,
                    NOT: {
                        reblogId: null,
                    },
                },
            });

            const favorites = await ctx.prisma.favorite.findMany({
                where: {
                    profileId: input.profileId,
                },
            });

            const reblogIds = reblogs.map((reblog) => reblog.reblogId);
            const favoriteIds = favorites.map((favorite) => favorite.postId);

            return posts.map((post) => {
                let reblog = {};
                if (post.reblog) {
                    const isReblogged = reblogIds.includes(post.reblog.id);
                    const isFavorited = favoriteIds.includes(post.reblog.id);

                    reblog = {
                        reblog: {
                            isReblogged,
                            isFavorited,
                            ...post.reblog,
                        },
                    };
                }

                const isReblogged = reblogIds.includes(post.id);
                const isFavorited = favoriteIds.includes(post.id);

                return { isReblogged, isFavorited, ...post, ...reblog };
            });
        }),
    getFeedByProfileId: publicProcedure
        .input(z.object({ profileId: z.string() }))
        .query(async ({ ctx, input }) => {
            const follows = await ctx.prisma.follow.findMany({
                where: {
                    followerId: input.profileId,
                },
            });

            // TODO: Make protected
            const posts = await ctx.prisma.post.findMany({
                where: {
                    profileId: {
                        in: [
                            input.profileId,
                            ...follows.map((follow) => follow.followedId),
                        ],
                    },
                },
                orderBy: [
                    {
                        createdAt: "desc",
                    },
                ],
                include: postInclude,
            });

            const reblogs = await ctx.prisma.post.findMany({
                where: {
                    profileId: input.profileId,
                    content: null,
                    NOT: {
                        reblogId: null,
                    },
                },
            });

            const favorites = await ctx.prisma.favorite.findMany({
                where: {
                    profileId: input.profileId,
                },
            });

            const reblogIds = reblogs.map((reblog) => reblog.reblogId);
            const favoriteIds = favorites.map((favorite) => favorite.postId);

            return posts.map((post) => {
                let reblog = {};
                if (post.reblog) {
                    const isReblogged = reblogIds.includes(post.reblog.id);
                    const isFavorited = favoriteIds.includes(post.reblog.id);

                    reblog = {
                        reblog: {
                            isReblogged,
                            isFavorited,
                            ...post.reblog,
                        },
                    };
                }

                const isReblogged = reblogIds.includes(post.id);
                const isFavorited = favoriteIds.includes(post.id);

                return { isReblogged, isFavorited, ...post, ...reblog };
            });
        }),
    create: protectedProcedure
        .input(
            z.object({
                profileId: z.string(),
                content: z.string(),
                files: z
                    .array(
                        z.object({
                            key: z.string().min(1),
                            ext: z.string().min(1),
                        })
                    )
                    .max(4),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.$transaction(async (tx) => {
                const session = ctx.session;
                const files = input.files;

                const hasPermission = await ctx.prisma.profile
                    .findFirst({
                        where: {
                            id: input.profileId,
                            userId: session.user.id,
                        },
                    })
                    .then((r) => Boolean(r));

                if (!hasPermission) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You do not have access to this profile.",
                    });
                }

                const post = await tx.post.create({
                    data: {
                        profileId: input.profileId,
                        content: input.content,
                    },
                });

                for (const upload of files) {
                    const uuid = uuidv4();
                    const name = uuid + "." + upload.ext;

                    await s3Server.send(
                        new CopyObjectCommand({
                            Bucket: env.S3_BUCKET,
                            CopySource: `${env.S3_BUCKET}/${upload.key}`,
                            Key: name,
                        })
                    );

                    await s3Server.send(
                        new DeleteObjectCommand({
                            Bucket: env.S3_BUCKET,
                            Key: upload.key,
                        })
                    );

                    const object = await s3Server.send(
                        new GetObjectCommand({
                            Bucket: env.S3_BUCKET,
                            Key: name,
                        })
                    );

                    const fileType = await probe(object.Body as Readable);

                    if (
                        !object.ContentLength ||
                        !fileType ||
                        upload.ext !== fileType.type
                    ) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Invalid file uploaded.",
                        });
                    }

                    const file = await tx.file.create({
                        data: {
                            type: "IMAGE",
                            url: env.S3_WEB_ENDPOINT + "/" + name,
                            mime: fileType.mime,
                            extension: upload.ext,
                            name,
                            size: object.ContentLength,
                            width: fileType.height,
                            height: fileType.width,
                        },
                    });

                    await tx.attachment.create({
                        data: {
                            postId: post.id,
                            fileId: file.id,
                        },
                    });
                }

                return tx.post.findUniqueOrThrow({
                    where: {
                        id: post.id,
                    },
                    include: postInclude,
                });
            });
        }),
    createPresignedUrls: protectedProcedure
        .input(z.object({ count: z.number().gte(1).lte(4) }))
        .query(async ({ input }) => {
            const urls = [];

            for (let i = 0; i < input.count; i++) {
                const key = uuidv4();

                const url = await getSignedUrl(
                    s3Client,
                    new PutObjectCommand({
                        Bucket: env.S3_BUCKET,
                        Key: key,
                    })
                );

                urls.push({
                    url,
                    key,
                });
            }

            return urls;
        }),
});
