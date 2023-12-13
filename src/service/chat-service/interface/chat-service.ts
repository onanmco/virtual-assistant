export interface IChatService {
  ask(question: string): Promise<string>;
}