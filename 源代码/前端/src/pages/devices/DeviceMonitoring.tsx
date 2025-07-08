import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert, 
  Paper, 
  Tabs, 
  Tab, 
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// ��������һ��api����
const deviceservice = {
  getdevices: async () => {
    // ģ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: '�豸A', status: 'online', type: 'camera', lastPing: new Date() },
          { id: 2, name: '�豸B', status: 'offline', type: 'sensor', lastPing: new Date(Date.now() - 86400000) },
          { id: 3, name: '�豸C', status: 'warning', type: 'camera', lastPing: new Date() },
          { id: 4, name: '�豸D', status: 'online', type: 'control', lastPing: new Date() }
        ]);
      }, 1000);
    });
  }
};

/**
 * �豸���ҳ�����
 * ���ڼ��ϵͳ�������豸��״̬������ָ��
 */
const DeviceMonitoring: React.FC = () => {
  const theme = useTheme();
  const [DevicesIcon, setdevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchdevices = async () => {
      try {
        setLoading(true);
        const data = await deviceservice.getdevices();
        setdevices(data as any[]);
        setLoading(false);
      } catch (err) {
        setError('�޷������豸���ݣ����Ժ�����');
        setLoading(false);
      }
    };

    fetchdevices();
    
    // ���ö�ʱˢ��
    const refreshInterval = setInterval(fetchdevices, 30000); // ÿ30��ˢ��һ��
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        �豸�������
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        ʵʱ���ϵͳ�������豸��״̬�����ܺͽ���ָ��
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="�豸����" />
          <Tab label="���ܼ��" />
          <Tab label="�澯����" />
        </Tabs>
        <Divider />

        {/* �豸���� */}
        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  �豸״̬����
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1
                }}>
                  <Typography>
                    �˴�������DeviceStatusCard�����չʾ�豸״̬
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ���ܼ�� */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              �豸����ָ��
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1
            }}>
              <Typography>
                �˴�������DeviceMetricsChart�����չʾ�豸����ָ��
              </Typography>
            </Box>
          </Box>
        )}

        {/* �澯���� */}
        {tabValue === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              �豸�澯��Ϣ
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              ��ǰû�л�Ծ���豸�澯
            </Alert>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" gutterBottom>
        �豸�б�
      </Typography>
      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} md={6} lg={4} key={device.id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{device.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                ����: {device.type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ״̬: {device.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ���ͨ��: {device.lastPing.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DeviceMonitoring;

