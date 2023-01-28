import classNames from "classnames";

export type Type = "primary" | "primary-outline" | "secondary";

export interface IButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    color = !color ? "primary" : color;

    const className = classNames(
        props.className,
        "shadow-inner focus:outline-none transition-colors font-semibold box-border",
        {
            "bg-red-500 hover:bg-red-600 text-white shadow-red-400":
                color === "primary",
            "hover:bg-neutral-100 text-red-500 border-2 border-red-500":
                color === "primary-outline",
            "active:ring active:ring-red-100": color.startsWith("primary"),
            "active:ring-red-100/75":
                transparent && color.startsWith("primary"),
        },
        {
            "active:ring active:ring-neutral-100 bg-neutral-100 hover:bg-neutral-200 shadow-neutral-50":
                color === "secondary",
            "active:ring-neutral-100/50": transparent && color === "secondary",
        },
        {
            "rounded-full p-2": iconOnly,
            "rounded-md px-4 py-0.5 min-w-[100px] min-h-[32px]": !iconOnly,
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
