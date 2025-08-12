import { Voice, GenerationResponse } from '@/types';

// API service functions
export class APIService {
  static async fetchVoices(): Promise<Voice[]> {
    try {
      const response = await fetch('/api/voices');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch voices');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  static async generateAudio(text: string, voiceId: string): Promise<GenerationResponse> {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to generate audio');
      }

      return result.data;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }
}

// Mock service for development/testing
export class MockAPIService {
  static async fetchVoices(): Promise<Voice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        voice_id: '9BWtsMINqrJLrRacOk9x',
        name: 'Aria',
        category: 'premade',
        description: 'A middle-aged female with an African-American accent. Calm with a hint of rasp.',
        preview_url: '/mock-audio-1.mp3',
        verified_languages: [
          {
            language: 'en',
            model_id: 'eleven_v2_flash',
            accent: 'american',
            locale: 'en-US',
            preview_url: '/mock-audio-1.mp3'
          }
        ]
      },
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Sarah',
        category: 'premade',
        description: 'Young adult woman with a confident and warm, mature quality and a reassuring, professional tone.',
        preview_url: '/mock-audio-2.mp3',
        verified_languages: [
          {
            language: 'en',
            model_id: 'eleven_turbo_v2',
            accent: 'american',
            locale: 'en-US',
            preview_url: '/mock-audio-2.mp3'
          }
        ]
      },
      {
        voice_id: 'FGY2WhTYpPnrIDTdsKH5',
        name: 'Laura',
        category: 'premade',
        description: 'This young adult female voice delivers sunny enthusiasm with a quirky attitude.',
        preview_url: '/mock-audio-3.mp3',
        verified_languages: [
          {
            language: 'en',
            model_id: 'eleven_v2_flash',
            accent: 'american',
            locale: 'en-US',
            preview_url: '/mock-audio-3.mp3'
          }
        ]
      },
      {
        voice_id: 'IKne3meq5aSn9XLyUdCD',
        name: 'Charlie',
        category: 'premade',
        description: 'A young Australian male with a confident and energetic voice.',
        preview_url: '/mock-audio-4.mp3',
        verified_languages: [
          {
            language: 'en',
            model_id: 'eleven_v2_flash',
            accent: 'australian',
            locale: 'en-AU',
            preview_url: '/mock-audio-4.mp3'
          }
        ]
      },
      {
        voice_id: 'JBFqnCBsd6RMkjVDRZzb',
        name: 'George',
        category: 'premade',
        description: 'Warm resonance that instantly captivates listeners.',
        preview_url: '/mock-audio-5.mp3',
        verified_languages: [
          {
            language: 'en',
            model_id: 'eleven_v2_flash',
            accent: 'british',
            locale: 'en-GB',
            preview_url: '/mock-audio-5.mp3'
          }
        ]
      }
    ];
  }

  static async generateAudio(text: string, voiceId: string): Promise<GenerationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAudioUrls = [
      '/mock-audio-1.mp3',
      '/mock-audio-2.mp3',
      '/mock-audio-3.mp3',
      '/mock-audio-4.mp3',
      '/mock-audio-5.mp3'
    ];
    
    const voiceNames: Record<string, string> = {
      '9BWtsMINqrJLrRacOk9x': 'Aria',
      'EXAVITQu4vr4xnSDxMaL': 'Sarah',
      'FGY2WhTYpPnrIDTdsKH5': 'Laura',
      'IKne3meq5aSn9XLyUdCD': 'Charlie',
      'JBFqnCBsd6RMkjVDRZzb': 'George'
    };
    
    return {
      audioUrl: mockAudioUrls[Math.floor(Math.random() * mockAudioUrls.length)],
      audioFormat: 'mp3',
      duration: Math.floor(Math.random() * 30) + 10,
      voiceName: voiceNames[voiceId] || 'Demo Voice',
      message: 'Mock audio generated'
    };
  }
} 