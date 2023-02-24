import SideNav from "./nav/Side";
import Sidebar from "./Sidebar";

interface IContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<IContainerProps> = ({ children }) => {
    return (
        <div className="flex justify-center">
            <SideNav type="desktop" className="sticky top-0 mr-[40px] h-full" />
            <div className="max-w-[615px] grow">
                <div className="flex h-[65px]">
                    <input
                        className="my-3 grow rounded-lg border-2 border-none bg-neutral-100 px-3.5 placeholder:text-neutral-600 focus:outline-none"
                        type="text"
                        placeholder="Search Gibber"
                    />
                </div>
                {children}
            </div>
            <Sidebar className="sticky top-[65px] ml-[40px] h-full">
                <h1 className="text-lg font-semibold">Discover People</h1>
            </Sidebar>
        </div>
    );
};

export default Container;
