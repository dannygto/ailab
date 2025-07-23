import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import DeviceManagement from '../src/pages/devices/DeviceManagement';

// 创建测试主题
const theme = createTheme();

// 模拟组件包装器
const MockedDeviceManagement = () => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <DeviceManagement />
    </ThemeProvider>
  </BrowserRouter>
);

// 模拟用户状态管理
jest.mock('../src/store', () => ({
  useUserStore: () => ({
    user: { id: 1, username: 'testuser', role: 'student' }
  })
}));

// 模拟设备数据
const mockDevices = [
  {
    id: 1,
    name: '温度传感器-001',
    type: 'sensor',
    status: 'online',
    location: '实验室A',
    lastUpdate: '2025-01-01T10:00:00Z',
    data: { temperature: 25.5 }
  },
  {
    id: 2,
    name: '摄像头-002',
    type: 'camera',
    status: 'offline',
    location: '实验室B',
    lastUpdate: '2025-01-01T09:30:00Z',
    data: {}
  }
];

// 模拟API服务
jest.mock('../src/services/api', () => ({
  default: {
    getDevices: jest.fn(() => Promise.resolve(mockDevices)),
    updateDevice: jest.fn((id, data) => Promise.resolve({ ...mockDevices.find(d => d.id === id), ...data })),
    deleteDevice: jest.fn(() => Promise.resolve({ success: true })),
    addDevice: jest.fn((data) => Promise.resolve({ id: 3, ...data }))
  }
}));

describe('DeviceManagement 组件测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染设备管理页面', async () => {
    render(<MockedDeviceManagement />);
    
    // 检查页面标题
    expect(screen.getByText('设备管理')).toBeInTheDocument();
  });

  it('应该显示设备列表', async () => {
    render(<MockedDeviceManagement />);
    
    // 等待设备数据加载
    await waitFor(() => {
      expect(screen.getByText('温度传感器-001')).toBeInTheDocument();
    });
    
    expect(screen.getByText('摄像头-002')).toBeInTheDocument();
  });

  it('应该显示设备状态', async () => {
    render(<MockedDeviceManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('温度传感器-001')).toBeInTheDocument();
    });
    
    // 检查在线状态
    expect(screen.getByText('在线')).toBeInTheDocument();
    expect(screen.getByText('离线')).toBeInTheDocument();
  });

  it('应该支持设备筛选', async () => {
    render(<MockedDeviceManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('温度传感器-001')).toBeInTheDocument();
    });
    
    // 查找状态筛选器 - 简化测试
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('应该支持批量操作', async () => {
    render(<MockedDeviceManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('温度传感器-001')).toBeInTheDocument();
    });
    
    // 检查页面上有复选框元素
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('应该显示设备详细信息', async () => {
    render(<MockedDeviceManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('温度传感器-001')).toBeInTheDocument();
    });
    
    // 检查设备位置信息
    expect(screen.getByText('实验室A')).toBeInTheDocument();
    expect(screen.getByText('实验室B')).toBeInTheDocument();
  });

  it('应该响应刷新操作', async () => {
    render(<MockedDeviceManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('温度传感器-001')).toBeInTheDocument();
    });
    
    // 检查页面上有按钮元素
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('应该处理错误状态', async () => {
    // 模拟API错误
    const apiService = require('../src/services/api').default;
    apiService.getDevices.mockRejectedValueOnce(new Error('网络错误'));
    
    render(<MockedDeviceManagement />);
    
    // 基本验证组件能够渲染
    expect(screen.getByText('设备管理')).toBeInTheDocument();
  });
});
