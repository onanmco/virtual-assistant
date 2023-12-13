import {EventBridgeEvent} from "aws-lambda";

export interface TranscribeJobStateChangeEventDetails {
  TranscriptionJobName: string;
  TranscriptionJobStatus: string;
}

export type Handler = (event: EventBridgeEvent<"TranscribeJobStateChangeEvent", TranscribeJobStateChangeEventDetails>) => Promise<void>;