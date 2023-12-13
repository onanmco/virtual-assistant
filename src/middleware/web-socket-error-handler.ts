import middy from "@middy/core";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { WebSocketError } from "../error/types";

export const webSocketErrorHandler = (): middy.MiddlewareObj => {
  const handler: middy.MiddlewareFn = async (request) => {
    const {
      message,
      statusCode,
      details
    } = request.error as WebSocketError;

    if (statusCode) {
      const response: APIGatewayProxyStructuredResultV2 = {
        body: JSON.stringify({
          statusCode,
          message,
          details
        }),
        statusCode
      }
  
      request.response = response;
    } else {
      const response: APIGatewayProxyStructuredResultV2 = {
        body: JSON.stringify({
          statusCode: 500,
          message: "Internal server error"
        }),
        statusCode: 500
      };
  
      request.response = response;
    }

  }

  return {
    onError: handler
  };
}