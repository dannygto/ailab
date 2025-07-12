// ExperimentDataVisualization组件测试
import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockExperimentData } from '../src/__tests__/mockData';

// 实验数据可视化组件模拟
interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface ExperimentDataVisualizationProps {
  data: DataPoint[];
  title: string;
  chartType: 'line' | 'bar' | 'scatter';
  xLabel?: string;
  yLabel?: string;
}

const ExperimentDataVisualization: React.FC<ExperimentDataVisualizationProps> = ({
  data,
  title,
  chartType,
  xLabel = 'X轴',
  yLabel = 'Y轴'
}) => (
  <div data-testid="data-visualization">
    <h3>{title}</h3>
    <div data-testid="chart-info">
      <div>图表类型: {chartType}</div>
      <div>数据点数: {data.length}</div>
      <div>X轴标签: {xLabel}</div>
      <div>Y轴标签: {yLabel}</div>
    </div>
    
    {data.length === 0 ? (
      <div data-testid="no-data">暂无数据</div>
    ) : (
      <div data-testid="chart-container">
        <div data-testid="data-summary">
          最小值: {Math.min(...data.map(d => d.y))}
          最大值: {Math.max(...data.map(d => d.y))}
        </div>
        <div data-testid="data-points">
          {data.slice(0, 3).map((point, index) => (
            <div key={index}>
              点{index + 1}: ({point.x}, {point.y}) {point.label && `- ${point.label}`}
            </div>
          ))}
          {data.length > 3 && <div>... 还有 {data.length - 3} 个数据点</div>}
        </div>
      </div>
    )}
  </div>
);

describe('ExperimentDataVisualization组件测试', () => {
  // 使用从mockData导入的数据
  const testData = mockExperimentData;

  test('渲染图表标题和基本信息', () => {
    render(
      <ExperimentDataVisualization
        data={testData}
        title="温度变化趋势"
        chartType="line"
        xLabel="时间"
        yLabel="温度(°C)"
      />
    );
    
    expect(screen.getByText('温度变化趋势')).toBeInTheDocument();
    expect(screen.getByText('图表类型: line')).toBeInTheDocument();
    expect(screen.getByText('数据点数: 7')).toBeInTheDocument();
    expect(screen.getByText('X轴标签: 时间')).toBeInTheDocument();
    expect(screen.getByText('Y轴标签: 温度(°C)')).toBeInTheDocument();
  });

  test('显示数据摘要', () => {
    render(
      <ExperimentDataVisualization
        data={testData}
        title="数据分析"
        chartType="bar"
      />
    );
    
    expect(screen.getByTestId('data-summary')).toHaveTextContent('最小值: 10最大值: 25');
  });

  test('显示数据点预览', () => {
    render(
      <ExperimentDataVisualization
        data={testData}
        title="数据分析"
        chartType="scatter"
      />
    );
    
    expect(screen.getByText('点1: (1, 10) - 第一个点')).toBeInTheDocument();
    expect(screen.getByText('点2: (2, 15) - 第二个点')).toBeInTheDocument();
    expect(screen.getByText('点3: (3, 12) - 第三个点')).toBeInTheDocument();
    expect(screen.getByText('... 还有 4 个数据点')).toBeInTheDocument();
  });

  test('空数据状态', () => {
    render(
      <ExperimentDataVisualization
        data={[]}
        title="空数据图表"
        chartType="line"
      />
    );
    
    expect(screen.getByTestId('no-data')).toHaveTextContent('暂无数据');
    expect(screen.queryByTestId('chart-container')).not.toBeInTheDocument();
  });

  test('默认轴标签', () => {
    render(
      <ExperimentDataVisualization
        data={mockData}
        title="默认标签"
        chartType="bar"
      />
    );
    
    expect(screen.getByText('X轴标签: X轴')).toBeInTheDocument();
    expect(screen.getByText('Y轴标签: Y轴')).toBeInTheDocument();
  });
});
