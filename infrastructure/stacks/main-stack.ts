import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {S3Stack} from "./nested-stacks/s3-stack";
import {CloudFrontStack} from "./nested-stacks/cloudfront-stack";
import {LambdaStack} from "./nested-stacks/lambda-stack";
import {IamStack} from "./nested-stacks/iam-stack";
import {ApiGatewayStack} from "./nested-stacks/api-gateway-stack";
import {DynamodbStack} from "./nested-stacks/dynamodb-stack";
import {EventbridgeStack} from "./nested-stacks/eventbridge-stack";

export interface MainStackProps extends StackProps {
  appName: string;
  envName: string;
}

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props);

    const s3Stack = new S3Stack(
      this,
      "s3-stack",
      {
        envName: props.envName,
        appName: props.appName,
        description: "Creates S3 buckets for the virtual assistant application."
      }
    );

    const cloudFrontStack = new CloudFrontStack(
      this,
      "cloudfront-stack",
      {
        envName: props.envName,
        appName: props.appName,
        origin: s3Stack.getFrontendBucket(),
        description: "Creates CloudFront distribution for the virtual assistant application."
      }
    );

    const dynamodbStack = new DynamodbStack(
      this,
      "dynamodb-stack",
      {
        envName: props.envName,
        appName: props.appName,
        description: "Creates DynamoDB tables for the virtual assistant application."
      }
    );

    const lambdaStack = new LambdaStack(
      this,
      "lambda-stack",
      {
        envName: props.envName,
        appName: props.appName,
        resourcesBucket: s3Stack.getResourcesBucket(),
        requestsTable: dynamodbStack.getRequestsTable(),
        description: "Creates Lambda functions for the virtual assistant application.",
      }
    );

    const apiGatewayStack = new ApiGatewayStack(
      this,
      "api-gateway-stack",
      {
        envName: props.envName,
        appName: props.appName,
        onMessageHandlerFunction: lambdaStack.getOnMessageHandlerFunction(),
        description: "Creates API Gateway resources for the virtual assistant application."
      }
    );

    const eventBridgeStack = new EventbridgeStack(
      this,
      "eventbridge-stack",
      {
        envName: props.envName,
        appName: props.appName,
        onTranscribeJobCompletedHandler: lambdaStack.getOnTranscribeJobCompletedHandlerFunction(),
        description: "Creates EventBridge rules for the virtual assistant application."
      }
    );

    const iamStack = new IamStack(
      this,
      "iam-stack",
      {
        envName: props.envName,
        appName: props.appName,
        webSocketApi: apiGatewayStack.getWebSocketApi(),
        onTranscribeJobCompletedHandler: lambdaStack.getOnTranscribeJobCompletedHandlerFunction(),
        description: "Creates IAM roles and policies for the virtual assistant application."
      },
    );

  }
}
