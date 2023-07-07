import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import NavButton from "../../components/button/NavButton";
import Container from "../../components/Container";
import Post from "../../components/post";
import CreatePost from "../../components/post/create";
import Spinner from "../../components/Spinner";
import Topbar from "../../components/Topbar";
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
            <Head>
                <title>Post</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {post.isLoading && (
                <div className="flex h-screen items-center justify-center">
                    <Spinner />
                </div>
            )}
            <Topbar mobileOnly>
                <NavButton />
                <p className="ml-5 font-semibold">Post</p>
            </Topbar>
            <Container>
                {post.data && (
                    <>
                        <Post post={post.data} />
                        <div className="my-5 mx-6 md:mx-0">
                            <CreatePost
                                inReplyToId={post.data?.id}
                                onPost={() => void onReply()}
                            />
                        </div>
                    </>
                )}
                {replies.data &&
                    replies.data.map((post) => (
                        <Post post={post} key={post.id} />
                    ))}
            </Container>
        </>
    );
};

export default PostPage;
