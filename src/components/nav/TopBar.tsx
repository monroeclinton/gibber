interface ITopBarProps {
    children: React.ReactNode;
}

const TopBar: React.FC<ITopBarProps> = ({ children }) => {
    return (
        <div className="flex h-[50px] min-h-[50px] items-center px-6 py-1 shadow">
            {children}
        </div>
    );
};

export default TopBar;
