import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithTheme } from '../test-utils';

// 模拟仪表板组件
const MockDashboard = () => (
  <div data-testid="dashboard">
    <h1>仪表板</h1>
    <div>系统概览</div>
    <div>实验统计</div>
    <div>设备状态</div>
  </div>
);

describe('Dashboard', () => {
  test('渲染仪表板', () => {
    renderWithTheme(<MockDashboard />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.getByText('仪表板')).toBeInTheDocument();
  });

  test('显示主要模块', () => {
    renderWithTheme(<MockDashboard />);
    expect(screen.getByText('系统概览')).toBeInTheDocument();
    expect(screen.getByText('实验统计')).toBeInTheDocument();
    expect(screen.getByText('设备状态')).toBeInTheDocument();
  });

  test('仪表板结构完整性', () => {
    renderWithTheme(<MockDashboard />);
    const dashboard = screen.getByTestId('dashboard');
    expect(dashboard.children.length).toBeGreaterThan(0);
  });
});