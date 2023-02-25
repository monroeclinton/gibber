import classNames from "classnames";

interface ISidebarProps {
    className?: string;
    children: React.ReactNode;
    type: "mobile" | "desktop";
}

const Sidebar: React.FC<ISidebarProps> = ({ className, children, type }) => {
    return (
        <div
            className={classNames(className, "w-full max-w-[320px] bg-white", {
                "lg:hidden": type === "mobile",
                "hidden lg:block": type === "desktop",
            })}
        >
            {children}
        </div>
    );
};

export default Sidebar;
