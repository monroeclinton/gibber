import classNames from "classnames";

export type Type = "primary" | "primary-outline" | "secondary";

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
        "shadow-inner focus:outline-none transition-colors font-semibold",
        {
            "bg-red-500 hover:bg-red-600 text-white shadow-red-400":
                color === "primary" || !color,
            "hover:bg-neutral-100 text-red-500 border-2 border-red-500":
                color === "primary-outline",
            "bg-neutral-100 hover:bg-neutral-200 shadow-neutral-50":
                color === "secondary",
            "border-2": !transparent && color === "secondary",
            "rounded-full p-2": iconOnly,
            "rounded-md px-4 py-0.5": !iconOnly,
            "opacity-75": transparent,
        }
    );

    return (
        <button {...props} className={className}>
            {children}
        </button>
    );
};

export default Button;
