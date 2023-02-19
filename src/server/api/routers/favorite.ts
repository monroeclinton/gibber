import { z } from "zod";

import { createTRPCRouter, protectedProcedureWithProfile } from "../trpc";

export const favoriteRouter = createTRPCRouter({
    create: protectedProcedureWithProfile
        .input(
            z.object({
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const profile = ctx.profile;

            const favorite = await ctx.prisma.favorite.create({
                data: {
                    profileId: profile?.id as string,
                    postId: input.postId,
                },
            });

            const post = await ctx.prisma.post.update({
                where: { id: input.postId },
                data: { favoritesCount: { increment: 1 } },
            });

            await ctx.prisma.notification.create({
                data: {
                    postId: input.postId,
                    notifierId: profile?.id as string,
                    notifiedId: post.profileId,
                    type: "FAVORITE",
                },
            });

            return favorite;
        }),
    delete: protectedProcedureWithProfile
        .input(
            z.object({
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const profile = ctx.profile;

            const favorite = await ctx.prisma.favorite.delete({
                where: {
                    postId_profileId: {
                        profileId: profile?.id as string,
                        postId: input.postId,
                    },
                },
            });

            await ctx.prisma.post.update({
                where: { id: input.postId },
                data: { favoritesCount: { decrement: 1 } },
            });

            return favorite;
        }),
});
