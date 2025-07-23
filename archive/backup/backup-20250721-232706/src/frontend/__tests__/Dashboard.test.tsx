import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import Dashboard from '../src/pages/Dashboard';

// 创建测试主题
const theme = createTheme();

// 模拟React Router
const MockedDashboard = () => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <Dashboard />
    </ThemeProvider>
  </BrowserRouter>
);

// 模拟用户状态管理
jest.mock('../src/store', () => ({
  useUserStore: () => ({
    user: { id: 1, username: 'testuser', role: 'student' }
  })
}));

// 模拟API服务
jest.mock('../src/services/api', () => ({
  default: {
    getDashboardStats: jest.fn(() => Promise.resolve({
      totalExperiments: 10,
      runningExperiments: 3,
      completedExperiments: 7,
      totalDevices: 5,
      onlineDevices: 4
    })),
    getRecentExperiments: jest.fn(() => Promise.resolve([
      { id: 1, name: '测试实验1', status: 'running' },
      { id: 2, name: '测试实验2', status: 'completed' }
    ]))
  }
}));

describe('Dashboard 组件测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染仪表板主要元素', async () => {
    render(<MockedDashboard />);
    
    // 检查标题
    expect(screen.getByText('人工智能辅助实验平台')).toBeInTheDocument();
  });

  it('应该显示统计卡片', async () => {
    render(<MockedDashboard />);
    
    // 分别等待每个元素
    await waitFor(() => {
      expect(screen.getByText('实验统计')).toBeInTheDocument();
    });
    
    expect(screen.getByText('总实验数')).toBeInTheDocument();
    expect(screen.getByText('进行中')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
    expect(screen.getByText('设备状态')).toBeInTheDocument();
  });

  it('应该显示快速操作按钮', async () => {
    render(<MockedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('创建实验')).toBeInTheDocument();
    });
    
    expect(screen.getByText('设备管理')).toBeInTheDocument();
    expect(screen.getByText('数据分析')).toBeInTheDocument();
  });

  it('应该响应快速操作按钮点击', async () => {
    render(<MockedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('创建实验')).toBeInTheDocument();
    });
    
    const createButton = screen.getByText('创建实验');
    fireEvent.click(createButton);
    // 这里可以添加更多的交互测试
  });

  it('应该正确处理加载状态', () => {
    render(<MockedDashboard />);
    
    // 检查是否有加载指示器或者组件能正常渲染
    expect(screen.getByText('人工智能辅助实验平台')).toBeInTheDocument();
  });

  it('应该在移动端正确显示', () => {
    // 模拟移动端屏幕
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<MockedDashboard />);
    
    // 检查移动端适配
    expect(screen.getByText('人工智能辅助实验平台')).toBeInTheDocument();
  });
});
