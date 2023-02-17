import { useAtom } from "jotai";
import { type NextPage } from "next";
import Head from "next/head";

import { createPostAtom } from "../atoms";
import Button from "../components/button";
import NavButton from "../components/button/NavButton";
import TopBar from "../components/nav/TopBar";
import Post from "../components/post";
import { api } from "../utils/api";
import { getProfileId } from "../utils/use-profile";

const Home: NextPage = () => {
    const profileId = getProfileId();

    const [, setCreatePost] = useAtom(createPostAtom);

    const posts = api.post.getFeedByProfileId.useQuery(
        {
            profileId: profileId as string,
        },
        {
            enabled: !!profileId,
        }
    );

    return (
        <>
            <Head>
                <title>Home</title>
                <meta
                    name="description"
                    content="Gibber is a free, federated, and open source social network based on ActivityPub."
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <TopBar>
                <NavButton />
                <p className="ml-5 font-semibold">Latest Posts</p>
                <Button className="ml-auto" onClick={() => setCreatePost(true)}>
                    Post
                </Button>
            </TopBar>
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

export default Home;
