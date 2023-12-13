import {injectable} from "inversify";
import {InvokeModelCommand, InvokeModelCommandInput} from "@aws-sdk/client-bedrock-runtime";
import {bedrockClient} from "../../client/bedrock";
import {TitanInputBody, TitanOutput} from "./types";
import {IChatService} from "./interface/chat-service";

@injectable()
export class ChatService implements IChatService {

  public async ask(question: string): Promise<string> {
    try {
      const titanInputBody: TitanInputBody = {
        inputText: question,
        textGenerationConfig: {
          temperature: 0.7,
          topP: 1,
          maxTokenCount: 200,
          stopSequences: []
        }
      };

      const invokeModelCommandInput: InvokeModelCommandInput = {
        modelId: "amazon.titan-text-express-v1",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(titanInputBody)
      };

      const {body} = await bedrockClient.send(new InvokeModelCommand(invokeModelCommandInput));

      const response: TitanOutput = JSON.parse(new TextDecoder().decode(body!));

      return response.results[0].outputText;
    } catch (e) {
      console.error("An error occurred while asking the question to Bedrock", e);
      return "I'm sorry, I don't know the answer to that question.";
    }
  }
}