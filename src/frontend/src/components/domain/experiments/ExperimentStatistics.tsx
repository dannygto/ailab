import React, { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  Divider,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { RefreshIcon, GetAppIcon } from '../../../utils/icons';

interface ExperimentStatisticsProps {
  className?: string;
  title?: string;
}

interface StatisticsData {
  totalExperiments: number;
  completedExperiments: number;
  failedExperiments: number;
  averageExecutionTime: number;
  successRate: number;
  mostUsedType: string;
  recentTrends: Array<{
    date: string;
    count: number;
  }>;
}

const ExperimentStatistics: React.FC<ExperimentStatisticsProps> = ({ 
  className,
  title = "实验统计"
}) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StatisticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: StatisticsData = {
        totalExperiments: 156,
        completedExperiments: 134,
        failedExperiments: 22,
        averageExecutionTime: 45.6,
        successRate: 85.9,
        mostUsedType: '物理实验',
        recentTrends: [
          { date: '2024-01-01', count: 12 },
          { date: '2024-01-02', count: 15 },
          { date: '2024-01-03', count: 8 }
        ]
      };
      
      setData(mockData);
    } catch (err) {
      setError('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatistics();
    setRefreshing(false);
  };

  const handleExport = () => {
    console.log('导出统计数据');
  };

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  if (loading && !data) {
    return (
      <Box className={className}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <React.Fragment>
        <Alert severity="error">{error}</Alert>
      </React.Fragment>
    );
  }

  return (
    <Box className={className}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{title}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>时间范围</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="时间范围"
            >
              <MenuItem value="7d">7天</MenuItem>
              <MenuItem value="30d">30天</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="刷新数据">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="导出数据">
            <IconButton>
              <GetAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    总实验数
                  </Typography>
                  <Typography variant="h4">
                    {data?.totalExperiments || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    完成实验
                  </Typography>
                  <Typography variant="h4">
                    {data?.completedExperiments || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    失败实验
                  </Typography>
                  <Typography variant="h4">
                    {data?.failedExperiments || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    成功率
                  </Typography>
                  <Typography variant="h4">
                    {data?.successRate || 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              平均执行时间
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                {data?.averageExecutionTime || 0} 分钟
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                基于最近的实验数据计算
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              最常用类型
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                {data?.mostUsedType || '暂无数据'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                基于实验数量统计
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              趋势分析
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                最近7天实验总数: {data?.recentTrends?.length || 0}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                详细图表功能开发中
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              性能指标
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                系统整体稳定性良好
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                监控数据实时更新
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ExperimentStatistics;
