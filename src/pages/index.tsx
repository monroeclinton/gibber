import Head from "next/head";
import { useSession } from "next-auth/react";

import NavButton from "../components/button/NavButton";
import Container from "../components/Container";
import CreatePost from "../components/post/create";
import Posts from "../components/post/Posts";
import Topbar from "../components/Topbar";
import type { GibberPage } from "../types/next";
import { api } from "../utils/api";
import { useProfile } from "../utils/use-profile";

const Home: GibberPage = () => {
    const { id: profileId } = useProfile();

    const { status: sessionStatus } = useSession();
    const unauthenticated = sessionStatus === "unauthenticated";

    const feedPosts = api.post.getFeedByProfileId.useQuery(
        {
            profileId: profileId as string,
        },
        {
            enabled: !!profileId,
        }
    );

    const publicPosts = api.post.getFeed.useQuery(undefined, {
        enabled: unauthenticated,
    });

    const onReply = async () => {
        await feedPosts.refetch();
        await publicPosts.refetch();
    };

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
            <Topbar mobileOnly>
                <NavButton />
                <p className="ml-5 font-semibold">Latest Posts</p>
            </Topbar>
            <Container>
                <div className="mb-4 hidden lg:block">
                    <CreatePost onPost={() => void onReply()} />
                </div>
                <Posts posts={unauthenticated ? publicPosts : feedPosts} />
            </Container>
        </>
    );
};

export default Home;
