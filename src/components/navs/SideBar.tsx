import classNames from "classnames";
import { useAtom } from "jotai";
import Image from "next/image";
import { Transition } from "react-transition-group";
import {
    ENTERED,
    ENTERING,
    EXITED,
    EXITING,
} from "react-transition-group/Transition";

import { navOpenAtom } from "../../atoms";
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
    const [, setNavOpen] = useAtom(navOpenAtom);

    const className = classNames(defaultClassName, "w-[75%] bg-white", {
        "-translate-x-full skew-y-6": [ENTERING, EXITED].includes(state),
        "translate-x-0": state === ENTERED,
        "-z-10": state === EXITED,
        "z-50": state !== EXITED,
    });

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
        </div>
    );
};

export default SideBar;
