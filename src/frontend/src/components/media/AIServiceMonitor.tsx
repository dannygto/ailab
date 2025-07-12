import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  FormControlLabel
} from '@mui/material';
import { CloudIcon, ErrorIcon, CheckCircleIcon as SuccessIcon, WarningIcon, RefreshIcon, TrendingUpIcon, TrendingDownIcon, SettingsIcon } from '../../utils/icons';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  uptime: number;
  errorRate: number;
  lastCheckIcon: Date;
}

interface UsageStatistics {
  speechToText: {
    totalRequests: number;
    avgProcessingTime: number;
    successRate: number;
  };
  ocr: {
    totalRequests: number;
    avgProcessingTime: number;
    successRate: number;
  };
  chartAnalysis: {
    totalRequests: number;
    avgProcessingTime: number;
    successRate: number;
  };
  formulaRecognition: {
    totalRequests: number;
    avgProcessingTime: number;
    successRate: number;
  };
}

interface AIServiceMonitorProps {
  autoRefreshIcon?: boolean;
  RefreshIconInterval?: number;
}

const AIServiceMonitor: React.FC<AIServiceMonitorProps> = ({
  autoRefreshIcon = true,
  RefreshIconInterval = 30000
}) => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStatistics | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRefreshIconEnabled, setAutoRefreshIconEnabled] = useState(autoRefreshIcon);
  const [lastRefreshIcon, setLastRefreshIcon] = useState<Date>(new Date());

  // ����ģ�������ָ��
  const generatePerformanceMetrics = (): PerformanceMetric[] => {
    return [
      {
        name: 'CPUʹ����',
        value: 45 + Math.random() * 30,
        unit: '%',
        status: 'good',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        description: 'AI����CPUʹ�����'
      },
      {
        name: '�ڴ�ʹ����',
        value: 60 + Math.random() * 25,
        unit: '%',
        status: 'warning',
        trend: 'stable',
        description: 'AI�����ڴ�ʹ�����'
      },
      {
        name: 'ƽ����Ӧʱ��',
        value: 150 + Math.random() * 100,
        unit: 'ms',
        status: 'good',
        trend: 'down',
        description: 'AI apiƽ����Ӧʱ��'
      },
      {
        name: 'GPU������',
        value: 75 + Math.random() * 20,
        unit: '%',
        status: 'good',
        trend: 'up',
        description: 'GPU������Դʹ�����'
      },
      {
        name: '���г���',
        value: Math.floor(Math.random() * 10),
        unit: '��',
        status: 'good',
        trend: 'stable',
        description: '��������������'
      },
      {
        name: '������',
        value: Math.random() * 5,
        unit: '%',
        status: Math.random() > 0.7 ? 'warning' : 'good',
        trend: 'down',
        description: '�����������'
      }
    ];
  };

  // ����ģ��ķ���״̬
  const generateServiceStatuses = (): ServiceStatus[] => {
    return [
      {
        name: '����ʶ�����',
        status: Math.random() > 0.1 ? 'online' : 'degraded',
        responseTime: 120 + Math.random() * 80,
        uptime: 99.5 + Math.random() * 0.4,
        errorRate: Math.random() * 2,
        lastCheckIcon: new Date()
      },
      {
        name: 'OCRʶ�����',
        status: Math.random() > 0.05 ? 'online' : 'offline',
        responseTime: 80 + Math.random() * 60,
        uptime: 99.8 + Math.random() * 0.2,
        errorRate: Math.random() * 1.5,
        lastCheckIcon: new Date()
      },
      {
        name: 'ͼ����������',
        status: 'online',
        responseTime: 200 + Math.random() * 150,
        uptime: 99.2 + Math.random() * 0.6,
        errorRate: Math.random() * 3,
        lastCheckIcon: new Date()
      },
      {
        name: '��ʽʶ�����',
        status: Math.random() > 0.15 ? 'online' : 'degraded',
        responseTime: 180 + Math.random() * 120,
        uptime: 99.0 + Math.random() * 0.8,
        errorRate: Math.random() * 2.5,
        lastCheckIcon: new Date()
      }
    ];
  };

  // ����ģ���ʹ��ͳ��
  const generateUsageStats = (): UsageStatistics => {
    return {
      speechToText: {
        totalRequests: 1250 + Math.floor(Math.random() * 500),
        avgProcessingTime: 2.3 + Math.random() * 1.5,
        successRate: 95 + Math.random() * 4
      },
      ocr: {
        totalRequests: 890 + Math.floor(Math.random() * 300),
        avgProcessingTime: 1.8 + Math.random() * 1.2,
        successRate: 97 + Math.random() * 2.5
      },
      chartAnalysis: {
        totalRequests: 420 + Math.floor(Math.random() * 200),
        avgProcessingTime: 3.5 + Math.random() * 2.0,
        successRate: 92 + Math.random() * 6
      },
      formulaRecognition: {
        totalRequests: 310 + Math.floor(Math.random() * 150),
        avgProcessingTime: 2.8 + Math.random() * 1.8,
        successRate: 94 + Math.random() * 5
      }
    };
  };

  // ˢ������
  const RefreshIconData = useCallback(() => {
    setPerformanceMetrics(generatePerformanceMetrics());
    setServiceStatuses(generateServiceStatuses());
    setUsageStats(generateUsageStats());
    setLastRefreshIcon(new Date());
  }, []);

  // ��ʼ������
  useEffect(() => {
    RefreshIconData();
  }, [RefreshIconData]);

  // �Զ�ˢ��
  useEffect(() => {
    if (!autoRefreshIconEnabled) return;

    const interval = setInterval(RefreshIconData, RefreshIconInterval);
    return () => clearInterval(interval);
  }, [autoRefreshIconEnabled, RefreshIconInterval, RefreshIconData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'good':
        return 'success';
      case 'warning':
      case 'degraded':
        return 'warning';
      case 'critical':
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getServiceIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <SuccessIcon color="success" />;
      case 'degraded':
        return <WarningIcon color="warning" />;
      case 'offline':
        return <ErrorIcon color="error" />;
      default:
        return <CloudIcon />;
    }
  };

  return (
    <div>
      {/* ͷ�������� */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">AI������</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              ������: {lastRefreshIcon.toLocaleTimeString()}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefreshIconEnabled}
                  onChange={(e) => setAutoRefreshIconEnabled(e.target.checked)}
                />
              }
              label="�Զ�ˢ��"
            />
            <Button
              variant="outlined"
              onClick={() => setShowDetails(true)}
              startIcon={<SettingsIcon />}
            >
              ��ϸ��Ϣ
            </Button>
            <IconButton onClick={RefreshIconData} title="�ֶ�ˢ��">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* ����ָ�꿨Ƭ */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {performanceMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {metric.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getTrendIcon(metric.trend)}
                    <Chip 
                      label={metric.status} 
                      color={getStatusColor(metric.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Typography variant="h4" component="div" color="primary">
                  {metric.value.toFixed(1)} {metric.unit}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.description}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(metric.value, 100)} 
                  sx={{ mt: 1 }}
                  color={getStatusColor(metric.status) as any}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ����״̬ */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>����״̬</Typography>
        <List>
          {serviceStatuses.map((service, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {getServiceIcon(service.status)}
              </ListItemIcon>
              <ListItemText
                primary={service.name}
                secondary={
                  <div>
                    <Typography variant="body2" component="span">
                      ��Ӧʱ��: {service.responseTime.toFixed(0)}ms | 
                      ��������ʱ��: {service.uptime.toFixed(2)}% | 
                      ������: {service.errorRate.toFixed(2)}%
                    </Typography>
                  </div>
                }
              />
              <Chip 
                label={service.status} 
                color={getStatusColor(service.status) as any}
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* ʹ��ͳ�Ƹ��� */}
      {usageStats && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>ʹ��ͳ�� (����)</Typography>
          <Grid container spacing={2}>
            {Object.entries(usageStats).map(([key, stats]) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {key === 'speechToText' ? '����ʶ��' :
                       key === 'ocr' ? 'OCRʶ��' :
                       key === 'chartAnalysis' ? 'ͼ������' : '��ʽʶ��'}
                    </Typography>
                    <Typography variant="h6">
                      {stats.totalRequests} ��
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ƽ������ʱ��: {stats.avgProcessingTime.toFixed(1)}s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      �ɹ���: {stats.successRate.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ��ϸ��Ϣ�Ի��� */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="lg" fullWidth>
        <DialogTitle>��ϸ�����Ϣ</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>ʵʱ����ָ��</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ָ������</TableCell>
                  <TableCell>��ǰֵ</TableCell>
                  <TableCell>״̬</TableCell>
                  <TableCell>����</TableCell>
                  <TableCell>����</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceMetrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell>{metric.value.toFixed(1)} {metric.unit}</TableCell>
                    <TableCell>
                      <Chip 
                        label={metric.status} 
                        color={getStatusColor(metric.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getTrendIcon(metric.trend)}</TableCell>
                    <TableCell>{metric.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <div>
            <Typography variant="h6" gutterBottom>���񽡿�״̬</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>��������</TableCell>
                  <TableCell>״̬</TableCell>
                  <TableCell>��Ӧʱ��</TableCell>
                  <TableCell>��������ʱ��</TableCell>
                  <TableCell>������</TableCell>
                  <TableCell>�����</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serviceStatuses.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={service.status} 
                        color={getStatusColor(service.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{service.responseTime.toFixed(0)}ms</TableCell>
                    <TableCell>{service.uptime.toFixed(2)}%</TableCell>
                    <TableCell>{service.errorRate.toFixed(2)}%</TableCell>
                    <TableCell>{service.lastCheckIcon.toLocaleTimeString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>�ر�</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AIServiceMonitor;


