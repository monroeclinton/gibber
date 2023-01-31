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

const postInclude = {
    profile: {
        include: {
            avatar: true,
        },
    },
    attachments: {
        include: {
            file: true,
        },
    },
};

export const postRouter = createTRPCRouter({
    getByUserId: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(({ ctx }) => {
            // TODO: Filter on account
            return ctx.prisma.post.findMany({
                orderBy: [
                    {
                        createdAt: "desc",
                    },
                ],
                include: postInclude,
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
