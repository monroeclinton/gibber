import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const personRouter = createTRPCRouter({
    getByUsername: publicProcedure
        .input(z.object({ username: z.string() }))
        .query(({ input }) => {
            return {
                id: "example-id",
                avatar: "/avatar.png",
                header: "/header.png",
                name: "Monroe Programs",
                username: "mornoeprograms",
                address: "monroeprograms@localhost:3000",
                summary:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed consectetur interdum orci quis pretium. Sed placerat molestie velit, eu feugiat est condimentum vel",
                followersCount: 211,
                followingCount: 300,
            };
        }),
});
