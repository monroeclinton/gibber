import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

import Button from "../components/button";
import NavButton from "../components/button/NavButton";
import Container from "../components/Container";
import Modal from "../components/modal";
import Post from "../components/post";
import Topbar from "../components/Topbar";
import { api } from "../utils/api";

const Search: NextPage = () => {
    const [content, setContent] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [isFilterModalOpen, setFilterModalOpen] = useState<boolean>(false);

    const posts = api.post.search.useQuery(
        {
            content,
            username,
        },
        {
            enabled: content.length > 0 || username.length > 0,
        }
    );

    const onContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);

        if (e.target.value.length === 0) {
            void posts.remove();
        }
    };

    return (
        <>
            <Head>
                <title>Search</title>
                <meta name="description" content="Search Gibber for content" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Modal
                isOpen={isFilterModalOpen}
                title="Filter search"
                onClose={() => setFilterModalOpen(false)}
            >
                <div className="mt-6 flex">
                    <input
                        className="grow rounded-lg border-2 border-none bg-neutral-100 p-3.5 placeholder:text-neutral-600 focus:outline-none"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mt-6 flex">
                    <Button
                        className="grow"
                        onClick={() => setFilterModalOpen(false)}
                    >
                        Search
                    </Button>
                </div>
            </Modal>
            <Topbar mobileOnly>
                <NavButton />
                <div className="ml-5 flex h-full grow py-1">
                    <input
                        className="h-full grow rounded-lg border-2 border-none bg-neutral-100 px-3.5 placeholder:text-neutral-600 focus:outline-none"
                        type="text"
                        placeholder="Search Gibber"
                        value={content}
                        onChange={onContentChange}
                    />
                </div>
                <Button
                    className="ml-3.5"
                    color="secondary"
                    iconOnly
                    onClick={() => setFilterModalOpen(true)}
                >
                    <AdjustmentsHorizontalIcon width={20} height={20} />
                </Button>
            </Topbar>
            <Container>
                {posts.data &&
                    posts.data.map((post) => (
                        <Post post={post} key={post.id} />
                    ))}
                {posts.data?.length === 0 && (
                    <div className="bg-neutral-50 p-4 text-neutral-800">
                        There are no posts here.
                    </div>
                )}
            </Container>
        </>
    );
};

export default Search;
