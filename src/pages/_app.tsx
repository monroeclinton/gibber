import "../styles/globals.css";

import { Provider } from "jotai";
import { SessionProvider } from "next-auth/react";

import AuthGuard from "../components/auth/AuthGuard";
import ProfileManager from "../components/auth/ProfileManager";
import BottomNav from "../components/nav/Bottom";
import SideNav from "../components/nav/Side";
import CreateModal from "../components/post/create/CreateModal";
import { type GibberAppProps } from "../types/next";
import { api } from "../utils/api";

const MyApp: React.FC<GibberAppProps> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <Provider>
                {Component.authRequired ? (
                    <AuthGuard>
                        <Component {...pageProps} />
                    </AuthGuard>
                ) : (
                    <Component {...pageProps} />
                )}
                <SideNav type="mobile" />
                <BottomNav />
                <ProfileManager />
                <CreateModal />
            </Provider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
