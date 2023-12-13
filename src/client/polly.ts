import {PollyClient} from "@aws-sdk/client-polly";

if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION is a required environment variable.");
}

export const pollyClient = new PollyClient({
  region: process.env.AWS_REGION
});
