import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const favoriteRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                profileId: z.string(),
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            const hasPermission = await ctx.prisma.profile
                .findFirst({
                    where: {
                        id: input.profileId,
                    },
                })
                .then((r) => r === null || r.userId === session.user.id);

            if (!hasPermission) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have access to this profile.",
                });
            }

            const favorite = await ctx.prisma.favorite.create({
                data: input,
            });

            const post = await ctx.prisma.post.update({
                where: { id: input.postId },
                data: { favoritesCount: { increment: 1 } },
            });

            await ctx.prisma.notification.create({
                data: {
                    postId: input.postId,
                    notifierId: input.profileId,
                    notifiedId: post.profileId,
                    type: "FAVORITE",
                },
            });

            return favorite;
        }),
    delete: protectedProcedure
        .input(
            z.object({
                profileId: z.string(),
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            const hasPermission = await ctx.prisma.profile
                .findFirst({
                    where: {
                        id: input.profileId,
                    },
                })
                .then((r) => r === null || r.userId === session.user.id);

            if (!hasPermission) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not have access to this profile.",
                });
            }

            const favorite = await ctx.prisma.favorite.delete({
                where: {
                    postId_profileId: input,
                },
            });

            await ctx.prisma.post.update({
                where: { id: input.postId },
                data: { favoritesCount: { decrement: 1 } },
            });

            return favorite;
        }),
});
