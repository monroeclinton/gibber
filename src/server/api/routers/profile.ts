import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "../../../env/server.mjs";
import uploadFile from "../../../utils/upload-file";
import {
    createTRPCRouter,
    protectedProcedure,
    protectedProcedureWithProfile,
    publicProcedure,
} from "../trpc";

const profileInclude = {
    header: true,
    avatar: true,
};

export const profileRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        const session = ctx.session;

        return ctx.prisma.profile.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
            ],
            include: profileInclude,
        });
    }),
    getDiscover: publicProcedure.query(async ({ ctx }) => {
        const take = 5;
        const count = await ctx.prisma.profile.count();
        const skip = count > take ? Math.floor(Math.random() * count) : 0;

        return ctx.prisma.profile.findMany({
            take,
            skip,
            include: profileInclude,
        });
    }),
    getByUsername: publicProcedure
        .input(
            z.object({
                username: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            if (input.username.includes("@")) {
                const [username, server] = input.username.split("@");

                const res = await fetch(
                    `http://${server as string}/api/activitypub/${
                        username as string
                    }`
                );

                return res.json();
            }

            const profile = await ctx.prisma.profile.findFirst({
                where: {
                    username: input.username,
                },
                include: profileInclude,
            });

            if (!profile) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Profile not found.",
                });
            }

            let isFollowing = false;

            if (ctx.profile?.id) {
                isFollowing = await ctx.prisma.follow
                    .findFirst({
                        where: {
                            followedId: profile.id,
                            followerId: ctx.profile?.id,
                        },
                    })
                    .then((r) => r !== null);
            }

            return {
                isFollowing,
                ...profile,
            };
        }),
    getById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const profile = await ctx.prisma.profile.findFirst({
                where: {
                    id: input.id,
                },
                include: profileInclude,
            });

            if (!profile) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Profile not found.",
                });
            }

            return profile;
        }),
    createFriendship: protectedProcedureWithProfile
        .input(
            z.object({
                followedId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const profile = ctx.profile;

            const data = {
                followedId: input.followedId,
                followerId: profile?.id as string,
            };

            const follow = await ctx.prisma.follow.findFirst({
                where: data,
            });

            if (!follow) {
                await ctx.prisma.profile.update({
                    where: { id: data.followedId },
                    data: { followersCount: { increment: 1 } },
                });

                await ctx.prisma.profile.update({
                    where: { id: data.followerId },
                    data: { followingCount: { increment: 1 } },
                });

                return await ctx.prisma.follow.create({
                    data,
                });
            }

            return follow;
        }),
    deleteFriendship: protectedProcedureWithProfile
        .input(
            z.object({
                followedId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const profile = ctx.profile;

            const data = {
                followedId: input.followedId,
                followerId: profile?.id as string,
            };

            const follow = await ctx.prisma.follow.findFirst({
                where: data,
            });

            if (follow) {
                await ctx.prisma.profile.update({
                    where: { id: data.followedId },
                    data: { followersCount: { decrement: 1 } },
                });

                await ctx.prisma.profile.update({
                    where: { id: data.followerId },
                    data: { followingCount: { decrement: 1 } },
                });

                return await ctx.prisma.follow.delete({
                    where: {
                        followedId_followerId: data,
                    },
                });
            }

            return follow;
        }),
    following: publicProcedure
        .input(
            z.object({
                profileId: z.string(),
            })
        )
        .query(({ ctx, input }) => {
            return ctx.prisma.follow.findMany({
                where: {
                    followerId: input.profileId,
                },
                include: {
                    followed: {
                        include: {
                            header: true,
                            avatar: true,
                        },
                    },
                },
            });
        }),
    followers: publicProcedure
        .input(
            z.object({
                profileId: z.string(),
            })
        )
        .query(({ ctx, input }) => {
            return ctx.prisma.follow.findMany({
                where: {
                    followedId: input.profileId,
                },
                include: {
                    follower: {
                        include: {
                            header: true,
                            avatar: true,
                        },
                    },
                },
            });
        }),
    upsert: protectedProcedure
        .input(
            z.object({
                header: z
                    .object({
                        key: z.string().min(1),
                        ext: z.string().min(1),
                    })
                    .or(z.undefined()),
                avatar: z
                    .object({
                        key: z.string().min(1),
                        ext: z.string().min(1),
                    })
                    .or(z.undefined()),
                name: z.string().min(1),
                username: z
                    .string()
                    .regex(new RegExp("^[a-zA-Z0-9_]*$"))
                    .min(1),
                summary: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            // TODO: transaction/better verification
            const hasPermission = await ctx.prisma.profile
                .findFirst({
                    where: {
                        username: input.username,
                    },
                })
                .then((r) => r === null || r.userId === session.user.id);

            if (!hasPermission) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have access to this profile.",
                });
            }

            let header = {};
            if (input.header) {
                const { name, size, type } = await uploadFile(
                    input.header.key,
                    input.header.ext
                );

                const file = await ctx.prisma.file.create({
                    data: {
                        type: "IMAGE",
                        url: env.S3_WEB_ENDPOINT + "/" + name,
                        mime: type.mime,
                        extension: input.header.ext,
                        name,
                        size,
                        width: type.height,
                        height: type.width,
                    },
                });

                header = {
                    headerId: file.id,
                };
            }

            let avatar = {};
            if (input.avatar) {
                const { name, size, type } = await uploadFile(
                    input.avatar.key,
                    input.avatar.ext
                );

                const file = await ctx.prisma.file.create({
                    data: {
                        type: "IMAGE",
                        url: env.S3_WEB_ENDPOINT + "/" + name,
                        mime: type.mime,
                        extension: input.avatar.ext,
                        name,
                        size,
                        width: type.height,
                        height: type.width,
                    },
                });

                avatar = {
                    avatarId: file.id,
                };
            }

            const data = {
                ...header,
                ...avatar,
                userId: session.user.id,
                name: input.name,
                username: input.username,
                summary: input.summary,
            };

            return ctx.prisma.profile.upsert({
                where: {
                    username: input.username,
                },
                update: data,
                create: data,
                include: profileInclude,
            });
        }),
});
