// ElevenLabs API utilities using official SDK

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

// Simplified Voice interface with only the fields we actually use
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

export interface TextToSpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export class ElevenLabsAPI {
  private client: ElevenLabsClient;

  constructor(apiKey?: string) {
    this.client = new ElevenLabsClient({
      apiKey: apiKey || ELEVENLABS_API_KEY || "",
    });
  }

  async getVoices(): Promise<Voice[]> {
    try {
      const response = await this.client.voices.getAll();
      // Convert SDK response to our simplified Voice format
      return response.voices.map((voice) => ({
        voice_id: voice.voiceId || "",
        name: voice.name || "",
        category: voice.category || "premade",
        description: voice.description,
        preview_url: voice.previewUrl,
        verified_languages: voice.verifiedLanguages
          ? voice.verifiedLanguages.map((vl) => ({
              language: vl.language || "",
              model_id: vl.modelId || "",
              accent: vl.accent || "",
              locale: vl.locale || null,
              preview_url: vl.previewUrl || "",
            }))
          : undefined,
      }));
    } catch (error) {
      console.error("Error fetching voices:", error);
      throw new Error("Failed to fetch voices from ElevenLabs API");
    }
  }

  async generate(request: {
    voice: string;
    model_id: string;
    text: string;
    output_format: string;
  }): Promise<ReadableStream<Uint8Array>> {
    try {
      const audioStream = await this.client.textToSpeech.convert(request.voice, {
        text: request.text,
        modelId: request.model_id,
        outputFormat: request.output_format as 'mp3_44100_128',
      });

      return audioStream;
    } catch (error) {
      console.error('Error generating speech:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        voiceId: request.voice,
        text: request.text?.substring(0, 50) + '...',
        hasApiKey: !!ELEVENLABS_API_KEY
      });
      throw new Error(`Failed to generate speech from ElevenLabs API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<ArrayBuffer> {
    try {
      const audioStream = await this.client.textToSpeech.convert(
        request.voice_id,
        {
          text: request.text,
          modelId: request.model_id || "eleven_multilingual_v2",
          outputFormat: "mp3_44100_128",
          voiceSettings: request.voice_settings
            ? {
                stability: request.voice_settings.stability,
                similarityBoost: request.voice_settings.similarity_boost,
                style: request.voice_settings.style,
                useSpeakerBoost: request.voice_settings.use_speaker_boost,
              }
            : undefined,
        }
      );

      // Read the stream
      const reader = audioStream.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result.buffer;
    } catch (error) {
      console.error("Error generating speech:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        voiceId: request.voice_id,
        text: request.text?.substring(0, 50) + "...",
        hasApiKey: !!ELEVENLABS_API_KEY,
      });
      throw new Error(
        `Failed to generate speech from ElevenLabs API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getVoice(voiceId: string): Promise<Voice> {
    try {
      const voice = await this.client.voices.get(voiceId);
      // Convert SDK voice to our simplified Voice format
      return {
        voice_id: voice.voiceId || "",
        name: voice.name || "",
        category: voice.category || "premade",
        description: voice.description,
        preview_url: voice.previewUrl,
        verified_languages: voice.verifiedLanguages
          ? voice.verifiedLanguages.map((vl) => ({
              language: vl.language || "",
              model_id: vl.modelId || "",
              accent: vl.accent || "",
              locale: vl.locale || null,
              preview_url: vl.previewUrl || "",
            }))
          : undefined,
      };
    } catch (error) {
      console.error("Error fetching voice:", error);
      throw new Error("Failed to fetch voice from ElevenLabs API");
    }
  }
}

// Default API instance
export const elevenLabsAPI = new ElevenLabsAPI();

// Utility functions
export const convertArrayBufferToBlob = (arrayBuffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): Blob => {
  return new Blob([arrayBuffer], { type: mimeType });
};

export const createAudioUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
}; 