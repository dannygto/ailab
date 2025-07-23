import React, { useState, useMemo, useCallback, CSSProperties } from 'react';
import {
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VirtualList from './VirtualList';
import { useComponentPerformance } from '../../utils/performanceMonitoring';

// 列定义接口
export interface Column<T> {
  id: string;
  label: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  renderHeader?: (column: Column<T>) => React.ReactNode;
}

// 排序方向类型
type SortDirection = 'asc' | 'desc';

// 排序状态接口
interface SortState {
  field: string;
  direction: SortDirection;
}

// 过滤器接口
interface Filter {
  field: string;
  value: string;
}

// 表格属性接口
interface VirtualDataTableProps<T> {
  /**
   * 表格数据
   */
  data: T[];

  /**
   * 列定义
   */
  columns: Column<T>[];

  /**
   * 表格高度
   */
  height?: number | string;

  /**
   * 行高
   */
  rowHeight?: number;

  /**
   * 是否显示序号列
   */
  showIndexColumn?: boolean;

  /**
   * 加载状态
   */
  loading?: boolean;

  /**
   * 是否有更多数据
   */
  hasMore?: boolean;

  /**
   * 加载更多回调
   */
  onLoadMore?: () => void;

  /**
   * 行点击回调
   */
  onRowClick?: (item: T, index: number) => void;

  /**
   * 行样式
   */
  rowStyle?: CSSProperties;

  /**
   * 获取行键
   */
  getRowKey?: (item: T, index: number) => string | number;

  /**
   * 是否显示工具栏
   */
  showToolbar?: boolean;

  /**
   * 表格标题
   */
  title?: string;

  /**
   * 是否允许排序
   */
  sortable?: boolean;

  /**
   * 是否允许过滤
   */
  filterable?: boolean;

  /**
   * 初始排序状态
   */
  initialSort?: SortState;

  /**
   * 排序变化回调
   */
  onSortChange?: (sortState: SortState) => void;

  /**
   * 过滤变化回调
   */
  onFilterChange?: (filters: Filter[]) => void;

  /**
   * 刷新回调
   */
  onRefresh?: () => void;

  /**
   * 导出回调
   */
  onExport?: () => void;

  /**
   * 自定义操作按钮
   */
  actions?: React.ReactNode;

  /**
   * 自定义空内容
   */
  emptyContent?: React.ReactNode;

  /**
   * 自定义样式
   */
  sx?: CSSProperties;
}

/**
 * 虚拟数据表格组件
 *
 * 基于虚拟列表优化的高性能数据表格，适用于大数据集
 */
function VirtualDataTable<T>({
  data,
  columns,
  height = 500,
  rowHeight = 53,
  showIndexColumn = true,
  loading = false,
  hasMore = false,
  onLoadMore,
  onRowClick,
  rowStyle,
  getRowKey = (_, index) => index,
  showToolbar = true,
  title = '',
  sortable = true,
  filterable = true,
  initialSort,
  onSortChange,
  onFilterChange,
  onRefresh,
  onExport,
  actions,
  emptyContent,
  sx
}: VirtualDataTableProps<T>) {
  // 使用性能监控
  useComponentPerformance('VirtualDataTable');

  // 状态管理
  const [sortState, setSortState] = useState<SortState>(
    initialSort || { field: '', direction: 'asc' }
  );
  const [filters, setFilters] = useState<Filter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [filterField, setFilterField] = useState('');
  const [optionsMenuAnchorEl, setOptionsMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    columns.reduce((acc, column) => ({ ...acc, [column.id]: true }), {})
  );

  // 过滤和排序后的数据
  const processedData = useMemo(() => {
    let result = [...data];

    // 应用过滤器
    if (filters.length > 0 || searchTerm) {
      result = result.filter(item => {
        // 全局搜索
        if (searchTerm) {
          const searchFields = columns.filter(col => col.filterable !== false);
          const matchesSearch = searchFields.some(column => {
            const value = column.accessor(item);
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
          });

          if (!matchesSearch) return false;
        }

        // 特定字段过滤
        return filters.every(filter => {
          const column = columns.find(col => col.id === filter.field);
          if (!column) return true;

          const value = column.accessor(item);
          return String(value).toLowerCase().includes(filter.value.toLowerCase());
        });
      });
    }

    // 应用排序
    if (sortState.field) {
      const sortColumn = columns.find(col => col.id === sortState.field);

      if (sortColumn) {
        result.sort((a, b) => {
          const valueA = sortColumn.accessor(a);
          const valueB = sortColumn.accessor(b);

          let comparison = 0;

          if (valueA < valueB) {
            comparison = -1;
          } else if (valueA > valueB) {
            comparison = 1;
          }

          return sortState.direction === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, columns, sortState, filters, searchTerm]);

  // 处理排序变化
  const handleSort = (field: string) => {
    const newDirection =
      sortState.field === field && sortState.direction === 'asc' ? 'desc' : 'asc';

    const newSortState = {
      field,
      direction: newDirection
    };

    setSortState(newSortState);

    if (onSortChange) {
      onSortChange(newSortState);
    }
  };

  // 处理过滤器菜单打开
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>, field: string) => {
    setFilterMenuAnchorEl(event.currentTarget);
    setFilterField(field);
  };

  // 处理过滤器菜单关闭
  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };

  // 处理选项菜单打开
  const handleOptionsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOptionsMenuAnchorEl(event.currentTarget);
  };

  // 处理选项菜单关闭
  const handleOptionsMenuClose = () => {
    setOptionsMenuAnchorEl(null);
  };

  // 添加或更新过滤器
  const handleAddFilter = (field: string, value: string) => {
    if (!value.trim()) {
      handleRemoveFilter(field);
      return;
    }

    const filterIndex = filters.findIndex(f => f.field === field);

    if (filterIndex >= 0) {
      const newFilters = [...filters];
      newFilters[filterIndex] = { field, value };
      setFilters(newFilters);
    } else {
      setFilters([...filters, { field, value }]);
    }

    handleFilterMenuClose();

    if (onFilterChange) {
      onFilterChange([...filters, { field, value }]);
    }
  };

  // 移除过滤器
  const handleRemoveFilter = (field: string) => {
    const newFilters = filters.filter(f => f.field !== field);
    setFilters(newFilters);

    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // 处理列可见性变化
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumnVisibility({
      ...columnVisibility,
      [columnId]: visible
    });
  };

  // 重置所有过滤器
  const handleResetFilters = () => {
    setFilters([]);
    setSearchTerm('');

    if (onFilterChange) {
      onFilterChange([]);
    }
  };

  // 渲染表格行
  const renderRow = useCallback((item: T, index: number, style: CSSProperties) => {
    const handleClick = onRowClick ? () => onRowClick(item, index) : undefined;

    return (
      <TableRow
        hover
        onClick={handleClick}
        style={{
          ...style,
          ...rowStyle,
          cursor: onRowClick ? 'pointer' : 'default'
        }}
      >
        {showIndexColumn && (
          <TableCell padding="checkbox" align="center">
            <Typography variant="body2" color="text.secondary">
              {index + 1}
            </Typography>
          </TableCell>
        )}

        {columns
          .filter(column => columnVisibility[column.id])
          .map(column => (
            <TableCell
              key={column.id}
              align={column.align || 'left'}
              style={{ width: column.width }}
            >
              {column.accessor(item)}
            </TableCell>
          ))}
      </TableRow>
    );
  }, [columns, onRowClick, rowStyle, showIndexColumn, columnVisibility]);

  // 可见的列
  const visibleColumns = useMemo(() => {
    return columns.filter(column => columnVisibility[column.id]);
  }, [columns, columnVisibility]);

  // 应用过滤的列数
  const activeFiltersCount = filters.length + (searchTerm ? 1 : 0);

  return (
    <Paper elevation={0} sx={{ ...sx, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      {showToolbar && (
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">{title}</Typography>

            <Box>
              {onRefresh && (
                <Tooltip title="刷新">
                  <IconButton onClick={onRefresh} size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {onExport && (
                <Tooltip title="导出">
                  <IconButton onClick={onExport} size="small">
                    <FileDownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="表格选项">
                <IconButton onClick={handleOptionsMenuOpen} size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {actions}
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <TextField
              placeholder="搜索..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Box>
              {filters.length > 0 && (
                <Box display="flex" alignItems="center" mr={1}>
                  {filters.map(filter => {
                    const column = columns.find(col => col.id === filter.field);
                    return (
                      <Chip
                        key={filter.field}
                        label={`${column?.label || filter.field}: ${filter.value}`}
                        size="small"
                        onDelete={() => handleRemoveFilter(filter.field)}
                        sx={{ mr: 0.5 }}
                      />
                    );
                  })}

                  <Chip
                    label="清除全部"
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={handleResetFilters}
                  />
                </Box>
              )}
            </Box>
          </Box>

          {activeFiltersCount > 0 && (
            <Typography variant="caption" color="text.secondary" mt={1} display="block">
              显示 {processedData.length} 项结果（共 {data.length} 项）
            </Typography>
          )}
        </Box>
      )}

      {/* 表格头部 */}
      <TableContainer component={Paper} elevation={0} sx={{ flex: 0, overflow: 'hidden' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {showIndexColumn && (
                <TableCell padding="checkbox" align="center" width={60}>
                  #
                </TableCell>
              )}

              {visibleColumns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                >
                  <Box display="flex" alignItems="center">
                    {column.renderHeader ? (
                      column.renderHeader(column)
                    ) : (
                      <Box display="flex" alignItems="center" width="100%">
                        {column.sortable !== false && sortable ? (
                          <TableSortLabel
                            active={sortState.field === column.id}
                            direction={sortState.field === column.id ? sortState.direction : 'asc'}
                            onClick={() => handleSort(column.id)}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}

                        {column.filterable !== false && filterable && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterMenuOpen(e, column.id)}
                            sx={{ ml: 0.5 }}
                          >
                            <FilterListIcon
                              fontSize="small"
                              color={filters.some(f => f.field === column.id) ? 'primary' : 'inherit'}
                            />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

      {/* 表格内容 - 使用虚拟列表 */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <VirtualList
          items={processedData}
          renderItem={renderRow}
          itemHeight={rowHeight}
          height={typeof height === 'number' ? height - (showToolbar ? 150 : 0) : '100%'}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          getItemKey={getRowKey}
          emptyContent={
            emptyContent || (
              <Typography align="center" color="text.secondary" sx={{ p: 4 }}>
                没有数据
              </Typography>
            )
          }
          containerStyle={{ boxShadow: 'none' }}
        />
      </Box>

      {/* 过滤菜单 */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            {columns.find(col => col.id === filterField)?.label || ''} 过滤
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="输入过滤值..."
            variant="outlined"
            defaultValue={filters.find(f => f.field === filterField)?.value || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddFilter(filterField, (e.target as HTMLInputElement).value);
              }
            }}
            autoFocus
          />

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Tooltip title="清除此过滤器">
              <IconButton
                size="small"
                onClick={() => handleRemoveFilter(filterField)}
                disabled={!filters.some(f => f.field === filterField)}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Menu>

      {/* 选项菜单 */}
      <Menu
        anchorEl={optionsMenuAnchorEl}
        open={Boolean(optionsMenuAnchorEl)}
        onClose={handleOptionsMenuClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          表格选项
        </Typography>
        <Divider />
        <Box sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
            显示/隐藏列
          </Typography>
          {columns.map(column => (
            <MenuItem key={column.id} dense sx={{ py: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columnVisibility[column.id]}
                    onChange={(e) => handleColumnVisibilityChange(column.id, e.target.checked)}
                    size="small"
                  />
                }
                label={column.label}
              />
            </MenuItem>
          ))}
        </Box>
        <Divider />
        <MenuItem onClick={handleResetFilters}>
          清除所有过滤器
        </MenuItem>
      </Menu>
    </Paper>
  );
}

export default VirtualDataTable;
