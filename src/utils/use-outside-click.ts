import { useEffect } from "react";

const useOutsideClick = (
    callback: (e: MouseEvent) => void,
    ref: React.RefObject<HTMLElement>
) => {
    useEffect(() => {
        const onOutsideClick = (e: MouseEvent) => {
            if (e && ref.current && !ref.current.contains(e.target as Node)) {
                callback(e);
            }
        };

        document.addEventListener("mousedown", onOutsideClick);

        return () => document.removeEventListener("mousedown", onOutsideClick);
    }, [ref, callback]);
};

export default useOutsideClick;
