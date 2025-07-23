import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert, 
  Paper, 
  Tabs, 
  Tab, 
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// 设备服务和api调用
const deviceservice = {
  getdevices: async () => {
    // 模拟api调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: '设备A', status: 'online', type: 'camera', lastPing: new Date() },
          { id: 2, name: '设备B', status: 'offline', type: 'sensor', lastPing: new Date(Date.now() - 86400000) },
          { id: 3, name: '设备C', status: 'warning', type: 'camera', lastPing: new Date() },
          { id: 4, name: '设备D', status: 'online', type: 'control', lastPing: new Date() }
        ]);
      }, 1000);
    });
  }
};

/**
 * 设备监控页面组件
 * 用于集中显示所有设备的状态、性能和健康指标
 */
const DeviceMonitoring: React.FC = () => {
  const theme = useTheme();
  const [DevicesIcon, setdevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchdevices = async () => {
      try {
        setLoading(true);
        const data = await deviceservice.getdevices();
        setdevices(data as any[]);
        setLoading(false);
      } catch (err) {
        setError('无法加载设备数据，请稍后重试');
        setLoading(false);
      }
    };

    fetchdevices();
    
    // 设置定时刷新
    const refreshInterval = setInterval(fetchdevices, 30000); // 每30秒刷新一次
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        设备监控面板
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        实时监控系统中所有设备的状态、性能和健康指标
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="设备概览" />
          <Tab label="性能监控" />
          <Tab label="报警管理" />
        </Tabs>
        <Divider />

        {/* 设备概览 */}
        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  设备状态概览
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1
                }}>
                  <Typography>
                    此处应集成DeviceStatusCard组件展示设备状态
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 性能监控 */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              设备性能指标
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1
            }}>
              <Typography>
                此处应集成DeviceMetricsChart组件展示设备性能指标
              </Typography>
            </Box>
          </Box>
        )}

        {/* 报警管理 */}
        {tabValue === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              设备报警信息
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              当前没有活跃的设备报警
            </Alert>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" gutterBottom>
        设备列表
      </Typography>
      <Grid container spacing={3}>
        {DevicesIcon.map((device: any) => (
          <Grid item xs={12} md={6} lg={4} key={device.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{device.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                类型: {device.type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                状态: {device.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                最后通信: {device.lastPing.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DeviceMonitoring;

