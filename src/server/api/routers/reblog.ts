import { z } from "zod";

import { createTRPCRouter, protectedProcedureWithProfile } from "../trpc";

export const reblogRouter = createTRPCRouter({
    create: protectedProcedureWithProfile
        .input(
            z.object({
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const profile = ctx.profile;

            const post = await ctx.prisma.post.create({
                data: {
                    profileId: profile?.id as string,
                    reblogId: input.postId,
                },
            });

            await ctx.prisma.post.update({
                where: { id: input.postId },
                data: { reblogsCount: { increment: 1 } },
            });

            return post;
        }),
    delete: protectedProcedureWithProfile
        .input(
            z.object({
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const profile = ctx.profile;

            const post = await ctx.prisma.post.deleteMany({
                where: {
                    content: null,
                    profileId: profile?.id as string,
                    reblogId: input.postId,
                },
            });

            await ctx.prisma.post.update({
                where: { id: input.postId },
                data: { reblogsCount: { decrement: 1 } },
            });

            return post;
        }),
});
