import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import {
  FilterListIcon,
  ExpandMoreIcon,
  ExpandLessIcon,
  ClearIcon,
  SearchIcon,
} from '../../../utils/icons';

export interface ExperimentFilterV2Props {
  onFilterChange?: (filters: any) => void;
  initialFilters?: any;
  className?: string;
}

const ExperimentFilterV2: React.FC<ExperimentFilterV2Props> = ({
  onFilterChange,
  initialFilters = {},
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateRange: '',
    keyword: '',
    ...initialFilters,
  });
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      status: '',
      type: '',
      dateRange: '',
      keyword: '',
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  }, [onFilterChange]);

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card className={className} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            实验筛选
          </Typography>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 状态筛选 */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">状态</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={filters.status}
                  label="状态"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">全部状态</MenuItem>
                  <MenuItem value="draft">草稿</MenuItem>
                  <MenuItem value="running">运行中</MenuItem>
                  <MenuItem value="completed">已完成</MenuItem>
                  <MenuItem value="failed">失败</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 类型筛选 */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-filter-label">类型</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={filters.type}
                  label="类型"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">全部类型</MenuItem>
                  <MenuItem value="physics">物理实验</MenuItem>
                  <MenuItem value="chemistry">化学实验</MenuItem>
                  <MenuItem value="biology">生物实验</MenuItem>
                  <MenuItem value="engineering">工程实验</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 日期范围 */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-filter-label">时间范围</InputLabel>
                <Select
                  labelId="date-filter-label"
                  value={filters.dateRange}
                  label="时间范围"
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <MenuItem value="">全部时间</MenuItem>
                  <MenuItem value="today">今天</MenuItem>
                  <MenuItem value="week">本周</MenuItem>
                  <MenuItem value="month">本月</MenuItem>
                  <MenuItem value="custom">自定义</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 关键词搜索 */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="关键词搜索"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>

            {/* 操作按钮 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                  size="small"
                >
                  清除筛选
                </Button>

                {/* 显示活跃的筛选器 */}
                {hasActiveFilters && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {filters.status && (
                      <Chip
                        label={`状态: ${filters.status}`}
                        size="small"
                        onDelete={() => handleFilterChange('status', '')}
                      />
                    )}
                    {filters.type && (
                      <Chip
                        label={`类型: ${filters.type}`}
                        size="small"
                        onDelete={() => handleFilterChange('type', '')}
                      />
                    )}
                    {filters.dateRange && (
                      <Chip
                        label={`时间: ${filters.dateRange}`}
                        size="small"
                        onDelete={() => handleFilterChange('dateRange', '')}
                      />
                    )}
                    {filters.keyword && (
                      <Chip
                        label={`关键词: ${filters.keyword}`}
                        size="small"
                        onDelete={() => handleFilterChange('keyword', '')}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* 保存的筛选器 */}
            {showSavedFilters && savedFilters.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    保存的筛选器
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {savedFilters.map((savedFilter, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setFilters(savedFilter.filters);
                          onFilterChange?.(savedFilter.filters);
                        }}
                      >
                        {savedFilter.name}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ExperimentFilterV2;
