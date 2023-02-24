import classNames from "classnames";

interface ITopbarProps {
    mobileOnly?: boolean;
    children: React.ReactNode;
}

const Topbar: React.FC<ITopbarProps> = ({ mobileOnly, children }) => {
    const className = classNames("h-[50px]", {
        "lg:hidden": mobileOnly,
    });

    return (
        <div className={className}>
            <div className="fixed flex h-[50px] w-full">
                <div className="flex grow items-center bg-white px-6 py-1 shadow">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Topbar;
