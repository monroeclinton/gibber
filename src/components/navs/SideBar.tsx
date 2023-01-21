import {
    BellIcon,
    Cog6ToothIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useAtom } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { Transition } from "react-transition-group";
import {
    ENTERED,
    ENTERING,
    EXITED,
    EXITING,
} from "react-transition-group/Transition";

import { navOpenAtom } from "../../atoms";
import Button from "../buttons/Button";
import CloseButton from "../buttons/CloseButton";
import TopBar from "./TopBar";

const duration = 150;
const defaultClassName = `
    absolute top-0 bottom-0 left-0 right-0
    duration-[${duration.toString()}ms] ease-[cubic-bezier(0.5, 0.25, 0, 1)] transition-all
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
    const [navOpen] = useAtom(navOpenAtom);

    return (
        <Transition in={navOpen} timeout={duration}>
            {(state: string) => (
                <>
                    <Mask state={state} />
                    <Content state={state} />
                </>
            )}
        </Transition>
    );
};

const Mask: React.FC<{ state: string }> = ({ state }) => {
    const [, setNavOpen] = useAtom(navOpenAtom);

    const className = classNames(defaultClassName, "bg-black", {
        "opacity-0": [ENTERING, EXITED].includes(state),
        "opacity-40": [ENTERED, EXITING].includes(state),
        "-z-10": state === EXITED,
        "z-50": state !== EXITED,
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
            "-translate-x-full skew-y-6": [ENTERING, EXITED].includes(state),
            "translate-x-0": state === ENTERED,
            "-z-10": state === EXITED,
            "z-50": state !== EXITED,
        }
    );

    const items = sidebarItems
        .filter((item) => !item.auth || sessionStatus === "authenticated")
        .map((item) => (
            <Link
                className={classNames(
                    "flex items-center justify-end rounded bg-gradient-to-r py-2 hover:from-neutral-100",
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

    return (
        <div className={className}>
            <TopBar>
                <Image
                    alt="Gibber Logo"
                    src="/gibber.svg"
                    width={40}
                    height={40}
                />
                <CloseButton
                    className="ml-auto"
                    onClick={() => setNavOpen(false)}
                />
            </TopBar>
            <div className="mt-12 flex flex-col justify-center px-8">
                <AuthCard />
                <div className="mt-16">
                    <div className="absolute right-0 h-[45px] rounded border-r-2 border-red-700" />
                    {items}
                </div>
            </div>
        </div>
    );
};

const AuthCard: React.FC = () => {
    const { data: sessionData, status: sessionStatus } = useSession();

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
            {sessionData?.user?.image && (
                <Image
                    className="rounded-full"
                    alt="Your avatar"
                    src={sessionData.user.image}
                    width={75}
                    height={75}
                />
            )}
            {!sessionData?.user?.image && (
                <div className="h-[75px] w-[75px] rounded-full bg-neutral-100">
                    <UserIcon className="m-[25%] w-1/2 text-neutral-400" />
                </div>
            )}
            <p className="mt-2 text-lg">{sessionData?.user?.name}</p>
            <Button
                color="primary-outline"
                className="mt-3"
                onClick={() => void signOut()}
            >
                Sign Out
            </Button>
        </div>
    );
};

export default SideBar;
