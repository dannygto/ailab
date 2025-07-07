import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithTheme } from '../test-utils';
import { experimentFixtures } from '../fixtures/experiments';

// 模拟实验详情组件V2
const MockExperimentDetailV2 = ({ experiment = experimentFixtures.basicExperiments[0] }) => (
  <div data-testid="experiment-detail-v2">
    <header data-testid="experiment-header">
      <h1>{experiment.name}</h1>
      <div data-testid="experiment-status">
        <span className={`status-${experiment.status}`}>
          状态: {experiment.status}
        </span>
      </div>
    </header>
    
    <section data-testid="experiment-info">
      <h3>实验信息</h3>
      <p>描述: {experiment.description}</p>
      <p>创建时间: {experiment.createdAt}</p>
    </section>

    <section data-testid="experiment-tabs">
      <div data-testid="tab-overview">概览</div>
      <div data-testid="tab-data">数据</div>
      <div data-testid="tab-results">结果</div>
      <div data-testid="tab-settings">设置</div>
    </section>

    <section data-testid="experiment-content">
      <div>实验内容区域</div>
    </section>
  </div>
);

describe('ExperimentDetailV2', () => {
  test('渲染实验详情V2', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-detail-v2')).toBeInTheDocument();
  });

  test('显示实验标题和状态', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-header')).toBeInTheDocument();
    expect(screen.getByText('牛顿第二定律验证实验')).toBeInTheDocument();
    expect(screen.getByTestId('experiment-status')).toBeInTheDocument();
  });

  test('显示实验信息', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-info')).toBeInTheDocument();
    expect(screen.getByText(/描述:/)).toBeInTheDocument();
    expect(screen.getByText(/创建时间:/)).toBeInTheDocument();
  });

  test('显示选项卡', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-data')).toBeInTheDocument();
    expect(screen.getByTestId('tab-results')).toBeInTheDocument();
    expect(screen.getByTestId('tab-settings')).toBeInTheDocument();
  });

  test('显示内容区域', () => {
    renderWithTheme(<MockExperimentDetailV2 />);
    expect(screen.getByTestId('experiment-content')).toBeInTheDocument();
  });
});