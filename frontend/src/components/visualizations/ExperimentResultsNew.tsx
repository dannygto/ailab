import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Paper, 
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { BarChartIcon as BarChartIcon, ShowChartIcon as LineChartIcon, PieChartIcon as PieChartIcon, DownloadIcon as DownloadIcon, RefreshIcon as RefreshIcon, FullscreenIcon as FullscreenIcon } from '../../utils/icons';
import {
  BarChartIcon,
  Bar,
  LineChart,
  Line,
  PieChartIcon,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';

// ʵ��������
interface ExperimentResult {
  id: string;
  experimentId: string;
  title: string;
  description: string;
  timestamp: string;
  dataType: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'custom' | 'timeseries';
  data: any[];
}

// ͼ������
type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'table';

// Ĭ����ɫ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// ʵ�������ӻ����
interface ExperimentResultsProps {
  experimentId?: string;
  results?: ExperimentResult[];
  loading?: boolean;
  error?: string;
  standalone?: boolean;
}

const ExperimentResultsNew: React.FC<ExperimentResultsProps> = ({
  experimentId,
  results: propResults,
  loading: propLoading,
  error: propError,
  standalone = false
}) => {  // ״̬
  const [activeTab, setActiveTab] = useState(0);
  const [chartType, setChartType] = useState<ChartType>('line');

  // ��api��ȡ��������û���ṩprops��
  const {
    data: fetchedResults,
    isLoading: isLoadingResults,
    error: fetchError,
    refetch: refetchResults
  } = useQuery<ExperimentResult[], Error>(
    ['experimentResults', experimentId],
    async () => {
      // ģ��api����
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // ����ģ������
      return [
        {
          id: '1',
          experimentId: experimentId || '1',
          title: '�¶ȱ仯����',
          description: 'ʵ��������¶ȵı仯���',
          timestamp: new Date().toISOString(),
          dataType: 'timeseries',
          data: Array(24).fill(0).map((_, i) => ({
            time: `${i}:00`,
            value: 20 + Math.sin(i * Math.PI / 12) * 5 + Math.random() * 2,
            category: i < 8 ? '����' : i < 16 ? '����' : '����'
          }))
        },
        {
          id: '2',
          experimentId: experimentId || '1',
          title: 'ѹ�����ݻ���ϵ',
          description: '��ͬѹ���������ݻ��ı仯',
          timestamp: new Date().toISOString(),
          dataType: 'scatter',
          data: Array(15).fill(0).map((_, i) => ({
            pressure: 1 + i * 0.5,
            volume: 10 - i * 0.4 + Math.random() * 0.5,
            temperature: 20 + Math.floor(i / 5) * 10
          }))
        },
        {
          id: '3',
          experimentId: experimentId || '1',
          title: '��Ӧ��Ũ�ȷֲ�',
          description: '��ͬ��Ӧ���Ũ��ռ��',
          timestamp: new Date().toISOString(),
          dataType: 'pie',
          data: [
            { name: '��Ӧ��A', value: 35 + Math.random() * 5 },
            { name: '��Ӧ��B', value: 25 + Math.random() * 5 },
            { name: '��Ӧ��C', value: 20 + Math.random() * 5 },
            { name: '�߻���', value: 10 + Math.random() * 3 },
            { name: '�ܼ�', value: 10 + Math.random() * 3 }
          ]
        },
        {
          id: '4',
          experimentId: experimentId || '1',
          title: '��Ӧ������ʱ��仯',
          description: '��ͬ�����·�Ӧ���ʵ�ʱ��仯����',
          timestamp: new Date().toISOString(),
          dataType: 'bar',
          data: Array(8).fill(0).map((_, i) => ({
            time: `${i * 10}����`,
            '25��C': 10 + i * 2 - i * i * 0.1 + Math.random() * 2,
            '35��C': 12 + i * 3 - i * i * 0.15 + Math.random() * 2,
            '45��C': 15 + i * 4 - i * i * 0.2 + Math.random() * 2
          }))
        }
      ];
    },
    {
      enabled: standalone && !!experimentId,
      staleTime: 60000
    }
  );

  // �ϲ����������props��api��
  const results = propResults || fetchedResults || [];
  const loading = propLoading || isLoadingResults;
  const error = propError || (fetchError ? fetchError.message : undefined);

  // ��ǰ��ʾ�Ľ��
  const currentResult = results[activeTab];
  // ͼ������ѡ����
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  // ��������
  const handleExportData = () => {
    if (!currentResult) {
      toast.error('û�пɵ���������');
      return;
    }

    try {
      const dataStr = JSON.stringify(currentResult.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentResult.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('���ݵ����ɹ�');
    } catch (err) {
      console.error('��������ʧ��:', err);
      toast.error('��������ʧ��');
    }
  };

  // ��Ⱦͼ��
  const renderChart = () => {
    if (!currentResult || !currentResult.data) {
      return (
        <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography color="text.secondary">�޿��ӻ�����</Typography>
        </div>
      );
    }

    // ���ݽ�����;������ʺϵ�ͼ������
    const data = currentResult.data;
    const bestChartType = currentResult.dataType === 'pie' ? 'pie' : 
                         currentResult.dataType === 'scatter' ? 'scatter' : 
                         currentResult.dataType === 'bar' ? 'bar' : 'line';

    // ���û����ȷ����ͼ�����ͣ�ʹ�����ʺϵ�����
    const effectiveChartType = chartType || bestChartType;

    // �������ݽṹȷ����
    let xKey = Object.keys(data[0])[0];    let yKey = Object.keys(data[0])[1];

    // ���⴦��ɢ��ͼ������
    if (currentResult.dataType === 'scatter') {
      xKey = 'pressure';
      yKey = 'volume';
    }

    // ���⴦����ͼ����
    if (currentResult.dataType === 'pie') {
      xKey = 'name';
      yKey = 'value';
    }

    switch (effectiveChartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {Object.keys(data[0]).filter(k => k !== xKey && typeof data[0][k] === 'number').map((key, index) => (
                <Line 
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChartIcon data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {Object.keys(data[0]).filter(k => k !== xKey && typeof data[0][k] === 'number').map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChartIcon>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChartIcon>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yKey}
                nameKey={xKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChartIcon>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey={xKey} name={xKey} />
              <YAxis type="number" dataKey={yKey} name={yKey} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter
                name={`${xKey} vs ${yKey}`}
                data={data}
                fill="#8884d8"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'table':
        return (
          <div sx={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td key={cellIndex} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                        {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">��֧�ֵ�ͼ������</Typography>
          </div>
        );
    }
  };

  // ����Ⱦ
  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ����Ϳ��ư�ť */}
      <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {standalone ? 'ʵ�������ӻ�' : '������ӻ�'}
        </Typography>
        <div>
          {standalone && experimentId && (
            <IconButton onClick={() => refetchResults()} title="ˢ������">
              <RefreshIcon />
            </IconButton>
          )}
          <IconButton onClick={handleExportData} title="��������">
            <DownloadIcon />
          </IconButton>
          <IconButton title="ȫ���鿴">
            <FullscreenIcon />
          </IconButton>
        </div>
      </div>

      {/* ������ʾ */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ������ */}
      {loading ? (
        <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>����������...</Typography>
        </div>
      ) : results.length === 0 ? (
        <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography color="text.secondary">
            {standalone && experimentId ? '����ʵ��������' : '��ѡ��һ��ʵ��鿴���'}
          </Typography>
        </div>
      ) : (
        <>
          {/* ���ѡ� */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            {results.map((result, index) => (
              <Tab key={result.id} label={result.title} />
            ))}
          </Tabs>

          {/* ͼ������ѡ�� */}
          <div sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>ͼ������:</Typography>
            <div sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="����ͼ">
                <IconButton 
                  color={chartType === 'line' ? 'primary' : 'default'} 
                  onClick={() => handleChartTypeChange('line')}
                  size="small"
                >
                  <LineChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="��״ͼ">
                <IconButton 
                  color={chartType === 'bar' ? 'primary' : 'default'} 
                  onClick={() => handleChartTypeChange('bar')}
                  size="small"
                >
                  <BarChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="��ͼ">
                <IconButton 
                  color={chartType === 'pie' ? 'primary' : 'default'} 
                  onClick={() => handleChartTypeChange('pie')}
                  size="small"
                >
                  <PieChartIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="ɢ��ͼ">
                <IconButton 
                  color={chartType === 'scatter' ? 'primary' : 'default'} 
                  onClick={() => handleChartTypeChange('scatter')}
                  size="small"
                >
                  <ScatterPlotIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="������ͼ">
                <IconButton 
                  color={chartType === 'table' ? 'primary' : 'default'} 
                  onClick={() => handleChartTypeChange('table')}
                  size="small"
                >
                  <TableChartIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* ͼ������ */}
          {currentResult && currentResult.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentResult.description}
            </Typography>
          )}

          {/* ͼ����ʾ */}
          <div sx={{ flex: 1, minHeight: 300 }}>
            {renderChart()}
          </div>
        </>
      )}
    </Paper>
  );
};

export default ExperimentResultsNew;


