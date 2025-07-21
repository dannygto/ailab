import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { ChartData } from '../../types';

interface AdvancedVisualizationProps {
  chart: ChartData;
  height?: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdvancedVisualization: React.FC<AdvancedVisualizationProps> = ({ chart, height = 400 }) => {
  const { type, title, description, data, options, labels } = chart;

  // 渲染不同类型的图表
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data} {...options}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={labels?.xAxis || 'x'} />
            <YAxis label={{ value: labels?.yAxis || '', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {(labels?.series || Object.keys(data[0] || {})).filter(k => k !== (labels?.xAxis || 'x')).map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} />
            ))}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data} {...options}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={labels?.xAxis || 'x'} />
            <YAxis label={{ value: labels?.yAxis || '', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {(labels?.series || Object.keys(data[0] || {})).filter(k => k !== (labels?.xAxis || 'x')).map((key, idx) => (
              <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} />
            ))}
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart {...options}>
            <Tooltip />
            <Legend />
            <Pie data={data} dataKey={labels?.yAxis || 'value'} nameKey={labels?.xAxis || 'name'} cx="50%" cy="50%" outerRadius={120} fill="#8884d8">
              {data.map((entry: any, idx: number) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data} {...options}>
            <PolarGrid />
            <PolarAngleAxis dataKey={labels?.xAxis || 'subject'} />
            <PolarRadiusAxis />
            <Radar name={labels?.series?.[0] || 'A'} dataKey={labels?.yAxis || 'A'} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        );
      // 可扩展更多类型...
      default:
        return <Typography color="error">暂不支持的图表类型: {type}</Typography>;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, height }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">{title || '高级可视化'}</Typography>
        {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
      </Box>
      <ResponsiveContainer width="100%" height="85%">
        {renderChart()}
      </ResponsiveContainer>
    </Paper>
  );
};

export default AdvancedVisualization;
