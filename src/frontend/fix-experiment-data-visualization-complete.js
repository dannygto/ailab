const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'domain', 'experiments', 'ExperimentDataVisualization.tsx');

console.log('开始全面修复 ExperimentDataVisualization.tsx...');

// 重新写入一个可工作的版本
const fixedContent = `import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
  Grid,
} from '@mui/material';
import {
  RefreshIcon,
  DownloadIcon,
  SettingsIcon,
  BarChartIcon,
  ShowChartIcon,
  PieChartIcon,
  BubbleChartIcon,
  InsertChartIcon,
} from '../../../utils/icons';

export interface ExperimentDataVisualizationProps {
  experimentData?: any;
  loading?: boolean;
  error?: string | null;
  height?: number;
  title?: string;
  className?: string;
  allowExport?: boolean;
  enableAdvancedsettings?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
}

const ExperimentDataVisualization: React.FC<ExperimentDataVisualizationProps> = ({
  experimentData,
  loading = false,
  error = null,
  height = 400,
  title = "实验数据可视化",
  className,
  allowExport = true,
  enableAdvancedsettings = true,
  onRefresh,
  onExport,
}) => {
  const [chartType, setChartType] = useState('line');
  const [showsettings, setShowsettings] = useState(false);
  const [RefreshIconing, setRefreshIconing] = useState(false);
  const [timeRange, setTimeRange] = useState('complete');
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

  const isEmptyData = useMemo(() => {
    return !experimentData || 
           !experimentData.data || 
           experimentData.data.length === 0;
  }, [experimentData]);

  const handleRefreshIcon = useCallback(async () => {
    if (RefreshIconing) return;
    
    setRefreshIconing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshIconing(false);
    }
  }, [RefreshIconing, onRefresh]);

  const handleExportData = useCallback(() => {
    if (isEmptyData) return;
    onExport?.();
  }, [isEmptyData, onExport]);

  const variablesByCategory = useMemo(() => {
    if (!experimentData?.variables) return {};
    
    return experimentData.variables.reduce((acc: any, variable: any) => {
      const category = variable.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(variable);
      return acc;
    }, {});
  }, [experimentData]);

  if (loading && !experimentData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !experimentData) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="刷新数据">
              <IconButton onClick={handleRefreshIcon} disabled={RefreshIconing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {allowExport && (
              <Tooltip title="导出数据">
                <IconButton onClick={handleExportData} disabled={isEmptyData}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            {enableAdvancedsettings && (
              <Tooltip title="图表设置">
                <IconButton onClick={() => setShowsettings(!showsettings)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* 图表类型选择 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(_, newType) => newType && setChartType(newType)}
            aria-label="chart type"
          >
            <ToggleButton value="line" aria-label="line chart">
              <Tooltip title="折线图">
                <ShowChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="bar" aria-label="bar chart">
              <Tooltip title="柱状图">
                <BarChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="pie" aria-label="pie chart">
              <Tooltip title="饼图">
                <PieChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="scatter" aria-label="scatter chart">
              <Tooltip title="散点图">
                <BubbleChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>时间范围</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="时间范围"
            >
              <MenuItem value="complete">全部数据</MenuItem>
              <MenuItem value="last24">最近24小时</MenuItem>
              <MenuItem value="last7">最近7天数据</MenuItem>
              <MenuItem value="custom">自定义范围</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 数据加载状态 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 变量选择面板 */}
        {showsettings && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">选择变量</Typography>
              <Button
                size="small"
                onClick={() => setSelectedVariables([])}
                disabled={selectedVariables.length === 0}
              >
                清除选择
              </Button>
            </Box>

            {Object.entries(variablesByCategory).map(([category, variables]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    textTransform: 'capitalize', 
                    fontWeight: 'bold',
                    mb: 1 
                  }}
                >
                  {category}
                </Typography>
                <Grid container spacing={1}>
                  {(variables as any[]).map((variable: any) => (
                    <Grid item key={variable.id}>
                      <Button
                        variant={selectedVariables.includes(variable.id) ? "contained" : "outlined"}
                        size="small"
                        onClick={() => {
                          setSelectedVariables(prev => 
                            prev.includes(variable.id)
                              ? prev.filter(id => id !== variable.id)
                              : [...prev, variable.id]
                          );
                        }}
                      >
                        {variable.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Paper>
        )}

        {/* 图表显示区域 */}
        {isEmptyData ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              暂无实验数据可用于显示
            </Alert>
            <Box sx={{ textAlign: 'center' }}>
              <InsertChartIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                请选择变量和时间范围来查看数据可视化
                或检查实验是否已生成数据
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: height, position: 'relative' }}>
            {/* 这里将放置实际的图表组件 */}
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1
            }}>
              <Typography variant="body1" color="text.secondary">
                图表将在这里显示 ({chartType})
              </Typography>
            </Box>

            {/* 图表底部信息 */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                数据点数: {experimentData?.data?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                时间范围: {timeRange === 'complete' ? '全部数据' : timeRange}
              </Typography>
            </Box>
          </Box>
        )}

        {/* 导出按钮 */}
        {allowExport && !isEmptyData && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
            >
              导出数据
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ExperimentDataVisualization;
`;

// 写入修复后的内容
fs.writeFileSync(filePath, fixedContent, 'utf-8');

console.log('修复完成！文件已重新生成。');
