import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import { ErrorIcon, VisibilityIcon, RefreshIcon, BuildIcon as ConfigureIcon, InfoIcon, ThermostatIcon, BatteryFullIcon, WifiIcon, SettingsIcon } from '../../../utils/icons';

// ��������
import { Device, DeviceConnectionStatus, DeviceType } from '../../../types/devices';

// �豸״̬ӳ��
const devicestatusMap: Record<string, { label: string; color: string; icon: React.ReactElement }> = {
  'online': { 
    label: '����', 
    color: 'success', 
    icon: <WifiIcon fontSize="small" /> 
  },
  'offline': { 
    label: '����', 
    color: 'default', 
    icon: <WifiIcon fontSize="small" /> 
  },
  'connecting': { 
    label: '������', 
    color: 'info', 
    icon: <WifiIcon fontSize="small" /> 
  },
  'error': { 
    label: '����', 
    color: 'error', 
    icon: <ErrorIcon fontSize="small" /> 
  },
  'maintenance': { 
    label: 'ά����', 
    color: 'warning', 
    icon: <SettingsIcon fontSize="small" /> 
  },
  'connected': { 
    label: '����', 
    color: 'success', 
    icon: <WifiIcon fontSize="small" /> 
  },
  'disconnected': { 
    label: '����', 
    color: 'default', 
    icon: <WifiIcon fontSize="small" /> 
  },
  'reconnecting': { 
    label: '������', 
    color: 'info', 
    icon: <WifiIcon fontSize="small" /> 
  }
};

/**
 * ��ȡ��ȫ���豸״̬��Ϣ
 */
const getdevicestatusInfo = (status?: string) => {
  return status ? devicestatusMap[status] || {
    label: 'δ֪״̬',
    color: 'default',
    icon: <ErrorIcon fontSize="small" />
  } : {
    label: 'δ֪״̬',
    color: 'default',
    icon: <ErrorIcon fontSize="small" />
  };
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
 * �豸״̬��Ƭ���Խӿ�
 */
export interface DeviceStatusCardProps {
  /** �豸���� */
  device: Device;
  
  /** �Ƿ���ʾ������ť */
  showActions?: boolean;
  
  /** �鿴���鰴ť����¼� */
  onViewDetails?: (device: Device) => void;
  
  /** �����豸��ť����¼� */
  onRestart?: (device: Device) => void;
  
  /** �����豸��ť����¼� */
  onConfigure?: (device: Device) => void;
  
  /** ��Ƭ����¼� */
  onClick?: (device: Device) => void;
  
  /** �Զ������� */
  className?: string;
  
  /** �Զ�����ʽ */
  style?: React.CSSProperties;
  
  /** �Ƿ�Ϊ����״̬ */
  loading?: boolean;
  
  /** ������ʱ�� */
  lastUpdated?: Date | string;
  
  /** ָ������ */
  metrics?: {
    temperature?: number;
    humidity?: number;
    batteryLevel?: number;
    signalStrength?: number;
    [key: string]: number | undefined;
  };
}

/**
 * �豸״̬��Ƭ���
 * 
 * ����չʾ�豸��ʵʱ״̬���ؼ�ָ��Ͳ�����ť
 */
const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  device,
  showActions = true,
  onViewDetails,
  onRestart,
  onConfigure,
  onClick,
  className,
  style,
  loading = false,
  lastUpdated,
  metrics = {}
}) => {
  const theme = useTheme();
  
  // �����豸״̬ȷ����Ƭ�߿���ɫ
  const getBorderColor = () => {
    switch (device.connectionStatus) {
      case DeviceConnectionStatus.ONLINE:
        return theme.palette.success.main;
      case DeviceConnectionStatus.ERROR:
        return theme.palette.error.main;
      case DeviceConnectionStatus.MAINTENANCE:
        return theme.palette.warning.main;
      case DeviceConnectionStatus.CONNECTING:
        return theme.palette.info.main;
      default:
        return theme.palette.divider;
    }
  };
  
  // ������Ƭ���
  const handleCardClick = () => {
    if (onClick) {
      onClick(device);
    }
  };
  
  // �����鿴���鰴ť���
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(device);
    }
  };
  
  // ����������ť���
  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRestart) {
      onRestart(device);
    }
  };
  
  // �������ð�ť���
  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConfigure) {
      onConfigure(device);
    }
  };
  
  // ��ʽ��������ʱ��
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'δ֪';
    
    const date = typeof lastUpdated === 'string' 
      ? new Date(lastUpdated) 
      : lastUpdated;
      
    return date.toLocaleString();
  };
  
  return (
    <Card 
      className={className}
      style={{
        ...style,
        borderLeft: `4px solid ${getBorderColor()}`,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={handleCardClick}
      elevation={2}
      sx={{
        '&:hover': {
          boxShadow: onClick ? 6 : 2,
          transform: onClick ? 'translateY(-2px)' : 'none'
        }
      }}
    >
      {loading && (
        <LinearProgress 
          color={
            device.connectionStatus === DeviceConnectionStatus.ERROR ? 'error' :
            device.connectionStatus === DeviceConnectionStatus.MAINTENANCE ? 'warning' :
            'primary'
          }
          sx={{ height: 2 }}
        />
      )}
      
      <CardContent sx={{ pb: 1 }}>
        {/* �豸�����״̬ */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
            {device.name}
          </Typography>
          <Chip
            label={getdevicestatusInfo(device.connectionStatus).label}
            color={getdevicestatusInfo(device.connectionStatus).color as any}
            size="small"
            icon={getdevicestatusInfo(device.connectionStatus).icon}
          />
        </Box>
        
        {/* �豸���ͺ�ID */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip
            label={deviceTypeMap[device.type].label}
            color={deviceTypeMap[device.type].color as any}
            size="small"
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            ID: {device.id}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        {/* �豸�ؼ�ָ�� */}
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {metrics.temperature !== undefined && (
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ThermostatIcon 
                  fontSize="small" 
                  color={metrics.temperature > 30 ? 'error' : 'action'} 
                  sx={{ mr: 0.5 }}
                />
                <Typography variant="body2">
                  {metrics.temperature.toFixed(1)}��C
                </Typography>
              </Box>
            </Grid>
          )}
          
          {metrics.humidity !== undefined && (
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon 
                  fontSize="small" 
                  color="action" 
                  sx={{ mr: 0.5 }}
                />
                <Typography variant="body2">
                  {metrics.humidity.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
          )}
          
          {metrics.batteryLevel !== undefined && (
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BatteryFullIcon 
                  fontSize="small" 
                  color={metrics.batteryLevel < 20 ? 'error' : 'action'} 
                  sx={{ mr: 0.5 }}
                />
                <Typography variant="body2">
                  {metrics.batteryLevel.toFixed(0)}%
                </Typography>
              </Box>
            </Grid>
          )}
          
          {metrics.signalStrength !== undefined && (
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WifiIcon 
                  fontSize="small" 
                  color={metrics.signalStrength < 30 ? 'error' : 'action'} 
                  sx={{ mr: 0.5 }}
                />
                <Typography variant="body2">
                  {metrics.signalStrength.toFixed(0)}%
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {/* �豸λ�� */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
          λ��: {device.location}
        </Typography>
      </CardContent>
      
      {showActions && (
        <>
          <Divider />
          <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
            <Box>
              <Tooltip title="�鿴����">
                <IconButton 
                  size="small" 
                  onClick={handleViewDetails}
                  color="primary"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="�����豸">
                <IconButton 
                  size="small" 
                  onClick={handleRestart}
                  color="primary"
                  disabled={device.connectionStatus === DeviceConnectionStatus.OFFLINE}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="�����豸">
                <IconButton 
                  size="small" 
                  onClick={handleConfigure}
                  color="primary"
                >
                  <ConfigureIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              ����: {formatLastUpdated()}
            </Typography>
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default DeviceStatusCard;


