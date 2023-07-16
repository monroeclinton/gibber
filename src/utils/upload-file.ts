import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import type { ProbeResult } from "probe-image-size";
import probe from "probe-image-size";
import type { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";

import { env } from "../env.mjs";
import { s3Server } from "../server/s3";

const uploadFile = async (
    key: string,
    ext: string
): Promise<{ name: string; size: number; type: ProbeResult }> => {
    const uuid = uuidv4();
    const name = uuid + "." + ext;

    await s3Server.send(
        new CopyObjectCommand({
            Bucket: env.S3_BUCKET,
            CopySource: `${env.S3_BUCKET}/${key}`,
            Key: name,
        })
    );

    await s3Server.send(
        new DeleteObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: key,
        })
    );

    const object = await s3Server.send(
        new GetObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: name,
        })
    );

    const type = await probe(object.Body as Readable);

    if (!object.ContentLength || !type || ext !== type.type) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file uploaded.",
        });
    }

    return {
        name,
        size: object.ContentLength,
        type,
    };
};

export default uploadFile;
