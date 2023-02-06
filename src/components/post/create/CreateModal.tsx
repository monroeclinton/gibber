import { useAtom } from "jotai";

import { createPostAtom, reblogPostAtom } from "../../../atoms";
import Model from "../../modal";
import CreatePost from ".";

const CreateModal: React.FC = () => {
    const [createPost, setCreatePost] = useAtom(createPostAtom);
    const [reblogPost, setReblogPost] = useAtom(reblogPostAtom);

    const onClose = () => {
        setCreatePost(false);
        setReblogPost(undefined);
    };

    return (
        <Model isOpen={createPost} onClose={onClose} title="Create Post">
            <CreatePost reblogId={reblogPost} onPost={onClose} />
        </Model>
    );
};

export default CreateModal;
