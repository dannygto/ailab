import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, Typography, Box, TextField, InputAdornment, IconButton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VirtualList from '../common/VirtualList';
import { useComponentPerformance } from '../../utils/performanceMonitoring';

// 示例数据接口
interface ListItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface VirtualListDemoProps {
  /**
   * 初始数据加载函数
   */
  fetchItems?: (pageSize: number, page: number) => Promise<ListItem[]>;

  /**
   * 每页数据量
   */
  pageSize?: number;

  /**
   * 标题
   */
  title?: string;
}

/**
 * 虚拟列表演示组件
 *
 * 展示虚拟列表的使用方法和性能优势
 */
const VirtualListDemo: React.FC<VirtualListDemoProps> = ({
  fetchItems,
  pageSize = 50,
  title = '虚拟列表组件演示'
}) => {
  // 使用性能监控
  useComponentPerformance('VirtualListDemo');

  // 状态管理
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 生成模拟数据
  const generateMockData = useCallback((page: number, pageSize: number): ListItem[] => {
    const startIndex = page * pageSize;
    return Array.from({ length: pageSize }, (_, index) => {
      const itemIndex = startIndex + index;
      return {
        id: `item-${itemIndex}`,
        title: `项目 ${itemIndex}`,
        description: `这是项目 ${itemIndex} 的详细描述，用于测试虚拟列表组件的渲染性能。`,
        timestamp: new Date(Date.now() - itemIndex * 60000).toISOString()
      };
    });
  }, []);

  // 加载数据
  const loadItems = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      let newItems: ListItem[];

      if (fetchItems) {
        newItems = await fetchItems(pageSize, page);
      } else {
        // 使用模拟数据
        // 延迟300ms模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 300));
        newItems = generateMockData(page, pageSize);
      }

      setItems(prev => [...prev, ...newItems]);
      setHasMore(newItems.length === pageSize);
    } catch (error) {
      console.error('加载数据出错:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, generateMockData, loading, page, pageSize]);

  // 首次加载和翻页
  useEffect(() => {
    loadItems();
  }, [loadItems, page]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  // 搜索过滤
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(
      item =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  // 渲染列表项
  const renderItem = (item: ListItem, index: number) => (
    <Card
      elevation={0}
      sx={{
        mb: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.2s'
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="medium">
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(item.timestamp).toLocaleString('zh-CN')}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {item.description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="搜索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small">
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary" mb={1}>
          共 {filteredItems.length} 项 {loading && '(加载中...)'}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
        <VirtualList
          items={filteredItems}
          renderItem={renderItem}
          itemHeight={85} // 每项高度
          height={500} // 列表容器高度
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          getItemKey={(item) => item.id}
          emptyContent={
            <Typography align="center" color="text.secondary">
              没有找到匹配的数据
            </Typography>
          }
          containerStyle={{ boxShadow: 'none', border: '1px solid #eee' }}
        />
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          虚拟列表只渲染可见区域的项，即使有上千条数据也能保持高性能。
        </Typography>
      </Box>
    </Box>
  );
};

export default VirtualListDemo;
