import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Effect, Policy, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {IWebSocketApi} from "aws-cdk-lib/aws-apigatewayv2";
import {IFunction} from "aws-cdk-lib/aws-lambda";

export interface IamStackProps extends NestedStackProps {
  appName: string;
  envName: string;
  webSocketApi: IWebSocketApi;
  onTranscribeJobCompletedHandler: IFunction;
}

export class IamStack extends NestedStack {

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    const manageConnectionsPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "execute-api:ManageConnections"
      ],
      resources: [
        `arn:${this.partition}:execute-api:${this.region}:${this.account}:${props.webSocketApi.apiId}*`
      ]
    });

    const bedrockInvokeModelPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "bedrock:InvokeModel"
      ],
      resources: [
        "*"
      ]
    });

    const manageConnectionsPolicy = new Policy(this, "manage-connections-policy", {});
    manageConnectionsPolicy.addStatements(manageConnectionsPolicyStatement);
    props.onTranscribeJobCompletedHandler.role?.attachInlinePolicy(manageConnectionsPolicy);

    const bedrockPolicy = new Policy(this, "bedrock-policy", {});
    bedrockPolicy.addStatements(bedrockInvokeModelPolicyStatement);
    props.onTranscribeJobCompletedHandler.role?.attachInlinePolicy(bedrockPolicy);

  }

}