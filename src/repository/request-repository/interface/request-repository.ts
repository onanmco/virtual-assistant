import {Request} from "../types";

export interface IRequestRepository {
  getByConnectionId(connectionId: string): Promise<Request | undefined>;

  getByTranscribeInputKey(key: string): Promise<Request | undefined>;

  getByUuid(uuid: string): Promise<Request | undefined>;

  put(request: Request): Promise<Request>;
}