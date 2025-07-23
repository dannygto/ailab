// ExperimentStatistics组件测试
import React from 'react';
import { render, screen } from '@testing-library/react';

// 实验统计组件模拟
interface ExperimentStats {
  totalExperiments: number;
  activeExperiments: number;
  completedExperiments: number;
  failedExperiments: number;
  totalParticipants: number;
  averageDuration: number;
}

interface ExperimentStatisticsProps {
  stats: ExperimentStats;
  loading?: boolean;
}

const ExperimentStatistics: React.FC<ExperimentStatisticsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return <div data-testid="stats-loading">加载统计中...</div>;
  }

  const successRate = stats.totalExperiments > 0 
    ? ((stats.completedExperiments / stats.totalExperiments) * 100).toFixed(1)
    : '0';

  return (
    <div data-testid="experiment-statistics">
      <h2>实验统计</h2>
      
      <div data-testid="stats-grid">
        <div data-testid="total-experiments">
          <div>总实验数</div>
          <div>{stats.totalExperiments}</div>
        </div>
        
        <div data-testid="active-experiments">
          <div>进行中</div>
          <div>{stats.activeExperiments}</div>
        </div>
        
        <div data-testid="completed-experiments">
          <div>已完成</div>
          <div>{stats.completedExperiments}</div>
        </div>
        
        <div data-testid="failed-experiments">
          <div>失败</div>
          <div>{stats.failedExperiments}</div>
        </div>
        
        <div data-testid="total-participants">
          <div>总参与者</div>
          <div>{stats.totalParticipants}</div>
        </div>
        
        <div data-testid="average-duration">
          <div>平均时长</div>
          <div>{stats.averageDuration} 分钟</div>
        </div>
        
        <div data-testid="success-rate">
          <div>成功率</div>
          <div>{successRate}%</div>
        </div>
      </div>
    </div>
  );
};

describe('ExperimentStatistics组件测试', () => {
  const mockStats: ExperimentStats = {
    totalExperiments: 100,
    activeExperiments: 15,
    completedExperiments: 75,
    failedExperiments: 10,
    totalParticipants: 250,
    averageDuration: 45
  };

  test('渲染统计数据', () => {
    render(<ExperimentStatistics stats={mockStats} />);
    
    expect(screen.getByText('实验统计')).toBeInTheDocument();
    expect(screen.getByTestId('total-experiments')).toHaveTextContent('100');
    expect(screen.getByTestId('active-experiments')).toHaveTextContent('15');
    expect(screen.getByTestId('completed-experiments')).toHaveTextContent('75');
    expect(screen.getByTestId('failed-experiments')).toHaveTextContent('10');
  });

  test('显示参与者和时长统计', () => {
    render(<ExperimentStatistics stats={mockStats} />);
    
    expect(screen.getByTestId('total-participants')).toHaveTextContent('250');
    expect(screen.getByTestId('average-duration')).toHaveTextContent('45 分钟');
  });

  test('计算成功率', () => {
    render(<ExperimentStatistics stats={mockStats} />);
    
    expect(screen.getByTestId('success-rate')).toHaveTextContent('75.0%');
  });

  test('加载状态', () => {
    render(<ExperimentStatistics stats={mockStats} loading={true} />);
    
    expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
    expect(screen.getByText('加载统计中...')).toBeInTheDocument();
    expect(screen.queryByTestId('experiment-statistics')).not.toBeInTheDocument();
  });

  test('零实验数据', () => {
    const emptyStats: ExperimentStats = {
      totalExperiments: 0,
      activeExperiments: 0,
      completedExperiments: 0,
      failedExperiments: 0,
      totalParticipants: 0,
      averageDuration: 0
    };

    render(<ExperimentStatistics stats={emptyStats} />);
    
    expect(screen.getByTestId('total-experiments')).toHaveTextContent('0');
    expect(screen.getByTestId('success-rate')).toHaveTextContent('0%');
  });

  test('高成功率数据', () => {
    const highSuccessStats: ExperimentStats = {
      totalExperiments: 50,
      activeExperiments: 5,
      completedExperiments: 44,
      failedExperiments: 1,
      totalParticipants: 150,
      averageDuration: 60
    };

    render(<ExperimentStatistics stats={highSuccessStats} />);
    
    expect(screen.getByTestId('success-rate')).toHaveTextContent('88.0%');
  });
});
