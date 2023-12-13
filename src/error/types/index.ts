export interface WebSocketError extends Error {
  statusCode: number;
  message: string;
  details?: string[];
}