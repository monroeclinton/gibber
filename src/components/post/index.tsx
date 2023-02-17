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
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

import { createPostAtom, reblogPostAtom } from "../../atoms";
import { api } from "../../utils/api";
import useOutsideClick from "../../utils/use-outside-click";
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
    const router = useRouter();

    const utils = api.useContext();

    const profileId = getProfileId();

    const [, setCreatePost] = useAtom(createPostAtom);
    const [, setReblogPost] = useAtom(reblogPostAtom);

    const [isReblogDropdownOpen, setReblogDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const onReblogDropdown = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setReblogDropdownOpen(true);
    };

    const onReblog = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
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

    const onQuoteReblog = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setReblogDropdownOpen(false);
        setCreatePost(true);
        setReblogPost(post.id);
    };

    const onFavorite = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();

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

    useOutsideClick(() => setReblogDropdownOpen(false), dropdownRef);

    if (post.reblog && post.content === null) {
        return <Post reblogger={post.profile} post={post.reblog} />;
    }

    return (
        <div
            className="border-b-2 border-neutral-50 px-6 py-5 transition-colors hover:cursor-pointer hover:bg-neutral-50"
            onClick={() => void router.push(`/post/${post.id}`)}
        >
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
                <Link
                    href={`/${post.profile.username}`}
                    onClick={(e) => e.stopPropagation()}
                >
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
                </Link>
                <div className="ml-3.5 flex flex-col justify-center">
                    <Link
                        className="hover:underline"
                        href={`/${post.profile.username}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {post.profile.username}
                    </Link>
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
            <div className="mt-3.5 flex min-w-[45px] justify-between hover:cursor-pointer">
                <div className="flex items-center">
                    <ChatBubbleLeftIcon
                        className="mr-3"
                        width={20}
                        height={20}
                    />
                    <p>{post.repliesCount}</p>
                </div>
                <div
                    className="relative flex min-w-[45px] items-center hover:cursor-pointer"
                    onClick={onReblogDropdown}
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
                    {isReblogDropdownOpen && (
                        <div
                            className="absolute left-0 -top-2 mt-2 w-40 rounded-md border border-neutral-200 bg-white shadow"
                            ref={dropdownRef}
                        >
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
                    className="flex min-w-[45px] items-center hover:cursor-pointer"
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
    const router = useRouter();

    return (
        <div
            className="rounded-lg border-2 border-neutral-200 p-3.5"
            onClick={(e) => {
                e.stopPropagation();
                void router.push(`/post/${post.id}`);
            }}
        >
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
                <div className="mt-2">
                    <p>{post.content}</p>
                </div>
            )}
            {post.attachments.length > 0 && (
                <div className="mt-2 h-[250px]">
                    <Attachments attachments={post.attachments} />
                </div>
            )}
        </div>
    );
};

export default Post;
export { PreviewPost };
