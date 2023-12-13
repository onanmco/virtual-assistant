export interface Request {
  connectionId: string;
  uuid?: string;
  transcribeInputKey?: string;
  transcribeInputBucket?: string;
  transcribeOutputKey?: string;
  transcribeOutputBucket?: string;
  apiGatewayEndpoint: string;
}