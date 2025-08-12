import { NextResponse } from 'next/server';
import { elevenLabsAPI } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { text, voice_id } = await request.json();

    // Validate input
    if (!text || !voice_id) {
      return NextResponse.json({
        success: false,
        message: 'Text and voice_id are required'
      }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({
        success: false,
        message: 'Text must be 500 characters or less'
      }, { status: 400 });
    }

    // Check if we should use mock data
    const useMock = true; // Hardcoded for portfolio safety
    
    if (useMock) {
      // Return a random mock audio URL
      const mockAudioUrls = [
        '/mock-audio-1.mp3',
        '/mock-audio-2.mp3',
        '/mock-audio-3.mp3',
        '/mock-audio-4.mp3',
        '/mock-audio-5.mp3'
      ];
      
      const randomAudioUrl = mockAudioUrls[Math.floor(Math.random() * mockAudioUrls.length)];
      const mockVoiceNames: Record<string, string> = {
        '9BWtsMINqrJLrRacOk9x': 'Aria',
        'EXAVITQu4vr4xnSDxMaL': 'Sarah',
        '21m00Tcm4TlvDq8ikWAM': 'Rachel',
        'AZnzlk1XvdvUeBnXmlld': 'Domi',
        'pNInz6obpgDQGcFmaJgB': 'Bella'
      };

      return NextResponse.json({
        success: true,
        data: {
          audioUrl: randomAudioUrl,
          audioFormat: 'mp3',
          duration: Math.floor(Math.random() * 30) + 10,
          voiceName: mockVoiceNames[voice_id] || 'Unknown Voice',
          message: 'Mock audio generated successfully'
        }
      });
    }

    // Generate real audio using ElevenLabs API
    const audioStream = await elevenLabsAPI.generate({
      voice: voice_id,
      model_id: 'eleven_multilingual_v2',
      text,
      output_format: 'mp3_44100_128',
    });

    // Convert stream to Buffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));

    // Convert Buffer → base64
    const base64Audio = buffer.toString('base64');

    // Get voice details for response
    const voice = await elevenLabsAPI.getVoice(voice_id);

    return NextResponse.json({
      success: true,
      data: {
        audioData: base64Audio,
        audioFormat: 'mp3',
        duration: Math.floor(buffer.length / 16000), // Rough estimate
        voiceName: voice.name,
        message: 'Audio generated successfully'
      }
    });
    
  } catch (error) {
    console.error('Error generating audio:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate audio'
    }, { status: 500 });
  }
} 