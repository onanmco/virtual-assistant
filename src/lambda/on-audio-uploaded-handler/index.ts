import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import "reflect-metadata";
import {container} from "../../config/di/container";
import {Types} from "../../config/di/types";
import {ISpeech2TextService} from "../../service/speech2text-service/interface/speech2text-service";
import {Handler} from "./types";
import {IRequestRepository} from "../../repository/request-repository/interface/request-repository";

const _handler: Handler = async (event) => {
  const speech2TextService: ISpeech2TextService = await container.getAsync(Types.Speech2TextService);
  const requestRepository: IRequestRepository = await container.getAsync(Types.RequestRepository);

  for (const record of event.Records) {

    const request = await requestRepository.getByTranscribeInputKey(record.s3.object.key);

    if (!request) {
      console.error(`Request not found for key ${record.s3.object.key}`);
      continue;
    }

    if (!request.uuid) {
      console.error(`UUID not found for key ${record.s3.object.key}`);
      continue;
    }

    request.transcribeOutputBucket = record.s3.bucket.name;
    request.transcribeOutputKey = `transcribe-outputs/${request.uuid}.json`;

    await requestRepository.put(request);

    await speech2TextService.startTranscribeJob({
      jobName: request.uuid,
      input: {
        bucket: record.s3.bucket.name,
        key: record.s3.object.key
      },
      output: {
        bucket: request.transcribeOutputBucket,
        key: request.transcribeOutputKey
      },
      languageCode: "en-US",
    });
  }

}

export const handler = middy()
  .handler(_handler)
  .use(errorLogger());
