import { env } from "../env.mjs";

export const profileUrl = (username: string, domain: string) => {
    return env.WEB_DOMAIN === domain
        ? `/${username}`
        : `/${username}@${domain}`;
};
