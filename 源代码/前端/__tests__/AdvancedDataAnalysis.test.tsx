import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import AdvancedDataAnalysis from '../src/pages/data/AdvancedDataAnalysis';
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

describe('AdvancedDataAnalysis Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component title', async () => {
    renderWithQueryClient(<AdvancedDataAnalysis />);
    
    // 验证标题渲染
    expect(screen.getByText('高级数据分析')).toBeInTheDocument();
  });

  test('displays analysis methods correctly', async () => {
    renderWithQueryClient(<AdvancedDataAnalysis />);
    
    // 验证分析方法显示
    expect(screen.getByText('描述性统计')).toBeInTheDocument();
    expect(screen.getByText('相关性分析')).toBeInTheDocument();
    expect(screen.getByText('异常值检测')).toBeInTheDocument();
    expect(screen.getByText('回归分析')).toBeInTheDocument();
  });

  test('shows parameter form when analysis method is selected', async () => {
    renderWithQueryClient(<AdvancedDataAnalysis />);
    
    // 选择分析方法
    const methodSelect = screen.getByLabelText('选择分析方法');
    fireEvent.mouseDown(methodSelect);
    const optionDescriptive = screen.getByText('描述性统计');
    fireEvent.click(optionDescriptive);
    
    // 验证参数表单显示
    await waitFor(() => {
      expect(screen.getByText('变量')).toBeInTheDocument();
    });
  });

  test('performs analysis when run button is clicked', async () => {
    renderWithQueryClient(<AdvancedDataAnalysis />);
    
    // 选择分析方法
    const methodSelect = screen.getByLabelText('选择分析方法');
    fireEvent.mouseDown(methodSelect);
    const optionDescriptive = screen.getByText('描述性统计');
    fireEvent.click(optionDescriptive);
    
    // 设置参数
    await waitFor(() => {
      const variableInput = screen.getByLabelText('变量');
      fireEvent.change(variableInput, { target: { value: 'temperature' } });
    });
    
    // 点击运行按钮
    const runButton = screen.getByText('运行分析');
    fireEvent.click(runButton);
    
    // 验证结果显示
    await waitFor(() => {
      expect(screen.getByText('分析结果')).toBeInTheDocument();
    });
  });

  test('shows error message when analysis fails', async () => {
    renderWithQueryClient(<AdvancedDataAnalysis />);
    
    // 选择分析方法
    const methodSelect = screen.getByLabelText('选择分析方法');
    fireEvent.mouseDown(methodSelect);
    const optionRegression = screen.getByText('回归分析');
    fireEvent.click(optionRegression);
    
    // 不设置必要参数，直接点击运行
    const runButton = screen.getByText('运行分析');
    fireEvent.click(runButton);
    
    // 验证错误信息显示
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
