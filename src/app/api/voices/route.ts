import { NextResponse } from 'next/server';
import { elevenLabsAPI } from '@/lib/api';

// Mock voices for portfolio/demo purposes
const MOCK_VOICES = [
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

export async function GET() {
  try {
    // Check if we should use mock data
    const useMock = true; // Hardcoded for portfolio safety
    
    if (useMock) {
      return NextResponse.json({
        success: true,
        data: MOCK_VOICES
      });
    }

    // Fetch real voices from ElevenLabs
    const voices = await elevenLabsAPI.getVoices();
    
    // Filter to only premade voices and limit to 5
    const premadeVoices = voices
      .filter(voice => voice.category === 'premade')
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: premadeVoices
    });
    
  } catch (error) {
    console.error('Error fetching voices:', error);
    
    // Fallback to mock data
    return NextResponse.json({
      success: true,
      data: MOCK_VOICES
    });
  }
} 