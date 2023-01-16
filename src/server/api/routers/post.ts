import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
    getByAccountId: publicProcedure
        .input(z.object({ accountId: z.string() }))
        .query(({ input }) => {
            return {
                id: "example-id",
                createdAt: new Date(),
                content:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
                attachments: [
                    {
                        id: "1",
                        description: "Field of grass",
                        url: "/1.jpg",
                        width: 1062,
                        height: 708,
                    },
                    {
                        id: "2",
                        description: "Neon pipes",
                        url: "/2.jpg",
                        width: 3008,
                        height: 2000,
                    },
                    {
                        id: "3",
                        description: "Space shuttle",
                        url: "/3.jpg",
                        width: 6084,
                        height: 6084,
                    },
                ],
                repliesCount: 102,
                reblogsCount: 24,
                favoritesCount: 313,
                account: {
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
                },
            };
        }),
});
