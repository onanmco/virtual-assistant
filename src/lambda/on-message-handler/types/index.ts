import {APIGatewayProxyWebsocketEventV2, APIGatewayProxyStructuredResultV2} from "aws-lambda";

export type Handler = (event: APIGatewayProxyWebsocketEventV2) => Promise<APIGatewayProxyStructuredResultV2>;
