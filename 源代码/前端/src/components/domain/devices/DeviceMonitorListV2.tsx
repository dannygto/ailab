import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Alert,
  Tooltip,
  Skeleton
} from '@mui/material';
import { SearchIcon, RefreshIcon, AddIcon, FilterListIcon, VisibilityIcon, EditIcon, DeleteIcon, ErrorIcon, WifiIcon, SettingsIcon } from '../../../utils/icons';

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
  // 状态管理
  const [devices, setdevices] = useState<Device[]>(initialdevices);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selecteddevices, setSelecteddevices] = useState<string[]>([]);
  
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
    if (!autoLoad) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // ��ʵ����Ŀ�У�Ӧ�ô�api��ȡ�豸����
      // const response = await deviceservice.getdevices();
      // setdevices(response.data);
      
      // ģ��api�����ӳ�
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ʹ��ʾ������
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
        }
      ];
      
      // ���ɸ���ģ���豸����
      for (let i = 2; i <= 50; i++) {
        const deviceTypes = Object.values(DeviceType);
        const statuses = Object.values(DeviceConnectionStatus);
        const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        mockdevices.push({
          id: i.toString(),
          name: `�豸 ${i}`,
          type: type,
          model: `Model-${1000 + i}`,
          manufacturer: ['�Ƽ���˾A', '�Ƽ���˾B', '�Ƽ���˾C'][i % 3],
          description: `�豸 ${i} ��������Ϣ`,
          connectionStatus: status,
          location: `ʵ���� ${String.fromCharCode(65 + (i % 10))}`,
          ipAddress: `192.168.1.${100 + i}`,
          macAddress: `00:1B:44:11:3A:${i.toString(16).padStart(2, '0')}`,
          firmware: `v${Math.floor(i / 10)}.${i % 10}.${Math.floor(Math.random() * 10)}`,
          lastMaintenance: new Date(2025, 0, Math.floor(Math.random() * 30) + 1).toISOString().substring(0, 10),
          nextMaintenance: new Date(2025, 6, Math.floor(Math.random() * 30) + 1).toISOString().substring(0, 10),
          metadata: {
          installationDate: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().substring(0, 10),
          },
          capabilities: ['��������', '���ݴ���', 'Զ�̿���'].slice(0, Math.floor(Math.random() * 3) + 1),
          supportedProtocols: ['Modbus', 'MQTT', 'HTTP'].slice(0, Math.floor(Math.random() * 3) + 1),
          dataFormats: ['JSON', 'CSV', 'XML'].slice(0, Math.floor(Math.random() * 3) + 1),
          configuration: {
            setting1: `ֵ${i}`,
            setting2: `ֵ${i + 10}`
          },
          createdAt: new Date(2024, 0, 1).toISOString(),
          updatedAt: new Date(2025, 0, 1).toISOString()
        });
      }
      
      setdevices(mockdevices);
      
    } catch (err) {
      console.error('��ȡ�豸�б�ʧ��', err);
      setError('��ȡ�豸�б�ʧ�ܣ����Ժ�����');
    } finally {
      setLoading(false);
    }
  }, [autoLoad]);

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

  // �����豸����Ի���������
  const handleViewDetails = useCallback((device: Device) => {
    setSelectedDevice(device);
    setDetailsOpen(true);
    fetchDeviceData(device.id);
  }, [fetchDeviceData]);
  
  // �ر��豸����Ի���
  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedDevice(null);
  }, []);
  
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
  const handleChangeRowsPerPage = (EventIcon: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(EventIcon.target.value, 10));
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
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      safeStringMatch(device.name, searchTerm) ||
      safeStringMatch(device.model, searchTerm) ||
      safeStringMatch(device.manufacturer, searchTerm) ||
      safeStringMatch(device.location, searchTerm) ||
      safeStringMatch(device.description, searchTerm);
    
    // ���͹���
    const matchesType = typeFilter === 'all' || device.type === typeFilter;
    
    // ״̬����
    const matchesStatus = statusFilter === 'all' || device.connectionStatus === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // �����ҳ�豸
  const paginateddevices = filtereddevices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // ��Ⱦ�豸״̬
  const renderdevicestatus = (status: DeviceConnectionStatus | string | undefined) => {
    if (!status || !devicestatusMap[status]) {
      return <Chip label="δ֪" color="default" size="small" />;
    }
    const statusInfo = devicestatusMap[status];
    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color as any}
        size="small"
      />
    );
  };
  
  // ��Ⱦ�豸����
  const renderDeviceType = (type: DeviceType | string | undefined) => {
    if (!type || !deviceTypeMap[type]) {
      return <Chip label="δ֪" color="default" size="small" />;
    }
    const typeInfo = deviceTypeMap[type];
    return (
      <Chip
        label={typeInfo.label}
        color={typeInfo.color as any}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Box>
      {/* ������ */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">�豸����б�</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              buttonType={ButtonType.PRIMARY}
              startIcon={<AddIcon />}
              onClick={() => {/* �����豸 */}}
            >
              �����豸
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="�����豸..."
            size="small"
            value={searchTerm}
            onChange={(EventIcon) => setSearchTerm(EventIcon.target.value)}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            buttonType={ButtonType.SECONDARY}
            startIcon={<FilterListIcon />}
            onClick={() => {/* ��ʾ����ѡ�� */}}
          >
            ����
          </Button>
          
          <Tooltip title="ˢ��">
            <IconButton onClick={fetchdevices} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>
      
      {/* �豸�б� */}
      <Card>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selecteddevices.length > 0 && selecteddevices.length < filtereddevices.length}
                    checked={filtereddevices.length > 0 && selecteddevices.length === filtereddevices.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelecteddevices(filtereddevices.map(device => device.id));
                      } else {
                        setSelecteddevices([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>�豸����</TableCell>
                <TableCell>����</TableCell>
                <TableCell>״̬</TableCell>
                <TableCell>λ��</TableCell>
                <TableCell>������</TableCell>
                <TableCell>����</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // ����״̬
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell padding="checkbox"><Skeleton variant="rectangular" width={20} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="30%" /></TableCell>
                  </TableRow>
                ))
              ) : paginateddevices.length === 0 ? (
                // ������״̬
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      û���ҵ������������豸
                    </Typography>
                    <Button 
                      buttonType={ButtonType.PRIMARY}
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                      onClick={() => {/* �����豸 */}}
                    >
                      �����豸
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                // �豸����
                paginateddevices.map((device) => (
                  <TableRow 
                    key={device.id} 
                    hover
                    onClick={() => onDeviceClick && onDeviceClick(device)}
                    sx={{ cursor: onDeviceClick ? 'pointer' : 'default' }}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selecteddevices.includes(device.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelecteddevices(prev => [...prev, device.id]);
                          } else {
                            setSelecteddevices(prev => prev.filter(id => id !== device.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {device.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {device.model} - {device.manufacturer}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{renderDeviceType(device.type)}</TableCell>
                    <TableCell>{renderdevicestatus(device.connectionStatus)}</TableCell>
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewDetails(device)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
      
      {/* �豸����Ի��� */}
      <DeviceDetailDialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        device={selectedDevice}
        loading={detailsLoading}
        error={detailsError}
        deviceData={deviceData}
        onRefreshIcon={handleRefreshIconDeviceData}
      />
    </Box>
  );
};

export default DeviceMonitorListV2;


