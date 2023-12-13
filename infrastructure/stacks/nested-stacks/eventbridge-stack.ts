import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {IFunction} from "aws-cdk-lib/aws-lambda";
import {Rule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";

export interface EventbridgeStackProps extends NestedStackProps {
  appName: string;
  envName: string;
  onTranscribeJobCompletedHandler: IFunction;
}

export class EventbridgeStack extends NestedStack {

    private readonly transcribeJobStateChangeEventRule: Rule;

    constructor(scope: Construct, id: string, props: EventbridgeStackProps) {
      super(scope, id, props);

      this.transcribeJobStateChangeEventRule = new Rule(
        this,
        "transcribe-job-state-change-event-rule",
        {
          ruleName: `${props.envName}-${props.appName}-transcribe-job-state-change-event-rule`,
          enabled: true,
          description: "Rule that triggers a lambda fybction when a transcribe job state changes",
          eventPattern: {
            source: ["aws.transcribe"],
            detailType: ["Transcribe Job State Change"]
          }
        }
      );

      this.transcribeJobStateChangeEventRule.addTarget(new LambdaFunction(props.onTranscribeJobCompletedHandler));

    }
}