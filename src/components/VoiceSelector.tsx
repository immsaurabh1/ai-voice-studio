'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { PlayArrow, ExpandMore, Stop } from '@mui/icons-material';
import { APIService } from '@/lib/services';
import { Voice } from '@/types';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
}

// We'll use the preview_url from the API response instead of hardcoded files

export default function VoiceSelector({ selectedVoice, onVoiceSelect }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedVoices = await APIService.fetchVoices();
        setVoices(fetchedVoices);
        
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load voices');
        setLoading(false);
      }
    };

    loadVoices();
  }, []);

  const handleVoicePreview = async (voiceId: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPreviewingVoice(voiceId);
    setIsPlaying(voiceId);

    try {
      // Find the voice data to get the preview URL
      const voiceData = voices.find(voice => voice.voice_id === voiceId);
      if (!voiceData) {
        throw new Error('Voice not found');
      }
      
      // Use the preview URL from the API response
      // Priority: 1. verified_languages[0].preview_url (English), 2. preview_url, 3. samples[0].url
      const englishPreview = voiceData.verified_languages?.find(vl => vl.language === 'en')?.preview_url;
      const audioUrl = englishPreview || voiceData.preview_url;
      if (!audioUrl) {
        throw new Error('No preview audio available for this voice');
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('ended', () => {
        setIsPlaying(null);
        setPreviewingVoice(null);
      });

      audio.addEventListener('error', () => {
        setIsPlaying(null);
        setPreviewingVoice(null);
        console.error('Error playing preview audio');
      });

      // Play the audio
      await audio.play();
      
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setIsPlaying(null);
      setPreviewingVoice(null);
    }
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(null);
    setPreviewingVoice(null);
  };

  const handleChange = (event: SelectChangeEvent) => {
    onVoiceSelect(event.target.value);
  };

  
  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography 
          variant="subtitle1" 
          component="label" 
          sx={{ 
            mb: 1, 
            fontWeight: 500,
            color: 'text.primary'
          }}
        >
          Select Voice
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 56,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}>
          <CircularProgress size={24} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography 
          variant="subtitle1" 
          component="label" 
          sx={{ 
            mb: 1, 
            fontWeight: 500,
            color: 'text.primary'
          }}
        >
          Select Voice
        </Typography>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography 
        variant="subtitle1" 
        component="label" 
        sx={{ 
          mb: 1, 
          fontWeight: 500,
          color: 'text.primary'
        }}
      >
        Select Voice
      </Typography>
      
      <FormControl fullWidth variant="outlined">
        <InputLabel id="voice-select-label">Choose a voice...</InputLabel>
        <Select
          labelId="voice-select-label"
          value={selectedVoice}
          onChange={handleChange}
          label="Choose a voice..."
          IconComponent={ExpandMore}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: 2,
            },
          }}
        >
          {voices.map((voice) => (
            <MenuItem key={voice.voice_id} value={voice.voice_id}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                width: '100%',
                py: 0.5
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {voice.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {voice.description}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPlaying === voice.voice_id) {
                      stopPreview();
                    } else {
                      handleVoicePreview(voice.voice_id);
                    }
                  }}
                  disabled={previewingVoice === voice.voice_id && isPlaying !== voice.voice_id}
                  sx={{
                    ml: 1,
                    color: isPlaying === voice.voice_id ? 'error.main' : 'primary.main',
                    '&:hover': {
                      backgroundColor: isPlaying === voice.voice_id ? 'error.light' : 'primary.light',
                      color: 'white',
                    },
                  }}
                >
                  {previewingVoice === voice.voice_id && isPlaying !== voice.voice_id ? (
                    <CircularProgress size={16} />
                  ) : isPlaying === voice.voice_id ? (
                    <Stop fontSize="small" />
                  ) : (
                    <PlayArrow fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
