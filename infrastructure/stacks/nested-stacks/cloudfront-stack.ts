import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { AllowedMethods, CachePolicy, CachedMethods, Distribution, IDistribution, OriginAccessIdentity, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface CloudFrontStackProps extends NestedStackProps {
  appName: string;
  envName: string;
  origin: IBucket;
}

export class CloudFrontStack extends NestedStack {

  private readonly cdnDistribution: IDistribution;

  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    const originAccessIdentity = new OriginAccessIdentity(props.origin.stack, "origin-access-identity");
    props.origin.grantRead(originAccessIdentity);

    this.cdnDistribution = new Distribution(
      props.origin.stack,
      "cdn-distribution",
      {
        enabled: true,
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: new S3Origin(props.origin, {
            originAccessIdentity: originAccessIdentity
          }),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED
        }
      }
    );

  }

  public getCdnDistribution() {
    return this.cdnDistribution;
  }

  public getDomainName() {
    return `https://${this.cdnDistribution.distributionDomainName}`;
  }

}