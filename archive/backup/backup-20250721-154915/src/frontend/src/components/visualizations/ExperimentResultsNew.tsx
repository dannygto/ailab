import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChartIcon,
  ShowChartIcon,
  PieChartIcon,
  BubbleChartIcon,
  TableChartIcon,
  DownloadIcon,
  RefreshIcon
} from '../../utils/icons';

interface ExperimentResult {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  type: string;
}

interface ExperimentResultsProps {
  experimentId: string;
  results: ExperimentResult[];
  isLoading?: boolean;
  error?: string;
}

const ExperimentResultsNew: React.FC<ExperimentResultsProps> = ({
  experimentId,
  results,
  isLoading = false,
  error
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'scatter'>('line');

  const handleRefresh = () => {
    console.log('刷新实验结果');
  };

  const handleExport = () => {
    console.log('导出实验结果');
  };

  const renderChart = () => {
    if (!results || results.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">暂无可用数据</Typography>
        </Box>
      );
    }

    // 模拟图表渲染
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {chartType === 'line' && '线形图'}
          {chartType === 'bar' && '柱状图'}
          {chartType === 'pie' && '饼图'}
          {chartType === 'scatter' && '散点图'}
          占位符
        </Typography>
      </Box>
    );
  };

  const renderTable = () => {
    if (!results || results.length === 0) {
      return (
        <Typography color="text.secondary">暂无数据</Typography>
      );
    }

    return (
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>名称</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>值</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>类型</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>时间</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{result.name}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{result.value}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{result.type}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  {result.timestamp.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">实验结果</Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="刷新数据">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="导出数据">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>加载数据中...</Typography>
        </Box>
      ) : results.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            暂无实验结果数据
          </Typography>
        </Box>
      ) : (
        <>
          {/* 图表类型选择 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>图表类型:</Typography>
            
            <Tooltip title="线形图">
              <IconButton
                size="small"
                color={chartType === 'line' ? 'primary' : 'default'}
                onClick={() => setChartType('line')}
              >
                <ShowChartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="柱状图">
              <IconButton
                size="small"
                color={chartType === 'bar' ? 'primary' : 'default'}
                onClick={() => setChartType('bar')}
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="饼图">
              <IconButton
                size="small"
                color={chartType === 'pie' ? 'primary' : 'default'}
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="散点图">
              <IconButton
                size="small"
                color={chartType === 'scatter' ? 'primary' : 'default'}
                onClick={() => setChartType('scatter')}
              >
                <BubbleChartIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* 图表显示 */}
          <Box sx={{ mb: 3 }}>
            {renderChart()}
          </Box>

          {/* 数据表格 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              数据详情
            </Typography>
            {renderTable()}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ExperimentResultsNew;
