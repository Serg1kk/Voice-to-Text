export enum LoadingState {
  IDLE = 'IDLE',
  READING_FILE = 'READING_FILE',
  TRANSCRIBING = 'TRANSCRIBING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface TranscriptionResult {
  text: string;
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  file: File;
}

export type ProgressCallback = (message: string) => void;