import React from 'react';
import { Box, Skeleton, Paper, styled } from '@mui/material';

// 统一的骨架屏样式
const StyledSkeletonContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

export interface SkeletonLoaderProps {
  /**
   * 骨架屏类型
   */
  type?: 'table' | 'card' | 'list' | 'detail';

  /**
   * 行数，适用于表格和列表类型
   */
  rows?: number;

  /**
   * 高度，用于调整骨架屏整体高度
   */
  height?: number | string;

  /**
   * 是否显示标题骨架
   */
  showTitle?: boolean;

  /**
   * 动画效果
   */
  animation?: 'pulse' | 'wave' | false;
}

/**
 * 通用骨架屏加载组件
 *
 * 提供多种预设骨架屏布局，适用于不同UI场景的数据加载状态
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  rows = 3,
  height,
  showTitle = true,
  animation = 'pulse',
}) => {
  const renderTableSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {showTitle && (
        <Box sx={{ mb: 2 }}>
          <Skeleton animation={animation} height={40} width="30%" />
        </Box>
      )}
      <Box sx={{ display: 'flex', mb: 1 }}>
        {Array(5).fill(0).map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            animation={animation}
            height={40}
            width={`${100 / 5}%`}
            sx={{ mr: 1 }}
          />
        ))}
      </Box>
      {Array(rows).fill(0).map((_, index) => (
        <Box key={`row-${index}`} sx={{ display: 'flex', mb: 1 }}>
          {Array(5).fill(0).map((_, cellIndex) => (
            <Skeleton
              key={`cell-${index}-${cellIndex}`}
              animation={animation}
              height={40}
              width={`${100 / 5}%`}
              sx={{ mr: 1 }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );

  const renderCardSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {showTitle && (
        <Box sx={{ mb: 2 }}>
          <Skeleton animation={animation} height={40} width="50%" />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {Array(rows).fill(0).map((_, index) => (
          <Box
            key={`card-${index}`}
            sx={{
              width: 'calc(33.33% - 16px)',
              '@media (max-width: 900px)': {
                width: 'calc(50% - 16px)',
              },
              '@media (max-width: 600px)': {
                width: '100%',
              },
            }}
          >
            <Skeleton
              animation={animation}
              variant="rectangular"
              height={140}
              sx={{ mb: 1, borderRadius: 1 }}
            />
            <Skeleton animation={animation} height={24} width="80%" />
            <Skeleton animation={animation} height={20} width="60%" />
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderListSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {showTitle && (
        <Box sx={{ mb: 2 }}>
          <Skeleton animation={animation} height={40} width="40%" />
        </Box>
      )}
      {Array(rows).fill(0).map((_, index) => (
        <Box key={`list-${index}`} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
          <Skeleton
            animation={animation}
            variant="circular"
            width={40}
            height={40}
            sx={{ mr: 2 }}
          />
          <Box sx={{ width: '100%' }}>
            <Skeleton animation={animation} height={28} width="70%" />
            <Skeleton animation={animation} height={20} width="40%" />
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderDetailSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {showTitle && (
        <Box sx={{ mb: 3 }}>
          <Skeleton animation={animation} height={48} width="60%" />
          <Skeleton animation={animation} height={24} width="40%" sx={{ mt: 1 }} />
        </Box>
      )}

      <Box sx={{ display: 'flex', mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', md: '40%' }, pr: { md: 2 }, mb: { xs: 2, md: 0 } }}>
          <Skeleton
            animation={animation}
            variant="rectangular"
            height={250}
            sx={{ borderRadius: 1 }}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', md: '60%' } }}>
          {Array(6).fill(0).map((_, index) => (
            <Box key={`detail-${index}`} sx={{ mb: 2 }}>
              <Skeleton animation={animation} height={24} width="30%" sx={{ mb: 0.5 }} />
              <Skeleton animation={animation} height={32} width="100%" />
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Skeleton animation={animation} height={32} width="30%" sx={{ mb: 2 }} />
        <Skeleton animation={animation} height={120} width="100%" />
      </Box>
    </Box>
  );

  const renderContent = () => {
    switch (type) {
      case 'table':
        return renderTableSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'detail':
        return renderDetailSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <StyledSkeletonContainer
      elevation={0}
      sx={{ height: height }}
      data-testid="skeleton-loader"
    >
      {renderContent()}
    </StyledSkeletonContainer>
  );
};

export default SkeletonLoader;
