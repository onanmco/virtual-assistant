import {GetTranscriptionInput, StartTranscribeJob} from "../types";

export interface ISpeech2TextService {
  startTranscribeJob(input: StartTranscribeJob): Promise<void>;
  getTranscript(input: GetTranscriptionInput): Promise<string>;
}
