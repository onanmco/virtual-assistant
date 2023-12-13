import {injectable} from "inversify";
import {documentClient} from "../../client/dynamodb";
import {GetCommand, PutCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";
import {Request} from "./types";
import {IRequestRepository} from "./interface/request-repository";

@injectable()
export class RequestRepository implements IRequestRepository {

  private static TABLE_NAME = process.env.REQUESTS_TABLE_NAME!;

  public async getByConnectionId(connectionId: string): Promise<Request | undefined> {
    const {Item} = await documentClient.send(
      new GetCommand(
        {
          TableName: RequestRepository.TABLE_NAME,
          Key: {
            connectionId: connectionId
          }
        }
      )
    );

    return Item as Request | undefined;
  }


  public async put(request: Request): Promise<Request> {
    await documentClient.send(
      new PutCommand(
        {
          TableName: RequestRepository.TABLE_NAME,
          Item: request
        }
      )
    );

    return await this.getByConnectionId(request.connectionId) as Request;
  }

  public async getByTranscribeInputKey(key: string): Promise<Request | undefined> {
    const {Items} = await documentClient.send(
      new QueryCommand(
        {
          TableName: RequestRepository.TABLE_NAME,
          IndexName: "transcribe-input-key-index",
          ExpressionAttributeValues: {
            ":transcribeInputKey": key
          },
          ExpressionAttributeNames: {
            "#transcribeInputKey": "transcribeInputKey"
          },
          KeyConditionExpression: "#transcribeInputKey = :transcribeInputKey"
        }
      )
    );

    if (Items && Items.length > 0) {
      return Items[0] as Request;
    }

    return undefined;
  }

  public async getByUuid(uuid: string): Promise<Request | undefined> {
    const {Items} = await documentClient.send(
      new QueryCommand(
        {
          TableName: RequestRepository.TABLE_NAME,
          IndexName: "uuid-index",
          ExpressionAttributeValues: {
            ":uuid": uuid
          },
          ExpressionAttributeNames: {
            "#uuid": "uuid"
          },
          KeyConditionExpression: "#uuid = :uuid"
        }
      )
    );

    if (Items && Items.length > 0) {
      return Items[0] as Request;
    }

    return undefined;

  }

}