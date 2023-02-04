import {
    ArrowPathRoundedSquareIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
} from "@heroicons/react/24/outline";
import {
    HeartIcon as SolidHeartIcon,
    UserIcon,
} from "@heroicons/react/24/solid";
import type { Prisma } from "@prisma/client";
import classNames from "classnames";
import Image from "next/image";

import { api } from "../../utils/api";
import { getProfileId } from "../../utils/use-profile";
import Attachments from "./Attachments";

type IPost = Prisma.PostGetPayload<{
    include: {
        profile: {
            include: {
                avatar: true;
            };
        };
        attachments: {
            include: {
                file: true;
            };
        };
    };
}>;

type WithIsFavorited<T> = T & {
    isFavorited: boolean;
};

const Post: React.FC<{ post: WithIsFavorited<IPost> }> = ({ post }) => {
    const utils = api.useContext();

    const profileId = getProfileId();

    const favorite = api.favorite.create.useMutation({
        onSuccess: () => {
            if (profileId) {
                utils.post.getFeedByProfileId.setData(
                    { profileId },
                    (prevData) => {
                        if (prevData) {
                            prevData = prevData.map((data) => {
                                if (data.id === post.id) {
                                    data.isFavorited = true;
                                    data.favoritesCount += 1;
                                }

                                return data;
                            });
                        }

                        return prevData;
                    }
                );
            }
        },
    });

    const unfavorite = api.favorite.delete.useMutation({
        onSuccess: () => {
            if (profileId) {
                utils.post.getFeedByProfileId.setData(
                    { profileId },
                    (prevData) => {
                        if (prevData) {
                            prevData = prevData.map((data) => {
                                if (data.id === post.id) {
                                    data.isFavorited = false;
                                    data.favoritesCount -= 1;
                                }

                                return data;
                            });
                        }

                        return prevData;
                    }
                );
            }
        },
    });

    const onFavorite = () => {
        if (!profileId) {
            return;
        }

        if (!post.isFavorited) {
            favorite.mutate({
                profileId,
                postId: post.id,
            });
        } else {
            unfavorite.mutate({
                profileId,
                postId: post.id,
            });
        }
    };

    return (
        <div className="border-b-2 border-neutral-50 px-6 py-5">
            <div className="flex">
                <div
                    className={classNames(
                        "h-[50px] w-[50px] overflow-hidden rounded-full",
                        {
                            "bg-neutral-200": !post.profile.avatar,
                        }
                    )}
                >
                    {!post.profile.avatar && (
                        <UserIcon className="m-[25%] w-1/2 text-neutral-400" />
                    )}
                    {post.profile.avatar && (
                        <Image
                            alt="Person's avatar"
                            src={post.profile.avatar.url}
                            width={50}
                            height={50}
                        />
                    )}
                </div>
                <div className="ml-3.5 flex flex-col justify-center">
                    <p>{post.profile.username}</p>
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
            <div className="mt-3.5 flex min-w-[45px] cursor-pointer justify-between">
                <div className="flex items-center">
                    <ChatBubbleLeftIcon
                        className="mr-3"
                        width={20}
                        height={20}
                    />
                    <p>{post.repliesCount}</p>
                </div>
                <div className="flex min-w-[45px] cursor-pointer items-center">
                    <ArrowPathRoundedSquareIcon
                        className="mr-3"
                        width={20}
                        height={20}
                    />
                    <p>{post.reblogsCount}</p>
                </div>
                <div
                    className="flex min-w-[45px] cursor-pointer items-center"
                    onClick={onFavorite}
                >
                    {!post.isFavorited && (
                        <HeartIcon className="mr-3" width={20} height={20} />
                    )}
                    {post.isFavorited && (
                        <SolidHeartIcon
                            className="mr-3 text-red-500"
                            width={20}
                            height={20}
                        />
                    )}
                    <p>{post.favoritesCount}</p>
                </div>
            </div>
        </div>
    );
};

export default Post;
