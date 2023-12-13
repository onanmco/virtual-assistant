import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { Bucket, BucketEncryption, HttpMethods, IBucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export interface S3StackProps extends NestedStackProps {
  appName: string;
  envName: string;
}

export class S3Stack extends NestedStack {

  private readonly frontendBucket: IBucket;
  private readonly resourcesBucket: IBucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    this.frontendBucket = new Bucket(
      this,
      "frontend-bucket",
      {
        bucketName: `${props.envName}-${props.appName}-frontend`,
        blockPublicAccess: {
          blockPublicAcls: true,
          blockPublicPolicy: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: true
        },
        enforceSSL: true,
        encryption: BucketEncryption.S3_MANAGED
      }
    );

    new BucketDeployment(
      this,
      "frontend-bucket-deployment",
      {
        sources: [
          Source.asset("resources/website/")
        ],
        destinationKeyPrefix: "/",
        destinationBucket: this.frontendBucket
      }
    );

    this.resourcesBucket = new Bucket(
      this,
      "resources-bucket",
      {
        bucketName: `${props.envName}-${props.appName}-resources`,
        blockPublicAccess: {
          blockPublicAcls: true,
          blockPublicPolicy: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: true
        },
        enforceSSL: true,
        encryption: BucketEncryption.S3_MANAGED,
        cors: [
          {
            allowedMethods: [
              HttpMethods.GET,
              HttpMethods.POST,
              HttpMethods.PUT,
            ],
            allowedOrigins: ['*'],
            allowedHeaders: ['*'],
          },
        ]
      }
    );

  }

  public getFrontendBucket() {
    return this.frontendBucket;
  }

  public getResourcesBucket() {
    return this.resourcesBucket;
  }

}