// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    swcMinify: true,
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
    images: {
        domains: ["avatars.githubusercontent.com", "gibber.localhost"],
    },
    async rewrites() {
        return [
            {
                source: "/.well-known/:path*",
                destination: "/api/.well-known/:path*",
            },
        ];
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: [
                {
                    loader: "@svgr/webpack",
                    options: {
                        svgoConfig: {
                            plugins: [
                                {
                                    name: "preset-default",
                                    params: {
                                        overrides: {
                                            prefixIds: false,
                                            prefixClassNames: false,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            ],
        });

        return config;
    },
};
export default config;
