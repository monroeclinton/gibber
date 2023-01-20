import { useAtom } from "jotai";

import { navOpenAtom } from "../atoms";

const SideBar: React.FC = () => {
    const [navOpen, setNavOpen] = useAtom(navOpenAtom);
    console.log(navOpen);

    if (!navOpen) {
        return null;
    }

    return (
        <div className="absolute top-0 bottom-0 left-0 right-0">
            <div
                className="absolute h-full w-full bg-black opacity-40"
                onClick={() => setNavOpen(false)}
            />
            <div className="absolute h-full w-[75%] bg-white p-3">Gibber</div>
        </div>
    );
};

export default SideBar;
