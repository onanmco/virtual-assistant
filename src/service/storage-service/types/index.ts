import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";

export interface GetObjectInput {
  bucket: string;
  key: string;
}

export interface PresignedUrlInput {
  bucket: string;
  key: string;
}

export interface PutObjectInput {
  bucket: string;
  key: string;
  body: any;
}
