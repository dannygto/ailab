import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  useTheme,
  Tooltip
} from '@mui/material';
import { 
  CloseIcon, 
  SignalCellular4BarIcon, 
  SignalCellularAltIcon, 
  SignalCellularAlt1BarIcon, 
  SignalCellularConnectedNoInternet0BarIcon, 
  ErrorIcon, 
  MemoryIcon, 
  SettingsIcon, 
  HistoryIcon, 
  UpdateIcon 
} from '../../../utils/icons';

// ����������
import { Button, ButtonType } from '../../core/atoms/Button';

// ��������
import { Device, DeviceConnectionStatus, DeviceDataPoint } from '../../../types/devices';

/**
 * �豸״̬ͼ��ӳ��
 */
const devicestatusIcon: Record<string, React.ReactElement> = {
  'online': <SignalCellular4BarIcon color="success" />,
  'offline': <SignalCellularConnectedNoInternet0BarIcon color="error" />,
  'connecting': <SignalCellularAltIcon color="warning" />,
  'error': <ErrorIcon color="error" />,
  'maintenance': <SignalCellularAlt1BarIcon color="info" />,
  'connected': <SignalCellular4BarIcon color="success" />,
  'disconnected': <SignalCellularConnectedNoInternet0BarIcon color="error" />,
  'reconnecting': <SignalCellularAltIcon color="warning" />
};

/**
 * �豸״̬�ı�ӳ��
 */
const devicestatusText: Record<string, string> = {
  'online': '����',
  'offline': '����',
  'connecting': '������',
  'error': '����',
  'maintenance': 'ά����',
  'connected': '����',
  'disconnected': '����',
  'reconnecting': '������'
};

/**
 * ��ȡ��ȫ���豸״̬ͼ��
 */
const getdevicestatusIcon = (status?: string) => {
  return status ? devicestatusIcon[status as keyof typeof devicestatusIcon] || <ErrorIcon color="disabled" /> : <ErrorIcon color="disabled" />;
};

/**
 * ��ȡ��ȫ���豸״̬�ı�
 */
const getdevicestatusText = (status?: string) => {
  return status ? devicestatusText[status as keyof typeof devicestatusText] || 'δ֪״̬' : 'δ֪״̬';
};

/**
 * �豸����Ի�������
 */
export interface DeviceDetailDialogProps {
  /**
   * �Ƿ�򿪶Ի���
   */
  open: boolean;
  
  /**
   * �رնԻ���ص�
   */
  onClose: () => void;
  
  /**
   * �豸����
   */
  device: Device | null;
  
  /**
   * �Ƿ����ڼ�������
   */
  loading?: boolean;
  
  /**
   * ���ش�����Ϣ
   */
  error?: string | null;
  
  /**
   * �豸ʵʱ����
   */
  deviceData?: DeviceDataPoint[];
  
  /**
   * ˢ���豸���ݻص�
   */
  onRefreshIcon?: () => void;
  
  /**
   * �༭�豸�ص�
   */
  onEdit?: (device: Device) => void;
}

/**
 * �豸����Ի������
 * 
 * ��ʾ�豸����ϸ��Ϣ��״̬��ʵʱ���ݵ�
 */
const DeviceDetailDialog: React.FC<DeviceDetailDialogProps> = ({
  open,
  onClose,
  device,
  loading = false,
  error = null,
  deviceData = [],
  onRefreshIcon,
  onEdit
}) => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  
  // ������ǩ�л�
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  
  // ��Ⱦ������Ϣ
  const renderBasicInfo = () => {
    if (!device) return null;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">�豸ID</Typography>
          <Typography variant="body1">{device.id}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">�豸����</Typography>
          <Typography variant="body1">{device.name}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">�豸����</Typography>
          <Typography variant="body1">{device.type}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">����</Typography>
          <Typography variant="body1">{device.manufacturer}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">�ͺ�</Typography>
          <Typography variant="body1">{device.model}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">λ��</Typography>
          <Typography variant="body1">{device.location}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">����</Typography>
          <Typography variant="body1">{device.description}</Typography>
        </Grid>
        {device.ipAddress && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">IP��ַ</Typography>
            <Typography variant="body1">{device.ipAddress}</Typography>
          </Grid>
        )}
        {device.macAddress && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">MAC��ַ</Typography>
            <Typography variant="body1">{device.macAddress}</Typography>
          </Grid>
        )}
        {device.firmware && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">�̼��汾</Typography>
            <Typography variant="body1">{device.firmware}</Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">����</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {device.capabilities?.map((capability) => (
              <Chip key={capability} label={capability} size="small" />
            )) || <Typography variant="body2" color="text.secondary">��������Ϣ</Typography>}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">֧��Э��</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {device.supportedProtocols?.map((protocol) => (
              <Chip key={protocol} label={protocol} size="small" />
            )) || <Typography variant="body2" color="text.secondary">��Э����Ϣ</Typography>}
          </Box>
        </Grid>
      </Grid>
    );
  };
  
  // ��Ⱦ״̬��Ϣ
  const renderStatus = () => {
    if (!device) return null;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`
          }}>
            {getdevicestatusIcon(device.connectionStatus)}
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1">
                ����״̬: {getdevicestatusText(device.connectionStatus)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ������: {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MemoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">ϵͳ��Դ</Typography>
            </Box>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="CPUʹ����" 
                  secondary="32%" 
                  secondaryTypographyProps={{ color: 'success.main' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="�ڴ�ʹ����" 
                  secondary="45%" 
                  secondaryTypographyProps={{ color: 'success.main' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="����ʹ����" 
                  secondary="67%" 
                  secondaryTypographyProps={{ color: 'warning.main' }}
                />
              </ListItem>
            </List>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1">ά����Ϣ</Typography>
            </Box>
            <List dense>
              {device.lastMaintenance && (
                <ListItem>
                  <ListItemText 
                    primary="�ϴ�ά��" 
                    secondary={new Date(device.lastMaintenance).toLocaleDateString()} 
                  />
                </ListItem>
              )}
              {device.nextMaintenance && (
                <ListItem>
                  <ListItemText 
                    primary="�´�ά��" 
                    secondary={new Date(device.nextMaintenance).toLocaleDateString()} 
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText 
                  primary="����ʱ��" 
                  secondary="342Сʱ" 
                />
              </ListItem>
            </List>
          </Box>
        </Grid>
      </Grid>
    );
  };
  
  // ��Ⱦ������Ϣ
  const renderData = () => {
    if (!device) return null;
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (!deviceData || deviceData.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          �����豸����
        </Alert>
      );
    }
    
    // ��������ת��Ϊͼ�����ø�ʽ
    const formattedData = deviceData.map(data => ({
      time: new Date(data.timestamp).toLocaleTimeString(),
      temperature: data.temperature,
      humidity: data.humidity,
      pressure: data.pressure,
      batteryLevel: data.batteryLevel,
      signalStrength: data.signalStrength
    }));
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">ʵʱ����</Typography>
          {onRefreshIcon && (
            <Tooltip title="ˢ������">
              <IconButton onClick={onRefreshIcon} size="small">
                <UpdateIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {/* ͼ������ */}
        <Box sx={{ mb: 4, height: 300, width: '100%' }}>
          {/* ������Լ���ͼ���������recharts��visx�� */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ���24Сʱ��������
          </Typography>
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            bgcolor: 'background.paper'
          }}>
            {/* ����ͼ��չʾ */}
            <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              {formattedData.slice(-12).map((data, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%' }}>
                  <Box sx={{ 
                      width: '100%', 
                      bgcolor: theme.palette.primary.main, 
                      height: `${data.temperature ? data.temperature * 3 : 0}px`,
                      maxHeight: '80%',
                      minHeight: '10px',
                      borderTopLeftRadius: 2,
                      borderTopRightRadius: 2
                    }} 
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.6rem', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                    {data.time.split(':')[0] + ':' + data.time.split(':')[1]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        
        {/* �����б� */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>�������ݼ�¼</Typography>
        <List dense>
          {deviceData.slice(-5).reverse().map((dataPoint, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">ʱ���</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(dataPoint.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {dataPoint.temperature && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">�¶�:</Typography>
                        <Typography variant="caption">{dataPoint.temperature.toFixed(1)}��C</Typography>
                      </Box>
                    )}
                    {dataPoint.humidity && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">ʪ��:</Typography>
                        <Typography variant="caption">{dataPoint.humidity.toFixed(1)}%</Typography>
                      </Box>
                    )}
                    {dataPoint.pressure && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">ѹ��:</Typography>
                        <Typography variant="caption">{dataPoint.pressure.toFixed(1)} hPa</Typography>
                      </Box>
                    )}
                    {dataPoint.batteryLevel && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">���:</Typography>
                        <Typography variant="caption">{dataPoint.batteryLevel.toFixed(1)}%</Typography>
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };
  
  // ��Ⱦ������Ϣ
  const renderConfiguration = () => {
    if (!device) return null;
    
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>�豸����</Typography>
        {device.configuration && Object.entries(device.configuration).length > 0 ? (
          <List>
            {Object.entries(device.configuration).map(([key, value]) => (
              <ListItem key={key} divider>
                <ListItemText
                  primary={key}
                  secondary={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">����������Ϣ</Alert>
        )}
      </Box>
    );
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      {device && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getdevicestatusIcon(device.connectionStatus)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {device.name}
                </Typography>
                <Chip 
                  label={device.type} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              </Box>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <Divider />
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="������Ϣ" />
              <Tab label="״̬" />
              <Tab label="����" />
              <Tab label="����" />
            </Tabs>
          </Box>
          
          <DialogContent>
            {loading && !device ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error && !device ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Box sx={{ py: 1 }}>
                {tabIndex === 0 && renderBasicInfo()}
                {tabIndex === 1 && renderStatus()}
                {tabIndex === 2 && renderData()}
                {tabIndex === 3 && renderConfiguration()}
              </Box>
            )}
          </DialogContent>
          
          <Divider />
          
          <DialogActions>
            <Button buttonType={ButtonType.SECONDARY} onClick={onClose}>
              �ر�
            </Button>
            {onEdit && device && (
              <Button 
                buttonType={ButtonType.PRIMARY} 
                onClick={() => onEdit(device)}
                startIcon={<SettingsIcon />}
              >
                �༭�豸
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default DeviceDetailDialog;


