import { useRouter } from "next/router";

import { default as SearchInput } from "./input/Search";
import SideNav from "./nav/Side";
import Sidebar from "./Sidebar";

interface IContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<IContainerProps> = ({ children }) => {
    const router = useRouter();

    return (
        <div className="flex items-start justify-center">
            <SideNav
                type="desktop"
                className="sticky top-0 h-screen w-auto md:mr-[20px] xl:mr-[40px]"
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
                <h1 className="text-lg font-semibold">Discover People</h1>
            </Sidebar>
        </div>
    );
};

export default Container;
