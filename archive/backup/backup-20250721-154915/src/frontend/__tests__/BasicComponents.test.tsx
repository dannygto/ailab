// BasicComponents基础组件测试
import React from 'react';
import { render, screen } from '@testing-library/react';

// 基础组件模拟
const Loading: React.FC = () => <div data-testid="loading">加载中...</div>;
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => <div data-testid="error">{message}</div>;
const EmptyState: React.FC = () => <div data-testid="empty">暂无数据</div>;

describe('基础组件测试', () => {
  test('Loading组件', () => {
    render(<Loading />);
    
    const loading = screen.getByTestId('loading');
    expect(loading).toBeInTheDocument();
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  test('ErrorMessage组件', () => {
    const errorMsg = '网络连接失败';
    render(<ErrorMessage message={errorMsg} />);
    
    const error = screen.getByTestId('error');
    expect(error).toBeInTheDocument();
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  test('EmptyState组件', () => {
    render(<EmptyState />);
    
    const empty = screen.getByTestId('empty');
    expect(empty).toBeInTheDocument();
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });
});
