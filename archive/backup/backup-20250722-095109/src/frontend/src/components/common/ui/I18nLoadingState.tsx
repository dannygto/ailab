import React from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/Info';
import SkeletonLoader, { SkeletonLoaderProps } from './SkeletonLoader';

export interface InternationalizedLoadingStateProps {
  /**
   * 当前加载状态
   */
  loading: boolean;

  /**
   * 错误信息，如果存在则显示错误状态
   */
  error?: string | null;

  /**
   * 空数据状态的显示文本（国际化键）
   */
  emptyMessageKey?: string;

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
 * 国际化的数据加载状态处理组件
 *
 * 与LoadingState组件功能相同，但支持国际化文本
 */
const I18nLoadingState: React.FC<InternationalizedLoadingStateProps> = ({
  loading,
  error,
  isEmpty = false,
  emptyMessageKey = 'common.noData',
  onRetry,
  skeletonProps,
  emptyContent,
  errorContent,
  children,
}) => {
  const { t } = useTranslation();

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
          {t('common.loadingFailed')}
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
            {t('common.retry')}
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
          {t(emptyMessageKey)}
        </Typography>
      </Box>
    );
  }

  // 正常数据状态
  return <>{children}</>;
};

export default I18nLoadingState;
