import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const profileInclude = {
    header: true,
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
    getByUsername: publicProcedure
        .input(
            z.object({
                username: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
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

            return profile;
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
    upsert: protectedProcedure
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

            const data = {
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
