import classNames from "classnames";

export type Type = "primary" | "secondary";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    iconOnly?: boolean;
    color?: Type;
    transparent?: boolean;
}

const Button: React.FC<IButtonProps> = ({
    children,
    color,
    iconOnly,
    transparent,
    ...props
}) => {
    const className = classNames(
        props.className,
        "shadow-inner focus:outline-none",
        {
            "bg-red-500 hover:bg-red-800 text-white shadow-red-400":
                color === "primary" || !color,
            "bg-neutral-100 hover:bg-neutral-200 shadow-neutral-50":
                color === "secondary",
            "rounded-full p-2": iconOnly,
            "rounded px-4 py-1.5": !iconOnly,
            "opacity-75": transparent,
            "border-2": !transparent,
        }
    );

    return (
        <button {...props} className={className}>
            {children}
        </button>
    );
};

export default Button;
