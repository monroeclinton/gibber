import { UserIcon } from "@heroicons/react/24/solid";
import className from "classnames";
import { useAtom } from "jotai";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { profileManagerAtom } from "../../atoms";
import Button from "../../components/button";
import NavButton from "../../components/button/NavButton";
import Post from "../../components/post";
import { api } from "../../utils/api";
import { getProfileId } from "../../utils/use-profile";
import Container from "../Container";
import Spinner from "../Spinner";
import FollowersModal from "./FollowersModal";
import FollowingModal from "./FollowingModal";

interface IProfileProps {
    postFilter?: "with-replies" | "media";
}

const Profile: React.FC<IProfileProps> = ({ postFilter }) => {
    const router = useRouter();
    const { username } = router.query;

    const utils = api.useContext();

    const profileId = getProfileId();

    const [isFollowingModalOpen, setFollowingModalOpen] = useState(false);
    const [isFollowersModalOpen, setFollowersModalOpen] = useState(false);

    const { status: sessionStatus } = useSession();

    const [, setProfileManager] = useAtom(profileManagerAtom);

    const profile = api.profile.getByUsername.useQuery(
        {
            profileId,
            username: username as string,
        },
        {
            enabled: router.isReady,
            retry: (failureCount, error) => {
                return failureCount < 3 && error.data?.httpStatus != 404;
            },
        }
    );

    const posts = api.post.getByProfileId.useQuery(
        {
            profileId,
            id: profile.data?.id,
            filter: postFilter,
        },
        {
            enabled: profile.isSuccess,
        }
    );

    const createFriendship = api.profile.createFriendship.useMutation({
        onSuccess: () => {
            if (profile.data) {
                utils.profile.getByUsername.setData(
                    { profileId, username: profile.data.username },
                    (prevData) => {
                        if (prevData) {
                            prevData.isFollowing = true;
                            prevData.followersCount += 1;
                        }

                        return prevData;
                    }
                );
            }
        },
    });

    const deleteFriendship = api.profile.deleteFriendship.useMutation({
        onSuccess: () => {
            if (profile.data) {
                utils.profile.getByUsername.setData(
                    { profileId, username: profile.data.username },
                    (prevData) => {
                        if (prevData) {
                            prevData.isFollowing = false;
                            prevData.followersCount -= 1;
                        }

                        return prevData;
                    }
                );
            }
        },
    });

    const onFollow = () => {
        if (profileId && profile.data) {
            createFriendship.mutate({
                profileId,
                followedId: profile.data.id,
            });
        }
    };

    const onUnfollow = () => {
        if (profileId && profile.data) {
            deleteFriendship.mutate({
                profileId,
                followedId: profile.data.id,
            });
        }
    };

    if (profile.isError && profile.error.data?.httpStatus === 404) {
        return (
            <>
                <p>This profile does not exist.</p>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Monroe&apos;s Profile</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container>
                {profile.data && (
                    <>
                        <FollowingModal
                            profileId={profile.data.id}
                            isOpen={isFollowingModalOpen}
                            onClose={() => setFollowingModalOpen(false)}
                        />
                        <FollowersModal
                            profileId={profile.data.id}
                            isOpen={isFollowersModalOpen}
                            onClose={() => setFollowersModalOpen(false)}
                        />
                    </>
                )}
                {profile.isLoading && (
                    <div className="flex h-screen items-center justify-center">
                        <Spinner />
                    </div>
                )}
                {profile.data && (
                    <div>
                        <div className="aspect-h-1 aspect-w-3 bg-neutral-200">
                            {profile.data.header && (
                                <Image
                                    alt="Person's header"
                                    src={profile.data.header.url}
                                    width={615}
                                    height={205}
                                />
                            )}
                        </div>
                        <div className="absolute left-6 top-2.5 md:hidden">
                            <NavButton />
                        </div>
                        <div className="px-6 pt-2">
                            <div className="mb-7 flex">
                                <div className="relative shrink-0 basis-[100px]">
                                    <div
                                        className={className(
                                            "absolute top-[-50px] box-content h-[100px] w-[100px] overflow-hidden rounded-full border-2 border-white bg-neutral-200",
                                            {
                                                "border-opacity-25 bg-clip-padding":
                                                    profile.data.avatar,
                                            }
                                        )}
                                    >
                                        {profile.data.avatar && (
                                            <Image
                                                alt="Person's avatar"
                                                src={profile.data.avatar.url}
                                                width={100}
                                                height={100}
                                            />
                                        )}
                                        {!profile.data.avatar && (
                                            <UserIcon className="m-[25%] w-1/2 text-neutral-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="ml-3.5 min-w-0">
                                    <p className="text-lg">
                                        {profile.data.name}
                                    </p>
                                    <p className="overflow-hidden text-ellipsis">
                                        {profile.data.username}@
                                        {profile.data.domain}
                                    </p>
                                </div>
                            </div>
                            {profile.data.id !== profileId &&
                                sessionStatus === "authenticated" && (
                                    <div className="flex">
                                        <Button
                                            color={
                                                profile.data.isFollowing
                                                    ? "secondary"
                                                    : "primary"
                                            }
                                            className="grow"
                                            onClick={
                                                profile.data.isFollowing
                                                    ? onUnfollow
                                                    : onFollow
                                            }
                                        >
                                            {profile.data.isFollowing
                                                ? "Unfollow"
                                                : "Follow"}
                                        </Button>
                                    </div>
                                )}
                            {profile.data.id === profileId && (
                                <div className="flex">
                                    <Button
                                        color="secondary"
                                        className="grow"
                                        onClick={() =>
                                            setProfileManager("edit")
                                        }
                                    >
                                        Edit Profile
                                    </Button>
                                </div>
                            )}
                            {profile.data.summary && (
                                <div className="mt-4">
                                    <p>{profile.data.summary}</p>
                                </div>
                            )}
                            <div className="mt-3.5 flex">
                                <p>
                                    <span className="font-semibold">
                                        {profile.data.followersCount}
                                    </span>
                                    <span
                                        className="ml-2 hover:cursor-pointer hover:underline"
                                        onClick={() =>
                                            setFollowersModalOpen(true)
                                        }
                                    >
                                        Followers
                                    </span>
                                </p>
                                <p>
                                    <span className="ml-5 font-semibold">
                                        {profile.data.followingCount}
                                    </span>
                                    <span
                                        className="ml-2 hover:cursor-pointer hover:underline"
                                        onClick={() =>
                                            setFollowingModalOpen(true)
                                        }
                                    >
                                        Following
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="mt-3.5 flex h-10 space-x-3.5 overflow-auto border-b-2 border-neutral-100 md:mb-1">
                            <Link
                                href={`/${username as string}`}
                                className={className(
                                    "ml-3.5 flex h-full shrink-0 items-center rounded-t-lg px-6",
                                    {
                                        "bg-red-50 text-red-600":
                                            postFilter === undefined,
                                        "text-neutral-600":
                                            postFilter !== undefined,
                                    }
                                )}
                            >
                                <p className="font-semibold">Posts</p>
                            </Link>
                            <Link
                                href={`/${username as string}/with-replies`}
                                className={className(
                                    "ml-3.5 flex h-full shrink-0 items-center rounded-t-lg px-6",
                                    {
                                        "bg-red-50 text-red-600":
                                            postFilter === "with-replies",
                                        "text-neutral-600":
                                            postFilter !== "with-replies",
                                    }
                                )}
                            >
                                <p className="font-semibold">Posts & replies</p>
                            </Link>
                            <Link
                                href={`/${username as string}/media`}
                                className={className(
                                    "ml-3.5 flex h-full shrink-0 items-center rounded-t-lg px-6",
                                    {
                                        "bg-red-50 text-red-600":
                                            postFilter === "media",
                                        "text-neutral-600":
                                            postFilter !== "media",
                                    }
                                )}
                            >
                                <p className="font-semibold">Media</p>
                            </Link>
                        </div>
                        {posts.data &&
                            posts.data.map((post) => (
                                <Post post={post} key={post.id} />
                            ))}
                        {posts.isFetched && posts.data?.length === 0 && (
                            <div className="bg-neutral-50 p-4 text-neutral-800">
                                There are no posts here.
                            </div>
                        )}
                    </div>
                )}
            </Container>
        </>
    );
};

export default Profile;
