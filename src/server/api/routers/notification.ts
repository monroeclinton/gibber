import { createTRPCRouter, protectedProcedureWithProfile } from "../trpc";

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
    get: protectedProcedureWithProfile.query(async ({ ctx }) => {
        const profile = ctx.profile;

        return ctx.prisma.notification.findMany({
            where: {
                notifiedId: profile?.id as string,
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
