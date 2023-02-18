import {
    BellIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/router";

import Background from "../../../assets/bottom-bar.svg";
import { createPostAtom } from "../../atoms";
import { useProfile } from "../../utils/use-profile";
import Button from "../button";

const BottomBar: React.FC = () => {
    const router = useRouter();
    const { profile } = useProfile();

    const [, setCreatePost] = useAtom(createPostAtom);

    const items = [
        {
            url: "/",
            icon: HomeIcon,
        },
        {
            url: "/search",
            icon: MagnifyingGlassIcon,
        },
        {
            url: "/notifications",
            icon: BellIcon,
        },
        {
            url: "/" + (profile.data ? profile.data.username : ""),
            icon: UserCircleIcon,
        },
    ];

    const links = items.map((item) => (
        <Link
            className={classNames("p-2", {
                "text-red-700": item.url === router.asPath,
            })}
            href={item.url}
            key={item.url}
        >
            <item.icon width={30} height={30} />
        </Link>
    ));

    return (
        <div className="fixed left-6 right-6 bottom-4 left-1/2 w-[330px] -translate-x-1/2">
            <div className="absolute top-1/2 flex w-full -translate-y-1/2 justify-between px-4">
                {links}
            </div>
            <Button
                color="secondary"
                iconOnly
                className="absolute left-1/2 -top-[25px] h-[50px] w-[50px] -translate-x-1/2 border border-neutral-300"
                onClick={() => setCreatePost(true)}
            >
                <PencilIcon width={28} height={28} />
            </Button>
            <Background />
        </div>
    );
};

export default BottomBar;
