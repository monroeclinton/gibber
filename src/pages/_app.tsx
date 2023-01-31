import "../styles/globals.css";

import { Provider } from "jotai";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import ProfileManager from "../components/auth/ProfileManager";
import SideBar from "../components/nav/SideBar";
import { api } from "../utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <Provider>
                <Component {...pageProps} />
                <SideBar />
                <ProfileManager />
            </Provider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
