import {Duration, NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {IBucket} from "aws-cdk-lib/aws-s3";
import {Architecture, IFunction, Runtime} from "aws-cdk-lib/aws-lambda";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {ManagedPolicy} from "aws-cdk-lib/aws-iam";
import {LambdaDestination} from "aws-cdk-lib/aws-s3-notifications";
import {Table} from "aws-cdk-lib/aws-dynamodb";

export interface LambdaStackProps extends NestedStackProps {
  appName: string;
  envName: string;
  resourcesBucket: IBucket;
  requestsTable: Table;
}

export class LambdaStack extends NestedStack {

  private readonly onMessageHandler: IFunction;
  private readonly onAudioUploadedHandler: IFunction;
  private readonly onTranscribeJobCompletedHandler: IFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.onMessageHandler = new NodejsFunction(
      this,
      "on-message-handler-function",
      {
        functionName: `${props.envName}-${props.appName}-on-message-handler`,
        architecture: Architecture.X86_64,
        timeout: Duration.seconds(30),
        memorySize: 1024,
        runtime: Runtime.NODEJS_18_X,
        entry: "src/lambda/on-message-handler/index.ts",
        handler: "handler",
        bundling: {
          minify: true,
          sourceMap: true,
          nodeModules: [
            "@aws-sdk/client-bedrock-runtime",
            "@smithy/types"
          ]
        },
        environment: {
          "RESOURCES_BUCKET": props.resourcesBucket.bucketName,
          "REQUESTS_TABLE_NAME": props.requestsTable.tableName,
          "NODE_OPTIONS": "--enable-source-maps"
        }
      }
    );

    props.resourcesBucket.grantReadWrite(this.onMessageHandler);
    props.requestsTable.grantReadWriteData(this.onMessageHandler);

    this.onAudioUploadedHandler = new NodejsFunction(
      props.resourcesBucket.stack,
      "on-audio-uploaded-handler-function",
      {
        functionName: `${props.envName}-${props.appName}-on-audio-uploaded-handler`,
        architecture: Architecture.X86_64,
        timeout: Duration.seconds(60),
        memorySize: 1024,
        runtime: Runtime.NODEJS_18_X,
        entry: "src/lambda/on-audio-uploaded-handler/index.ts",
        handler: "handler",
        bundling: {
          minify: true,
          sourceMap: true,
          nodeModules: [
            "@aws-sdk/client-bedrock-runtime",
            "@smithy/types"
          ]
        },
        environment: {
          "REQUESTS_TABLE_NAME": props.requestsTable.tableName,
          "NODE_OPTIONS": "--enable-source-maps"
        }
      }
    );

    props.requestsTable.grantReadWriteData(this.onAudioUploadedHandler);
    props.resourcesBucket.grantReadWrite(this.onAudioUploadedHandler);
    this.onAudioUploadedHandler.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AmazonTranscribeFullAccess"));
    props.resourcesBucket.addObjectCreatedNotification(
      new LambdaDestination(this.onAudioUploadedHandler),
      {
        prefix: "transcribe-inputs/",
        suffix: ".wav"
      }
    );

    this.onTranscribeJobCompletedHandler = new NodejsFunction(
      this,
      "on-transcribe-job-completed-handler-function",
      {
        functionName: `${props.envName}-${props.appName}-on-transcribe-job-completed-handler`,
        architecture: Architecture.X86_64,
        timeout: Duration.seconds(30),
        memorySize: 1024,
        runtime: Runtime.NODEJS_18_X,
        entry: "src/lambda/on-transcribe-job-completed-handler/index.ts",
        handler: "handler",
        bundling: {
          minify: true,
          sourceMap: true,
          nodeModules: [
            "@aws-sdk/client-bedrock-runtime",
            "@smithy/types"
          ]
        },
        environment: {
          "REQUESTS_TABLE_NAME": props.requestsTable.tableName,
          "RESOURCES_BUCKET": props.resourcesBucket.bucketName,
          "NODE_OPTIONS": "--enable-source-maps"
        }
      }
    );

    props.requestsTable.grantReadData(this.onTranscribeJobCompletedHandler);
    props.resourcesBucket.grantReadWrite(this.onTranscribeJobCompletedHandler);
    this.onTranscribeJobCompletedHandler.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AmazonPollyFullAccess"));

  }

  public getOnMessageHandlerFunction() {
    return this.onMessageHandler;
  }

  public getOnTranscribeJobCompletedHandlerFunction() {
    return this.onTranscribeJobCompletedHandler;
  }

}