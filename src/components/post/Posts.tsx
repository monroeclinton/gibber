import type { QueryObserverBaseResult } from "@tanstack/react-query";

import { type Post as IPost } from "../../types/post";
import Spinner from "../Spinner";
import Post from ".";

const Posts: React.FC<{ posts: QueryObserverBaseResult<IPost[]> }> = ({
    posts,
}) => {
    return (
        <>
            {posts.isLoading && (
                <div className="flex h-screen items-center justify-center">
                    <Spinner />
                </div>
            )}
            {posts.data &&
                posts.data.map((post) => <Post post={post} key={post.id} />)}
            {posts.isFetched && posts.data?.length === 0 && (
                <div className="bg-neutral-50 p-4 text-neutral-800">
                    There are no posts here.
                </div>
            )}
        </>
    );
};

export default Posts;
