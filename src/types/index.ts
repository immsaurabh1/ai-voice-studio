// Application types

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  verified_languages?: Array<{
    language: string;
    model_id: string;
    accent: string;
    locale: string | null;
    preview_url: string;
  }>;
}

export interface AppVoice {
  id: string;
  name: string;
  description: string;
}

export interface GeneratedAudio {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  audioUrl: string;
  duration: number;
  timestamp: number;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface GenerationSettings {
  model_id: string;
  voice_settings: VoiceSettings;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerationResponse {
  audioData?: string; // base64 encoded audio data
  audioUrl?: string; // for mock data
  audioFormat?: string;
  duration: number;
  voiceName: string;
  message?: string;
} 