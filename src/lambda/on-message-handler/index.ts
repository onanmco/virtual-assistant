import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import "reflect-metadata";
import {container} from "../../config/di/container";
import {Types} from "../../config/di/types";
import {IStorageService} from "../../service/storage-service/interface/storage-service";
import {Handler} from "./types";
import {v4 as uuidv4} from "uuid";
import {IRequestRepository} from "../../repository/request-repository/interface/request-repository";
import {Request} from "../../repository/request-repository/types";
import {webSocketErrorHandler} from "../../middleware/web-socket-error-handler";

const _handler: Handler = async (event) => {
  const uuid = uuidv4();

  const request: Request = {
    connectionId: event.requestContext.connectionId,
    apiGatewayEndpoint: 'https://' + event.requestContext.domainName + '/' + event.requestContext.stage,
    uuid,
    transcribeInputBucket: process.env.RESOURCES_BUCKET!,
    transcribeInputKey: `transcribe-inputs/${uuid}.wav`
  };

  const storageService: IStorageService = await container.getAsync(Types.StorageService);
  const signedUrl = await storageService.getUploadLink({
    bucket: request.transcribeInputBucket!,
    key: request.transcribeInputKey!
  });

  const requestRepository: IRequestRepository = await container.getAsync(Types.RequestRepository);
  await requestRepository.put(request);

  return {
    statusCode: 200,
    body: JSON.stringify({
      statusCode: 200,
      signedUrl
    })
  };

}

export const handler = middy()
  .handler(_handler)
  .use(webSocketErrorHandler())
  .use(errorLogger());
