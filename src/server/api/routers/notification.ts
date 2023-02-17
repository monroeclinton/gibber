import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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

export const notificationRouter = createTRPCRouter({
    getByProfileId: protectedProcedure
        .input(
            z.object({
                profileId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
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

            return ctx.prisma.notification.findMany({
                where: {
                    notifiedId: input.profileId,
                },
                include: {
                    notifier: {
                        include: {
                            header: true,
                            avatar: true,
                        },
                    },
                    notified: {
                        include: {
                            header: true,
                            avatar: true,
                        },
                    },
                    post: {
                        include: postInclude,
                    },
                },
            });
        }),
});
