import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { InfoIcon } from '../utils/icons';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 100px)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500,
        }}
      >
        <ErrorIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          404 - 页面未找�?
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" paragraph>
          您请求的页面不存在或已被移除。请检查URL是否正确或返回首页�?
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          sx={{ mt: 3 }}
        >
          返回首页
        </Button>
      </Paper>
    </div>
  );
};

export default NotFound;
