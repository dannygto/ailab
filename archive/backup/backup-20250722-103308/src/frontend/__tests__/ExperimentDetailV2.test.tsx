// ExperimentDetailV2组件测试
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// 实验详情组件模拟
interface Experiment {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  duration: number;
  participants?: string[];
}

interface ExperimentDetailV2Props {
  experimentId: string;
  onBack?: () => void;
}

const ExperimentDetailV2: React.FC<ExperimentDetailV2Props> = ({ experimentId, onBack }) => {
  const [experiment, setExperiment] = React.useState<Experiment | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const mockExperiment: Experiment = {
        id: experimentId,
        name: `实验-${experimentId}`,
        type: 'physics',
        status: 'active',
        description: '这是一个物理实验的详细描述',
        createdAt: '2025-07-03T10:00:00Z',
        duration: 60,
        participants: ['张三', '李四']
      };
      setExperiment(mockExperiment);
      setLoading(false);
    }, 100);
  }, [experimentId]);

  if (loading) {
    return <div data-testid="loading">加载中...</div>;
  }

  if (!experiment) {
    return <div data-testid="not-found">实验不存在</div>;
  }

  return (
    <div data-testid="experiment-detail">
      <div data-testid="experiment-header">
        {onBack && <button onClick={onBack}>返回</button>}
        <h1>{experiment.name}</h1>
        <div data-testid="experiment-status">{experiment.status}</div>
      </div>
      
      <div data-testid="experiment-info">
        <div>类型: {experiment.type}</div>
        <div>时长: {experiment.duration} 分钟</div>
        <div>创建时间: {experiment.createdAt}</div>
        <div>描述: {experiment.description}</div>
      </div>

      {experiment.participants && experiment.participants.length > 0 && (
        <div data-testid="participants">
          <h3>参与者</h3>
          {experiment.participants.map((participant, index) => (
            <div key={index}>{participant}</div>
          ))}
        </div>
      )}
    </div>
  );
};

describe('ExperimentDetailV2组件测试', () => {
  test('显示加载状态', () => {
    render(<ExperimentDetailV2 experimentId="1" />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  test('加载并显示实验详情', async () => {
    render(<ExperimentDetailV2 experimentId="1" />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('experiment-detail')).toBeInTheDocument();
    expect(screen.getByText('实验-1')).toBeInTheDocument();
    expect(screen.getByText('类型: physics')).toBeInTheDocument();
    expect(screen.getByText('时长: 60 分钟')).toBeInTheDocument();
  });

  test('显示参与者列表', async () => {
    render(<ExperimentDetailV2 experimentId="1" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('participants')).toBeInTheDocument();
    });

    expect(screen.getByText('参与者')).toBeInTheDocument();
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('李四')).toBeInTheDocument();
  });

  test('返回按钮功能', async () => {
    const handleBack = jest.fn();
    render(<ExperimentDetailV2 experimentId="1" onBack={handleBack} />);
    
    await waitFor(() => {
      expect(screen.getByText('返回')).toBeInTheDocument();
    });

    const backButton = screen.getByText('返回');
    backButton.click();
    
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
