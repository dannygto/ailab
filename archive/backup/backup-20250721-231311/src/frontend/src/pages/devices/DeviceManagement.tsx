import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import {
  PlayCircleOutline as DemoIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DeviceList from '../../components/devices/DeviceList';
import DeviceReservations from '../../components/devices/DeviceReservations';
import DeviceRemoteControl from '../../components/devices/DeviceRemoteControl';
import DataSourceManagement from './DataSourceManagement';
import { DeviceStatus } from '../../types/devices';

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
  const navigate = useNavigate();

  const {
    data: devicesData,
    isLoading: devicesLoading,
    error: devicesError
  } = useQuery('devices', async () => {
    try {
      const response = await api.getdevices();
      return response || [];
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
      return response || [];
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            设备管理
          </Typography>
          <Typography variant="body1" color="text.secondary">
            管理实验设备、预约和远程控制
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DemoIcon />}
          onClick={() => navigate('/demo/device-flow')}
          sx={{ height: 'fit-content' }}
        >
          查看流程演示
        </Button>
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
            <Tab label="数据源配置" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <div>
            {(devicesError as Error | null) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                获取设备列表失败，请重试
              </Alert>
            )}
            <DeviceList 
              devices={devicesData || []} 
              loading={devicesLoading}
            />
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div>
            {(reservationsError as Error | null) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                获取预约列表失败，请重试
              </Alert>
            )}
            {reservationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <DeviceReservations 
                devices={devicesData || []}
                reservations={reservationsData || []} 
              />
            )}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div>
            {devicesData && devicesData.length > 0 ? (
              <DeviceRemoteControl 
                device={{
                  ...devicesData[0],
                  status: devicesData[0].status === DeviceStatus.ONLINE ? DeviceStatus.RUNNING : 
                          devicesData[0].status === DeviceStatus.OFFLINE ? DeviceStatus.IDLE : 
                          devicesData[0].status || DeviceStatus.IDLE
                }} 
              />
            ) : (
              <Alert severity="info">请先选择要控制的设备</Alert>
            )}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div>
            <DataSourceManagement />
          </div>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default DeviceManagement;
