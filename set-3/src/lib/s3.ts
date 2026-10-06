import { S3Client } from "@aws-sdk/client-s3";

import { env } from "../config/env";

export const s3 = new S3Client({
    endpoint: env.s3.endpoint,
    region: env.s3.region,
    credentials: {
        accessKeyId: env.s3.accessKey,
        secretAccessKey: env.s3.secretKey,
    },
    // minio wants http://host/bucket/key instead of http://bucket.host/key
    forcePathStyle: true,
    // otherwise the sdk bakes a checksum of an *empty* body into presigned urls,
    // and real S3 rejects the actual upload because the file's checksum won't match
    requestChecksumCalculation: "WHEN_REQUIRED",
});

export function publicFileUrl(key: string) {
    return `${env.s3.endpoint}/${env.s3.bucket}/${key}`;
}
