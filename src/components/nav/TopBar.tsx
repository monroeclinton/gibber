interface ITopBarProps {
    children: React.ReactNode;
}

const TopBar: React.FC<ITopBarProps> = ({ children }) => {
    return (
        <div className="h-[50px]">
            <div className="fixed flex h-[50px] w-full">
                <div className="flex grow items-center bg-white px-6 py-1 shadow">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
