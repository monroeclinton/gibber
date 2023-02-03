import {
    BellIcon,
    Cog6ToothIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import { UserIcon as SolidUserIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { useAtom } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { Transition } from "react-transition-group";
import {
    ENTERED,
    ENTERING,
    EXITED,
    EXITING,
} from "react-transition-group/Transition";

import Logo from "../../../assets/gibber.svg";
import { navOpenAtom } from "../../atoms";
import { clearProfileId, useProfile } from "../../utils/use-profile";
import Button from "../button";
import CloseButton from "../button/CloseButton";
import TopBar from "./TopBar";

// Make sure you change the tailwind duration too,
// literal values are not allowed.
const duration = 125;
const defaultClassName = `
    absolute top-0 bottom-0 left-0 right-0
    duration-[125ms] ease-[cubic-bezier(0.5, 0.25, 0, 1)] transition-all
`;

type HeroIcon = (props: React.ComponentProps<"svg">) => JSX.Element;

interface ISidebarItem {
    url: string;
    text: string;
    icon: HeroIcon;
    auth: boolean;
}

const sidebarItems: ISidebarItem[] = [
    {
        url: "/",
        text: "Home",
        icon: HomeIcon,
        auth: false,
    },
    {
        url: "/search",
        text: "Search",
        icon: MagnifyingGlassIcon,
        auth: false,
    },
    {
        url: "/notifications",
        text: "Notifications",
        icon: BellIcon,
        auth: true,
    },
    {
        url: "/profile",
        text: "Profile",
        icon: UserIcon,
        auth: true,
    },
    {
        url: "/settings",
        text: "Settings",
        icon: Cog6ToothIcon,
        auth: true,
    },
];

const SideBar: React.FC = () => {
    const router = useRouter();

    const [navOpen, setNavOpen] = useAtom(navOpenAtom);
    const nodeRef = useRef(null);

    useEffect(() => {
        const onChange = () => setNavOpen(false);

        router.events.on("routeChangeStart", onChange);

        return () => router.events.off("routeChangeStart", onChange);
    }, [router.events, setNavOpen]);

    return (
        <Transition nodeRef={nodeRef} in={navOpen} timeout={duration}>
            {(state: string) =>
                state !== EXITED && (
                    <div ref={nodeRef}>
                        <Mask state={state} />
                        <Content state={state} />
                    </div>
                )
            }
        </Transition>
    );
};

const Mask: React.FC<{ state: string }> = ({ state }) => {
    const [, setNavOpen] = useAtom(navOpenAtom);

    const className = classNames(defaultClassName, "bg-black", {
        "opacity-0": [ENTERING, EXITING].includes(state),
        "opacity-40": ENTERED === state,
    });

    return <div className={className} onClick={() => setNavOpen(false)} />;
};

const Content: React.FC<{ state: string }> = ({ state }) => {
    const router = useRouter();
    const { status: sessionStatus } = useSession();
    const [, setNavOpen] = useAtom(navOpenAtom);

    const className = classNames(
        defaultClassName,
        "w-full max-w-[380px] bg-white",
        {
            "-translate-x-full skew-y-6": [ENTERING, EXITING].includes(state),
            "translate-x-0": state === ENTERED,
        }
    );

    const activeItems = sidebarItems.filter(
        (item) => !item.auth || sessionStatus === "authenticated"
    );

    const items = activeItems.map((item) => (
        <Link
            className={classNames(
                "flex h-[45px] items-center justify-end rounded bg-gradient-to-r hover:from-neutral-100",
                {
                    "text-red-700": item.url === router.asPath,
                }
            )}
            href={item.url}
            key={item.url + item.text}
        >
            <p className="mr-6 text-xl">{item.text}</p>
            <item.icon width={30} height={30} />
        </Link>
    ));

    const top =
        activeItems
            .map((item) => {
                return item.url;
            })
            .indexOf(router.asPath) * 45;

    return (
        <div className={className}>
            <TopBar>
                <Logo width={40} height={40} />
                <CloseButton
                    className="ml-auto"
                    onClick={() => setNavOpen(false)}
                />
            </TopBar>
            <div className="mt-12 flex flex-col justify-center px-8">
                <AuthCard />
                <div className="relative mt-16">
                    {top !== undefined && (
                        <div
                            className="absolute top-[138px] -right-8 h-[45px] rounded border-r-2 border-red-700"
                            style={{ top: top.toString() + "px" }}
                        />
                    )}
                    {items}
                </div>
            </div>
        </div>
    );
};

const AuthCard: React.FC = () => {
    const { status: sessionStatus } = useSession();

    const { profile } = useProfile();

    if (sessionStatus === "unauthenticated") {
        return (
            <div className="flex grow flex-col rounded border-2 border-neutral-100 px-6 py-5">
                <p className="text-xl font-semibold">Welcome to Gibber!</p>
                <div className="mt-3.5 flex gap-2">
                    <Button className="w-1/2" onClick={() => void signIn()}>
                        Sign In
                    </Button>
                    <Button
                        color="primary-outline"
                        className="w-1/2"
                        onClick={() => void signIn()}
                    >
                        Register
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end">
            {profile.data?.avatar && (
                <Image
                    className="rounded-full"
                    alt="Your avatar"
                    src={profile.data.avatar.url}
                    width={75}
                    height={75}
                />
            )}
            {!profile.data?.avatar && (
                <div className="h-[75px] w-[75px] rounded-full bg-neutral-200">
                    <SolidUserIcon className="m-[25%] w-1/2 text-neutral-400" />
                </div>
            )}
            <p className="mt-2 text-lg">{profile.data?.username}</p>
            <div className="mt-3">
                <Button
                    color="secondary"
                    onClick={() => clearProfileId()}
                    className="mr-3.5"
                >
                    Switch Profile
                </Button>
                <Button
                    color="primary-outline"
                    onClick={() => {
                        clearProfileId();
                        void signOut();
                    }}
                >
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default SideBar;
