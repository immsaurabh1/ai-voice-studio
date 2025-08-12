'use client';

import { Button, CircularProgress } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function GenerateButton({ onClick, disabled, loading }: GenerateButtonProps) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <PlayArrow />
        )
      }
      sx={{
        height: 56, // Match Material-UI FormControl default height
        px: 3,
        py: 1.5,
        borderRadius: 2,
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 500,
        minWidth: 160,
        boxShadow: 3,
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      {loading ? 'Generating...' : 'Generate Audio'}
    </Button>
  );
} 