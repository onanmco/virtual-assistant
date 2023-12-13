import {Construct} from "constructs";
import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {AttributeType, BillingMode, ProjectionType, Table} from "aws-cdk-lib/aws-dynamodb";

export interface DynamodbStackProps extends NestedStackProps {
  appName: string;
  envName: string;
}

export class DynamodbStack extends NestedStack {

  private readonly requestsTable: Table;

  constructor(scope: Construct, id: string, props: DynamodbStackProps) {
    super(scope, id, props);

    this.requestsTable = new Table(this, "requests-table", {
      tableName: `${props.envName}-${props.appName}-requests`,
      partitionKey: {
        name: "connectionId",
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.requestsTable.addGlobalSecondaryIndex({
      indexName: "transcribe-input-key-index",
      projectionType: ProjectionType.ALL,
      partitionKey: {
        name: "transcribeInputKey",
        type: AttributeType.STRING
      }
    });

    this.requestsTable.addGlobalSecondaryIndex({
      indexName: "uuid-index",
      projectionType: ProjectionType.ALL,
      partitionKey: {
        name: "uuid",
        type: AttributeType.STRING
      }
    });

  }

  public getRequestsTable() {
    return this.requestsTable;
  }

}