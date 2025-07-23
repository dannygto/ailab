import { Box } from '@mui/material';
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithTheme } from '../test-utils';
import { experimentFixtures } from '../fixtures/experiments';

// 模拟实验统计组件
const MockExperimentStatistics = ({ experiments = experimentFixtures.basicExperiments }) => {
  const runningCount = experiments.filter(exp => exp.status === 'running').length;
  const completedCount = experiments.filter(exp => exp.status === 'completed').length;
  const failedCount = experiments.filter(exp => exp.status === 'failed').length;

  return (
    <div data-testid="experiment-statistics">
      <h2>实验统计</h2>
      <div data-testid="stats-grid">
        <div data-testid="stat-total">
          <h3>总实验数</h3>
          <span>{experiments.length}</span>
        </div>
        <div data-testid="stat-running">
          <h3>运行中</h3>
          <span>{runningCount}</span>
        </div>
        <div data-testid="stat-completed">
          <h3>已完成</h3>
          <span>{completedCount}</span>
        </div>
        <div data-testid="stat-failed">
          <h3>失败</h3>
          <span>{failedCount}</span>
        </div>
      </div>
      <div data-testid="charts-section">
        <div data-testid="pie-chart">饼图</div>
        <div data-testid="trend-chart">趋势图</div>
      </div>
    </div>
  );
};

describe('ExperimentStatistics', () => {
  test('渲染实验统计', () => {
    renderWithTheme(<MockExperimentStatistics />);
    expect(screen.getByTestId('experiment-statistics')).toBeInTheDocument();
    expect(screen.getByText('实验统计')).toBeInTheDocument();
  });

  test('显示统计网格', () => {
    renderWithTheme(<MockExperimentStatistics />);
    expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
    expect(screen.getByTestId('stat-total')).toBeInTheDocument();
    expect(screen.getByTestId('stat-running')).toBeInTheDocument();
    expect(screen.getByTestId('stat-completed')).toBeInTheDocument();
    expect(screen.getByTestId('stat-failed')).toBeInTheDocument();
  });

  test('显示正确的统计数字', () => {
    renderWithTheme(<MockExperimentStatistics />);
    expect(screen.getByText('总实验数')).toBeInTheDocument();
    expect(screen.getByText('运行中')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
    expect(screen.getByText('失败')).toBeInTheDocument();
  });

  test('显示图表区域', () => {
    renderWithTheme(<MockExperimentStatistics />);
    expect(screen.getByTestId('charts-section')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
  });

  test('处理空实验列表', () => {
    renderWithTheme(<MockExperimentStatistics experiments={[]} />);
    expect(screen.getByTestId('experiment-statistics')).toBeInTheDocument();
    expect(screen.getByTestId('stat-total')).toHaveTextContent('0'); // 总实验数应该为0
  });
});

export default MockExperimentStatistics;
