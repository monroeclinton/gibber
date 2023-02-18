import classNames from "classnames";
import { useEffect, useRef } from "react";
import { Transition } from "react-transition-group";
import {
    ENTERED,
    ENTERING,
    EXITED,
    EXITING,
} from "react-transition-group/Transition";

import CloseButton from "../button/CloseButton";

// Make sure you change the tailwind duration too,
// literal values are not allowed.
const duration = 125;
const defaultClassName = `
    fixed top-0 bottom-0 left-0 right-0
    duration-[125ms] ease-[cubic-bezier(0.5, 0.25, 0, 1)] transition-all
`;

interface IModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<IModalProps> = ({ isOpen, onClose, title, children }) => {
    const nodeRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "unset";

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <Transition nodeRef={nodeRef} in={isOpen} timeout={duration}>
            {(state: string) =>
                state !== EXITED && (
                    <div ref={nodeRef}>
                        <Mask state={state} />
                        <Content state={state}>
                            <div className="mb-7 flex">
                                <h1 className="text-xl font-semibold">
                                    {title}
                                </h1>
                                {onClose && (
                                    <CloseButton
                                        onClick={onClose}
                                        className="ml-auto"
                                    />
                                )}
                            </div>
                            {children}
                        </Content>
                    </div>
                )
            }
        </Transition>
    );
};

const Mask: React.FC<{ state: string; onClose?: () => void }> = ({
    state,
    onClose,
}) => {
    const className = classNames(defaultClassName, "bg-black z-10", {
        "opacity-0": [ENTERING, EXITING].includes(state),
        "opacity-40": ENTERED === state,
    });

    return <div className={className} onClick={onClose} />;
};

const Content: React.FC<{
    state: string;
    children: React.ReactNode;
}> = ({ state, children }) => {
    const className = classNames(
        defaultClassName,
        "w-full max-w-[615px] bg-white mt-[65px] rounded-t-3xl px-6 pt-8 z-10",
        {
            "translate-y-full": [ENTERING, EXITING].includes(state),
            "translate-y-0": state === ENTERED,
        }
    );

    return <div className={className}>{children}</div>;
};

export default Modal;
