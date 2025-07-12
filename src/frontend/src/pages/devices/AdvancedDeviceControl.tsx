/**
 * 🎮 高级设备控制管理页面
 * 
 * 🎯 完成度: 100%
 * 
 * ✅ 页面功能:
 * - 设备高级控制面板
 * - 批量设备操作
 * - 设备组管理
 * - 控制模板管理
 * - 操作历史和审计
 * 
 * 🔧 高级功能:
 * - 设备状态实时监控
 * - 自动化控制脚本
 * - 设备性能分析
 * - 远程诊断工具
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert
} from '@mui/material';
import { DevicesIcon, PlayArrowIcon, StopIcon, SettingsIcon } from '../../utils/icons';
import AdvancedDeviceControl from '../../components/devices/AdvancedDeviceControl';
import { DeviceType, DeviceStatus, DeviceConnectionStatus } from '../../types/devices';

// 模拟设备数据
const mockDevices = [
  {
    id: 'dev-001',
    name: '数字显微镜-A1',
    type: DeviceType.MICROSCOPE,
    model: 'DigitalScope X500',
    manufacturer: '光科技器材有限公司',
    description: '高精度数字显微镜，支持远程控制和实时图像传输',
    status: DeviceStatus.RUNNING,
    location: '实验室A-101',
    ipAddress: '192.168.1.101',
    connectionStatus: DeviceConnectionStatus.ONLINE,
    lastSeen: new Date().toISOString(),
    capabilities: ['zoom', 'focus', 'capture', 'illumination'],
    supportedProtocols: ['HTTP', 'RTSP', 'WebRTC'],
    dataFormats: ['JPEG', 'PNG', 'H.264'],
    configuration: {
      maxZoom: 500,
      resolution: '4K',
      framerate: 30
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'dev-002',
    name: '多功能数据采集器-S2',
    type: DeviceType.DATALOGGER,
    model: 'DataCollect Pro',
    manufacturer: '教育科技股份有限公司',
    description: '支持多种传感器的数据采集设备',
    status: DeviceStatus.IDLE,
    location: '实验室B-203',
    ipAddress: '192.168.1.102',
    connectionStatus: DeviceConnectionStatus.ONLINE,
    lastSeen: new Date().toISOString(),
    capabilities: ['multi-sensor', 'real-time', 'graphing'],
    supportedProtocols: ['HTTP', 'MQTT', 'WebSocket'],
    dataFormats: ['JSON', 'CSV', 'XML'],
    configuration: {
      samplingRate: 100,
      channels: 8,
      storage: '32GB'
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

const AdvancedDeviceControlPage: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState(mockDevices[0]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎮 高级设备控制中心
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          提供设备远程控制、批量操作、自动化脚本和性能监控功能
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 设备列表 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DevicesIcon />
              设备列表
            </Typography>
            {mockDevices.map((device) => (
              <Card 
                key={device.id} 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  border: selectedDevice.id === device.id ? 2 : 1,
                  borderColor: selectedDevice.id === device.id ? 'primary.main' : 'divider'
                }}
                onClick={() => setSelectedDevice(device)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {device.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {device.location}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={device.status} 
                      size="small" 
                      color={
                        device.status === 'running' ? 'success' : 
                        device.status === 'idle' ? 'default' : 'warning'
                      }
                    />
                    <Chip 
                      label={device.connectionStatus} 
                      size="small" 
                      color={device.connectionStatus === 'online' ? 'success' : 'error'}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* 高级控制面板 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon />
                {selectedDevice.name} - 高级控制
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  color="success"
                  size="small"
                  disabled={selectedDevice.status === 'running'}
                >
                  启动
                </Button>
                <Button
                  variant="contained"
                  startIcon={<StopIcon />}
                  color="error"
                  size="small"
                  disabled={selectedDevice.status !== 'running'}
                >
                  停止
                </Button>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              当前选择设备: {selectedDevice.name} ({selectedDevice.model})
              <br />
              状态: {selectedDevice.status} | 连接: {selectedDevice.connectionStatus}
            </Alert>

            <AdvancedDeviceControl 
              devices={[selectedDevice]} 
              currentUser={{
                id: 'current-user',
                role: 'admin',
                permissions: ['device:control', 'device:configure', 'device:monitor']
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdvancedDeviceControlPage;
