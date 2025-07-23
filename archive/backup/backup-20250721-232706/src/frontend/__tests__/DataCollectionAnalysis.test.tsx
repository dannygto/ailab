import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import DataCollectionAnalysis from '../src/pages/data/DataCollectionAnalysis';
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

describe('DataCollectionAnalysis Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component title', async () => {
    renderWithQueryClient(<DataCollectionAnalysis />);
    
    // 验证标题渲染
    expect(screen.getByText('基础数据采集与分析')).toBeInTheDocument();
  });

  test('displays tabs correctly', async () => {
    renderWithQueryClient(<DataCollectionAnalysis />);
    
    // 验证标签页渲染
    expect(screen.getByText('数据源')).toBeInTheDocument();
    expect(screen.getByText('数据采集')).toBeInTheDocument();
    expect(screen.getByText('数据分析')).toBeInTheDocument();
  });

  test('shows data sources after loading', async () => {
    renderWithQueryClient(<DataCollectionAnalysis />);
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // 验证数据源显示
    expect(screen.getByText('物理实验传感器')).toBeInTheDocument();
    expect(screen.getByText('化学实验pH数据')).toBeInTheDocument();
  });

  test('opens create dialog when new button is clicked', async () => {
    renderWithQueryClient(<DataCollectionAnalysis />);
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // 点击新建按钮
    fireEvent.click(screen.getByText('新建'));
    
    // 验证对话框显示
    expect(screen.getByText('创建新数据源')).toBeInTheDocument();
  });

  test('filters data sources when search term is entered', async () => {
    renderWithQueryClient(<DataCollectionAnalysis />);
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // 输入搜索词
    const searchInput = screen.getByLabelText('搜索数据源');
    fireEvent.change(searchInput, { target: { value: '物理' } });
    
    // 验证过滤结果
    await waitFor(() => {
      expect(screen.getByText('物理实验传感器')).toBeInTheDocument();
      expect(screen.queryByText('化学实验pH数据')).not.toBeInTheDocument();
    });
  });

  test('switches tabs correctly', async () => {
    renderWithQueryClient(<DataCollectionAnalysis />);
    
    // 等待加载完成
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // 点击数据采集标签页
    fireEvent.click(screen.getByText('数据采集'));
    
    // 验证标签页切换
    expect(screen.getByText('请从左侧选择一个数据源以开始采集数据。')).toBeInTheDocument();
  });

  // 更多测试用例...
});
