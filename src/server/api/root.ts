import { favoriteRouter } from "./routers/favorite";
import { notificationRouter } from "./routers/notification";
import { postRouter } from "./routers/post";
import { profileRouter } from "./routers/profile";
import { reblogRouter } from "./routers/reblog";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
    favorite: favoriteRouter,
    notification: notificationRouter,
    post: postRouter,
    profile: profileRouter,
    reblog: reblogRouter,
    user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
