import { LambdaClient } from "@aws-sdk/client-lambda";

if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION is a required environment variable.");
}

export const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION
});
