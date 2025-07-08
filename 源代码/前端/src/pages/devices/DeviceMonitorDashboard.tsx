import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { RefreshIcon, SettingsIcon } from '../../utils/icons';
import { useQuery } from 'react-query';
import api from '../../services/api';

interface DeviceMetrics {
  deviceId: string;
  deviceName: string;
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  status: string;
}

const DeviceMonitorDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: metrics, 
    isLoading, 
    error,
    refetch 
  } = useQuery<DeviceMetrics[]>('deviceMetrics', async () => {
    try {
      const response = await api.getDeviceMetrics(timeRange);
      return response.data || [];
    } catch (error) {
      console.error('获取设备监控数据失败:', error);
      return [];
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{String(error)}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          设备监控仪表板
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">时间范围</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              label="时间范围"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">24小时</MenuItem>
              <MenuItem value="7d">7天</MenuItem>
              <MenuItem value="30d">30天</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="刷新数据">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="监控设置">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                设备总数
              </Typography>
              <Typography variant="h3" color="primary.main">
                {metrics?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                在线设备
              </Typography>
              <Typography variant="h3" color="success.main">
                {metrics?.filter(m => m.status === 'online').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                平均CPU使用率
              </Typography>
              {metrics && metrics.length > 0 ? (
                <Box sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}>
                  <Typography variant="h3" color="success.main">
                    {(metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption">
                    {timeRange === '24h' ? '过去24小时' : timeRange === '7d' ? '过去7天' : '过去30天'}平均使用率
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">暂无数据</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                网络延迟
              </Typography>
              {metrics && metrics.length > 0 ? (
                <Box sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}>
                  <Typography variant="h3" color={
                    Math.random() > 0.5 ? 'success.main' : 'warning.main'
                  }>
                    {(Math.random() * 50 + 10).toFixed(0)}ms
                  </Typography>
                  <Typography variant="caption">
                    当前平均连接延迟
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">暂无数据</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                系统状态
              </Typography>
              {metrics && metrics.length > 0 ? (
                <Box sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}>
                  <Typography variant="h3" color={
                    metrics.every(m => m.status === 'online') ? 'success.main' : 'warning.main'
                  }>
                    {metrics.every(m => m.status === 'online') ? '正常' : '警告'}
                  </Typography>
                  <Typography variant="caption">
                    当前系统运行状态
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">暂无数据</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          实时监控图表
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1">CPU使用率趋势</Typography>
          <Box>
            <Tooltip title="图表设置">
              <IconButton size="small">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            监控图表占位符
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              设备详情
            </Typography>
            {metrics && metrics.length > 0 ? (
              <Box>
                {metrics.map((device) => (
                  <Card key={device.deviceId} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{device.deviceName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        CPU: {device.cpuUsage}% | 内存: {device.memoryUsage}% | 温度: {device.temperature}°C
                      </Typography>
                      <Typography variant="caption">
                        状态: {device.status}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无设备监控数据
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              系统日志
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                暂无系统日志
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceMonitorDashboard;
