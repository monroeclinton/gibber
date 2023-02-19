import { type GetServerSidePropsContext } from "next";
import { type Session, unstable_getServerSession } from "next-auth";

import { authOptions } from "../pages/api/auth/[...nextauth]";
import { prisma } from "./db";

/**
 * Wrapper for unstable_getServerSession, used in trpc createContext and the
 * restricted API route
 *
 * Don't worry too much about the "unstable", it's safe to use but the syntax
 * may change in future versions
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */

export const getServerAuthSession = async (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => {
    return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
};

export const getServerAuthProfile = async (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
    session: Session | null;
}) => {
    return await prisma.profile.findFirst({
        where: {
            id: ctx.req.cookies.profileId,
            userId: ctx.session?.user?.id,
        },
    });
};
