import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { type NextPage } from "next";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

import Button from "../components/button";
import NavButton from "../components/button/NavButton";
import Container from "../components/Container";
import { default as SearchInput } from "../components/input/Search";
import Modal from "../components/modal";
import Posts from "../components/post/Posts";
import Topbar from "../components/Topbar";
import { api } from "../utils/api";

const Search: NextPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const content = searchParams.get("q") ?? "";

    const [username, setUsername] = useState<string>("");
    const [isFilterModalOpen, setFilterModalOpen] = useState<boolean>(false);
    const isEnabled = (content && content.length > 0) || username.length > 0;

    const posts = api.post.search.useQuery(
        {
            content,
            username,
        },
        {
            enabled: isEnabled,
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
                <Posts posts={posts} isEnabled={isEnabled} />
            </Container>
        </>
    );
};

export default Search;
