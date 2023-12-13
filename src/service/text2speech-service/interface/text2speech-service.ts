export interface IText2SpeechService {
  getAudioUrlFromText(text: string): Promise<string>;
}