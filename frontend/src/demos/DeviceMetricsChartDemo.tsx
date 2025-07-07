import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  FormControlLabel, 
  Switch, 
  Button, 
  Card, 
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Divider
} from '@mui/material';
import DeviceMetricsChart, { ChartType, TimeRange } from '../components/domain/devices/DeviceMetricsChart';
import { Device, DeviceConnectionStatus, DeviceType, DeviceDataPoint } from '../types/devices';

/**
 * DeviceMetricsChartDemo���
 * 
 * ����չʾDeviceMetricsChart����Ĳ�ͬ״̬������
 */
const DeviceMetricsChartDemo: React.FC = () => {
  // ����״̬
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [dataPoints, setDataPoints] = useState<DeviceDataPoint[]>([]);
  const [dataPointCount, setDataPointCount] = useState<number>(100);
  const [selectedDevice, setSelectedDevice] = useState<string>('1');
  const [chartType, setChartType] = useState<ChartType>(ChartType.LINE);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.LAST_HOUR);

  // ʾ���豸����
  const devices: Device[] = [
    {
      id: '1',
      name: '�¶ȴ����� A1',
      type: DeviceType.SENSOR,
      model: 'TS-1000',
      manufacturer: 'Sensortech',
      description: '����ʵ�����¶ȼ��ĸ߾��ȴ�����',
      connectionStatus: DeviceConnectionStatus.ONLINE,
      location: 'ʵ���� A',
      ipAddress: '192.168.1.101',
      macAddress: '00:1B:44:11:3A:B7',
      firmware: 'v2.3.4',
      lastMaintenance: '2025-05-15',
      nextMaintenance: '2025-11-15',
      capabilities: ['�¶Ȳ���', 'Զ������', '���ݼ�¼'],
      supportedProtocols: ['HTTP', 'MQTT', 'Modbus'],
      dataFormats: ['JSON', 'CSV'],
      configuration: {
        samplingRate: '60s',
        alarmThreshold: '35��C',
        calibration: '��0.1��C'
      },
      metadata: {
        installationDate: '2024-01-10',
        warrantyEnd: '2027-01-10'
      },
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2025-06-01T10:15:30Z'
    },
    {
      id: '2',
      name: '��ѧ��΢�� M1',
      type: DeviceType.MICROSCOPE,
      model: 'OptiView 5000',
      manufacturer: 'OpticsLab',
      description: '���ֻ���ѧ��΢����֧��Զ�̲���',
      connectionStatus: DeviceConnectionStatus.OFFLINE,
      location: 'ʵ���� B',
      ipAddress: '192.168.1.102',
      macAddress: '00:1B:44:11:3A:C8',
      firmware: 'v3.1.2',
      lastMaintenance: '2025-04-20',
      nextMaintenance: '2025-10-20',
      capabilities: ['Զ�̹۲�', 'ͼ�񲶻�', '��Ƶ¼��', '����'],
      supportedProtocols: ['RTSP', 'HTTP', 'WebRTC'],
      dataFormats: ['JPEG', 'PNG', 'MP4'],
      configuration: { 
        defaultZoom: '40x',
        imageQuality: 'high',
        autoFocus: true
      },
      metadata: { 
        installDate: '2024-02-10',
        warrantyEnd: '2027-02-10'
      },
      createdAt: '2024-02-10T10:15:00Z',
      updatedAt: '2025-06-10T09:30:15Z'
    },
    {
      id: '3',
      name: '���ݼ�¼�� D1',
      type: DeviceType.DATALOGGER,
      model: 'DataTrack Pro',
      manufacturer: 'LoggerTech',
      description: '��ͨ�����ݼ�¼�������ڳ������ݲɼ�',
      connectionStatus: DeviceConnectionStatus.ERROR,
      location: 'ʵ���� C',
      ipAddress: '192.168.1.103',
      macAddress: '00:1B:44:11:3B:D9',
      firmware: 'v1.8.5',
      lastMaintenance: '2025-03-05',
      nextMaintenance: '2025-09-05',
      capabilities: ['��ͨ����¼', '���ڴ洢', '�Զ�����'],
      supportedProtocols: ['FTP', 'SFTP', 'HTTP'],
      dataFormats: ['CSV', 'Excel', 'SQLite'],
      configuration: { 
        channels: 16,
        sampleRate: '1s',
        StorageIconMode: 'circular'
      },
      metadata: { 
        installDate: '2024-03-01',
        warrantyEnd: '2027-03-01'
      },
      createdAt: '2024-03-01T14:20:00Z',
      updatedAt: '2025-06-15T11:40:30Z'
    }
  ];

  // ��ȡѡ�е��豸
  const getSelectedDevice = () => {
    return devices.find(d => d.id === selectedDevice) || devices[0];
  };

  // ����ģ�����ݵ�
  const generateDataPoints = (deviceId: string, count: number): DeviceDataPoint[] => {
    const dataPoints: DeviceDataPoint[] = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      // ���ɵݼ���ʱ��������µ����������
      let timestamp: Date;
      
      if (timeRange === TimeRange.LAST_HOUR) {
        // ��ȥһСʱ�����ݣ�ÿ����һ����
        timestamp = new Date(now.getTime() - (count - i - 1) * 60 * 1000);
      } else if (timeRange === TimeRange.LAST_DAY) {
        // ��ȥһ������ݣ�ÿ15����һ����
        timestamp = new Date(now.getTime() - (count - i - 1) * 15 * 60 * 1000);
      } else {
        // ��ȥһ�ܵ����ݣ�ÿ2Сʱһ����
        timestamp = new Date(now.getTime() - (count - i - 1) * 2 * 60 * 60 * 1000);
      }
      
      // �����豸ID���ɲ�ͬ������ģʽ
      const point: DeviceDataPoint = {
        id: `dp-${deviceId}-${i}`,
        deviceId,
        timestamp,
        sensortype: 'multiple',
        quality: 95 - Math.random() * 10
      };
      
      // Ϊ�豸1(�¶ȴ�����)������ʪ������
      if (deviceId === '1') {
        // �����¶����ߣ������¶ȸߣ�ҹ���¶ȵ�
        const hour = timestamp.getHours();
        const isDaytime = hour >= 6 && hour <= 18;
        const baseTemp = isDaytime ? 25 : 20;
        const variation = Math.sin(i / (count / 10)) * 3;
        const noise = (Math.random() - 0.5) * 2;
        
        point.temperature = baseTemp + variation + noise;
        point.humidity = 50 - variation + (Math.random() - 0.5) * 10;
        point.batteryLevel = 90 - (i / count) * 15;
        point.signalStrength = 85 + Math.sin(i / (count / 15)) * 10;
      } 
      // Ϊ�豸2(��΢��)�����������
      else if (deviceId === '2') {
        point.temperature = 28 + Math.sin(i / (count / 8)) * 1.5 + (Math.random() - 0.5);
        point.batteryLevel = 100 - (i / count) * 35;
        point.signalStrength = 75 + Math.cos(i / (count / 12)) * 15;
        // �豸���е�ָ��
        point.metadata = {
          zoomLevel: 40 + Math.floor(Math.sin(i / (count / 5)) * 20),
          lightIntensity: 75 + Math.floor(Math.cos(i / (count / 7)) * 15),
          focusQuality: 85 + Math.floor(Math.sin(i / (count / 9)) * 10)
        };
      } 
      // Ϊ�豸3(���ݼ�¼��)�����������
      else {
        point.temperature = 22 + Math.sin(i / (count / 12)) * 2 + (Math.random() - 0.5);
        point.pressure = 1013 + Math.sin(i / (count / 20)) * 5 + (Math.random() - 0.5) * 3;
        point.batteryLevel = 65 - (i / count) * 25;
        point.signalStrength = 65 + Math.sin(i / (count / 10)) * 20;
        // �豸���е�ָ��
        point.metadata = {
          StorageIconUsed: 40 + (i / count) * 30,
          dataRate: 25 + Math.sin(i / (count / 15)) * 10,
          errorRate: Math.max(0, 2 + Math.sin(i / (count / 8)) * 2)
        };
      }
      
      dataPoints.push(point);
    }
    
    return dataPoints;
  };

  // �������ݵ�
  const updateDataPoints = () => {
    setLoading(true);
    
    setTimeout(() => {
      const newDataPoints = generateDataPoints(selectedDevice, dataPointCount);
      setDataPoints(newDataPoints);
      setLoading(false);
    }, 500);
  };

  // ��ʼ�����豸�仯ʱ�������ݵ�
  useEffect(() => {
    updateDataPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice, dataPointCount, timeRange]);

  // ���ö�ʱˢ��
  useEffect(() => {
    if (refreshInterval) {
      const intervalId = setInterval(updateDataPoints, refreshInterval);
      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval, selectedDevice, dataPointCount, timeRange]);

  // ����ˢ�¼���仯
  const handleRefreshIntervalChange = (checked: boolean) => {
    setRefreshInterval(checked ? 5000 : null);
  };

  // �����豸�仯
  const handleDeviceChange = (Event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedDevice(Event.target.value as string);
  };

  // �л�����״̬
  const toggleLoading = () => {
    setLoading(prev => !prev);
    if (!loading) {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  // �л�����״̬
  const toggleError = () => {
    setShowError(prev => !prev);
  };

  // ����ͼ�����ͱ仯
  const handleChartTypeChange = (Event: React.ChangeEvent<{ value: unknown }>) => {
    setChartType(Event.target.value as ChartType);
  };

  // ����ʱ�䷶Χ�仯
  const handleTimeRangeChange = (Event: React.ChangeEvent<{ value: unknown }>) => {
    setTimeRange(Event.target.value as TimeRange);
  };

  // �������ݵ������仯
  const handleDataPointCountChange = (_Event: Event, value: number | number[]) => {
    setDataPointCount(value as number);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        �豸ָ��ͼ��ʾ��
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ͼ������
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="device-select-LabelIcon">�豸</InputLabel>
                <Select
                  labelId="device-select-LabelIcon"
                  value={selectedDevice}
                  onChange={handleDeviceChange as any}
                  label="�豸"
                >
                  {devices.map(device => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="chart-type-LabelIcon">ͼ������</InputLabel>
                <Select
                  labelId="chart-type-LabelIcon"
                  value={chartType}
                  onChange={handleChartTypeChange as any}
                  label="ͼ������"
                >
                  <MenuItem value={ChartType.LINE}>����ͼ</MenuItem>
                  <MenuItem value={ChartType.AREA}>���ͼ</MenuItem>
                  <MenuItem value={ChartType.BAR}>��״ͼ</MenuItem>
                  <MenuItem value={ChartType.COMPOSED}>���ͼ</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="time-range-LabelIcon">ʱ�䷶Χ</InputLabel>
                <Select
                  labelId="time-range-LabelIcon"
                  value={timeRange}
                  onChange={handleTimeRangeChange as any}
                  label="ʱ�䷶Χ"
                >
                  <MenuItem value={TimeRange.LAST_HOUR}>���1Сʱ</MenuItem>
                  <MenuItem value={TimeRange.LAST_DAY}>���24Сʱ</MenuItem>
                  <MenuItem value={TimeRange.LAST_WEEK}>���7��</MenuItem>
                </Select>
              </FormControl>
              
              <div sx={{ mt: 3 }}>
                <Typography gutterBottom>���ݵ�����: {dataPointCount}</Typography>
                <Slider
                  value={dataPointCount}
                  onChange={handleDataPointCountChange}
                  min={10}
                  max={500}
                  step={10}
                  valueLabelDisplay="auto"
                />
              </div>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                ģ��ѡ��
              </Typography>
              
              <FormControlLabel
                control={<Switch checked={loading} onChange={toggleLoading} />}
                label="��ʾ����״̬"
              />
              
              <FormControlLabel
                control={<Switch checked={showError} onChange={toggleError} />}
                label="��ʾ����״̬"
              />
              
              <FormControlLabel
                control={<Switch checked={!!refreshInterval} onChange={(e) => handleRefreshIntervalChange(e.target.checked)} />}
                label="�����Զ�ˢ��(5��)"
              />
              
              <div sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={updateDataPoints} 
                  fullWidth
                >
                  �ֶ�ˢ������
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <DeviceMetricsChart
            device={getSelectedDevice()}
            dataPoints={dataPoints}
            loading={loading}
            error={showError ? '�޷����ӵ��豸���������ʱ' : undefined}
            onRefresh={updateDataPoints}
            height={600}
            defaultChartType={chartType}
            defaultTimeRange={timeRange}
            showSettings={true}
            showDownload={true}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DeviceMetricsChartDemo;

