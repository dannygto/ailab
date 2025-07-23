/**
 * 公共加载状态组件
 * 用于统一展示数据加载状态和错误信息
 */
import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { RefreshIcon } from '../../utils/icons';

interface LoadingStateProps {
  loading?: boolean;
  error?: string | null;
  message?: string;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  fullPage?: boolean;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

/**
 * 加载状态组件
 * 用于显示加载中、错误和空数据状态
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  loading = true,
  error = null,
  message = '',
  loadingMessage = '正在加载数据...',
  errorMessage = '加载失败',
  onRetry,
  fullPage = false,
  size = 'medium',
  overlay = false
}) => {
  // 如果无需显示加载或错误状态，则不渲染
  if (!loading && !error && !message) {
    return null;
  }

  // 获取进度指示器大小
  const getCircularSize = () => {
    switch (size) {
      case 'small':
        return 30;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  // 加载状态内容
  const loadingContent = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3
    }}>
      <CircularProgress size={getCircularSize()} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {loadingMessage || message}
      </Typography>
    </Box>
  );

  // 错误状态内容
  const errorContent = (
    <Box sx={{ p: 3 }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              重试
            </Button>
          )
        }
      >
        {errorMessage || error}
      </Alert>
      {message && (
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  // 如果是全屏模式
  if (fullPage) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        p: 3
      }}>
        <Paper elevation={3} sx={{ maxWidth: 500, width: '100%' }}>
          {loading ? loadingContent : error ? errorContent : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                {message}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  // 如果是覆盖模式
  if (overlay) {
    return (
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000
      }}>
        {loading ? loadingContent : error ? errorContent : (
          <Typography variant="body1">
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // 默认内联模式
  return (
    <Box sx={{ p: 2 }}>
      {loading ? loadingContent : error ? errorContent : (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body1">
            {message}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LoadingState;
