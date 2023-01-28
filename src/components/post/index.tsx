import {
    ArrowPathRoundedSquareIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
} from "@heroicons/react/24/outline";
import type { Prisma } from "@prisma/client";
import Image from "next/image";

import Attachments from "./Attachments";

type IPost = Prisma.PostGetPayload<{
    include: {
        user: true;
        attachments: {
            include: {
                file: true;
            };
        };
    };
}>;

const Post: React.FC<{ post: IPost }> = ({ post }) => {
    return (
        <div className="border-b-2 border-neutral-50 px-6 py-5">
            <div className="flex">
                <div className="h-[50px] w-[50px] overflow-hidden rounded-full">
                    {post.user.image && (
                        <Image
                            alt="Person's avatar"
                            src={post.user.image}
                            width={50}
                            height={50}
                        />
                    )}
                </div>
                <div className="ml-3.5 flex flex-col justify-center">
                    <p>{post.user.name}</p>
                    <p className="text-sm">
                        {post.createdAt.toLocaleDateString()}
                    </p>
                </div>
            </div>
            {post.content && (
                <div className="mt-3.5">
                    <p>{post.content}</p>
                </div>
            )}
            {post.attachments.length > 0 && (
                <div className="mt-3.5 h-[250px]">
                    <Attachments attachments={post.attachments} />
                </div>
            )}
            <div className="mt-3.5 flex justify-between">
                <div className="flex items-center">
                    <ChatBubbleLeftIcon
                        className="mr-3"
                        width={20}
                        height={20}
                    />
                    <p>{post.repliesCount}</p>
                </div>
                <div className="flex items-center">
                    <ArrowPathRoundedSquareIcon
                        className="mr-3"
                        width={20}
                        height={20}
                    />
                    <p>{post.reblogsCount}</p>
                </div>
                <div className="flex items-center">
                    <HeartIcon className="mr-3" width={20} height={20} />
                    <p>{post.favoritesCount}</p>
                </div>
            </div>
        </div>
    );
};

export default Post;
