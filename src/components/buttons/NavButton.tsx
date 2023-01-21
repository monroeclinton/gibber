import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";

import { navOpenAtom } from "../../atoms";
import Button from "./Button";

const NavButton: React.FC = () => {
    const [, setNavOpen] = useAtom(navOpenAtom);

    return (
        <Button
            color="secondary"
            iconOnly
            transparent
            onClick={() => setNavOpen(true)}
        >
            <Bars3Icon width={20} height={20} />
        </Button>
    );
};

export default NavButton;
