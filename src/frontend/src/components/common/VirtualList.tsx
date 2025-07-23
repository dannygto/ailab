import React, { useState, useEffect, useRef, useMemo, CSSProperties } from 'react';
import { Typography, Box, CircularProgress, Paper } from '@mui/material';
import { useComponentPerformance } from '../utils/performanceMonitoring';

interface VirtualListProps<T> {
  /**
   * 列表数据
   */
  items: T[];

  /**
   * 渲染每一项的函数
   */
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;

  /**
   * 每项的高度（像素）
   */
  itemHeight: number;

  /**
   * 列表容器高度
   */
  height: number;

  /**
   * 列表容器宽度
   */
  width?: string | number;

  /**
   * 额外渲染的项数（视口外）
   */
  overscan?: number;

  /**
   * 加载中状态
   */
  loading?: boolean;

  /**
   * 空列表时显示的内容
   */
  emptyContent?: React.ReactNode;

  /**
   * 滚动到底部时触发加载更多
   */
  onLoadMore?: () => void;

  /**
   * 是否有更多数据
   */
  hasMore?: boolean;

  /**
   * 滚动到底部时的阈值（像素）
   */
  threshold?: number;

  /**
   * 容器样式
   */
  containerStyle?: CSSProperties;

  /**
   * 每项的键生成函数
   */
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * 虚拟列表组件
 *
 * 只渲染可见区域的项，大幅优化长列表性能
 */
function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  height,
  width = '100%',
  overscan = 3,
  loading = false,
  emptyContent = <Typography align="center">没有数据</Typography>,
  onLoadMore,
  hasMore = false,
  threshold = 200,
  containerStyle,
  getItemKey = (_, index) => index
}: VirtualListProps<T>) {
  // 使用性能监控Hook
  useComponentPerformance('VirtualList');

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 滚动位置状态
  const [scrollTop, setScrollTop] = useState(0);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);

      // 检查是否滚动到底部附近
      if (onLoadMore && hasMore && !loading) {
        const { scrollHeight, scrollTop, clientHeight } = container;
        if (scrollHeight - scrollTop - clientHeight < threshold) {
          onLoadMore();
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, hasMore, loading, threshold]);

  // 计算可见项的范围
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    // 计算可见区域的起始索引
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);

    // 计算可见区域的结束索引
    const visibleItemCount = Math.ceil(height / itemHeight);
    const end = Math.min(items.length - 1, start + visibleItemCount + 2 * overscan);

    // 计算总高度
    const total = items.length * itemHeight;

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: total
    };
  }, [scrollTop, height, itemHeight, items.length, overscan]);

  // 生成可见项列表
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => {
      const actualIndex = startIndex + index;
      const key = getItemKey(item, actualIndex);

      // 计算每项的样式和位置
      const style: CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: itemHeight,
        transform: `translateY(${actualIndex * itemHeight}px)`
      };

      return (
        <div key={key} style={style}>
          {renderItem(item, actualIndex, style)}
        </div>
      );
    });
  }, [items, startIndex, endIndex, itemHeight, renderItem, getItemKey]);

  // 列表为空且不在加载中时显示空内容
  if (items.length === 0 && !loading) {
    return (
      <Paper
        ref={containerRef}
        elevation={0}
        style={{
          height,
          width,
          overflow: 'auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...containerStyle
        }}
      >
        {emptyContent}
      </Paper>
    );
  }

  return (
    <Paper
      ref={containerRef}
      elevation={0}
      style={{
        height,
        width,
        overflow: 'auto',
        position: 'relative',
        ...containerStyle
      }}
    >
      {/* 创建一个占位容器，设置总高度 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 渲染可见项 */}
        {visibleItems}
      </div>

      {/* 加载更多指示器 */}
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={2}
          position={items.length > 0 ? 'relative' : 'absolute'}
          width="100%"
          bottom={0}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" color="textSecondary" ml={1}>
            加载中...
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default VirtualList;
