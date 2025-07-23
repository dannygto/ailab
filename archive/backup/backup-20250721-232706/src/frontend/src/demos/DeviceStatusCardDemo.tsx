import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Container, FormControlLabel, Switch } from '@mui/material';
import DeviceStatusCard from '../components/domain/devices/DeviceStatusCard';
import { Device, DeviceStatus, DeviceType, DeviceConnectionStatus } from '../types/devices';

/**
 * DeviceStatusCard演示组件
 * 
 * 用于展示DeviceStatusCard组件的不同状态和功能
 */
const DeviceStatusCardDemo: React.FC = () => {
  // 组件状态
  const [showActions, setShowActions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // 示例设备数据
  const devices: Device[] = [
    {
      id: '1',
      name: '温度传感器 A1',
      type: DeviceType.SENSOR,
      model: 'TS-1000',
      manufacturer: 'Sensortech',
      description: '用于实验室温度监测的高精度传感器',
      connectionStatus: DeviceConnectionStatus.ONLINE,
      location: '实验室 A',
      ipAddress: '192.168.1.101',
      macAddress: '00:1B:44:11:3A:B7',
      firmware: 'v2.3.4',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5分钟前
      metrics: {
        temperature: 25.5,
        humidity: 60.2,
        uptime: 95.8
      },
      tags: ['critical', 'lab-a'],
      status: DeviceStatus.ONLINE,
      createdAt: new Date('2023-01-15').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '湿度传感器 H2',
      type: DeviceType.SENSOR,
      model: 'HS-2000',
      manufacturer: 'Sensortech',
      description: '环境湿度监测传感器',
      connectionStatus: DeviceConnectionStatus.OFFLINE,
      location: '实验室 B',
      ipAddress: '192.168.1.102',
      macAddress: '00:1B:44:11:3A:B8',
      firmware: 'v2.1.0',
      lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
      metrics: {
        humidity: 45.3,
        battery: 75.0
      },
      tags: ['lab-b'],
      status: DeviceStatus.MAINTENANCE,
      createdAt: new Date('2023-01-20'),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '3',
      name: '压力传感器 P3',
      type: DeviceType.ACTUATOR,
      model: 'PS-3000',
      manufacturer: 'PressureTech',
      description: '高精度压力监测设备',
      connectionStatus: DeviceConnectionStatus.ERROR,
      location: '实验室 C',
      ipAddress: '192.168.1.103',
      macAddress: '00:1B:44:11:3A:B9',
      firmware: 'v1.8.2',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
      metrics: {
        pressure: 1013.25,
        temperature: 22.1
      },
      tags: ['critical', 'lab-c'],
      status: DeviceStatus.ERROR,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '4',
      name: '加热器控制器 HC4',
      type: DeviceType.ACTUATOR,
      model: 'HC-4000',
      manufacturer: 'HeatTech',
      description: '实验室温度控制设备',
      connectionStatus: DeviceConnectionStatus.CONNECTING,
      location: '实验室 D',
      ipAddress: '192.168.1.104',
      macAddress: '00:1B:44:11:3A:C0',
      firmware: 'v3.0.1',
      lastSeen: new Date(Date.now() - 1 * 60 * 1000), // 1分钟前
      metrics: {
        temperature: 28.7,
        power_consumption: 1250.5
      },
      tags: ['lab-d'],
      status: DeviceStatus.ACTIVE,
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date(Date.now() - 1 * 60 * 1000)
    }
  ];

  // 模拟自动刷新
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        // console.log removed
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const handleDeviceAction = (deviceId: string, action: string) => {
    // console.log removed
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleDeviceSelect = (deviceId: string) => {
    // console.log removed
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        设备状态卡片演示
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        展示不同状态下的设备状态卡片组件，包括在线、离线、错误和连接中状态。
      </Typography>

      {/* 控制选项 */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          控制选项
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FormControlLabel
              control={
                <Switch
                  checked={showActions}
                  onChange={(e) => setShowActions(e.target.checked)}
                />
              }
              label="显示操作按钮"
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Switch
                  checked={refreshInterval !== null}
                  onChange={(e) => setRefreshInterval(e.target.checked ? 5000 : null)}
                />
              }
              label="自动刷新 (5秒)"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 设备卡片网格 */}
      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
            <DeviceStatusCard
              device={device}
              showActions={showActions}
              loading={loading}
              onAction={(action) => handleDeviceAction(device.id, action)}
              onSelect={() => handleDeviceSelect(device.id)}
            />
          </Grid>
        ))}
      </Grid>

      {/* 状态说明 */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          状态说明
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  mr: 1
                }}
              />
              <Typography variant="body2">在线 - 设备正常运行</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  mr: 1
                }}
              />
              <Typography variant="body2">离线 - 设备无响应</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                  mr: 1
                }}
              />
              <Typography variant="body2">错误 - 设备故障</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'info.main',
                  mr: 1
                }}
              />
              <Typography variant="body2">连接中 - 正在建立连接</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DeviceStatusCardDemo;

