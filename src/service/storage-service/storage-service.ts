import { injectable } from "inversify";
import {GetObjectInput, PresignedUrlInput, PutObjectInput, SupportedCommands} from "./types";
import {s3Client} from "../../client/s3";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {IStorageService} from "./interface/storage-service";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

@injectable()
export class StorageService implements IStorageService {

  public async getObject(input: GetObjectInput): Promise<string> {
    const result = await s3Client.send(
      new GetObjectCommand(
        {
          Bucket: input.bucket,
          Key: input.key
        }
      )
    );

    if (!result.Body) {
      throw new Error("Failed to get object.");
    }

    return result.Body.transformToString();
  }

  public async getUploadLink(input: PresignedUrlInput): Promise<string> {
    return getSignedUrl(
      s3Client,
      new PutObjectCommand(
        {
          Bucket: input.bucket,
          Key: input.key
        }
      ),
      {
        expiresIn: 60 * 60
      }
    );
  }
  public async getDownloadLink(input: PresignedUrlInput): Promise<string> {
    return getSignedUrl(
      s3Client,
      new GetObjectCommand(
        {
          Bucket: input.bucket,
          Key: input.key
        }
      ),
      {
        expiresIn: 60 * 60
      }
    );
  }


  public async putObject(putObjectInput: PutObjectInput): Promise<void> {
    await s3Client.send(
      new PutObjectCommand(
        {
          Bucket: putObjectInput.bucket,
          Key: putObjectInput.key,
          Body: putObjectInput.body
        }
      )
    );
  }

}