import classNames from "classnames";

interface ISidebarProps {
    className?: string;
    children: React.ReactNode;
}

const Sidebar: React.FC<ISidebarProps> = ({ className, children }) => {
    return (
        <div className={classNames(className, "w-full max-w-[320px] bg-white")}>
            {children}
        </div>
    );
};

export default Sidebar;
