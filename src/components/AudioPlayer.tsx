'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Download,
} from '@mui/icons-material';

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    const time = newValue as number;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'generated-audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate waveform data (simulated)
  const waveformData = Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.2);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 3 }}>
        Generated Audio
      </Typography>
      
      {/* Waveform Visualization */}
      <Card sx={{ mb: 3, backgroundColor: 'grey.100' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between', 
            height: 64,
            gap: 0.5
          }}>
            {waveformData.map((height, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  backgroundColor: 'primary.main',
                  borderRadius: 0.5,
                  transition: 'all 0.2s ease',
                  height: `${height * 100}%`,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'scaleY(1.1)',
                  },
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Audio Controls */}
      <Box sx={{ spaceY: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 2
        }}>
          <IconButton
            onClick={togglePlay}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          
          <Box sx={{ flex: 1, mx: 2 }}>
            <Slider
              value={currentTime}
              onChange={handleSeek}
              max={duration || 0}
              min={0}
              sx={{
                '& .MuiSlider-track': {
                  backgroundColor: 'primary.main',
                },
                '& .MuiSlider-thumb': {
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: 'right' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<Download />}
            onClick={handleDownload}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Download
          </Button>
        </Box>
      </Box>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </Box>
  );
}
