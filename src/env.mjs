import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /*
     * Serverside Environment variables, not available on the client.
     * Will throw if you access these variables on the client.
     */
    server: {
        DATABASE_URL: z.string().url(),
        WEB_URL: z.string().url(),
        NODE_ENV: z.enum(["development", "test", "production"]),
        NEXTAUTH_SECRET:
            process.env.NODE_ENV === "production"
                ? z.string().min(1)
                : z.string().min(1).optional(),
        NEXTAUTH_URL: z.preprocess(
            // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
            // Since NextAuth.js automatically uses the VERCEL_URL if present.
            (str) => process.env.VERCEL_URL ?? str,
            // VERCEL_URL doesn't include `https` so it cant be validated as a URL
            process.env.VERCEL ? z.string() : z.string().url()
        ),
        GITHUB_ID: z.string(),
        GITHUB_SECRET: z.string(),
        S3_WEB_ENDPOINT: z.string(),
        S3_CLIENT_ENDPOINT: z.string(),
        S3_SERVER_ENDPOINT: z.string(),
        S3_REGION: z.string(),
        S3_BUCKET: z.string(),
        S3_KEY_ID: z.string(),
        S3_KEY_SECRET: z.string(),
    },

    /*
     * Environment variables available on the client (and server).
     *
     * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
     */
    client: {},

    /*
     * Due to how Next.js bundles environment variables on Edge and Client,
     * we need to manually destructure them to make sure all are included in bundle.
     *
     * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
     */
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        WEB_URL: process.env.WEB_URL,
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        GITHUB_ID: process.env.GITHUB_ID,
        GITHUB_SECRET: process.env.GITHUB_SECRET,
        NEXT_PUBLIC_REGISTRATION_ENABLED: process.env.REGISTRATION_ENABLED,
        S3_WEB_ENDPOINT: process.env.S3_WEB_ENDPOINT,
        S3_CLIENT_ENDPOINT: process.env.S3_CLIENT_ENDPOINT,
        S3_SERVER_ENDPOINT: process.env.S3_SERVER_ENDPOINT,
        S3_REGION: process.env.S3_REGION,
        S3_BUCKET: process.env.S3_BUCKET,
        S3_KEY_ID: process.env.S3_KEY_ID,
        S3_KEY_SECRET: process.env.S3_KEY_SECRET,
    },
});
