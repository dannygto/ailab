import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  useTheme, 
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrainingHistory } from '../../types';

interface TrainingHistoryChartProps {
  history: TrainingHistory;
  height?: number;
}

/**
 * ѵ����ʷͼ�����
 * 
 * �����չʾѵ�������е���ʧ��׼ȷ�ʱ仯
 */
const TrainingHistoryChart: React.FC<TrainingHistoryChartProps> = ({ history, height = 400 }) => {
  const theme = useTheme();
  const [chartType, setChartType] = React.useState<'accuracy' | 'loss'>('accuracy');

  // ׼��ͼ������
  const chartData = history.epochs.map((epoch, index) => ({
    epoch,
    accuracy: history.accuracy[index],
    valAccuracy: history.valAccuracy[index],
    loss: history.loss[index],
    valLoss: history.valLoss[index]
  }));

  // �л�ͼ�����ʹ�������
  const handleChartTypeChange = (
    _Event: React.MouseEvent<HTMLElement>,
    newType: 'accuracy' | 'loss' | null,
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, height }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          ѵ����ʷ
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="accuracy">
            ׼ȷ��
          </ToggleButton>
          <ToggleButton value="loss">
            ��ʧֵ
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <ResponsiveContainer width="100%" height="85%">
        {chartType === 'accuracy' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="epoch" 
              label={{ value: '�ִ�', position: 'insideBottomRight', offset: -5 }} 
            />
            <YAxis 
              label={{ value: '׼ȷ��', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip 
              formatter={(value: any) => [`${(value * 100).toFixed(2)}%`, '']}
              labelFormatter={(label ) => `�ִ� \$\{label\}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              name="ѵ����׼ȷ��" 
              stroke={theme.palette.primary.main} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="valAccuracy" 
              name="��֤��׼ȷ��" 
              stroke={theme.palette.secondary.main} 
            />
          </LineChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="epoch" 
              label={{ value: '�ִ�', position: 'insideBottomRight', offset: -5 }} 
            />
            <YAxis 
              label={{ value: '��ʧֵ', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any) => [value.toFixed(4), '']}
              labelFormatter={(label ) => `�ִ� \$\{label\}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="loss" 
              name="ѵ������ʧ" 
              stroke={theme.palette.error.main} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="valLoss" 
              name="��֤����ʧ" 
              stroke={theme.palette.warning.main} 
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default TrainingHistoryChart;

