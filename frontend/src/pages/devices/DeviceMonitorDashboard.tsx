import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert, 
  Paper, 
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RefreshIcon } from '../../utils/icons';
import { FullscreenIcon } from '../../utils/icons';
import { DownloadIcon } from '../../utils/icons';
import { settings } from '../../utils/icons';

// �����Զ������
import DeviceStatusCard from '../../components/domain/devices/DeviceStatusCard';

// ģ���豸���ݷ���
const deviceservice = {
  getdevicesSummary: async () => {
    // ģ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: 32,
          online: 24,
          offline: 5,
          warning: 2,
          maintenance: 1,
          byType: {
            camera: 12,
            sensor: 15,
            control: 5
          },
          recentActivity: [
            { id: 1, device: '����ͷ-A103', Event: '״̬�ı�', details: '�����߱�Ϊ����', timestamp: new Date(Date.now() - 120000) },
            { id: 2, device: '������-B207', Event: '���津��', details: '�¶ȳ�����ֵ', timestamp: new Date(Date.now() - 1800000) },
            { id: 3, device: '������-C302', Event: 'ά����ʼ', details: '�ƻ���ά��', timestamp: new Date(Date.now() - 3600000) }
          ]
        });
      }, 800);
    });
  },
  
  getSystemMetrics: async (timeRange: string) => {
    // ģ��ϵͳ��ָ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        // ���������ʷ����
        const now = new Date();
        let points = 24;
        let interval = 3600000; // 1Сʱ
        
        if (timeRange === '24h') {
          points = 24;
          interval = 3600000;
        } else if (timeRange === '7d') {
          points = 7;
          interval = 86400000; // 1��
        } else if (timeRange === '30d') {
          points = 30;
          interval = 86400000;
        }
        
        const deviceAvailability = [];
        const networkLatency = [];
        const errorRates = [];
        
        for (let i = points - 1; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * interval);
          
          deviceAvailability.push({
            timestamp,
            value: 90 + Math.floor(Math.random() * 10) // 90-100%
          });
          
          networkLatency.push({
            timestamp,
            value: 50 + Math.floor(Math.random() * 100) // 50-150ms
          });
          
          errorRates.push({
            timestamp,
            value: Math.floor(Math.random() * 5) // 0-5%
          });
        }
        
        resolve({
          deviceAvailability,
          networkLatency,
          errorRates
        });
      }, 1000);
    });
  }
};

/**
 * �豸����Ǳ������
 * �ṩϵͳ���豸��غ�ͳ����Ϣ���Ǳ���
 */
const DeviceMonitorDashboard: React.FC = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState<any>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [RefreshIconing, setRefreshIconing] = useState<boolean>(false);

  // ��ȡ�Ǳ�������
  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshIconing(true);
      const summaryData = await deviceservice.getdevicesSummary();
      const metricsData = await deviceservice.getSystemMetrics(timeRange);
      
      setSummary(summaryData);
      setSystemMetrics(metricsData);
      
      if (loading) setLoading(false);
      setRefreshIconing(false);
    } catch (err) {
      setError('�޷������Ǳ������ݣ����Ժ�����');
      setLoading(false);
      setRefreshIconing(false);
    }
  }, [timeRange, loading]);

  useEffect(() => {
    fetchDashboardData();
    
    // ���ö�ʱˢ��
    const RefreshIconInterval = setInterval(fetchDashboardData, 300000); // ÿ5����ˢ��һ��
    
    return () => clearInterval(RefreshIconInterval);
  }, [timeRange, fetchDashboardData]);

  const handleRefreshIcon = () => {
    fetchDashboardData();
  };

  const handleTimeRangeChange = (Event: SelectChangeEvent<string>) => {
    setTimeRange(Event.target.value);
  };

  // �豸״̬�ֲ�����
  const statusDistribution = useMemo(() => {
    if (!summary) return [];
    
    return [
      { id: 'online', label: '����', value: summary.online, color: theme.palette.success.main },
      { id: 'offline', label: '����', value: summary.offline, color: theme.palette.error.main },
      { id: 'warning', label: '����', value: summary.warning, color: theme.palette.warning.main },
      { id: 'maintenance', label: 'ά��', value: summary.maintenance, color: theme.palette.info.main }
    ];
  }, [summary, theme]);

  if (loading) {
    return (
      <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div sx={{ p: 3 }}>
      <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          �豸����Ǳ���
        </Typography>
        <div sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="time-range-LabelIcon">ʱ�䷶Χ</InputLabel>
            <Select
              labelId="time-range-LabelIcon"
              value={timeRange}
              label="ʱ�䷶Χ"
              onChange={handleTimeRangeChange}
              size="small"
            >
              <MenuItem value="24h">24Сʱ</MenuItem>
              <MenuItem value="7d">7��</MenuItem>
              <MenuItem value="30d">30��</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="ˢ������">
            <IconButton onClick={handleRefreshIcon} disabled={RefreshIconing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="����">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* �豸״̬������Ƭ */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                �����豸
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary?.online || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                �� {summary?.total || 0} ̨�豸
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                �����豸
              </Typography>
              <Typography variant="h4" color="error.main">
                {summary?.offline || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                �� {summary?.total || 0} ̨�豸
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                �����豸
              </Typography>
              <Typography variant="h4" color="warning.main">
                {summary?.warning || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                �� {summary?.total || 0} ̨�豸
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ά�����豸
              </Typography>
              <Typography variant="h4" color="info.main">
                {summary?.maintenance || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                �� {summary?.total || 0} ̨�豸
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ϵͳ��ָ�� */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            ϵͳ����ָ��
          </Typography>
          <div>
            <Tooltip title="ȫ���鿴">
              <IconButton size="small">
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="��������">
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  �豸������
                </Typography>
                <div sx={{ height: 200 }}>
                  {systemMetrics && (
                    <div sx={{ 
                      p: 1, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Typography variant="h3" color="success.main">
                        {systemMetrics.deviceAvailability[systemMetrics.deviceAvailability.length - 1].value}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {timeRange === '24h' ? '��ȥ24Сʱ' : timeRange === '7d' ? '��ȥ7��' : '��ȥ30��'}ƽ��������
                      </Typography>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  �����ӳ�
                </Typography>
                <div sx={{ height: 200 }}>
                  {systemMetrics && (
                    <div sx={{ 
                      p: 1, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Typography variant="h3" color={
                        systemMetrics.networkLatency[systemMetrics.networkLatency.length - 1].value < 80 
                          ? 'success.main' 
                          : systemMetrics.networkLatency[systemMetrics.networkLatency.length - 1].value < 120 
                            ? 'warning.main' 
                            : 'error.main'
                      }>
                        {systemMetrics.networkLatency[systemMetrics.networkLatency.length - 1].value}ms
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ��ǰƽ�������ӳ�
                      </Typography>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ������
                </Typography>
                <div sx={{ height: 200 }}>
                  {systemMetrics && (
                    <div sx={{ 
                      p: 1, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Typography variant="h3" color={
                        systemMetrics.errorRates[systemMetrics.errorRates.length - 1].value < 1 
                          ? 'success.main' 
                          : systemMetrics.errorRates[systemMetrics.errorRates.length - 1].value < 3 
                            ? 'warning.main' 
                            : 'error.main'
                      }>
                        {systemMetrics.errorRates[systemMetrics.errorRates.length - 1].value}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ��ǰϵͳ������
                      </Typography>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* �豸״̬�ֲ������� */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              �豸״̬�ֲ�
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <div sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* ����Ӧ����һ����ͼ����Ϊ�˼��������ı�չʾ */}
              <div>
                {statusDistribution.map((item) => (
                  <div key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <div 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: item.color,
                        mr: 1
                      }} 
                    />
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {item.label}:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {item.value} ({((item.value / summary.total) * 100).toFixed(1)}%)
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              ����豸�
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {summary && summary.recentActivity.length > 0 ? (
              <div>
                {summary.recentActivity.map((activity: any) => (
                  <div 
                    key={activity.id} 
                    sx={{ 
                      p: 1.5, 
                      mb: 1, 
                      borderLeft: `4px solid ${
                        activity.Event.includes('����') 
                          ? theme.palette.warning.main 
                          : activity.Event.includes('����') 
                            ? theme.palette.error.main 
                            : activity.Event.includes('����') 
                              ? theme.palette.success.main 
                              : theme.palette.info.main
                      }`,
                      '&:hover': { 
                        bgcolor: 'action.hover' 
                      }
                    }}
                  >
                    <Typography variant="subtitle2">
                      {activity.device} - {activity.Event}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.details}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  </div>
                ))}
              </div>
            ) : (
              <div sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  û��������豸�
                </Typography>
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default DeviceMonitorDashboard;


