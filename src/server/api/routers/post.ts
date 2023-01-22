import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const postInclude = {
    user: true,
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
                include: postInclude,
            });
        }),
    create: protectedProcedure
        .input(z.object({ content: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            return ctx.prisma.post.create({
                data: {
                    userId: session.user.id,
                    content: input.content,
                },
                include: postInclude,
            });
        }),
});
