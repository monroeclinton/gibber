import { env } from "../env.mjs";

export const profileUrl = (username: string, domain: string) => {
    return env.NEXT_PUBLIC_WEB_DOMAIN === domain
        ? `/${username}`
        : `/${username}@${domain}`;
};
