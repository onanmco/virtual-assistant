export interface TitanInputBody {
  inputText: string;
  textGenerationConfig: {
    temperature: number;
    topP: number;
    maxTokenCount: number;
    stopSequences: string[];
  };
}

export interface TitanOutput {
  inputTextTokenCount: number;
  results: {
    tokenCount: number;
    outputText: string;
    completionReason: string;
  }[];
}