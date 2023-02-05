import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const reblogRouter = createTRPCRouter({
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

            const post = await ctx.prisma.post.create({
                data: {
                    profileId: input.profileId,
                    reblogId: input.postId,
                },
            });

            await ctx.prisma.post.update({
                where: { id: input.postId },
                data: { reblogsCount: { increment: 1 } },
            });

            return post;
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

            const post = await ctx.prisma.post.delete({
                where: {
                    profileId_reblogId: {
                        profileId: input.profileId,
                        reblogId: input.postId,
                    },
                },
            });

            await ctx.prisma.post.update({
                where: { id: input.postId },
                data: { reblogsCount: { decrement: 1 } },
            });

            return post;
        }),
});
