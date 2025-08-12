'use client';

import { 
  TextField, 
  Box, 
  Typography,
  FormHelperText
} from '@mui/material';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextInput({ value, onChange }: TextInputProps) {
  const maxChars = 500;
  const charCount = value.length;
  const isOverLimit = charCount > maxChars;

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
        Enter your text
      </Typography>
      
      <TextField
        multiline
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your message here... (max 500 characters)"
        fullWidth
        variant="outlined"
        error={isOverLimit}
        inputProps={{
          maxLength: maxChars,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: isOverLimit ? 'error.main' : 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: isOverLimit ? 'error.main' : 'primary.main',
            },
          },
        }}
      />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mt: 1 
      }}>
        <FormHelperText 
          error={isOverLimit}
          sx={{ 
            fontSize: '0.875rem',
            color: isOverLimit ? 'error.main' : 'text.secondary'
          }}
        >
          {charCount}/{maxChars} characters
        </FormHelperText>
        
        {isOverLimit && (
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ fontWeight: 500 }}
          >
            Character limit exceeded!
          </Typography>
        )}
      </Box>
    </Box>
  );
}
