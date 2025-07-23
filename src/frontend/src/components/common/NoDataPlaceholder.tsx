import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SearchOff } from '@mui/icons-material';

interface NoDataPlaceholderProps {
  message: string;
  suggestion?: string;
  actionText?: string;
  onAction?: () => void;
}

const NoDataPlaceholder: React.FC<NoDataPlaceholderProps> = ({
  message,
  suggestion,
  actionText,
  onAction
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        minHeight: 200
      }}
    >
      <SearchOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      {suggestion && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 500, mb: 2 }}>
          {suggestion}
        </Typography>
      )}
      {actionText && onAction && (
        <Button variant="outlined" color="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default NoDataPlaceholder;
