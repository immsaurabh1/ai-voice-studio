'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Button,
  Collapse,
  Divider,
  List,
  ListItem,
  Chip
} from '@mui/material';
import {
  ExpandMore,
  PlayArrow,
  Delete,
  History,
  Clear
} from '@mui/icons-material';
import { storageManager, StoredAudio } from '@/lib/storage';

interface HistoryTabProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function HistoryTab({ isOpen, onToggle }: HistoryTabProps) {
  const [history, setHistory] = useState<StoredAudio[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      const historyData = storageManager.getHistory();
      setHistory(historyData);
    };

    loadHistory();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai-voice-studio-data') {
        loadHistory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const removeFromHistory = (id: string) => {
    storageManager.removeFromHistory(id);
    setHistory(storageManager.getHistory());
  };

  const clearHistory = () => {
    storageManager.clearHistory();
    setHistory([]);
  };

  const refreshHistory = () => {
    setHistory(storageManager.getHistory());
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePlayAudio = (item: StoredAudio) => {
    try {
      let audioUrl: string;
      
      if (item.audioData) {
        // Convert base64 to blob URL
        const audioBytes = atob(item.audioData);
        const audioArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
          audioArray[i] = audioBytes.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        audioUrl = URL.createObjectURL(audioBlob);
      } else if (item.audioUrl) {
        // For mock audio files, use the actual files
        const mockAudioMapping: Record<string, string> = {
          '/mock-audio-1.mp3': '/mock-audio-1.mp3',
          '/mock-audio-2.mp3': '/mock-audio-2.mp3',
          '/mock-audio-3.mp3': '/mock-audio-3.mp3',
          '/mock-audio-4.mp3': '/mock-audio-4.mp3',
          '/mock-audio-5.mp3': '/mock-audio-5.mp3',
        };
        
        audioUrl = mockAudioMapping[item.audioUrl] || item.audioUrl;
      } else {
        throw new Error('No audio data available');
      }
      
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing audio from history:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2
      }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          History
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={refreshHistory}
            sx={{ color: 'info.main' }}
            title="Refresh History"
          >
            <Typography variant="caption">🔄</Typography>
          </IconButton>
          <IconButton
            size="small"
            onClick={clearHistory}
            sx={{ color: 'error.main' }}
            title="Clear All History"
          >
            <Typography variant="caption">🧹</Typography>
          </IconButton>
          <IconButton
            onClick={onToggle}
            sx={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <ExpandMore />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isOpen}>
        <Box sx={{ mt: 2 }}>
          {history.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}>
              <History sx={{ 
                fontSize: 48, 
                mb: 2, 
                color: 'text.disabled',
                mx: 'auto',
                display: 'block'
              }} />
              <Typography variant="body2">
                No history yet. Generate some audio to see it here!
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={{ p: 0 }}>
                {history.map((item, index) => (
                  <Box key={item.id}>
                    <ListItem sx={{ 
                      p: 0, 
                      mb: 2,
                      display: 'block'
                    }}>
                      <Card sx={{ 
                        width: '100%',
                        backgroundColor: 'grey.50',
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        }
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            justifyContent: 'space-between'
                          }}>
                            <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                mb: 1 
                              }}>
                                <Chip
                                  label={item.voiceName}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(item.timestamp)}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.4,
                                }}
                              >
                                {item.text}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              flexShrink: 0
                            }}>
                              <IconButton
                                size="small"
                                onClick={() => handlePlayAudio(item)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    backgroundColor: 'primary.light',
                                    color: 'white',
                                  },
                                }}
                              >
                                <PlayArrow fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => removeFromHistory(item.id)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    backgroundColor: 'error.light',
                                    color: 'white',
                                  },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </ListItem>
                    {index < history.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 3 
              }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Clear />}
                  onClick={clearHistory}
                  size="small"
                >
                  Clear All History
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
} 