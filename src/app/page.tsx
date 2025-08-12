'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Alert,
  Snackbar
} from '@mui/material';
import TextInput from '@/components/TextInput';
import VoiceSelector from '@/components/VoiceSelector';
import GenerateButton from '@/components/GenerateButton';
import AudioPlayer from '@/components/AudioPlayer';
import HistoryTab from '@/components/HistoryTab';
import { APIService } from '@/lib/services';
import { storageManager } from '@/lib/storage';
import { GeneratedAudio } from '@/types';

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default function Home() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');

  // Clear any cached voice data on mount
  useEffect(() => {
    // Clear any old voice data from localStorage
    const oldVoiceData = localStorage.getItem('selectedVoice');
    if (oldVoiceData) {
      localStorage.removeItem('selectedVoice');
    }

    // Load last generated audio using storage manager
    const lastAudio = storageManager.getLastGeneratedAudio();

    if (lastAudio) {
      try {
        let audioUrl: string;

        if (lastAudio.audioData) {
          // Convert base64 to blob URL
          const audioBytes = atob(lastAudio.audioData);
          const audioArray = new Uint8Array(audioBytes.length);
          for (let i = 0; i < audioBytes.length; i++) {
            audioArray[i] = audioBytes.charCodeAt(i);
          }
          const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
          audioUrl = URL.createObjectURL(audioBlob);
        } else if (lastAudio.audioUrl) {
          audioUrl = lastAudio.audioUrl;
        } else {
          throw new Error('No audio data available');
        }

        // Set the state
        setText(lastAudio.text);
        setSelectedVoice(lastAudio.voiceId);
        setAudioUrl(audioUrl);
        setGeneratedAudio({
          id: lastAudio.id,
          text: lastAudio.text,
          voiceId: lastAudio.voiceId,
          voiceName: lastAudio.voiceName,
          audioUrl: audioUrl,
          timestamp: lastAudio.timestamp,
          duration: lastAudio.duration,
        });
      } catch (error) {
        console.error('Error loading last audio from storage:', error);
        // Clear invalid data
        storageManager.clearHistory();
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) {
      setError('Please enter text and select a voice');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const result = await APIService.generateAudio(text, selectedVoice);
      
      let finalAudioUrl: string;

      if (result.audioData) {
        // Convert base64 to blob URL
        const audioBytes = atob(result.audioData);
        const audioArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
          audioArray[i] = audioBytes.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        finalAudioUrl = URL.createObjectURL(audioBlob);
      } else if (result.audioUrl) {
        // Use direct URL (for mock data)
        finalAudioUrl = result.audioUrl;
      } else {
        throw new Error('No audio data received');
      }

      // Add to storage using storage manager
      const storedAudio = {
        id: Date.now().toString(),
        text: text,
        voiceId: selectedVoice,
        voiceName: result.voiceName,
        audioUrl: finalAudioUrl,
        timestamp: Date.now(),
        duration: result.duration,
        audioData: result.audioData, // Store base64 data for history
      };
      storageManager.addToHistory(storedAudio);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };


  const handleCloseError = () => {
    setError('');
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                color: 'white', 
                mb: 1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              AI Voice Studio
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300
              }}
            >
              Transform your text into realistic AI speech
            </Typography>
          </Box>

          {/* Main Content */}
          <Box maxWidth="md" mx="auto">
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4, 
                mb: 3,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <TextInput 
                value={text} 
                onChange={setText} 
              />
              
              <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'flex-end' }}>
                <Box sx={{ flex: { sm: 1 } }}>
                  <VoiceSelector 
                    selectedVoice={selectedVoice}
                    onVoiceSelect={setSelectedVoice}
                  />
                </Box>
                <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'flex-end' }}>
                  <GenerateButton 
                    onClick={handleGenerate}
                    disabled={!text.trim() || !selectedVoice || isGenerating}
                    loading={isGenerating}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Audio Player */}
            {audioUrl && generatedAudio && (
              <Paper 
                elevation={8} 
                sx={{ 
                  p: 4, 
                  mb: 3,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <AudioPlayer audioUrl={audioUrl} />
              </Paper>
            )}

            {/* History Tab */}
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <HistoryTab 
                isOpen={showHistory}
                onToggle={() => setShowHistory(!showHistory)}
              />
            </Paper>
          </Box>
        </Container>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseError} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
