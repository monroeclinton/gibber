import { UserIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { api } from "../utils/api";
import { default as SearchInput } from "./input/Search";
import SideNav from "./nav/Side";
import Sidebar from "./Sidebar";

interface IContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<IContainerProps> = ({ children }) => {
    const router = useRouter();

    const discover = api.profile.getDiscover.useQuery();

    const people = discover.data?.map((profile) => (
        <Link href={`/${profile.username}`} key={profile.id}>
            <div className="mt-4 flex">
                <div
                    className={classNames(
                        "h-[50px] min-h-[50px] w-[50px] min-w-[50px] overflow-hidden rounded-full",
                        {
                            "bg-neutral-200": !profile.avatar,
                        }
                    )}
                >
                    {!profile.header && (
                        <UserIcon className="m-[25%] w-1/2 text-neutral-400" />
                    )}
                    {profile.header && (
                        <Image
                            alt="Person's header"
                            src={profile.header.url}
                            width={615}
                            height={205}
                        />
                    )}
                </div>
                <div className="ml-4 min-w-0">
                    <p className="text-lg">{profile.name}</p>
                    <p className="overflow-hidden text-ellipsis">
                        {profile.username}
                        @localhost:3000
                    </p>
                </div>
            </div>
        </Link>
    ));

    return (
        <div className="flex items-start justify-center">
            <SideNav
                type="desktop"
                className="sticky top-0 h-screen w-auto md:mr-[20px] fd:mr-[40px]"
            />
            <div className="max-w-[615px] grow basis-[615px] md:shrink-0">
                <div className="hidden h-[65px] lg:flex">
                    <SearchInput
                        onSearch={(content) =>
                            void router.push(`/search?q=${content}`)
                        }
                    />
                </div>
                {children}
            </div>
            <Sidebar
                className="sticky top-[65px] ml-[40px] h-full"
                type="desktop"
            >
                <div className="lg:hidden xl:block">
                    <h1 className="text-lg font-semibold">Discover People</h1>
                    {people}
                </div>
            </Sidebar>
        </div>
    );
};

export default Container;
