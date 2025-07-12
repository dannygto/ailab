import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h1" component="h1" gutterBottom color="primary">
            404
          </Typography>
          
          <Typography variant="h5" component="h2" gutterBottom>
            页面未找到
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            抱歉，您访问的页面不存在。
          </Typography>
          
          <Button variant="contained" onClick={handleGoHome}>
            返回首页
          </Button>
        </Paper>
      </Box>
    </React.Fragment>
  );
};

export default NotFound;
