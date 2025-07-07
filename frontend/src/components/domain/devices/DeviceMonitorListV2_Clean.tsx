import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Alert,
  Tooltip,
  CircularProgress,
  Paper
} from '@mui/material';
import { SearchIcon as SearchIcon, RefreshIcon as RefreshIcon, visibility as visibility, EditIcon as EditIcon, DeleteIcon as DeleteIcon, ErrorIcon as ErrorIcon, VisibilityIcon } from '../../../utils/icons';;

// ����������
import { Button, ButtonType } from '../../core/atoms/Button';
import { Card } from '../../core/atoms/Card';
import DeviceDetailDialog from './DeviceDetailDialog';

// ��������
import { Device, DeviceConnectionStatus, DeviceType, DeviceDataPoint } from '../../../types/devices';

// �豸״̬ӳ��
const devicestatusMap: Record<string, { label: string; color: string; icon: React.ReactElement }> = {
  'online': { label: '����', color: 'success', icon: <WifiIcon /> },
  'offline': { label: '����', color: 'default', icon: <WifiIcon /> },
  'connecting': { label: '������', color: 'info', icon: <WifiIcon /> },
  'error': { label: '����', color: 'error', icon: <ErrorIcon /> },
  'maintenance': { label: 'ά����', color: 'warning', icon: <SettingsIcon /> },
  'connected': { label: '����', color: 'success', icon: <WifiIcon /> },
  'disconnected': { label: '����', color: 'default', icon: <WifiIcon /> },
  'reconnecting': { label: '������', color: 'info', icon: <WifiIcon /> }
};

// �豸����ӳ��
const deviceTypeMap: Record<string, { label: string; color: string }> = {
  'sensor': { label: '������', color: 'primary' },
  'meter': { label: '������', color: 'secondary' },
  'microscope': { label: '��΢��', color: 'info' },
  'spectroscope': { label: '�ֹ���', color: 'success' },
  'datalogger': { label: '���ݼ�¼��', color: 'warning' },
  'camera': { label: '���', color: 'error' },
  'control_unit': { label: '���Ƶ�Ԫ', color: 'default' },
  'other': { label: '����', color: 'default' }
};

/**
 * DeviceMonitorListV2������Խӿ�
 */
interface DeviceMonitorListV2Props {
  /** ��ʼ�豸�б�����ѡ */
  initialdevices?: Device[];
  /** �Ƿ��Զ��������� */
  autoLoad?: boolean;
  /** ÿҳ��ʾ���豸���� */
  pageSize?: number;
  /** ����豸ʱ�Ļص����� */
  onDeviceClick?: (device: Device) => void;
  /** ˢ�°�ť���ʱ�Ļص����� */
  onRefreshIcon?: () => void;
}

/**
 * �豸����б���� - �ع���V2
 * 
 * ʹ���µ������ʵ�ֵ��豸����б���֧�ַ�ҳ�����������˵ȹ���
 */
const DeviceMonitorListV2: React.FC<DeviceMonitorListV2Props> = ({
  initialdevices = [],
  autoLoad = true,
  pageSize = 10,
  onDeviceClick,
  onRefreshIcon
}) => {
  // ״̬����
  const [devices, setdevices] = useState<Device[]>(initialdevices);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // ��ҳ״̬
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  
  // ��ϸ��Ϣ�Ի���״̬
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceDataPoint[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  
  // ��ʱˢ���豸�б��Ķ�ʱ������
  const RefreshIconTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // ģ������豸����
  const fetchdevices = useCallback(async () => {
    if (!autoLoad && initialdevices.length > 0) {
      setdevices(initialdevices);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // ģ��api�����ӳ�
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ��ʵ��Ӧ���У�����Ӧ�ô�api��ȡ�豸����
      // const response = await deviceservice.getdevices();
      // setdevices(response.data);
      
      if (initialdevices.length > 0) {
        setdevices(initialdevices);
      } else {
        // ʹ��ģ�����ݣ�����û�д���initialdevicesʱ��
        const mockdevices: Device[] = [
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
            connectionStatus: DeviceConnectionStatus.ONLINE,
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
          }
        ];
        
        setdevices(mockdevices);
      }
    } catch (err) {
      console.error('��ȡ�豸�б�ʧ��:', err);
      setError('��ȡ�豸�б�ʧ�ܣ����Ժ�����');
    } finally {
      setLoading(false);
    }
  }, [autoLoad, initialdevices]);

  // ��ȡ�豸ʵʱ����
  const fetchDeviceData = useCallback(async (deviceId: string) => {
    if (!deviceId) return;
    
    setDetailsLoading(true);
    setDetailsError(null);
    
    try {
      // ��ʵ����Ŀ�У�����Ӧ�õ���api��ȡ�豸��ʵʱ����
      // const response = await deviceservice.getDeviceData(deviceId);
      
      // ģ�����ݼ����ӳ�
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // ����ģ������
      const mockData: DeviceDataPoint[] = [];
      const now = new Date();
      
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        
        // ���ӷ���DeviceDataPoint�ӿڵ�ģ������
        mockData.push({
          id: `data-${deviceId}-${i}`,
          deviceId: deviceId,
          timestamp: timestamp,
          temperature: 20 + Math.random() * 5,
          humidity: 40 + Math.random() * 20,
          pressure: 1010 + Math.random() * 10,
          batteryLevel: 80 - i * 0.5,
          signalStrength: 70 + Math.random() * 20,
          sensortype: 'temperature',
          value: 20 + Math.random() * 5,
          unit: '��C',
          quality: 95
        });
      }
      
      setDeviceData(mockData.reverse());
      
    } catch (error) {
      console.error('��ȡ�豸����ʧ��', error);
      setDetailsError('��ȡ�豸����ʧ�ܣ����Ժ�����');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  // ˢ���豸״̬��ֻ����״̬�������¼��������б���
  const RefreshIcondevicestatus = useCallback(async () => {
    try {
      // ��ʵ����Ŀ�У�����Ӧ�õ���api��ȡ���µ��豸״̬
      // const response = await deviceservice.getdevicesStatus();
      
      // ģ��״̬���£�����ı�һЩ�豸��״̬
      setdevices(prevdevices => {
        return prevdevices.map(device => {
          // 20%�ĸ��ʸı��豸״̬
          if (Math.random() < 0.2) {
            const statuses = Object.values(DeviceConnectionStatus);
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return { ...device, connectionStatus: newStatus };
          }
          return device;
        });
      });
      
      console.log('�豸״̬��ˢ��', new Date().toLocaleTimeString());
      
    } catch (error) {
      console.error('ˢ���豸״̬ʧ��', error);
    }
  }, []);
  
  // �����Զ�ˢ���豸״̬
  useEffect(() => {
    // ��ʼ����
    if (autoLoad) {
      fetchdevices();
    }
    
    // ����ÿ30���Զ�ˢ��һ��
    RefreshIconTimerRef.current = setInterval(() => {
      if (autoLoad) {
        RefreshIcondevicestatus();
      }
    }, 30000);
    
    // ������ʱ��
    return () => {
      if (RefreshIconTimerRef.current) {
        clearInterval(RefreshIconTimerRef.current);
      }
    };
  }, [autoLoad, fetchdevices, RefreshIcondevicestatus]);
  
  // ��������
  const handleSearch = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(Event.target.value);
  };
  
  // ����ˢ��
  const handleRefreshIcon = () => {
    fetchdevices();
    if (onRefreshIcon) {
      onRefreshIcon();
    }
  };
  
  // �����鿴�豸����
  const handleViewDetails = (device: Device) => {
    if (!device || !device.id) return;
    
    setSelectedDevice(device);
    setDetailsOpen(true);
    fetchDeviceData(device.id);
  };
  
  // �����ر�����Ի���
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedDevice(null);
  };
  
  // �����豸����ˢ��
  const handleRefreshIconDeviceData = useCallback(() => {
    if (selectedDevice && selectedDevice.id) {
      fetchDeviceData(selectedDevice.id);
    }
  }, [selectedDevice, fetchDeviceData]);
  
  // ����ҳ��仯
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // ����ÿҳ�����仯
  const handleChangeRowsPerPage = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(Event.target.value, 10));
    setPage(0);
  };
  
  // ��ȫ���ַ���ƥ�亯������ֹundefined��null
  const safeStringMatch = (value: string | undefined | null, term: string): boolean => {
    if (!value) return false;
    return value.toLowerCase().includes(term.toLowerCase());
  };

  // �����豸
  const filtereddevices = devices.filter(device => {
    // ��������
    const matchesSearch = searchTerm === '' || 
      safeStringMatch(device.name, searchTerm) ||
      safeStringMatch(device.model, searchTerm) ||
      safeStringMatch(device.manufacturer, searchTerm) ||
      safeStringMatch(device.location, searchTerm);
    
    // ���ͺ�״̬����
    const matchesTypeFilter = typeFilter === 'all' || device.type === typeFilter;
    const matchesStatusFilter = statusFilter === 'all' || device.connectionStatus === statusFilter;
    
    return matchesSearch && matchesTypeFilter && matchesStatusFilter;
  });
  
  const paginateddevices = filtereddevices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // ��Ⱦ�豸״̬
  const renderdevicestatus = (status: DeviceConnectionStatus | string | undefined) => {
    if (!status || !devicestatusMap[status]) {
      return <Chip label="δ֪" color="default" size="small" />;
    }
    const { label, color, icon } = devicestatusMap[status];
    return (
      <Chip
        label={label }
        color={color as any}
        size="small"
        icon={icon}
      />
    );
  };
  
  return (
    <div sx={{ width: '100%' }}>
      <Card>
        <div sx={{ p: 2 }}>
          <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">�豸���</Typography>
            <div>
              <Button 
                buttonType={ButtonType.PRIMARY}
                startIcon={<RefreshIcon />}
                onClick={handleRefreshIcon}
                aria-label="ˢ��"
              >
                ˢ��
              </Button>
            </div>
          </div>
          
          <div sx={{ mb: 2 }}>
            <TextField
              placeholder="�����豸..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <div sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </div>
          ) : (
            filtereddevices.length === 0 ? (
              <Alert severity="info">
                û���ҵ������������豸
              </Alert>
            ) : null
          )}
        </div>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>�豸����</TableCell>
                <TableCell>����</TableCell>
                <TableCell>״̬</TableCell>
                <TableCell>λ��</TableCell>
                <TableCell>������</TableCell>
                <TableCell>����</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginateddevices.map(device => (
                <TableRow 
                  key={device.id}
                  hover
                  onClick={() => onDeviceClick?.(device)}
                  sx={{ cursor: onDeviceClick ? 'pointer' : 'default' }}
                >
                  <TableCell>
                    <div sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">{device.name}</Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={deviceTypeMap[device.type].label} 
                      color={deviceTypeMap[device.type].color as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {renderdevicestatus(device.connectionStatus)}
                  </TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>
                    {device.updatedAt ? new Date(device.updatedAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'δ֪ʱ��'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="�鿴����">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewDetails(device)}
                          aria-label="�鿴����"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="�༭�豸">
                        <IconButton size="small" color="primary" aria-label="�༭�豸">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ɾ���豸">
                        <IconButton size="small" color="error" aria-label="ɾ���豸">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filtereddevices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="ÿҳ����"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>
      
      {/* ʹ���µ��豸����Ի������ */}
      <DeviceDetailDialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        device={selectedDevice}
        loading={detailsLoading}
        error={detailsError}
        deviceData={deviceData}
        onRefreshIcon={handleRefreshIconDeviceData}
      />
    </div>
  );
};

export default DeviceMonitorListV2;


