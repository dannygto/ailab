import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  CircularProgress,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { RefreshIcon, DownloadIcon, ZoomInIcon, ZoomOutIcon, SettingsIcon } from '../../../utils/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';

// ��������
import { DeviceDataPoint, Device } from '../../../types/devices';

/**
 * ͼ������
 */
export enum ChartType {
  LINE = 'line',
  AREA = 'area',
  BAR = 'bar',
  COMPOSED = 'composed'
}

/**
 * ʱ�䷶Χ
 */
export enum TimeRange {
  LAST_HOUR = 'lastHour',
  LAST_DAY = 'lastDay',
  LAST_WEEK = 'lastWeek',
  CUSTOM = 'custom'
}

/**
 * ָ������
 */
export enum MetricType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  BATTERY_LEVEL = 'batteryLevel',
  SIGNAL_STRENGTH = 'signalStrength'
}

/**
 * ָ������
 */
export interface MetricConfig {
  key: string;
  label: string;
  unit: string;
  color: string;
  visible: boolean;
  threshold?: {
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
  };
}

/**
 * �豸ָ��ͼ������
 */
export interface DeviceMetricsChartProps {
  /** �豸���� */
  device: Device;
  
  /** �豸���ݵ����� */
  dataPoints: DeviceDataPoint[];
  
  /** �Ƿ������ */
  loading?: boolean;
  
  /** ������Ϣ */
  error?: string;
  
  /** ˢ�����ݺ��� */
  onRefreshIcon?: () => void;
  
  /** ͼ���߶� */
  height?: number | string;
  
  /** Ĭ��ͼ������ */
  defaultChartType?: ChartType;
  
  /** Ĭ��ʱ�䷶Χ */
  defaultTimeRange?: TimeRange;
  
  /** �Ƿ���ʾ���ð�ť */
  showsettings?: boolean;
  
  /** �Ƿ���ʾ���ذ�ť */
  showDownload?: boolean;
  
  /** �Զ���ָ������ */
  metricConfigs?: Record<string, MetricConfig>;
  
  /** �Զ�����ʽ */
  className?: string;
  
  /** �Զ�����ʽ */
  style?: React.CSSProperties;
}

/**
 * �豸ָ��ͼ�����
 * 
 * ����չʾ�豸����ָ���ʵʱ����ʷ����ͼ��
 */
const DeviceMetricsChart: React.FC<DeviceMetricsChartProps> = ({
  device,
  dataPoints,
  loading = false,
  error,
  onRefreshIcon,
  height = 400,
  defaultChartType = ChartType.LINE,
  defaultTimeRange = TimeRange.LAST_HOUR,
  showsettings = true,
  showDownload = true,
  metricConfigs,
  className,
  style
}) => {
  const theme = useTheme();
  
  // ͼ��״̬
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
  const [selectedTab, setSelectedTab] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // �ϲ��û��Զ�������
  const configs = useMemo(() => {
    // Ĭ��ָ������
    const defaultMetricConfigs: Record<string, MetricConfig> = {
      temperature: {
        key: 'temperature',
        label: '�¶�',
        unit: '��C',
        color: theme.palette.error.main,
        visible: true,
        threshold: {
          min: 0,
          max: 50,
          warning: 30,
          critical: 40
        }
      },
      humidity: {
        key: 'humidity',
        label: 'ʪ��',
        unit: '%',
        color: theme.palette.info.main,
        visible: true,
        threshold: {
          min: 0,
          max: 100,
          warning: 80,
          critical: 90
        }
      },
      pressure: {
        key: 'pressure',
        label: '��ѹ',
        unit: 'hPa',
        color: theme.palette.success.main,
        visible: true,
        threshold: {
          min: 900,
          max: 1100
        }
      },
      batteryLevel: {
        key: 'batteryLevel',
        label: '����',
        unit: '%',
        color: theme.palette.warning.main,
        visible: true,
        threshold: {
          min: 0,
          max: 100,
          warning: 20,
          critical: 10
        }
      },
      signalStrength: {
        key: 'signalStrength',
        label: '�ź�ǿ��',
        unit: '%',
        color: theme.palette.primary.main,
        visible: true,
        threshold: {
          min: 0,
          max: 100,
          warning: 30,
          critical: 20
        }
      }
    };
    
    if (!metricConfigs) return defaultMetricConfigs;
    
    return Object.keys(defaultMetricConfigs).reduce((acc, key) => {
      acc[key] = {
        ...defaultMetricConfigs[key],
        ...(metricConfigs[key] || {})
      };
      return acc;
    }, {} as Record<string, MetricConfig>);
  }, [metricConfigs, theme.palette]);
  
  // ����ʱ�䷶Χ�仯
  const handleTimeRangeChange = (Event: SelectChangeEvent) => {
    setTimeRange(Event.target.value as TimeRange);
  };
  
  // ����ͼ�����ͱ仯
  const handleChartTypeChange = (Event: SelectChangeEvent) => {
    setChartType(Event.target.value as ChartType);
  };
  
  // ����ѡ��仯
  const handleTabChange = (_Event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  // ����ˢ��
  const handleRefreshIcon = () => {
    if (onRefreshIcon) {
      onRefreshIcon();
    }
  };
  
  // ������������
  const handleDownload = () => {
    // �����ݵ�ת��ΪCSV��ʽ
    const headers = ['timestamp', ...Object.keys(configs)];
    const csvContent = [
      // ��ͷ
      headers.join(','),
      // ������
      ...dataPoints.map(point => {
        const timestamp = typeof point.timestamp === 'string' 
          ? new Date(point.timestamp).toISOString()
          : (point.timestamp as Date).toISOString();
          
        const values = headers.map(header => {
          if (header === 'timestamp') return timestamp;
          return point[header as keyof DeviceDataPoint] !== undefined
            ? point[header as keyof DeviceDataPoint]
            : '';
        });
        
        return values.join(',');
      })
    ].join('\n');
    
    // �����������ļ�
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `device_${device.id}_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // ��������
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // ��ʽ������
  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString();
  };
  
  // ����ʱ�䷶Χ��������
  const filteredData = useMemo(() => {
    if (!dataPoints.length) return [];
    
    const now = new Date();
    let cutoffTime: Date;
    
    switch (timeRange) {
      case TimeRange.LAST_HOUR:
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case TimeRange.LAST_DAY:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case TimeRange.LAST_WEEK:
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        return dataPoints;
    }
    
    return dataPoints.filter(point => {
      const pointTime = typeof point.timestamp === 'string' 
        ? new Date(point.timestamp) 
        : point.timestamp;
      return pointTime >= cutoffTime;
    });
  }, [dataPoints, timeRange]);
  
  // �Զ��幤����ʾ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ 
          p: 1, 
          boxShadow: theme.shadows[3],
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {formatDate(label )}
          </Typography>
          
          {payload.map((entry: any) => (
            <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                mr: 1, 
                borderRadius: '50%',
                bgcolor: entry.color 
              }} />
              <Typography variant="body2" color="text.primary">
                {configs[entry.name]?.label || entry.name}: {' '}
                <Typography component="span" fontWeight="bold">
                  {entry.value.toFixed(2)} {configs[entry.name]?.unit || ''}
                </Typography>
              </Typography>
            </Box>
          ))}
        </Card>
      );
    }
    
    return null;
  };
  
  // ��Ⱦͼ������
  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%'
        }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column'
        }}>
          <Typography color="error" gutterBottom>
            ��������ʱ����
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Box>
      );
    }
    
    if (!dataPoints.length) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%'
        }}>
          <Typography color="text.secondary">
            û�п��õ����ݵ�
          </Typography>
        </Box>
      );
    }
    
    // ����ѡ�ѡ��Ҫ��ʾ��ָ��
    const metricsForTab = selectedTab === 0 
      ? ['temperature', 'humidity'] 
      : selectedTab === 1 
        ? ['batteryLevel', 'signalStrength'] 
        : ['pressure'];
    
    // ��ʾ��ָ�꼯��
    const visibleMetrics = metricsForTab.filter(key => configs[key]?.visible);
    
    // ���û�пɼ�ָ�꣬��ʾ��ʾ
    if (!visibleMetrics.length) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%'
        }}>
          <Typography color="text.secondary">
            û��ѡ��Ҫ��ʾ��ָ��
          </Typography>
        </Box>
      );
    }
    
    // ����ͼ��������Ⱦ��ͬ��ͼ��
    switch (chartType) {
      case ChartType.LINE:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return timeRange === TimeRange.LAST_HOUR 
                    ? date.toLocaleTimeString() 
                    : date.toLocaleDateString();
                }}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              
              {visibleMetrics.map(key => (
                <YAxis 
                  key={`yAxis-${key}`}
                  yAxisId={key}
                  orientation={key === visibleMetrics[0] ? 'left' : 'right'}
                  domain={[configs[key]?.threshold?.min || 'auto', configs[key]?.threshold?.max || 'auto']}
                  label={{ 
                    value: `${configs[key]?.label || key} (${configs[key]?.unit || ''})`,
                    angle: key === visibleMetrics[0] ? -90 : 90,
                    position: 'insideLeft'
                  }}
                  hide={visibleMetrics.length > 1 && key !== visibleMetrics[0] && key !== visibleMetrics[visibleMetrics.length - 1]}
                />
              ))}
              
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              
              <Brush dataKey="timestamp" height={30} stroke={theme.palette.primary.main} />
              
              {visibleMetrics.map(key => (
                <React.Fragment key={key}>
                  <Line
                    type="monotone"
                    dataKey={key}
                    name={configs[key].label}
                    stroke={configs[key].color}
                    yAxisId={key}
                    dot={{ r: 3 }}
                    activeDot={{ r: 8 }}
                  />
                  
                  {configs[key].threshold?.warning !== undefined && (
                    <ReferenceLine 
                      y={configs[key].threshold?.warning} 
                      yAxisId={key}
                      stroke={theme.palette.warning.main} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: "������ֵ", 
                        position: 'insideBottomRight',
                        fill: theme.palette.warning.main
                      }} 
                    />
                  )}
                  
                  {configs[key].threshold?.critical !== undefined && (
                    <ReferenceLine 
                      y={configs[key].threshold?.critical} 
                      yAxisId={key}
                      stroke={theme.palette.error.main} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: "�ٽ���ֵ", 
                        position: 'insideBottomRight',
                        fill: theme.palette.error.main
                      }} 
                    />
                  )}
                </React.Fragment>
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case ChartType.AREA:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return timeRange === TimeRange.LAST_HOUR 
                    ? date.toLocaleTimeString() 
                    : date.toLocaleDateString();
                }}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              
              {visibleMetrics.map(key => (
                <YAxis 
                  key={`yAxis-${key}`}
                  yAxisId={key}
                  orientation={key === visibleMetrics[0] ? 'left' : 'right'}
                  domain={[configs[key]?.threshold?.min || 'auto', configs[key]?.threshold?.max || 'auto']}
                  label={{ 
                    value: `${configs[key]?.label || key} (${configs[key]?.unit || ''})`,
                    angle: key === visibleMetrics[0] ? -90 : 90,
                    position: 'insideLeft'
                  }}
                  hide={visibleMetrics.length > 1 && key !== visibleMetrics[0] && key !== visibleMetrics[visibleMetrics.length - 1]}
                />
              ))}
              
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              
              <Brush dataKey="timestamp" height={30} stroke={theme.palette.primary.main} />
              
              {visibleMetrics.map(key => (
                <React.Fragment key={key}>
                  <Area
                    type="monotone"
                    dataKey={key}
                    name={configs[key].label}
                    stroke={configs[key].color}
                    fill={configs[key].color}
                    fillOpacity={0.3}
                    yAxisId={key}
                  />
                  
                  {configs[key].threshold?.warning !== undefined && (
                    <ReferenceLine 
                      y={configs[key].threshold?.warning} 
                      yAxisId={key}
                      stroke={theme.palette.warning.main} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: "������ֵ", 
                        position: 'insideBottomRight',
                        fill: theme.palette.warning.main
                      }} 
                    />
                  )}
                  
                  {configs[key].threshold?.critical !== undefined && (
                    <ReferenceLine 
                      y={configs[key].threshold?.critical} 
                      yAxisId={key}
                      stroke={theme.palette.error.main} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: "�ٽ���ֵ", 
                        position: 'insideBottomRight',
                        fill: theme.palette.error.main
                      }} 
                    />
                  )}
                </React.Fragment>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case ChartType.BAR:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return timeRange === TimeRange.LAST_HOUR 
                    ? date.toLocaleTimeString() 
                    : date.toLocaleDateString();
                }}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              
              {visibleMetrics.map(key => (
                <YAxis 
                  key={`yAxis-${key}`}
                  yAxisId={key}
                  orientation={key === visibleMetrics[0] ? 'left' : 'right'}
                  domain={[configs[key]?.threshold?.min || 'auto', configs[key]?.threshold?.max || 'auto']}
                  label={{ 
                    value: `${configs[key]?.label || key} (${configs[key]?.unit || ''})`,
                    angle: key === visibleMetrics[0] ? -90 : 90,
                    position: 'insideLeft'
                  }}
                  hide={visibleMetrics.length > 1 && key !== visibleMetrics[0] && key !== visibleMetrics[visibleMetrics.length - 1]}
                />
              ))}
              
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              
              <Brush dataKey="timestamp" height={30} stroke={theme.palette.primary.main} />
              
              {visibleMetrics.map((key, index) => (
                <React.Fragment key={key}>
                  <Bar
                    dataKey={key}
                    name={configs[key].label}
                    fill={configs[key].color}
                    yAxisId={key}
                    barSize={20}
                    opacity={0.8}
                  />
                  
                  {configs[key].threshold?.warning !== undefined && (
                    <ReferenceLine 
                      y={configs[key].threshold?.warning} 
                      yAxisId={key}
                      stroke={theme.palette.warning.main} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: "������ֵ", 
                        position: 'insideBottomRight',
                        fill: theme.palette.warning.main
                      }} 
                    />
                  )}
                  
                  {configs[key].threshold?.critical !== undefined && (
                    <ReferenceLine 
                      y={configs[key].threshold?.critical} 
                      yAxisId={key}
                      stroke={theme.palette.error.main} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: "�ٽ���ֵ", 
                        position: 'insideBottomRight',
                        fill: theme.palette.error.main
                      }} 
                    />
                  )}
                </React.Fragment>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      case ChartType.COMPOSED:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return timeRange === TimeRange.LAST_HOUR 
                    ? date.toLocaleTimeString() 
                    : date.toLocaleDateString();
                }}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              
              {visibleMetrics.map(key => (
                <YAxis 
                  key={`yAxis-${key}`}
                  yAxisId={key}
                  orientation={key === visibleMetrics[0] ? 'left' : 'right'}
                  domain={[configs[key]?.threshold?.min || 'auto', configs[key]?.threshold?.max || 'auto']}
                  label={{ 
                    value: `${configs[key]?.label || key} (${configs[key]?.unit || ''})`,
                    angle: key === visibleMetrics[0] ? -90 : 90,
                    position: 'insideLeft'
                  }}
                  hide={visibleMetrics.length > 1 && key !== visibleMetrics[0] && key !== visibleMetrics[visibleMetrics.length - 1]}
                />
              ))}
              
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              
              <Brush dataKey="timestamp" height={30} stroke={theme.palette.primary.main} />
              
              {visibleMetrics.map((key, index) => {
                // ÿ��ָ��ʹ�ò�ͬ�Ŀ��ӻ�����
                if (index % 3 === 0) {
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={configs[key].label}
                      stroke={configs[key].color}
                      yAxisId={key}
                      dot={{ r: 3 }}
                      activeDot={{ r: 8 }}
                    />
                  );
                } else if (index % 3 === 1) {
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      name={configs[key].label}
                      fill={configs[key].color}
                      yAxisId={key}
                      barSize={20}
                      opacity={0.8}
                    />
                  );
                } else {
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={configs[key].label}
                      stroke={configs[key].color}
                      fill={configs[key].color}
                      fillOpacity={0.3}
                      yAxisId={key}
                    />
                  );
                }
              })}
              
              {visibleMetrics.map(key => (
                <React.Fragment key={`ref-${key}`}>
                  {configs[key].threshold?.warning !== undefined && (
                    <ReferenceLine 
                      y={configs[key].threshold?.warning} 
                      yAxisId={key}
                      stroke={theme.palette.warning.main} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: "������ֵ", 
                        position: 'insideBottomRight',
                        fill: theme.palette.warning.main
                      }} 
                    />
                  )}
                  
                  {configs[key].threshold?.critical !== undefined && (
                    <ReferenceLine 
                      y={configs[key].threshold?.critical} 
                      yAxisId={key}
                      stroke={theme.palette.error.main} 
                      strokeDasharray="3 3"
                      label={{ 
                        value: "�ٽ���ֵ", 
                        position: 'insideBottomRight',
                        fill: theme.palette.error.main
                      }} 
                    />
                  )}
                </React.Fragment>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  // ��ȡ������ʱ��
  const getLastUpdatedTime = () => {
    if (!dataPoints.length) return null;
    
    // �ҳ����µ����ݵ�
    const timestamps = dataPoints.map(point => 
      typeof point.timestamp === 'string' 
        ? new Date(point.timestamp).getTime() 
        : (point.timestamp as Date).getTime()
    );
    
    const maxTimestamp = Math.max(...timestamps);
    return new Date(maxTimestamp);
  };
  
  const lastUpdated = getLastUpdatedTime();
  
  return (
    <Card className={className} style={style}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {device.name} - ָ����
            </Typography>
            {loading && (
              <CircularProgress 
                size={20} 
                sx={{ ml: 1 }} 
                color="primary" 
              />
            )}
          </Box>
        }
        subheader={
          lastUpdated 
            ? `������: ${lastUpdated.toLocaleString()}`
            : '������'
        }
        action={
          <Box>
            {onRefreshIcon && (
              <Tooltip title="ˢ������">
                <IconButton onClick={handleRefreshIcon} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {showDownload && (
              <Tooltip title="��������">
                <IconButton 
                  onClick={handleDownload}
                  disabled={loading || !dataPoints.length}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="�Ŵ�">
              <IconButton 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="��С">
              <IconButton 
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            
            {showsettings && (
              <Tooltip title="ͼ������">
                <IconButton>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="��ʪ��" />
        <Tab label="�豸״̬" />
        <Tab label="����ָ��" />
      </Tabs>
      
      <Box sx={{ py: 1, px: 2, display: 'flex', justifyContent: 'space-between' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            displayEmpty
            variant="outlined"
            size="small"
          >
            <MenuItem value={TimeRange.LAST_HOUR}>���1Сʱ</MenuItem>
            <MenuItem value={TimeRange.LAST_DAY}>���24Сʱ</MenuItem>
            <MenuItem value={TimeRange.LAST_WEEK}>���7��</MenuItem>
            <MenuItem value={TimeRange.CUSTOM}>�Զ���ʱ���</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={chartType}
            onChange={handleChartTypeChange}
            displayEmpty
            variant="outlined"
            size="small"
          >
            <MenuItem value={ChartType.LINE}>����ͼ</MenuItem>
            <MenuItem value={ChartType.AREA}>���ͼ</MenuItem>
            <MenuItem value={ChartType.BAR}>��״ͼ</MenuItem>
            <MenuItem value={ChartType.COMPOSED}>���ͼ</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <CardContent sx={{ height: height, pt: 0 }}>
        <Box sx={{ 
            height: '100%',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}
        >
          {renderChart()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeviceMetricsChart;


