import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Collapse,
  LinearProgress
} from '@mui/material';
import { ExpandMoreIcon as ExpandMoreIcon, ExpandLessIcon as ExpandLessIcon, visibility as visibility, WarningIcon as WarningIcon, AccountCircleIcon as AccountCircleIcon, ErrorIcon as ErrorIcon, CloudOffIcon as CloudOffIcon } from '../../utils/icons';
import { Device } from '../../types';

interface MobileDeviceCardProps {
  device: Device;
  onMonitor?: (deviceId: string) => void;
  onsettings?: (deviceId: string) => void;
  showDetails?: boolean;
}

const MobileDeviceCard: React.FC<MobileDeviceCardProps> = ({
  device,
  onMonitor,
  onsettings,
  showDetails = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = React.useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'online':
        return <AccountCircleIcon color="success" />;
      case 'disconnected':
      case 'offline':
        return <CloudOffIcon color="disabled" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <AccountCircleIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'online':
        return 'success';
      case 'disconnected':
      case 'offline':
        return 'default';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '������';
      case 'disconnected':
        return 'δ����';
      case 'online':
        return '����';
      case 'offline':
        return '����';
      case 'error':
        return '����';
      case 'warning':
        return '����';
      default:
        return 'δ֪';
    }
  };

  // ģ���豸ָ������
  const metrics = [
    { label: '�¶�', value: '25.3��C', progress: 42 },
    { label: 'ʪ��', value: '65%', progress: 65 },
    { label: 'ѹ��', value: '1.2bar', progress: 80 },
    { label: '��ѹ', value: '3.7V', progress: 90 }
  ];

  return (
    <Card 
      sx={{ 
        width: '100%',
        mb: isMobile ? 1 : 2,
        border: device.connectionStatus === 'error' ? '2px solid' : '1px solid',
        borderColor: device.connectionStatus === 'error' ? 'error.main' : 'divider'
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* �豸������Ϣ */}
        <div sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <div sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {device.name}
            </Typography>
            
            <div sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {getStatusIcon(device.connectionStatus || 'disconnected')}
              <Chip 
                label={getStatusText(device.connectionStatus || 'disconnected')}
                color={getStatusColor(device.connectionStatus || 'disconnected') as any}
                size="small"
              />
              <Chip 
                label={device.type}
                variant="outlined"
                size="small"
              />
            </div>
            
            {device.location && (
              <Typography variant="body2" color="text.secondary">
                λ��: {device.location}
              </Typography>
            )}
          </div>
          
          {/* չ��/����ť */}
          {(showDetails || metrics.length > 0) && (
            <IconButton
              onClick={() => setExpanded(!expanded)}
              size="small"
              sx={{ ml: 1 }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </div>

        {/* ����״ָ̬�� */}
        {!expanded && (
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {metrics.slice(0, isMobile ? 2 : 4).map((metric, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <div sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {metric.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metric.value}
                  </Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ��ϸ��Ϣ����չ���� */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <div sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              �豸ָ��
            </Typography>
            
            {metrics.map((metric, index) => (
              <div key={index} sx={{ mb: 2 }}>
                <div sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    {metric.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metric.value}
                  </Typography>
                </div>
                <LinearProgress 
                  variant="determinate" 
                  value={metric.progress} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </div>
            ))}

            {device.description && (
              <div sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  �豸����
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {device.description}
                </Typography>
              </div>
            )}

            {/* ���ά��ʱ�� */}
            <div sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                ���ά��: {device.lastMaintenance ? new Date(device.lastMaintenance).toLocaleString() : 'δ��¼'}
              </Typography>
            </div>
          </div>
        </Collapse>
      </CardContent>

      {/* ������ť */}
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              variant="contained"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => onMonitor?.(device.id)}
              disabled={device.connectionStatus === 'offline'}
              fullWidth
            >
              ���
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SettingsIcon />}
              onClick={() => onsettings?.(device.id)}
              fullWidth
            >
              ����
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default MobileDeviceCard;


