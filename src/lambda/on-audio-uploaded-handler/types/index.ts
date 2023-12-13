import { S3Event } from "aws-lambda";

export type Handler = (event: S3Event) => Promise<void>;