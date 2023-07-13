import { useSearchParams } from "next/navigation";

interface ISearchProps {
    autoFocus?: boolean;
    onSearch: (content: string) => void;
}

const Search: React.FC<ISearchProps> = ({ autoFocus = false, onSearch }) => {
    const searchParams = useSearchParams();
    const content = searchParams.get("q") ?? "";

    const onContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    return (
        <input
            className="my-3 grow rounded-lg border-2 border-none bg-neutral-100 px-3.5 placeholder:text-neutral-600 focus:outline-none"
            type="text"
            placeholder="Search Gibber"
            autoFocus={autoFocus}
            value={content}
            onChange={onContentChange}
        />
    );
};

export default Search;
