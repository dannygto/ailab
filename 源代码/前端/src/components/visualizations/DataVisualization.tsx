import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { DownloadIcon, RefreshIcon, ImageIcon } from '../../utils/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';

// ע��Chart.js���
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  title,
  Tooltip,
  Legend,
  Filler
);

// ���ݼ�����
interface DataSet {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

// ���ӻ���������
interface VisualizationData {
  labels: string[];
  datasets: DataSet[];
}

// ͼ������
type ChartType = 'line' | 'bar' | 'pie' | 'radar';

// ������������
interface TableData {
  headers: string[];
  rows: any[];
}

// ������ʽ
type ExportFormat = 'png' | 'csv' | 'excel' | 'pdf';

interface DataVisualizationProps {
  experimentId?: string;
  initialData?: VisualizationData | TableData;
  initialChartType?: ChartType;
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
  onRefreshIcon?: () => void;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  experimentId,
  initialData,
  initialChartType = 'line',
  title = 'ʵ�����ݿ��ӻ�',
  description,
  loading: externalLoading,
  error: externalError,
  onRefreshIcon
}) => {
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [data, setData] = useState<VisualizationData | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // ��ɫ����
  const chartColors = {
    line: {
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
    },
    bar: {
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ]
    },
    pie: {
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
      borderColor: 'white'
    },
    radar: {
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
    }
  };
  
  // ��ʼ������
  useEffect(() => {
    if (initialData) {
      if ('labels' in initialData) {
        setData(initialData as VisualizationData);
      } else if ('headers' in initialData) {
        setTableData(initialData as TableData);
      }
    } else if (experimentId) {
      fetchExperimentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId, initialData]);
  
  // ��ȡʵ������
  const fetchExperimentData = async () => {
    if (!experimentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // ����Ӧ�õ���ʵ�ʵ�api��ȡʵ������
      // ��ʱʹ��ģ������
      const mockData: VisualizationData = {
        labels: ['1��', '2��', '3��', '4��', '5��', '6��'],
        datasets: [
          {
            label: '�¶� (��C)',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: chartColors.line.backgroundColor,
            borderColor: chartColors.line.borderColor,
            borderWidth: 2,
            fill: false
          },
          {
            label: 'ʪ�� (%)',
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false
          }
        ]
      };
      
      const mockTableData: TableData = {
        headers: ['����', '�¶� (��C)', 'ʪ�� (%)', '��ѹ (hPa)'],
        rows: [
          { id: 1, date: '2025-01-01', temperature: 12, humidity: 65, pressure: 1012 },
          { id: 2, date: '2025-02-01', temperature: 19, humidity: 59, pressure: 1015 },
          { id: 3, date: '2025-03-01', temperature: 3, humidity: 80, pressure: 1010 },
          { id: 4, date: '2025-04-01', temperature: 5, humidity: 81, pressure: 1013 },
          { id: 5, date: '2025-05-01', temperature: 2, humidity: 56, pressure: 1017 },
          { id: 6, date: '2025-06-01', temperature: 3, humidity: 55, pressure: 1011 }
        ]
      };
      
      setData(mockData);
      setTableData(mockTableData);
      
    } catch (err) {
      console.error('��ȡʵ�����ݴ���:', err);
      setError('�޷�����ʵ������');
    } finally {
      setLoading(false);
    }
  };
  
  // ����ˢ��
  const handleRefreshIcon = () => {
    if (onRefreshIcon) {
      onRefreshIcon();
    } else {
      fetchExperimentData();
    }
  };
  
  // ����ͼ�����ͱ��
  const handleChartTypeChange = (Event: any) => {
    setChartType(Event.target.value);
  };
  
  // ������ǩҳ���
  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // ��������
  const handleExport = (format: ExportFormat) => {
    if (!data) return;
    
    if (format === 'png') {
      // ����ΪͼƬ
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `experiment-${experimentId || 'data'}-chart.png`;
        link.click();
      }
    } else if (format === 'csv') {
      // ����ΪCSV
      let csvContent = '';
      
      if (tableData) {
        // ���ӱ�ͷ
        csvContent += tableData.headers.join(',') + '\n';
        
        // ����������
        tableData.rows.forEach(row => {
          const values = tableData.headers.map(header => {
            const key = header.toLowerCase().replace(/\s/g, '');
            return row[key] !== undefined ? row[key] : '';
          });
          csvContent += values.join(',') + '\n';
        });
      } else if (data) {
        // ���ӱ�ͷ (��ǩ��Ϊ��һ��)
        csvContent += 'Labels,' + data.datasets.map(ds => ds.label).join(',') + '\n';
        
        // ����������
        data.labels.forEach((label, i) => {
          csvContent += label + ',';
          csvContent += data.datasets.map(ds => ds.data[i]).join(',') + '\n';
        });
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `experiment-${experimentId || 'data'}.csv`;
      link.click();
    }
  };
  
  // ͼ������
  const getChartOptions = (): ChartOptions<any> => {
    const baseOptions: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
    };
    
    // ��Բ�ͬͼ�����͵���������
    if (chartType === 'line' || chartType === 'bar') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      };
    } else if (chartType === 'pie') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'right' as const,
          },
        },
      };
    } else if (chartType === 'radar') {
      return {
        ...baseOptions,
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
          },
        },
      };
    }
    
    return baseOptions;
  };
  
  // ׼��ͼ������
  const prepareChartData = () => {
    if (!data) return null;
    
    if (chartType === 'pie') {
      // ��ͼֻ����ʾһ�����ݼ���ʹ�õ�һ�����ݼ�
      const dataset = data.datasets[0];
      return {
        labels: data.labels,
        datasets: [
          {
            label: dataset.label,
            data: dataset.data,
            backgroundColor: chartColors.pie.backgroundColor,
            borderColor: chartColors.pie.borderColor,
            borderWidth: 1,
          },
        ],
      };
    } else if (chartType === 'radar') {
      return {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: chartColors.radar.backgroundColor,
          borderColor: chartColors.radar.borderColor,
          borderWidth: 2,
          pointBackgroundColor: chartColors.radar.borderColor,
        })),
      };
    } else if (chartType === 'bar') {
      return {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: Array.isArray(chartColors.bar.backgroundColor) 
            ? chartColors.bar.backgroundColor[index % chartColors.bar.backgroundColor.length]
            : chartColors.bar.backgroundColor,
          borderColor: Array.isArray(chartColors.bar.borderColor)
            ? chartColors.bar.borderColor[index % chartColors.bar.borderColor.length]
            : chartColors.bar.borderColor,
          borderWidth: 1,
        })),
      };
    }
    
    // ��ͼʹ��ԭʼ����
    return data;
  };
  
  // ��Ⱦͼ��
  const renderChart = () => {
    const chartData = prepareChartData();
    if (!chartData) return null;
    
    const options = getChartOptions();
    
    switch (chartType) {
      case 'line':
        return (
          <Line data={chartData} options={options} />
        );
      case 'bar':
        return (
          <Bar data={chartData} options={options} />
        );
      case 'pie':
        return (
          <Pie data={chartData} options={options} />
        );
      case 'radar':
        return (
          <Radar data={chartData} options={options} />
        );
      default:
        return null;
    }
  };
  
  // ��Ⱦ����
  const renderTable = () => {
    if (!tableData) return null;
    
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          border: '1px solid #eee',
          fontSize: '0.875rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {tableData.headers.map((header, index) => (
                <th key={index} style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left',
                  borderBottom: '2px solid #ddd'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} style={{ 
                borderBottom: '1px solid #eee',
                backgroundColor: rowIndex % 2 === 0 ? 'white' : '#fafafa'
              }}>
                {tableData.headers.map((header, colIndex) => {
                  const key = header.toLowerCase().replace(/\s/g, '');
                  return (
                    <td key={colIndex} style={{ padding: '8px 16px' }}>
                      {row[key] !== undefined ? row[key] : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };
  
  // ��ʾ����״̬�����
  const isLoading = loading || externalLoading;
  const currentError = error || externalError;
  
  return (
    <Card sx={{ width: '100%' }}>
      <CardHeader
        title={title}
        subheader={description}
        action={
          <Stack direction="row" spacing={1}>
            <Button 
              startIcon={<RefreshIcon />}
              onClick={handleRefreshIcon}
              disabled={isLoading}
            >
              ˢ��
            </Button>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>ͼ������</InputLabel>
              <Select
                value={chartType}
                onChange={handleChartTypeChange}
                label="ͼ������"
                disabled={isLoading || activeTab !== 0}
              >
                <MenuItem value="line">����ͼ</MenuItem>
                <MenuItem value="bar">��״ͼ</MenuItem>
                <MenuItem value="pie">��ͼ</MenuItem>
                <MenuItem value="radar">�״�ͼ</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        }
      />
      <Divider />
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="ͼ��" />
        <Tab label="���ݱ�" />
      </Tabs>
      
      <CardContent>
        {currentError ? (
          <Alert severity="error">{currentError}</Alert>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ͼ����ͼ */}
            {activeTab === 0 && (
              <Box sx={{ position: 'relative', height: 400, mt: 1 }}>
                {renderChart()}
              </Box>
            )}
            
            {/* ������ͼ */}
            {activeTab === 1 && (
              <Box sx={{ mt: 1 }}>
                {renderTable()}
              </Box>
            )}
            
            {/* ����ѡ�� */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={<ImageIcon />}
                  variant="outlined"
                  size="small"
                  onClick={() => handleExport('png')}
                  disabled={!data || activeTab !== 0}
                >
                  ����ͼƬ
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  size="small"
                  onClick={() => handleExport('csv')}
                  disabled={!data && !tableData}
                >
                  ����CSV
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DataVisualization;


