import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { useQuery } from 'react-query';
import api from '../../services/api';
import DeviceList from '../../components/devices/DeviceList';
import DeviceReservations from '../../components/devices/DeviceReservations';
import DeviceRemoteControl from '../../components/devices/DeviceRemoteControl';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`device-tabpanel-${index}`}
      aria-labelledby={`device-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const DeviceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const {
    data: devicesData,
    isLoading: devicesLoading,
    error: devicesError
  } = useQuery('devices', async () => {
    try {
      const response = await api.getDevices();
      return response.data || [];
    } catch (error) {
      console.error('获取设备列表失败:', error);
      return [];
    }
  });

  const {
    data: reservationsData,
    isLoading: reservationsLoading,
    error: reservationsError
  } = useQuery('deviceReservations', async () => {
    try {
      const response = await api.getDeviceReservations();
      return response.data || [];
    } catch (error) {
      console.error('获取设备预约列表失败:', error);
      return [];
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          设备管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理实验设备、预约和远程控制
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="设备管理标签页"
          >
            <Tab label="设备列表" />
            <Tab label="设备预约" />
            <Tab label="远程控制" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box>
            {devicesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                获取设备列表失败，请重试
              </Alert>
            )}
            <DeviceList 
              devices={devicesData || []} 
              loading={devicesLoading}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            {reservationsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                获取预约列表失败，请重试
              </Alert>
            )}
            <DeviceReservations 
              reservations={reservationsData || []} 
              loading={reservationsLoading}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box>
            {devicesData && devicesData.length > 0 ? (
              <DeviceRemoteControl devices={devicesData} />
            ) : (
              <Alert severity="info">请先选择要控制的设备</Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default DeviceManagement;
