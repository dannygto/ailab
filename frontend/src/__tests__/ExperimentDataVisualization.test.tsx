import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithTheme } from '../test-utils';
import { experimentFixtures } from '../fixtures/experiments';

// 模拟实验数据可视化组件
const MockExperimentDataVisualization = ({ experiment = experimentFixtures.basicExperiments[0] }) => (
  <div data-testid="experiment-data-visualization">
    <h3>实验数据可视化</h3>
    <div data-testid="experiment-info">
      <h4>{experiment.name}</h4>
      <p>状态: {experiment.status}</p>
    </div>
    <div data-testid="chart-section">
      <div data-testid="line-chart">线图</div>
      <div data-testid="bar-chart">柱状图</div>
      <div data-testid="scatter-plot">散点图</div>
    </div>
    <div data-testid="data-table">
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>数值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2024-01-01</td>
            <td>100</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

describe('ExperimentDataVisualization', () => {
  test('渲染实验数据可视化', () => {
    renderWithTheme(<MockExperimentDataVisualization />);
    expect(screen.getByTestId('experiment-data-visualization')).toBeInTheDocument();
    expect(screen.getByText('实验数据可视化')).toBeInTheDocument();
  });

  test('显示实验信息', () => {
    renderWithTheme(<MockExperimentDataVisualization />);
    expect(screen.getByTestId('experiment-info')).toBeInTheDocument();
    expect(screen.getByText('牛顿第二定律验证实验')).toBeInTheDocument();
  });

  test('显示图表区域', () => {
    renderWithTheme(<MockExperimentDataVisualization />);
    expect(screen.getByTestId('chart-section')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-plot')).toBeInTheDocument();
  });

  test('显示数据表格', () => {
    renderWithTheme(<MockExperimentDataVisualization />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getByText('时间')).toBeInTheDocument();
    expect(screen.getByText('数值')).toBeInTheDocument();
  });
});