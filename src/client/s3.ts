import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION is a required environment variable.");
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION
});
