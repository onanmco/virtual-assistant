import { LanguageCode } from "@aws-sdk/client-transcribe";

export interface StartTranscribeJob {
  jobName: string;
  input: {
    bucket: string;
    key: string;
  },
  output: {
    bucket: string;
    key: string;
  },
  languageCodes: LanguageCode[];
}

export interface GetTranscriptionInput {
  bucket: string;
  key: string;
}

export interface Transcription {
  results: {
    transcripts: {
      transcript: string;
    }[];
  }
}