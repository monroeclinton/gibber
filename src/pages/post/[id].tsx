import { type NextPage } from "next";
import { useRouter } from "next/router";

import NavButton from "../../components/button/NavButton";
import TopBar from "../../components/nav/TopBar";
import Post from "../../components/post";
import CreatePost from "../../components/post/create";
import { api } from "../../utils/api";

const PostPage: NextPage = () => {
    const router = useRouter();

    const post = api.post.getById.useQuery(
        {
            id: router.query.id as string,
        },
        {
            enabled: !!router.isReady,
        }
    );

    const replies = api.post.getRepliesById.useQuery(
        {
            id: router.query.id as string,
        },
        {
            enabled: !!router.isReady,
        }
    );

    const onReply = async () => {
        await post.refetch();
        await replies.refetch();
    };

    return (
        <>
            {post.isLoading && (
                <div className="flex h-screen items-center justify-center">
                    <svg
                        className="-ml-1 mr-3 h-8 w-8 animate-spin text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                </div>
            )}
            <TopBar>
                <NavButton />
                <p className="ml-5 font-semibold">Post</p>
            </TopBar>
            {post.data && (
                <>
                    <Post post={post.data} />
                    <div className="my-5 mx-6">
                        <CreatePost
                            inReplyToId={post.data.id}
                            onPost={() => void onReply()}
                        />
                    </div>
                </>
            )}
            {replies.data &&
                replies.data.map((post) => <Post post={post} key={post.id} />)}
        </>
    );
};

export default PostPage;
