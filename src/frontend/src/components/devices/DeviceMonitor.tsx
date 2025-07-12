import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  Badge
} from '@mui/material';
import { RefreshIcon, PlayArrowIcon, PauseIcon, MoreVertIcon, WarningIcon, InfoIcon, DownloadIcon, TuneIcon, CodeIcon, NotificationsActiveIcon, SettingsIcon, InsertChartIcon, ElectricBoltIcon } from '../../utils/icons';
import { Device, DeviceConnectionStatus, DeviceDataPoint } from '../../types/devices';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  Area, AreaChart, Line, LineChart
} from 'recharts';
import { useInterval } from '../../hooks/useInterval';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { zhCN } from 'date-fns/locale';
import AlertManagement from '../alerts/AlertManagement';

interface DeviceMonitorProps {
  devices: Device[];
  wsEndpoint?: string; // WebSocket����˵�
}

const DeviceMonitor: React.FC<DeviceMonitorProps> = ({ wsEndpoint = 'ws://localhost:3002/ws', ...props }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [isRealtime, setIsRealtime] = useState<boolean>(true);
  const [RefreshIconInterval, setRefreshIconInterval] = useState<number>(5000);
  const [monitoringData, setMonitoringData] = useState<DeviceDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  // ����״̬
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');
  const [timeRange, setTimeRange] = useState<'realtime' | '1h' | '6h' | '24h' | 'custom'>('realtime');
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [customTimeDialogOpen, setCustomTimeDialogOpen] = useState<boolean>(false);
  const [customStartTime, setCustomStartTime] = useState<Date>(new Date(Date.now() - 3600000)); // Ĭ��1Сʱǰ
  const [customEndTime, setCustomEndTime] = useState<Date>(new Date());  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['temperature']); // ��ָ��ѡ��
  const [metricDialogOpen, setMetricDialogOpen] = useState<boolean>(false); // ���ƶ�ָ��ѡ��Ի���
  const [showMultiMetrics, setShowMultiMetrics] = useState<boolean>(false); // �Ƿ���ʾ��ָ��
  
  // �����澯���״̬
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [alertCount, setAlertCount] = useState<number>(0);
  
  // WebSocket ����
  const wsRef = useRef<WebSocket | null>(null);
  
  // ģ������
  const [simulatedData, setSimulatedData] = useState<{
    cpuUsage: number;
    MemoryIconUsage: number;
    temperature: number;
    batteryLevel: number;
    dataPoints: DeviceDataPoint[];
    recentEventIcons: {
      id: string;
      type: string;
      timestamp: string;
      message: string;
      severity: 'info' | 'warning' | 'error';
    }[];
  }>({
    cpuUsage: 23,
    MemoryIconUsage: 45,
    temperature: 42.5,
    batteryLevel: 78,
    dataPoints: Array(20).fill(0).map((_, i) => ({
      id: `dp-${i}`,
      deviceId: selectedDeviceId || 'dev-001',
      timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
      sensorType: 'temperature',
      value: 40 + Math.sin(i / 3) * 5 + Math.random() * 2,
      unit: '��C',
      quality: 95
    })),
    recentEventIcons: [
      {
        id: 'evt-001',
        type: 'status_change',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        message: '�豸������',
        severity: 'info'
      },
      {
        id: 'evt-002',
        type: 'warning',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        message: '�¶Ƚӽ�����ֵ',
        severity: 'warning'
      },
      {
        id: 'evt-003',
        type: 'data_collection',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        message: '���ݲɼ���ʼ',
        severity: 'info'
      }
    ]
  });
  // �����豸����
  const updateDeviceData = useCallback((data: any) => {
    const { sensorData, systemMetrics } = data;
    
    // �����豸���ݵ�
    if (sensorData) {
      const newDataPoint: DeviceDataPoint = {
        id: `dp-${Date.now()}`,
        deviceId: selectedDeviceId,
        timestamp: new Date().toISOString(),
        sensorType: sensorData.type,
        value: sensorData.value,
        unit: sensorData.unit,
        quality: sensorData.quality || 100
      };
      
      setMonitoringData(prev => [...prev.slice(-99), newDataPoint]);
    }
    
    // ����ϵͳָ��
    if (systemMetrics) {
      setSimulatedData(prev => ({
        ...prev,
        cpuUsage: systemMetrics.cpuUsage || prev.cpuUsage,
        MemoryIconUsage: systemMetrics.MemoryIconUsage || prev.MemoryIconUsage,
        temperature: systemMetrics.temperature || prev.temperature,
        batteryLevel: systemMetrics.batteryLevel || prev.batteryLevel
      }));
    }
  }, [selectedDeviceId]);
  
  // �����豸�¼�
  const addDeviceEventIcon = useCallback((data: any) => {
    if (!data.EventIcon) return;
    
    const newEventIcon = {
      id: `evt-${Date.now()}`,
      type: data.EventIcon.type,
      timestamp: data.EventIcon.timestamp || new Date().toISOString(),
      message: data.EventIcon.message,
      severity: data.EventIcon.severity || 'info'
    };
    
    setSimulatedData(prev => ({
      ...prev,
      recentEventIcons: [newEventIcon, ...prev.recentEventIcons.slice(0, 9)]
    }));
  }, []);

  // ��ʼ��WebSocket����
  const initWebSocket = useCallback(() => {
    if (!selectedDeviceId || !isMonitoring || !isRealtime) return;
    
    try {
      setConnectionStatus('connecting');
      
      wsRef.current = new WebSocket(wsEndpoint);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket�����ѽ���');
        setConnectionStatus('connected');
        
        // �����豸������Ϣ
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'subscribe',
            deviceId: selectedDeviceId,
            timestamp: new Date().toISOString()
          }));
        }
      };
      
      wsRef.current.onmessage = (EventIcon) => {
        try {
          const data = JSON.parse(EventIcon.data);
          console.log('�յ�WebSocket��Ϣ:', data);
          
          if (data.type === 'device_data' && data.deviceId === selectedDeviceId) {
            // �����豸����
            updateDeviceData(data);
          } else if (data.type === 'device_EventIcon') {
            // �����豸�¼�
            addDeviceEventIcon(data);
          }
        } catch (err) {
          console.error('����WebSocket��Ϣ����:', err);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket����:', error);
        setError('WebSocket���Ӵ���');
        setConnectionStatus('disconnected');
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket�����ѹر�');
        setConnectionStatus('disconnected');
      };
    } catch (err) {
      console.error('��ʼ��WebSocket����ʧ��:', err);
      setError('��ʼ��WebSocket����ʧ��');
      setConnectionStatus('disconnected');
    }
  }, [selectedDeviceId, isMonitoring, isRealtime, wsEndpoint, updateDeviceData, addDeviceEventIcon]);

  // �ر�WebSocket����
  const closeWebSocket = useCallback(() => {
    if (wsRef.current) {
      // ����ȡ��������Ϣ
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'unsubscribe',
          deviceId: selectedDeviceId,
          timestamp: new Date().toISOString()
        }));
      }
      
      wsRef.current.close();
      wsRef.current = null;
      setConnectionStatus('disconnected');
    }
  }, [selectedDeviceId]);  // ѡ���豸ʱ�Ĵ���
  const handleDeviceChange = (EventIcon: SelectChangeEvent<string>) => {
    const newDeviceId = EventIcon.target.value;
    // ������ڼ�أ��ȹرյ�ǰ����
    if (isMonitoring && wsRef.current) {
      closeWebSocket();
    }
    
    setSelectedDeviceId(newDeviceId);
    setMonitoringData([]);
    
    // ���ü��״̬
    setIsMonitoring(false);
    
    // ��ʼ��ģ������
    generateSimulatedData();
  };
  
  // �رն�ָ��ѡ��Ի���
  const handleCloseMultiMetricsDialog = () => {
    setMetricDialogOpen(false);
  };
  
  // Ӧ�ö�ָ��ѡ��
  const handleApplyMultiMetrics = () => {
    if (selectedMetrics.length > 0) {
      // ���µ�һָ��Ϊ��һ��ѡ�е�ָ�꣨���¼��ݣ�
      setSelectedMetric(selectedMetrics[0]);
      // �����Ƿ���ʾ��ָ��
      setShowMultiMetrics(selectedMetrics.length > 1);
      // �رնԻ���
      setMetricDialogOpen(false);
      // �������ʵʱģʽ�����»�ȡ��ʷ����
      if (timeRange !== 'realtime' && customStartTime && customEndTime) {
        fetchHistoricalData(customStartTime, customEndTime);
      }
    }
  };

  // �л����״̬
  const toggleMonitoring = () => {
    const newState = !isMonitoring;
    setIsMonitoring(newState);
    
    if (newState) {
      if (isRealtime) {
        initWebSocket();
      } else {
        fetchDeviceData();
      }
    } else {
      closeWebSocket();
    }
  };
  
  // �л�ʵʱģʽ
  const toggleRealtime = (EventIcon: React.ChangeEvent<HTMLInputElement>) => {
    const newState = EventIcon.target.checked;
    setIsRealtime(newState);
    
    // ������ڼ�أ���������
    if (isMonitoring) {
      if (newState) {
        closeWebSocket();
        initWebSocket();
      } else {
        closeWebSocket();
        fetchDeviceData();
      }
    }
  };
  // ����ˢ�¼��
  const handleRefreshIconIntervalChange = (EventIcon: SelectChangeEvent<number>) => {
    setRefreshIconInterval(EventIcon.target.value as number);
  };

  // �ֶ�ˢ��
  const handleRefreshIcon = () => {
    if (isRealtime) {
      // ��ʵʱģʽ�£�����ping��Ϣ
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ping',
          deviceId: selectedDeviceId,
          timestamp: new Date().toISOString()
        }));
      }
    } else {
      // �ڷ�ʵʱģʽ�£���ȡ��������
      fetchDeviceData();
    }
  };
  
  // ��ȡ�豸����
  const fetchDeviceData = async () => {
    if (!selectedDeviceId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // ģ��api�����ӳ�
      await new Promise(resolve => setTimeout(resolve, 800));
      generateSimulatedData();
      setIsLoading(false);
    } catch (err) {
      console.error('��ȡ�豸����ʧ��:', err);
      setError('��ȡ�豸����ʧ�ܣ�������');
      setIsLoading(false);
    }
  };
  // ����ģ������
  const generateSimulatedData = () => {
    // ����CPUʹ����
    const newCpuUsage = Math.min(100, Math.max(10, simulatedData.cpuUsage + (Math.random() * 10 - 5)));
    
    // �����ڴ�ʹ����
    const newMemoryIconUsage = Math.min(100, Math.max(20, simulatedData.MemoryIconUsage + (Math.random() * 8 - 4)));
    
    // �����¶�
    const newTemperature = Math.min(60, Math.max(35, simulatedData.temperature + (Math.random() * 2 - 1)));
    
    // ���µ�ص���
    const newBatteryLevel = Math.max(0, simulatedData.batteryLevel - Math.random() * 0.5);
    
    // �ڶ�ָ��ģʽ�£�Ϊÿ��ѡ�е�ָ���������ݵ�
    if (showMultiMetrics && selectedMetrics.length > 1) {
      // ���ɶ�����ݵ㣬ÿ��ָ��һ��
      selectedMetrics.forEach((metric) => {
        const value = metric === 'temperature' ? newTemperature :
                     metric === 'cpuUsage' ? newCpuUsage :
                     metric === 'MemoryIconUsage' ? newMemoryIconUsage :
                     metric === 'batteryLevel' ? newBatteryLevel : 0;
        
        const newDataPoint = {
          id: `dp-${Date.now()}-${metric}`,
          deviceId: selectedDeviceId || 'dev-001',
          timestamp: new Date().toISOString(),
          sensorType: metric,
          value,
          unit: metric === 'temperature' ? '°C' : '%',
          quality: 95
        };
        
        setMonitoringData(prev => [...prev.slice(-99), newDataPoint]);
      });
    } else {
      // ��ָ��ģʽ������ѡ���ָ�괴�����ݵ�
      const newDataPoint = {
        id: `dp-${Date.now()}`,
        deviceId: selectedDeviceId || 'dev-001',
        timestamp: new Date().toISOString(),
        sensorType: selectedMetric,
        value: selectedMetric === 'temperature' ? newTemperature :
               selectedMetric === 'cpuUsage' ? newCpuUsage :
               selectedMetric === 'MemoryIconUsage' ? newMemoryIconUsage :
               selectedMetric === 'batteryLevel' ? newBatteryLevel : 0,
        unit: selectedMetric === 'temperature' ? '°C' : '%',
        quality: 95
      };
      
      setMonitoringData(prev => [...prev.slice(-99), newDataPoint]);
    }
    
    // ����ϵͳ״̬
    setSimulatedData(prev => ({
      ...prev,
      cpuUsage: newCpuUsage,
      MemoryIconUsage: newMemoryIconUsage,
      temperature: newTemperature,
      batteryLevel: newBatteryLevel,
      dataPoints: prev.dataPoints.slice(1).concat({
        id: `hist-${Date.now()}`,
        deviceId: selectedDeviceId || 'dev-001',
        timestamp: new Date().toISOString(),
        sensorType: selectedMetric,
        value: selectedMetric === 'temperature' ? newTemperature :
               selectedMetric === 'cpuUsage' ? newCpuUsage :
               selectedMetric === 'MemoryIconUsage' ? newMemoryIconUsage :
               selectedMetric === 'batteryLevel' ? newBatteryLevel : 0,
        unit: selectedMetric === 'temperature' ? '��C' : '%',
        quality: 95
      })
    }));
  };

  // ��ʵʱģʽ�¶�ʱˢ��
  useInterval(() => {
    if (isMonitoring && !isRealtime && selectedDeviceId) {
      fetchDeviceData();
    }
  }, isMonitoring && !isRealtime ? RefreshIconInterval : null);
  
  // �豸ѡ�����״̬�仯ʱ����WebSocket����
  useEffect(() => {
    if (isMonitoring && isRealtime) {
      initWebSocket();
    } else {
      closeWebSocket();
    }
    
    // ���ж��ʱ����
    return () => {
      closeWebSocket();
    };
  }, [isMonitoring, isRealtime, selectedDeviceId, initWebSocket, closeWebSocket]);

  // ģ��澯��������
  useEffect(() => {
    if (selectedDeviceId) {
      // ģ����澯����
      const mockAlertCount = Math.floor(Math.random() * 5); // 0-4���澯
      setAlertCount(mockAlertCount);
    }
  }, [selectedDeviceId]);

  // ѡ���豸�������˵�
  const renderdeviceselector = () => (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="device-select-LabelIcon">ѡ���豸</InputLabel>
      <Select
        labelId="device-select-LabelIcon"
        id="device-select"
        value={selectedDeviceId}
        onChange={handleDeviceChange}
        label="ѡ���豸"
      >
        <MenuItem value="">
          <em>��ѡ���豸</em>
        </MenuItem>
        {props.devices.map((device) => (
          <MenuItem key={device.id} value={device.id}>
            {device.name} ({device.model})
            <Chip 
              size="small" 
              label={device.connectionStatus} 
              color={device.connectionStatus === DeviceConnectionStatus.ONLINE ? 'success' : 'error'}
              sx={{ ml: 1 }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // �������
  const renderControlPanel = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {renderdeviceselector()}
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color={isMonitoring ? "error" : "primary"}
              startIcon={isMonitoring ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={toggleMonitoring}
              disabled={!selectedDeviceId}
            >
              {isMonitoring ? "ֹͣ���" : "��ʼ���"}
            </Button>
            
            <FormControlLabel
              control={
                <Switch
                  checked={isRealtime}
                  onChange={toggleRealtime}
                  disabled={!selectedDeviceId}
                />
              }
              label="ʵʱģʽ"
            />
            
            {!isRealtime && (
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="RefreshIcon-interval-LabelIcon">ˢ�¼��</InputLabel>
                <Select
                  labelId="RefreshIcon-interval-LabelIcon"
                  id="RefreshIcon-interval"
                  value={RefreshIconInterval}
                  onChange={handleRefreshIconIntervalChange}
                  label="ˢ�¼��"
                  disabled={!selectedDeviceId || isRealtime}
                >
                  <MenuItem value={2000}>2��</MenuItem>
                  <MenuItem value={5000}>5��</MenuItem>
                  <MenuItem value={10000}>10��</MenuItem>
                  <MenuItem value={30000}>30��</MenuItem>
                </Select>
              </FormControl>
            )}
            
            <IconButton
              onClick={handleRefreshIcon}
              disabled={!selectedDeviceId}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
            
            <IconButton
              onClick={() => setShowAlerts(!showAlerts)}
              disabled={!selectedDeviceId}
              color={alertCount > 0 ? "error" : "default"}
            >
              <Badge badgeContent={alertCount} color="error">
                <NotificationsActiveIcon />
              </Badge>
            </IconButton>
            
            <Chip 
              label={connectionStatus === 'connected' ? '������' : 
                    connectionStatus === 'connecting' ? '������...' : 'δ����'} 
              color={connectionStatus === 'connected' ? 'success' : 
                    connectionStatus === 'connecting' ? 'warning' : 'error'}
              size="small"
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  // �豸״̬���
  const renderdevicestatus = () => {
    if (!selectedDeviceId) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          ��ѡ��һ���豸��ʼ���
        </Alert>
      );
    }
    
    const selectedDevice = props.devices.find(d => d.id === selectedDeviceId);
    
    if (!selectedDevice) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ��ѡ�豸�����ڻ��ѱ��Ƴ�
        </Alert>
      );
    }
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardHeader 
          title={`�豸״̬: ${selectedDevice.name}`} 
          subheader={`�ͺ�: ${selectedDevice.model} | λ��: ${selectedDevice.location}`}
          action={
            <IconButton>
              <SettingsIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  CPUʹ����
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={simulatedData.cpuUsage} 
                  color={simulatedData.cpuUsage > 80 ? "error" : "primary"}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {simulatedData.cpuUsage.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  �ڴ�ʹ����
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={simulatedData.MemoryIconUsage} 
                  color={simulatedData.MemoryIconUsage > 80 ? "error" : "primary"}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {simulatedData.MemoryIconUsage.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  �¶�
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(simulatedData.temperature / 60) * 100} 
                  color={simulatedData.temperature > 50 ? "error" : "primary"}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {simulatedData.temperature.toFixed(1)}��C
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ��ص���
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={simulatedData.batteryLevel} 
                  color={simulatedData.batteryLevel < 20 ? "error" : "success"}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {simulatedData.batteryLevel.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  // ����ͼ��
  const renderDataCharts = () => {
    if (!selectedDeviceId || !isMonitoring) {
      return null;
    }
    // Ϊͼ��׼������
    const chartData = (() => {
      const dataSource = isRealtime ? monitoringData : simulatedData.dataPoints;
      
      if (showMultiMetrics && selectedMetrics.length > 1) {
        // ��ָ��ģʽ����ʱ�����������
        const groupedData: Record<string, any> = {};
        
        dataSource.forEach(dp => {
          const timeKey = new Date(dp.timestamp).toLocaleTimeString();
          if (!groupedData[timeKey]) {
            groupedData[timeKey] = { timestamp: timeKey };
          }
          if (dp.sensorType) {
            groupedData[timeKey][dp.sensorType] = typeof dp.value === 'number' ? dp.value : 0;
          }
        });
        
        // Ϊÿ��ʱ������ȱʧ��ָ��ֵ
        return Object.values(groupedData).map((item: any) => {
          selectedMetrics.forEach(metric => {
            if (!(metric in item)) {
              // ʹ�õ�ǰϵͳ״̬��ΪĬ��ֵ
              item[metric] = metric === 'temperature' ? simulatedData.temperature :
                           metric === 'cpuUsage' ? simulatedData.cpuUsage :
                           metric === 'MemoryIconUsage' ? simulatedData.MemoryIconUsage :
                           metric === 'batteryLevel' ? simulatedData.batteryLevel : 0;
            }
          });
          return item;
        });
      } else {
        // ��ָ��ģʽ
        return dataSource.map(dp => ({
          timestamp: new Date(dp.timestamp).toLocaleTimeString(),
          value: typeof dp.value === 'number' ? dp.value : 0,
          unit: dp.unit || ''
        }));
      }
    })();
    
    // ��ȡ��ָ��ģʽ�µ���ɫӳ��
    const metricColors: Record<string, string> = {
      temperature: '#8884d8',
      cpuUsage: '#82ca9d',
      MemoryIconUsage: '#ffc658',
      batteryLevel: '#ff8042'
    };
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardHeader              title={showMultiMetrics ? "��ָ����" : 
                     `${selectedMetric === 'temperature' ? '�¶�' : 
                      selectedMetric === 'cpuUsage' ? 'CPUʹ����' : 
                      selectedMetric === 'MemoryIconUsage' ? '�ڴ�ʹ����' : 
                      selectedMetric === 'batteryLevel' ? '��ص���' : ''}����`}
              subheader={`���${chartData.length}�����ݵ�`}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>                  {isLoading ? (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ) : null}
                  
                  {!showMultiMetrics && (
                    <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                      <InputLabel id="metric-select-LabelIcon">ָ��</InputLabel>
                      <Select
                        labelId="metric-select-LabelIcon"
                        id="metric-select"
                        value={selectedMetric}
                        label="ָ��"
                        onChange={handleMetricChange}
                      >
                        <MenuItem value="temperature">�¶�</MenuItem>
                        <MenuItem value="cpuUsage">CPUʹ����</MenuItem>
                        <MenuItem value="MemoryIconUsage">�ڴ�ʹ����</MenuItem>
                        <MenuItem value="batteryLevel">��ص���</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  <FormControl size="small" sx={{ minWidth: 100, mr: 1 }}>
                    <InputLabel id="chart-type-select-LabelIcon">ͼ������</InputLabel>
                    <Select
                      labelId="chart-type-select-LabelIcon"
                      id="chart-type-select"
                      value={chartType}
                      label="ͼ������"
                      onChange={handleChartTypeChange}
                    >
                      <MenuItem value="area">���ͼ</MenuItem>
                      <MenuItem value="line">����ͼ</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                    <InputLabel id="time-range-select-LabelIcon">ʱ�䷶Χ</InputLabel>
                    <Select
                      labelId="time-range-select-LabelIcon"
                      id="time-range-select"
                      value={timeRange}
                      label="ʱ�䷶Χ"
                      onChange={handleTimeRangeChange}
                    >
                      <MenuItem value="realtime">ʵʱ</MenuItem>
                      <MenuItem value="1h">1Сʱ</MenuItem>
                      <MenuItem value="6h">6Сʱ</MenuItem>
                      <MenuItem value="24h">24Сʱ</MenuItem>
                      <MenuItem value="custom">�Զ���</MenuItem>
                    </Select>                  </FormControl>
                  
                  <IconButton onClick={handleRefreshIcon}>
                    <RefreshIcon />
                  </IconButton>
                  
                  <IconButton onClick={handleExportMenuOpen}>
                    <DownloadIcon />
                  </IconButton>
                  
                  <IconButton onClick={() => setMetricDialogOpen(true)} color={showMultiMetrics ? "primary" : "default"}>
                    <TuneIcon />
                  </IconButton>
                  
                  <Menu
                    anchorEl={exportMenuAnchorEl}
                    open={Boolean(exportMenuAnchorEl)}
                    onClose={handleExportMenuClose}
                  >
                    <MenuItem onClick={exportAsCSV}>
                      <ListItemIcon>
                        <InsertChartIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>����ΪCSV</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={exportAsJSON}>
                      <ListItemIcon>
                        <CodeIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>����ΪJSON</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
              }
            />
            <Divider />            <CardContent>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {showMultiMetrics ? (
                    // ��ָ��ͼ��
                    chartType === 'area' ? (
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis 
                          label={{ 
                            value: '��ֵ',
                            angle: -90, 
                            position: 'insideLeft' 
                          }} 
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip 
                          formatter={(value: any, name: string) => [
                            `${value} ${name === 'temperature' ? '��C' : '%'}`, 
                            name === 'temperature' ? '�¶�' : 
                            name === 'cpuUsage' ? 'CPUʹ����' :
                            name === 'MemoryIconUsage' ? '�ڴ�ʹ����' :
                            name === 'batteryLevel' ? '��ص���' : name
                          ]}
                          labelFormatter={(label: string) => `ʱ��: \$\{label\}`}
                        />
                        <Legend />
                        {selectedMetrics.map((metric) => (
                          <Area 
                            key={metric}
                            type="monotone" 
                            dataKey={metric}
                            name={metric === 'temperature' ? '�¶�' : 
                                  metric === 'cpuUsage' ? 'CPUʹ����' :
                                  metric === 'MemoryIconUsage' ? '�ڴ�ʹ����' :
                                  metric === 'batteryLevel' ? '��ص���' : metric}
                            stroke={metricColors[metric]} 
                            fill={metricColors[metric]} 
                            fillOpacity={0.3}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </AreaChart>
                    ) : (
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis 
                          label={{ 
                            value: '��ֵ',
                            angle: -90, 
                            position: 'insideLeft' 
                          }} 
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip 
                          formatter={(value: any, name: string) => [
                            `${value} ${name === 'temperature' ? '��C' : '%'}`, 
                            name === 'temperature' ? '�¶�' : 
                            name === 'cpuUsage' ? 'CPUʹ����' :
                            name === 'MemoryIconUsage' ? '�ڴ�ʹ����' :
                            name === 'batteryLevel' ? '��ص���' : name
                          ]}
                          labelFormatter={(label: string) => `ʱ��: \$\{label\}`}
                        />
                        <Legend />
                        {selectedMetrics.map((metric) => (
                          <Line 
                            key={metric}
                            type="monotone" 
                            dataKey={metric}
                            name={metric === 'temperature' ? '�¶�' : 
                                  metric === 'cpuUsage' ? 'CPUʹ����' :
                                  metric === 'MemoryIconUsage' ? '�ڴ�ʹ����' :
                                  metric === 'batteryLevel' ? '��ص���' : metric}
                            stroke={metricColors[metric]}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    )
                  ) : (
                    // ��ָ��ͼ��
                    chartType === 'area' ? (
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis 
                          label={{ 
                            value: selectedMetric === 'temperature' ? `�¶� (��C)` : 
                                   selectedMetric === 'cpuUsage' ? 'CPUʹ���� (%)' :
                                   selectedMetric === 'MemoryIconUsage' ? '�ڴ�ʹ���� (%)' :
                                   selectedMetric === 'batteryLevel' ? '��ص��� (%)' : '',
                            angle: -90, 
                            position: 'insideLeft' 
                          }} 
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip 
                          formatter={(value: any) => [
                            `${value} ${selectedMetric === 'temperature' ? '��C' : '%'}`, 
                            selectedMetric === 'temperature' ? '�¶�' : 
                            selectedMetric === 'cpuUsage' ? 'CPUʹ����' :
                            selectedMetric === 'MemoryIconUsage' ? '�ڴ�ʹ����' :
                            selectedMetric === 'batteryLevel' ? '��ص���' : ''
                          ]}
                          labelFormatter={(label: string) => `ʱ��: \$\{label\}`}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          name={selectedMetric === 'temperature' ? '�¶�' : 
                                selectedMetric === 'cpuUsage' ? 'CPUʹ����' :
                                selectedMetric === 'MemoryIconUsage' ? '�ڴ�ʹ����' :
                                selectedMetric === 'batteryLevel' ? '��ص���' : ''}
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.3}
                          activeDot={{ r: 8 }}
                        />
                      </AreaChart>
                    ) : (
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis 
                          label={{ 
                            value: selectedMetric === 'temperature' ? `�¶� (��C)` : 
                                   selectedMetric === 'cpuUsage' ? 'CPUʹ���� (%)' :
                                   selectedMetric === 'MemoryIconUsage' ? '�ڴ�ʹ���� (%)' :
                                   selectedMetric === 'batteryLevel' ? '��ص��� (%)' : '',
                            angle: -90, 
                            position: 'insideLeft' 
                          }} 
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip 
                          formatter={(value: any) => [
                            `${value} ${selectedMetric === 'temperature' ? '��C' : '%'}`, 
                            selectedMetric === 'temperature' ? '�¶�' : 
                            selectedMetric === 'cpuUsage' ? 'CPUʹ����' :
                            selectedMetric === 'MemoryIconUsage' ? '�ڴ�ʹ����' :
                            selectedMetric === 'batteryLevel' ? '��ص���' : ''
                          ]}
                          labelFormatter={(label: string) => `ʱ��: \$\{label\}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name={selectedMetric === 'temperature' ? '�¶�' : 
                                selectedMetric === 'cpuUsage' ? 'CPUʹ����' :
                                selectedMetric === 'MemoryIconUsage' ? '�ڴ�ʹ����' :
                                selectedMetric === 'batteryLevel' ? '��ص���' : ''}
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    )
                  )}
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // �¼���־
  const renderEventIconLog = () => {
    if (!selectedDeviceId) {
      return null;
    }
    
    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader 
          title="�¼���־" 
          action={
            <IconButton onClick={() => console.log('������־')}>
              <MoreVertIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ʱ��</TableCell>
                  <TableCell>����</TableCell>
                  <TableCell>��Ϣ</TableCell>
                  <TableCell>���س̶�</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {simulatedData.recentEventIcons.map((EventIcon) => (
                  <TableRow key={EventIcon.id}>
                    <TableCell>{new Date(EventIcon.timestamp).toLocaleTimeString()}</TableCell>
                    <TableCell>{EventIcon.type}</TableCell>
                    <TableCell>{EventIcon.message}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        icon={
                          EventIcon.severity === 'error' ? <WarningIcon /> : 
                          EventIcon.severity === 'warning' ? <ElectricBoltIcon /> : 
                          <InfoIcon />
                        }
                        label={
                          EventIcon.severity === 'error' ? '����' : 
                          EventIcon.severity === 'warning' ? '����' : 
                          '��Ϣ'
                        }
                        color={
                          EventIcon.severity === 'error' ? 'error' : 
                          EventIcon.severity === 'warning' ? 'warning' : 
                          'info'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  // ���ݵ�������
  const handleExportMenuOpen = (EventIcon: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchorEl(EventIcon.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchorEl(null);
  };

  // ����ΪCSV
  const exportAsCSV = () => {
    if (!selectedDeviceId || !monitoringData.length) return;
    
    const selectedDevice = props.devices.find(d => d.id === selectedDeviceId);
    if (!selectedDevice) return;
    
    // ׼��CSV����
    const headers = ['ʱ���', 'ָ������', '��ֵ', '��λ', '����'];
    const dataRows = monitoringData.map(dp => [
      new Date(dp.timestamp).toLocaleString(),
      dp.sensorType,
      dp.value,
      dp.unit || '',
      dp.quality || ''
    ]);
    
    // ���CSV����
    const csvContent = [
      headers.join(','),
      ...dataRows.map(row => row.join(','))
    ].join('\n');
    
    // ����Blob������
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `�豸�������_${selectedDevice.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    handleExportMenuClose();
  };

  // ����ΪJSON
  const exportAsJSON = () => {
    if (!selectedDeviceId || !monitoringData.length) return;
    
    const selectedDevice = props.devices.find(d => d.id === selectedDeviceId);
    if (!selectedDevice) return;
    
    // ׼��JSON����
    const exportData = {
      device: {
        id: selectedDevice.id,
        name: selectedDevice.name,
        model: selectedDevice.model,
        location: selectedDevice.location
      },
      timestamp: new Date().toISOString(),
      dataPoints: monitoringData
    };
    
    // ����Blob������
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `�豸�������_${selectedDevice.name}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    handleExportMenuClose();
  };

  // �л�ָ������
  const handleMetricChange = (EventIcon: SelectChangeEvent<string>) => {
    setSelectedMetric(EventIcon.target.value);
  };

  // �л�ͼ������
  const handleChartTypeChange = (EventIcon: SelectChangeEvent<'area' | 'line'>) => {
    setChartType(EventIcon.target.value as 'area' | 'line');
  };
  // �л�ʱ�䷶Χ
  const handleTimeRangeChange = (EventIcon: SelectChangeEvent<string>) => {
    const newRange = EventIcon.target.value as 'realtime' | '1h' | '6h' | '24h' | 'custom';
    setTimeRange(newRange);
    
    if (newRange === 'custom') {
      setCustomTimeDialogOpen(true);
    } else if (newRange !== 'realtime') {
      // ���㿪ʼʱ��
      let startTime: Date;
      const endTime = new Date();
      
      switch (newRange) {
        case '1h':
          startTime = new Date(endTime.getTime() - 3600000); // 1Сʱǰ
          break;
        case '6h':
          startTime = new Date(endTime.getTime() - 6 * 3600000); // 6Сʱǰ
          break;
        case '24h':
          startTime = new Date(endTime.getTime() - 24 * 3600000); // 24Сʱǰ
          break;
        default:
          startTime = new Date(endTime.getTime() - 3600000); // Ĭ��1Сʱ
      }
      
      setCustomStartTime(startTime);
      setCustomEndTime(endTime);
      
      // ��ȡ��ʷ����
      fetchHistoricalData(startTime, endTime);
    }
  };
  
  // ��ȡ��ʷ����
  const fetchHistoricalData = (startTime: Date, endTime: Date) => {
    if (!selectedDeviceId) return;
    
    setIsLoading(true);
    setError(null);
    
    // ģ���ȡ��ʷ���ݵ�api����
    setTimeout(() => {
      // ����ģ����ʷ����
      const historyPoints: DeviceDataPoint[] = [];
      const timeRange = endTime.getTime() - startTime.getTime();
      const pointCount = Math.min(100, Math.floor(timeRange / 60000)); // ���100���㣬����ÿ����һ����
      
      if (showMultiMetrics && selectedMetrics.length > 1) {
        // ��ָ��ģʽ��Ϊÿ��ָ��������ʷ����
        for (let i = 0; i < pointCount; i++) {
          const timestamp = new Date(startTime.getTime() + (i * (timeRange / pointCount)));
          
          selectedMetrics.forEach(metric => {
            const value = metric === 'temperature' 
              ? 40 + Math.sin(i / (pointCount / 8)) * 5 + Math.random() * 2
              : metric === 'cpuUsage'
              ? 30 + Math.sin(i / (pointCount / 6)) * 30 + Math.random() * 10
              : metric === 'MemoryIconUsage'
              ? 40 + Math.sin(i / (pointCount / 4)) * 20 + Math.random() * 5
              : metric === 'batteryLevel'
              ? 95 - (i / pointCount) * 15 + Math.random() * 2
              : 0;
            
            historyPoints.push({
              id: `hist-${i}-${metric}`,
              deviceId: selectedDeviceId,
              timestamp: timestamp.toISOString(),
              sensorType: metric,
              value,
              unit: metric === 'temperature' ? '°C' : '%',
              quality: 95
            });
          });
        }
      } else {
        // ��ָ��ģʽ
        for (let i = 0; i < pointCount; i++) {
          const timestamp = new Date(startTime.getTime() + (i * (timeRange / pointCount)));
          const value = selectedMetric === 'temperature' 
            ? 40 + Math.sin(i / (pointCount / 8)) * 5 + Math.random() * 2
            : selectedMetric === 'cpuUsage'
            ? 30 + Math.sin(i / (pointCount / 6)) * 30 + Math.random() * 10
            : selectedMetric === 'MemoryIconUsage'
            ? 40 + Math.sin(i / (pointCount / 4)) * 20 + Math.random() * 5
            : selectedMetric === 'batteryLevel'
            ? 95 - (i / pointCount) * 15 + Math.random() * 2
            : 0;
          
          historyPoints.push({
            id: `hist-${i}`,
            deviceId: selectedDeviceId,
            timestamp: timestamp.toISOString(),
            sensorType: selectedMetric,
            value,
            unit: selectedMetric === 'temperature' ? '°C' : '%',
            quality: 95
          });
        }
      }
      
      setMonitoringData(historyPoints);
      setIsLoading(false);
    }, 1000);
  };
  
  // �����Զ���ʱ��Ի���Ĺر�
  const handleCustomTimeDialogClose = () => {
    setCustomTimeDialogOpen(false);
    
    // �����ʼ�ͽ���ʱ�䶼��Ч����ȡ��ʷ����
    if (customStartTime && customEndTime) {
      fetchHistoricalData(customStartTime, customEndTime);
    }
  };
  
  // ������ָ��ѡ��
  const handleMetricsChange = (EventIcon: React.ChangeEvent<HTMLInputElement>) => {
    const metric = EventIcon.target.name;
    const checked = EventIcon.target.checked;
    
    if (checked) {
      setSelectedMetrics(prev => [...prev, metric]);
    } else {
      setSelectedMetrics(prev => prev.filter(m => m !== metric));
    }
  };
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {renderControlPanel()}
      {renderdevicestatus()}
      
      {/* �澯������� */}
      {showAlerts && selectedDeviceId && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            �豸�澯����
          </Typography>
          <AlertManagement deviceId={selectedDeviceId} />
        </Box>
      )}
      
      {renderDataCharts()}
      {renderEventIconLog()}
      
      {/* �Զ���ʱ�䷶Χ�Ի��� */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
        <Dialog open={customTimeDialogOpen} onClose={handleCustomTimeDialogClose}>
          <DialogTitle>ѡ���Զ���ʱ�䷶Χ</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <DateTimePicker
                label="��ʼʱ��"
                value={customStartTime}
                onChange={(newValue) => newValue && setCustomStartTime(newValue)}
              />
              <DateTimePicker
                label="����ʱ��"
                value={customEndTime}
                onChange={(newValue) => newValue && setCustomEndTime(newValue)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomTimeDialogOpen(false)}>ȡ��</Button>
            <Button onClick={handleCustomTimeDialogClose} variant="contained">ȷ��</Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
        {/* ��ָ��ѡ��Ի��� */}
      <Dialog open={metricDialogOpen} onClose={() => setMetricDialogOpen(false)}>
        <DialogTitle>ѡ����ʾָ��</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedMetrics.includes('temperature')}
                  onChange={handleMetricsChange}
                  name="temperature"
                />
              }
              label="�¶�"
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedMetrics.includes('cpuUsage')}
                  onChange={handleMetricsChange}
                  name="cpuUsage"
                />
              }
              label="CPUʹ����"
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedMetrics.includes('MemoryIconUsage')}
                  onChange={handleMetricsChange}
                  name="MemoryIconUsage"
                />
              }
              label="�ڴ�ʹ����"
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedMetrics.includes('batteryLevel')}
                  onChange={handleMetricsChange}
                  name="batteryLevel"
                />
              }
              label="��ص���"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMultiMetricsDialog}>ȡ��</Button>
          <Button 
            onClick={handleApplyMultiMetrics} 
            variant="contained"
          >
            ȷ��
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeviceMonitor;


