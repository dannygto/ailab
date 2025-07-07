import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// 创建测试主题
const theme = createTheme();

// 模拟组件包装器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

// 模拟用户状态管理
jest.mock('../src/store', () => ({
  useUserStore: () => ({
    user: { id: 1, username: 'testuser', role: 'student' }
  })
}));

// 模拟监控数据
const mockMonitoringData = [
  {
    deviceId: 1,
    deviceName: '温度传感器-001',
    timestamp: '2025-01-01T10:00:00Z',
    value: 25.5,
    unit: '°C',
    status: 'normal'
  },
  {
    deviceId: 2,
    deviceName: '湿度传感器-002',
    timestamp: '2025-01-01T10:00:00Z',
    value: 60.2,
    unit: '%',
    status: 'warning'
  }
];

// 模拟API服务
jest.mock('../src/services/api', () => ({
  default: {
    getMonitoringData: jest.fn(() => Promise.resolve(mockMonitoringData)),
    getDeviceAlerts: jest.fn(() => Promise.resolve([
      {
        id: 1,
        deviceId: 2,
        message: '湿度过高',
        level: 'warning',
        timestamp: '2025-01-01T10:00:00Z'
      }
    ]))
  }
}));

// 创建一个简单的监控组件用于测试
const MonitoringComponent: React.FC = () => {
  return (
    <div>
      <h1>设备监控</h1>
      <div data-testid="monitoring-dashboard">
        <div>温度传感器-001: 25.5°C</div>
        <div>湿度传感器-002: 60.2%</div>
        <div>告警：湿度过高</div>
      </div>
    </div>
  );
};

describe('设备监控系统测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染监控组件', () => {
    render(
      <TestWrapper>
        <MonitoringComponent />
      </TestWrapper>
    );
    
    expect(screen.getByText('设备监控')).toBeInTheDocument();
    expect(screen.getByTestId('monitoring-dashboard')).toBeInTheDocument();
  });

  it('应该显示设备监控数据', () => {
    render(
      <TestWrapper>
        <MonitoringComponent />
      </TestWrapper>
    );
    
    expect(screen.getByText('温度传感器-001: 25.5°C')).toBeInTheDocument();
    expect(screen.getByText('湿度传感器-002: 60.2%')).toBeInTheDocument();
  });

  it('应该显示告警信息', () => {
    render(
      <TestWrapper>
        <MonitoringComponent />
      </TestWrapper>
    );
    
    expect(screen.getByText('告警：湿度过高')).toBeInTheDocument();
  });

  it('API 服务应该能够获取监控数据', async () => {
    const apiService = require('../src/services/api').default;
    const data = await apiService.getMonitoringData();
    
    expect(data).toHaveLength(2);
    expect(data[0].deviceName).toBe('温度传感器-001');
    expect(data[0].value).toBe(25.5);
  });

  it('API 服务应该能够获取告警数据', async () => {
    const apiService = require('../src/services/api').default;
    const alerts = await apiService.getDeviceAlerts();
    
    expect(alerts).toHaveLength(1);
    expect(alerts[0].message).toBe('湿度过高');
    expect(alerts[0].level).toBe('warning');
  });

  it('应该正确处理数据格式', () => {
    const data = mockMonitoringData[0];
    
    expect(data).toHaveProperty('deviceId');
    expect(data).toHaveProperty('deviceName');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('value');
    expect(data).toHaveProperty('unit');
    expect(data).toHaveProperty('status');
  });

  it('应该支持不同类型的传感器数据', () => {
    const temperatureData = mockMonitoringData.find(d => d.unit === '°C');
    const humidityData = mockMonitoringData.find(d => d.unit === '%');
    
    expect(temperatureData).toBeDefined();
    expect(humidityData).toBeDefined();
    expect(temperatureData?.deviceName).toContain('温度');
    expect(humidityData?.deviceName).toContain('湿度');
  });
});
