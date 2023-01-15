import { createTRPCRouter } from "./trpc";
import { personRouter } from "./routers/person";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
    person: personRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
