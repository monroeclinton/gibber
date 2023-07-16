import { S3Client } from "@aws-sdk/client-s3";

import { env } from "../env.mjs";

const config = {
    region: env.S3_REGION,
    credentials: {
        accessKeyId: env.S3_KEY_ID,
        secretAccessKey: env.S3_KEY_SECRET,
    },
    forcePathStyle: true,
};

export const s3Client = new S3Client({
    ...config,
    endpoint: env.S3_CLIENT_ENDPOINT,
});

export const s3Server = new S3Client({
    ...config,
    endpoint: env.S3_SERVER_ENDPOINT,
});
