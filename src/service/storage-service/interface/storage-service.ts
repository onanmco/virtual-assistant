import {GetObjectInput, PresignedUrlInput, PutObjectInput} from "../types";

export interface IStorageService {
  getObject(input: GetObjectInput): Promise<string>;
  getUploadLink(input: PresignedUrlInput): Promise<string>;
  getDownloadLink(input: PresignedUrlInput): Promise<string>;
  putObject(putObjectInput: PutObjectInput): Promise<void>;
}
