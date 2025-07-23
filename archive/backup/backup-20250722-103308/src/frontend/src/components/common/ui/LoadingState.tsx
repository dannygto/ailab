import React from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/Info';
import SkeletonLoader, { SkeletonLoaderProps } from './SkeletonLoader';

export interface LoadingStateProps {
  /**
   * 当前加载状态
   */
  loading: boolean;

  /**
   * 错误信息，如果存在则显示错误状态
   */
  error?: string | null;

  /**
   * 空数据状态的显示文本
   */
  emptyMessage?: string;

  /**
   * 是否为空数据状态
   */
  isEmpty?: boolean;

  /**
   * 重试操作的回调函数
   */
  onRetry?: () => void;

  /**
   * 骨架屏配置，传递给内部SkeletonLoader组件
   */
  skeletonProps?: SkeletonLoaderProps;

  /**
   * 自定义空状态内容
   */
  emptyContent?: React.ReactNode;

  /**
   * 自定义错误状态内容
   */
  errorContent?: React.ReactNode;

  /**
   * 子元素，在数据加载完成且非空时显示
   */
  children: React.ReactNode;
}

/**
 * 统一的数据加载状态处理组件
 *
 * 处理以下四种状态：
 * 1. 加载中 - 显示骨架屏或加载指示器
 * 2. 错误状态 - 显示错误信息和重试按钮
 * 3. 空数据状态 - 显示空状态提示
 * 4. 正常数据状态 - 渲染子组件
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  isEmpty = false,
  emptyMessage = '暂无数据',
  onRetry,
  skeletonProps,
  emptyContent,
  errorContent,
  children,
}) => {
  // 加载中状态
  if (loading) {
    return skeletonProps ? (
      <SkeletonLoader {...skeletonProps} />
    ) : (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4
      }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // 错误状态
  if (error) {
    if (errorContent) return <>{errorContent}</>;

    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        textAlign: 'center'
      }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom color="error">
          加载失败
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 500 }}>
          {error}
        </Typography>
        {onRetry && (
          <Button
            variant="outlined"
            color="primary"
            onClick={onRetry}
            startIcon={<InfoIcon />}
          >
            重试
          </Button>
        )}
      </Box>
    );
  }

  // 空数据状态
  if (isEmpty) {
    if (emptyContent) return <>{emptyContent}</>;

    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
        textAlign: 'center'
      }}>
        <InfoIcon sx={{ fontSize: 48, mb: 2, color: 'text.secondary' }} />
        <Typography variant="h6" gutterBottom color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // 正常数据状态
  return <>{children}</>;
};

export default LoadingState;
