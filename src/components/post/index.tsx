import {
    ArrowPathRoundedSquareIcon,
    ChatBubbleLeftIcon,
    HeartIcon,
} from "@heroicons/react/24/outline";
import {
    ArrowPathRoundedSquareIcon as SolidArrowPathRoundedSquareIcon,
    HeartIcon as SolidHeartIcon,
    UserIcon,
} from "@heroicons/react/24/solid";
import type { Prisma, Profile } from "@prisma/client";
import classNames from "classnames";
import { useAtom } from "jotai";
import Image from "next/image";
import { useState } from "react";

import { createPostAtom, reblogPostAtom } from "../../atoms";
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
        reblog: {
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
        };
    };
}>;

type WithIsInteractions<T> = T & {
    isReblogged: boolean;
    isFavorited: boolean;
    reblog: T & {
        isReblogged: boolean;
        isFavorited: boolean;
    };
};

const Post: React.FC<{
    reblogger?: Profile;
    post: WithIsInteractions<IPost>;
}> = ({ reblogger, post }) => {
    const utils = api.useContext();

    const profileId = getProfileId();

    const [, setCreatePost] = useAtom(createPostAtom);
    const [, setReblogPost] = useAtom(reblogPostAtom);

    const [isReblogDropdownOpen, setReblogDropdownOpen] = useState(false);

    const reblog = api.reblog.create.useMutation({
        onSuccess: async () => {
            await utils.post.getFeedByProfileId.refetch();
        },
    });

    const unreblog = api.reblog.delete.useMutation({
        onSuccess: async () => {
            await utils.post.getFeedByProfileId.refetch();
        },
    });

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

    const onReblog = () => {
        setReblogDropdownOpen(false);

        if (!profileId) {
            return;
        }

        if (!post.isReblogged) {
            reblog.mutate({
                profileId,
                postId: post.id,
            });
        } else {
            unreblog.mutate({
                profileId,
                postId: post.id,
            });
        }
    };

    const onQuoteReblog = () => {
        setReblogDropdownOpen(false);
        setCreatePost(true);
        setReblogPost(post.id);
    };

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

    if (post.reblog && post.content === null) {
        return <Post reblogger={post.profile} post={post.reblog} />;
    }

    return (
        <div className="border-b-2 border-neutral-50 px-6 py-5">
            {reblogger && (
                <div className="mb-3.5 flex text-sm font-semibold text-neutral-600">
                    <ArrowPathRoundedSquareIcon
                        className="mr-3"
                        width={20}
                        height={20}
                    />
                    <p>@{reblogger.username} Reblogged</p>
                </div>
            )}
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
            {post.reblog && (
                <div className="mt-3.5">
                    <PreviewPost post={post.reblog} />
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
                <div className="relative">
                    <div
                        className="flex min-w-[45px] cursor-pointer items-center"
                        onClick={() => setReblogDropdownOpen(true)}
                    >
                        {!post.isReblogged && (
                            <ArrowPathRoundedSquareIcon
                                className="mr-3"
                                width={20}
                                height={20}
                            />
                        )}
                        {post.isReblogged && (
                            <SolidArrowPathRoundedSquareIcon
                                className="mr-3 text-green-500"
                                width={20}
                                height={20}
                            />
                        )}
                        <p>{post.reblogsCount}</p>
                    </div>
                    {isReblogDropdownOpen && (
                        <div className="absolute left-0 -top-2 mt-2 w-40 rounded-md border border-neutral-200 bg-white shadow">
                            <div className="py-1" role="none">
                                <div
                                    className="block px-4 py-2 transition-all hover:bg-neutral-100"
                                    onClick={onReblog}
                                >
                                    <p>
                                        {post.isReblogged
                                            ? "Undo Reblog"
                                            : "Reblog"}
                                    </p>
                                </div>
                                <div
                                    className="block px-4 py-2 transition-all hover:bg-neutral-100"
                                    onClick={onQuoteReblog}
                                >
                                    <p>Quote Reblog</p>
                                </div>
                            </div>
                        </div>
                    )}
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

const PreviewPost: React.FC<{ post: IPost }> = ({ post }) => {
    return (
        <div className="border-neutral-2 rounded border-2 p-3.5">
            <div className="mb-2 flex items-center">
                <div
                    className={classNames(
                        "h-[30px] w-[30px] overflow-hidden rounded-full",
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
                            width={30}
                            height={30}
                        />
                    )}
                </div>
                <p className="ml-3.5">{post.profile.username}</p>
                <p className="mx-2 text-neutral-600">·</p>
                <p className="text-sm text-neutral-600">
                    {post.createdAt.toLocaleDateString()}
                </p>
            </div>

            {post.content && (
                <div className="mt-3.5">
                    <p>{post.content}</p>
                </div>
            )}
        </div>
    );
};

export default Post;
export { PreviewPost };
