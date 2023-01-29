import { XMarkIcon } from "@heroicons/react/24/outline";

import type { IButtonProps } from "./index";
import Button from "./index";

const CloseButton: React.FC<IButtonProps> = (props) => {
    return (
        <Button {...props} color="secondary" iconOnly>
            <XMarkIcon width={20} height={20} />
        </Button>
    );
};

export default CloseButton;
