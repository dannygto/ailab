import React from 'react';
import { Box, Typography } from '@mui/material';

const AIChatInterface: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        AI 聊天助手
      </Typography>
      <Typography variant="body1">
        AI 聊天助手正在开发中...
      </Typography>
    </Box>
  );
};

export default AIChatInterface;