#!/usr/bin/env node
import 'source-map-support/register';
import { MainStack } from '../stacks/main-stack';
import dotenv from "dotenv";
import {App} from "aws-cdk-lib";

dotenv.config(
  {
    path: `./config/.env.${process.env.NODE_ENV}`
  }
);

const app = new App();
new MainStack(app, 'MainStack', {
  stackName: `${process.env.ENVIRONMENT_NAME}-${process.env.APPLICATION_NAME}`,
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION
  },
  appName: process.env.APPLICATION_NAME!,
  envName: process.env.ENVIRONMENT_NAME!,
  tags: {
    "Environment": process.env.ENVIRONMENT_NAME!,
    "Application": process.env.APPLICATION_NAME!
  }
});