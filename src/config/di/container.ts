import {Container} from "inversify";
import { Types } from "./types";
import {RequestRepository} from "../../repository/request-repository/request-repository";
import { StorageService } from "../../service/storage-service/storage-service";
import { Speech2TextService } from "../../service/speech2text-service/speech2text-service";
import { Text2SpeechService } from "../../service/text2speech-service/text2speech-service";
import {ChatService} from "../../service/chat-service/chat-service";

const container = new Container();

container.bind(Types.RequestRepository)
  .to(RequestRepository)
  .inSingletonScope()
  .whenTargetIsDefault();

container.bind(Types.StorageService)
  .to(StorageService)
  .inSingletonScope()
  .whenTargetIsDefault();

container.bind(Types.Speech2TextService)
  .to(Speech2TextService)
  .inSingletonScope()
  .whenTargetIsDefault();

container.bind(Types.Text2SpeechService)
  .to(Text2SpeechService)
  .inSingletonScope()
  .whenTargetIsDefault();

container.bind(Types.ChatService)
  .to(ChatService)
  .inSingletonScope()
  .whenTargetIsDefault();

export {
  container
};
