import Head from "next/head";
import { useSession } from "next-auth/react";

import NavButton from "../components/button/NavButton";
import Container from "../components/Container";
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
                <Posts posts={unauthenticated ? publicPosts : feedPosts} />
            </Container>
        </>
    );
};

export default Home;
