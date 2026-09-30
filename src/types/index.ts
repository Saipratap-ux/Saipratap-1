export type AgentState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'interrupted'
  | 'error'
  | 'completed';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  language?: string;
  audioBase64?: string;
  isVoice?: boolean;
  status?: 'sending' | 'success' | 'interrupted' | 'error';
}

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  greeting: string;
  samplePrompt: string;
  region: string;
}

export interface VoiceSettings {
  ttsEngine: 'gemini' | 'browser';
  geminiVoice: 'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon';
  browserVoiceURI: string;
  speakingRate: number;
  pitch: number;
  sttEngine: 'webspeech' | 'gemini_transcribe';
  continuousMode: boolean;
  micDeviceId: string;
  visualizerMode: 'wave' | 'radial' | 'frequency';
  autoPlayVoice: boolean;
}

export interface ErrorInfo {
  code:
    | 'MIC_PERMISSION_DENIED'
    | 'MIC_NOT_FOUND'
    | 'MIC_RESTRICTED'
    | 'SPEECH_NOT_SUPPORTED'
    | 'NETWORK_ERROR'
    | 'API_TIMEOUT'
    | 'EMPTY_AUDIO'
    | 'TTS_FAILED'
    | 'UNKNOWN';
  title: string;
  message: string;
  recoverySuggestion: string;
  canRetry: boolean;
}

export interface QuickPrompt {
  id: string;
  label: string;
  query: string;
  category: 'general' | 'culture' | 'tech' | 'creativity';
}
