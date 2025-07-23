import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import ExperimentResultsNew from '../src/components/visualizations/ExperimentResultsNew';
import { toast } from 'react-hot-toast';

// 模拟依赖
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// 创建测试用的QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0
    }
  }
});

// 测试组件包装器
const renderWithQueryClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};

// 模拟数据
const mockResults = [
  {
    id: '1',
    experimentId: '1',
    title: '测试数据1',
    description: '测试描述1',
    timestamp: new Date().toISOString(),
    dataType: 'line',
    data: [
      { time: '1:00', value: 25, category: '低温' },
      { time: '2:00', value: 28, category: '低温' },
      { time: '3:00', value: 30, category: '中温' }
    ]
  },
  {
    id: '2',
    experimentId: '1',
    title: '测试数据2',
    description: '测试描述2',
    timestamp: new Date().toISOString(),
    dataType: 'bar',
    data: [
      { name: 'A', value: 10 },
      { name: 'B', value: 20 },
      { name: 'C', value: 30 }
    ]
  }
];

describe('ExperimentResults组件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('正确渲染组件标题', async () => {
    renderWithQueryClient(<ExperimentResultsNew standalone={true} />);
    expect(screen.getByText('实验结果可视化')).toBeInTheDocument();
  });

  test('显示加载状态', async () => {
    renderWithQueryClient(<ExperimentResultsNew loading={true} />);
    expect(screen.getByText('加载数据中...')).toBeInTheDocument();
  });

  test('显示错误信息', async () => {
    const errorMessage = '加载失败';
    renderWithQueryClient(<ExperimentResultsNew error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('显示无数据信息', async () => {
    renderWithQueryClient(<ExperimentResultsNew results={[]} />);
    expect(screen.getByText('请选择一个实验查看结果')).toBeInTheDocument();
  });

  test('正确渲染提供的结果数据', async () => {
    renderWithQueryClient(<ExperimentResultsNew results={mockResults} />);
    
    // 检查选项卡标题
    expect(screen.getByText('测试数据1')).toBeInTheDocument();
    expect(screen.getByText('测试数据2')).toBeInTheDocument();
    
    // 检查描述
    expect(screen.getByText('测试描述1')).toBeInTheDocument();
  });

  test('切换图表类型', async () => {
    renderWithQueryClient(<ExperimentResultsNew results={mockResults} />);
    
    // 点击柱状图按钮
    const barChartButton = screen.getByTitle('柱状图');
    fireEvent.click(barChartButton);
    
    // 验证图表类型已切换 (通过样式检查)
    expect(barChartButton).toHaveAttribute('color', 'primary');
  });

  test('点击导出按钮', async () => {
    renderWithQueryClient(<ExperimentResultsNew results={mockResults} />);
    
    // 模拟createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:test');
    
    // 模拟document.createElement
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn()
    };
    document.createElement = jest.fn().mockReturnValue(mockLink);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    // 点击导出按钮
    const exportButton = screen.getByTitle('导出数据');
    fireEvent.click(exportButton);
    
    // 验证导出逻辑被调用
    expect(toast.success).toHaveBeenCalledWith('数据导出成功');
    expect(mockLink.click).toHaveBeenCalled();
  });

  test('加载远程数据', async () => {
    renderWithQueryClient(<ExperimentResultsNew experimentId="1" standalone={true} />);
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByText('加载数据中...')).not.toBeInTheDocument();
    });
    
    // 验证是否显示从API获取的数据
    await waitFor(() => {
      expect(screen.getByText('温度变化数据')).toBeInTheDocument();
    });
  });
});
