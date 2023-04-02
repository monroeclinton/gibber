import { useState } from "react";

interface ISearchProps {
    onSearch: (content: string) => void;
}

const Search: React.FC<ISearchProps> = ({ onSearch }) => {
    const [content, setContent] = useState<string>("");

    const onContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <input
            className="h-full grow rounded-lg border-2 border-none bg-neutral-100 px-3.5 placeholder:text-neutral-600 focus:outline-none"
            type="text"
            placeholder="Search Gibber"
            value={content}
            onChange={onContentChange}
        />
    );
};

export default Search;
