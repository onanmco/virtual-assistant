import "reflect-metadata";
import {Handler} from "./types";
import middy from "@middy/core";
import errorLogger from "@middy/error-logger";
import {ApiGatewayManagementApiClient, PostToConnectionCommand} from "@aws-sdk/client-apigatewaymanagementapi";
import {IRequestRepository} from "../../repository/request-repository/interface/request-repository";
import {container} from "../../config/di/container";
import {Types} from "../../config/di/types";
import {ISpeech2TextService} from "../../service/speech2text-service/interface/speech2text-service";
import {IText2SpeechService} from "../../service/text2speech-service/interface/text2speech-service";
import {IChatService} from "../../service/chat-service/interface/chat-service";

const _handler: Handler = async (event) => {

  const requestRepository: IRequestRepository = await container.getAsync(Types.RequestRepository);

  const request = await requestRepository.getByUuid(event.detail.TranscriptionJobName);

  if (!request) {
    throw new Error(`Request with uuid ${event.detail.TranscriptionJobName} not found.`);
  }

  const speech2TextService: ISpeech2TextService = await container.getAsync(Types.Speech2TextService);

  const question = await speech2TextService.getTranscript({
    bucket: request.transcribeOutputBucket!,
    key: request.transcribeOutputKey!,
  });

  const apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
    region: process.env.AWS_REGION,
    endpoint: request.apiGatewayEndpoint
  });

  const chatService: IChatService = await container.getAsync(Types.ChatService);
  const textAnswer = await chatService.ask(question);

  const text2SpeechService: IText2SpeechService = await container.getAsync(Types.Text2SpeechService);
  const audioAnswer = await text2SpeechService.getAudioUrlFromText(textAnswer);

  if (event.detail.TranscriptionJobStatus === "COMPLETED") {
    await apiGatewayManagementApiClient.send(
      new PostToConnectionCommand({
        ConnectionId: request.connectionId,
        Data: JSON.stringify({
          statusCode: 200,
          question: question,
          textAnswer,
          audioAnswer
        })
      })
    );
  }

  if (event.detail.TranscriptionJobStatus === "FAILED") {
    await apiGatewayManagementApiClient.send(
      new PostToConnectionCommand({
        ConnectionId: request.connectionId,
        Data: JSON.stringify({
          statusCode: 500,
          message: "Transcription job failed."
        })
      })
    );
  }

}

export const handler = middy()
  .handler(_handler)
  .use(errorLogger());
