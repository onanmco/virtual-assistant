import {inject, injectable} from "inversify";
import {pollyClient} from "../../client/polly";
import {OutputFormat, SynthesizeSpeechCommand} from "@aws-sdk/client-polly";
import {Readable} from "stream";
import {IText2SpeechService} from "./interface/text2speech-service";
import {Types} from "../../config/di/types";
import {IStorageService} from "../storage-service/interface/storage-service";
import {v4 as uuidv4} from "uuid";

@injectable()
export class Text2SpeechService implements IText2SpeechService {

  private static readonly RESOURCES_BUCKET = process.env.RESOURCES_BUCKET!;

  private readonly storageService: IStorageService;

  public constructor(
    @inject(Types.StorageService) storageService: IStorageService
  ) {
    this.storageService = storageService;
  }

  async getAudioUrlFromText(text: string): Promise<string> {
    const {AudioStream} = await pollyClient.send(
      new SynthesizeSpeechCommand({
          OutputFormat: OutputFormat.MP3,
          Text: text,
          TextType: "text",
          SampleRate: "22050",
          VoiceId: "Joanna"
        }
      ));

    if (!(AudioStream instanceof Readable)) {
      throw new Error("AudioStream is not a readable stream.");
    }

    const uuid = uuidv4();

    await this.storageService.putObject({
      bucket: Text2SpeechService.RESOURCES_BUCKET,
      key: `polly-outputs/${uuid}.mp3`,
      body: await this.getBinary(AudioStream)
    });

    return this.storageService.getDownloadLink({
      bucket: Text2SpeechService.RESOURCES_BUCKET,
      key: `polly-outputs/${uuid}.mp3`
    });
  }

  private getBinary(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      stream.on("error", (error: Error) => {
        reject(error);
      });
      stream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
}