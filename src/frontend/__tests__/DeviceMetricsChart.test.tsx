// DeviceMetricsChart组件测试
import React from 'react';
import { render, screen } from '@testing-library/react';

// 设备指标图表组件模拟
interface MetricsData {
  timestamp: string;
  value: number;
  unit: string;
}

interface DeviceMetricsChartProps {
  title: string;
  data: MetricsData[];
  height?: number;
}

const DeviceMetricsChart: React.FC<DeviceMetricsChartProps> = ({ title, data, height = 300 }) => (
  <div data-testid="metrics-chart" style={{ height }}>
    <h3>{title}</h3>
    <div data-testid="chart-data">
      {data.length > 0 ? (
        <div>
          <div>数据点数量: {data.length}</div>
          <div>最新值: {data[data.length - 1]?.value} {data[data.length - 1]?.unit}</div>
        </div>
      ) : (
        <div>暂无数据</div>
      )}
    </div>
  </div>
);

describe('DeviceMetricsChart组件测试', () => {
  const mockData: MetricsData[] = [
    { timestamp: '2025-07-03T10:00:00Z', value: 25.5, unit: '°C' },
    { timestamp: '2025-07-03T10:05:00Z', value: 26.0, unit: '°C' },
    { timestamp: '2025-07-03T10:10:00Z', value: 25.8, unit: '°C' }
  ];

  test('渲染图表标题', () => {
    render(<DeviceMetricsChart title="温度趋势" data={mockData} />);
    
    expect(screen.getByText('温度趋势')).toBeInTheDocument();
  });

  test('显示数据统计', () => {
    render(<DeviceMetricsChart title="温度趋势" data={mockData} />);
    
    expect(screen.getByText('数据点数量: 3')).toBeInTheDocument();
    expect(screen.getByText('最新值: 25.8 °C')).toBeInTheDocument();
  });

  test('空数据状态', () => {
    render(<DeviceMetricsChart title="温度趋势" data={[]} />);
    
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  test('自定义高度', () => {
    render(<DeviceMetricsChart title="温度趋势" data={mockData} height={400} />);
    
    const chart = screen.getByTestId('metrics-chart');
    expect(chart).toHaveStyle({ height: '400px' });
  });
});
