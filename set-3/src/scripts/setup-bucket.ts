import { CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";

import { env } from "../config/env";
import { s3 } from "../lib/s3";

// one-off: create the bucket and let anyone read files from it (so image urls work in a browser)
async function main() {
    const Bucket = env.s3.bucket;

    try {
        await s3.send(new HeadBucketCommand({ Bucket }));
        console.log(`Bucket "${Bucket}" already exists`);
    } catch {
        await s3.send(new CreateBucketCommand({ Bucket }));
        console.log(`Created bucket "${Bucket}"`);
    }

    const policy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: "*",
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${Bucket}/*`],
            },
        ],
    };

    await s3.send(new PutBucketPolicyCommand({ Bucket, Policy: JSON.stringify(policy) }));
    console.log("Public read policy set");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
