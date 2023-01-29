import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAtom } from "jotai";

import { navOpenAtom } from "../../atoms";
import type { IButtonProps } from "./index";
import Button from "./index";

const NavButton: React.FC<IButtonProps> = (props) => {
    const [, setNavOpen] = useAtom(navOpenAtom);

    return (
        <Button
            {...props}
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
