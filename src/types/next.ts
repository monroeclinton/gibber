import {
    type NextComponentType,
    type NextPage,
    type NextPageContext,
} from "next";
import { type AppProps } from "next/app";
import { type Session } from "next-auth";

export type GibberPage<P = any, IP = P> = NextPage<P, IP> & {
    authRequired?: boolean;
};

export type GibberComponent = NextComponentType<NextPageContext, any, object> &
    Partial<GibberPage>;

export type GibberAppProps<P = object> = AppProps<
    P & { session: Session | null }
> & {
    Component: GibberComponent;
};
