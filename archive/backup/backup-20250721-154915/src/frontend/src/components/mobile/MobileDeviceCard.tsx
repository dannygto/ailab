import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  LinearProgress,
  Button,
  Grid
} from '@mui/material';
import { ExpandMoreIcon, ExpandLessIcon, PowerIcon, SettingsIcon } from '../../utils/icons';

interface DeviceMetric {
  name: string;
  value: number;
  unit: string;
  color: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  location: string;
  description?: string;
  metrics: DeviceMetric[];
  lastUpdate: Date;
}

interface MobileDeviceCardProps {
  device: Device;
  onControl?: (deviceId: string, action: string) => void;
  onConfigure?: (deviceId: string) => void;
}

const MobileDeviceCard: React.FC<MobileDeviceCardProps> = ({
  device,
  onControl,
  onConfigure
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return '在线';
      case 'offline': return '离线';
      case 'maintenance': return '维护中';
      default: return '未知';
    }
  };

  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" noWrap>
              {device.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {device.type} · {device.location}
            </Typography>
          </Box>
          
          <Chip
            label={getStatusLabel(device.status)}
            color={getStatusColor(device.status) as any}
            size="small"
          />
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {device.metrics.map((metric, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    {metric.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metric.value} {metric.unit}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={metric.value}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}

            {device.description && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  设备描述
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {device.description}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            最后更新: {device.lastUpdate.toLocaleString()}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            aria-label="展开详情"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PowerIcon />}
              onClick={() => onControl?.(device.id, 'toggle')}
              disabled={device.status === 'maintenance'}
              fullWidth
            >
              {device.status === 'online' ? '关闭' : '开启'}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => onConfigure?.(device.id)}
              fullWidth
            >
              配置
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default MobileDeviceCard;
