import {TranscribeClient} from "@aws-sdk/client-transcribe";

if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION is a required environment variable.");
}

export const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION
});
