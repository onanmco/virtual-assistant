import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {IWebSocketApi, WebSocketApi, WebSocketStage} from "aws-cdk-lib/aws-apigatewayv2";
import {WebSocketLambdaIntegration} from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {IFunction} from "aws-cdk-lib/aws-lambda";
import {Construct} from "constructs";

export interface ApiGatewayStackProps extends NestedStackProps {
  appName: string;
  envName: string;
  onMessageHandlerFunction: IFunction;
}

export class ApiGatewayStack extends NestedStack {

  private readonly webSocketApi: IWebSocketApi;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);


    this.webSocketApi = new WebSocketApi(this, 'websocket-api', {
      apiName: `${props.envName}-${props.appName}-websocket-api`,
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration("on-message-handler", props.onMessageHandlerFunction)
      }
    });

    new WebSocketStage(this, 'latest-stage', {
      webSocketApi: this.webSocketApi,
      stageName: 'latest',
      autoDeploy: true,
    });

  }

  public getWebSocketApi() {
    return this.webSocketApi;
  }

}