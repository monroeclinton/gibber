import { XMarkIcon } from "@heroicons/react/24/outline";

import Button from "./Button";

type ICloseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const CloseButton: React.FC<ICloseButtonProps> = (props) => {
    return (
        <Button {...props} color="secondary" iconOnly>
            <XMarkIcon width={20} height={20} />
        </Button>
    );
};

export default CloseButton;
