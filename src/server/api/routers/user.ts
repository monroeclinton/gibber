import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
    delete: protectedProcedure.mutation(async ({ ctx }) => {
        const session = ctx.session;

        return ctx.prisma.user.delete({
            where: { id: session.user.id },
        });
    }),
});
