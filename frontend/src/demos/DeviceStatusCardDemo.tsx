import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Container, FormControlLabel, Switch } from '@mui/material';
import DeviceStatusCard from '../components/domain/devices/DeviceStatusCard';
import { Device, DeviceConnectionStatus, DeviceType } from '../types/devices';

/**
 * DeviceStatusCardDemo���
 * 
 * ����չʾDeviceStatusCard����Ĳ�ͬ״̬������
 */
const DeviceStatusCardDemo: React.FC = () => {
  // ����״̬
  const [showActions, setShowActions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

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
    },
    {
      id: '4',
      name: 'ʵ����� C1',
      type: DeviceType.CAMERA,
      model: 'LabCam 4K',
      manufacturer: 'VisualTech',
      description: '�߷ֱ���ʵ���¼���',
      connectionStatus: DeviceConnectionStatus.MAINTENANCE,
      location: 'ʵ���� D',
      ipAddress: '192.168.1.104',
      macAddress: '00:1B:44:11:3C:E0',
      firmware: 'v2.0.1',
      lastMaintenance: '2025-02-25',
      nextMaintenance: '2025-08-25',
      capabilities: ['4K¼��', 'ʵʱ��', 'Զ�̿���'],
      supportedProtocols: ['RTMP', 'HLS', 'RTSP'],
      dataFormats: ['MP4', 'H.264', 'JPEG'],
      configuration: { 
        resolution: '3840x2160',
        framerate: 30,
        compression: 'high'
      },
      metadata: { 
        installDate: '2024-02-20',
        warrantyEnd: '2027-02-20'
      },
      createdAt: '2024-02-20T11:10:00Z',
      updatedAt: '2025-06-20T13:25:45Z'
    }
  ];

  // Ϊÿ���豸�������ָ������
  const getRandomMetrics = (deviceId: string) => {
    // ÿ���豸�Ļ���ֵ����ֵ֤��һ���ȶ���
    const baseValue = parseInt(deviceId) * 10;
    
    return {
      temperature: 20 + (baseValue % 10) + Math.random() * 5,
      humidity: 40 + (baseValue % 20) + Math.random() * 20,
      batteryLevel: Math.max(0, Math.min(100, 80 - (baseValue % 30) + Math.random() * 10)),
      signalStrength: Math.max(0, Math.min(100, 70 + (baseValue % 20) + Math.random() * 20))
    };
  };

  // �豸ָ������״̬
  const [deviceMetrics, setDeviceMetrics] = useState<Record<string, any>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // ����ָ������
  const updateMetrics = () => {
    const newMetrics: Record<string, any> = {};
    devices.forEach(device => {
      newMetrics[device.id] = getRandomMetrics(device.id);
    });
    setDeviceMetrics(newMetrics);
    setLastUpdated(new Date());
  };

  // ��ʼ���Ͷ�ʱ����ָ������
  useEffect(() => {
    updateMetrics();
    
    // ���ö�ʱˢ��
    if (refreshInterval) {
      const intervalId = setInterval(updateMetrics, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval]);

  // ����ˢ�¼���仯
  const handleRefreshIntervalChange = (checked: boolean) => {
    setRefreshInterval(checked ? 5000 : null);
  };

  // ģ�����״̬
  const toggleLoading = () => {
    setLoading(prev => !prev);
    if (!loading) {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  // �����鿴����
  const handleViewDetails = (device: Device) => {
    alert(`�鿴�豸���飺${device.name}`);
  };

  // ���������豸
  const handleRestart = (device: Device) => {
    alert(`�����豸��${device.name}`);
  };

  // ���������豸
  const handleConfigure = (device: Device) => {
    alert(`�����豸��${device.name}`);
  };

  // ������Ƭ���
  const handleCardClick = (device: Device) => {
    alert(`����豸��Ƭ��${device.name}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        �豸״̬��Ƭʾ��
      </Typography>
      
      <div sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          ����ѡ��
        </Typography>
        <FormControlLabel
          control={<Switch checked={showActions} onChange={(e) => setShowActions(e.target.checked)} />}
          label="��ʾ������ť"
        />
        <FormControlLabel
          control={<Switch checked={loading} onChange={toggleLoading} />}
          label="��ʾ����״̬"
        />
        <FormControlLabel
          control={<Switch checked={!!refreshInterval} onChange={(e) => handleRefreshIntervalChange(e.target.checked)} />}
          label="�����Զ�ˢ��(5��)"
        />
      </div>
      
      <Typography variant="subtitle1" gutterBottom>
        ������ʱ��: {lastUpdated.toLocaleString()}
      </Typography>
      
      <Grid container spacing={3}>
        {devices.map(device => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
            <DeviceStatusCard
              device={device}
              showActions={showActions}
              loading={loading}
              metrics={deviceMetrics[device.id] || {}}
              lastUpdated={lastUpdated}
              onViewDetails={handleViewDetails}
              onRestart={handleRestart}
              onConfigure={handleConfigure}
              onClick={handleCardClick}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DeviceStatusCardDemo;

