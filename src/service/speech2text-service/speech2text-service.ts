import { StartTranscriptionJobCommand } from "@aws-sdk/client-transcribe";
import {inject, injectable} from "inversify";
import { transcribeClient } from "../../client/transcribe";
import {GetTranscriptionInput, StartTranscribeJob, Transcription} from "./types";
import { ISpeech2TextService } from "./interface/speech2text-service";
import {Types} from "../../config/di/types";
import {IStorageService} from "../storage-service/interface/storage-service";

@injectable()
export class Speech2TextService implements ISpeech2TextService {

  private readonly storageService: IStorageService;

  public constructor(
    @inject(Types.StorageService) storageService: IStorageService
  ) {
    this.storageService = storageService;
  }

  public async startTranscribeJob(input: StartTranscribeJob): Promise<void> {
    await transcribeClient.send(
      new StartTranscriptionJobCommand(
        {
          TranscriptionJobName: input.jobName,
          LanguageCode: input.languageCode,
          Media: {
            MediaFileUri: `s3://${input.input.bucket}/${input.input.key}`
          },
          OutputBucketName: input.output.bucket,
          OutputKey: input.output.key
        }
      )
    );
  }

  public async getTranscript(input: GetTranscriptionInput): Promise<string> {
    const transcription: Transcription = await this.storageService.getObject({
      bucket: input.bucket,
      key: input.key
    })
      .then(jsonString => JSON.parse(jsonString));

    return transcription.results.transcripts[0].transcript;
  }

}