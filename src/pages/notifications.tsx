import { UserIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import Head from "next/head";
import Image from "next/image";

import NavButton from "../components/button/NavButton";
import { PreviewPost } from "../components/post";
import Topbar from "../components/Topbar";
import type { GibberPage } from "../types/next";
import { api } from "../utils/api";

const Notifications: GibberPage = () => {
    const notifications = api.notification.get.useQuery();

    return (
        <>
            <Head>
                <title>Notifications</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <TopBar>
                <NavButton />
                <p className="ml-5 font-semibold">Notifications</p>
            </TopBar>
            {notifications.data &&
                notifications.data.map((notification) => (
                    <div className="px-6 py-5" key={notification.id}>
                        <div className="mb-2 flex items-center">
                            <div
                                className={classNames(
                                    "h-[30px] w-[30px] overflow-hidden rounded-full",
                                    {
                                        "bg-neutral-200":
                                            !notification.notifier.avatar,
                                    }
                                )}
                            >
                                {!notification.notifier.avatar && (
                                    <UserIcon className="m-[25%] w-1/2 text-neutral-400" />
                                )}
                                {notification.notifier.avatar && (
                                    <Image
                                        alt="Person's avatar"
                                        src={notification.notifier.avatar.url}
                                        width={30}
                                        height={30}
                                    />
                                )}
                            </div>
                            <p className="ml-3.5">
                                {notification.notifier.username} liked your
                                post.
                            </p>
                        </div>

                        <div className="mt-3.5">
                            <PreviewPost post={notification.post} />
                        </div>
                    </div>
                ))}
            {notifications.isFetched && notifications.data?.length === 0 && (
                <div className="bg-neutral-50 p-4 text-neutral-800">
                    There are no notifications here.
                </div>
            )}
        </>
    );
};

Notifications.authRequired = true;

export default Notifications;
