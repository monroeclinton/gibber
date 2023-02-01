import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const profileInclude = {
    avatar: true,
};

export const profileRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        const session = ctx.session;

        return ctx.prisma.profile.findMany({
            where: {
                user: session.user,
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
            ],
            include: profileInclude,
        });
    }),
    getById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(({ ctx, input }) => {
            return ctx.prisma.profile.findFirstOrThrow({
                where: {
                    id: input.id,
                },
                include: profileInclude,
            });
        }),
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                username: z
                    .string()
                    .regex(new RegExp("^[a-zA-Z0-9_]*$"))
                    .min(1),
                summary: z.string(),
            })
        )
        .mutation(({ ctx, input }) => {
            const session = ctx.session;

            return ctx.prisma.profile.create({
                data: {
                    userId: session.user.id,
                    name: input.name,
                    username: input.username,
                    summary: input.summary,
                },
                include: profileInclude,
            });
        }),
});
