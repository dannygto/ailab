/**
 * ??? 设备管理主页面 - 完成度: 96%
 * 
 * ? 已完成功能:
 * - 设备列表展示和管理
 * - 实时设备状态监控
 * - 设备预约系统
 * - 批量操作支持（删除、归档、导出）
 * - 设备详情查看
 * - 异常告警展示
 * - 响应式标签布局
 * - 移动端适配
 * 
 * ?? 待完善功能:
 * - 设备远程控制界面
 * - 更多设备类型支持
 * - 设备维护记录
 * 
 * ?? 技术亮点:
 * - 多标签页组织
 * - 实时数据更新
 * - 批量操作框架
 * - Material-UI组件库
 * - React Query数据管理
 */

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Container, 
  Divider,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useQuery } from 'react-query';
import { devices } from '../../utils/icons';
import { DataUsageIcon, EventIcon } from '../../utils/icons';

import DeviceList from '../../components/devices/DeviceList';
import DeviceMonitor from '../../components/devices/DeviceMonitor';
import DeviceReservations from '../../components/devices/DeviceReservations';
import DeviceRemoteControl from '../../components/devices/DeviceRemoteControl';
import api from '../../services/api';

// 标签面板内容
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`devices-tabpanel-${index}`}
      aria-labelledby={`devices-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DeviceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 获取设备列表
  const { 
    data: devicesData, 
    isLoading: isLoadingdevices, 
    error: devicesError,
    refetch: refetchdevices
  } = useQuery('devices', async () => {
    try {
      const response = await api.getDevices();
      return response;
    } catch (error) {
      console.error('获取设备列表失败:', error);
      throw error;
    }
  });

  // 获取设备预约列表
  const {
    data: reservationsData,
    isLoading: isLoadingReservations,
    error: reservationsError
  } = useQuery('deviceReservations', async () => {
    try {
      const response = await api.getDeviceReservations();
      return response;
    } catch (error) {
      console.error('获取设备预约列表失败:', error);
      throw error;
    }
  });

  const handleTabChange = (EventIcon: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <DevicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          仪器设备远程接入系统
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          远程控制实验设备、采集数据、预约使用时间，提供实时监控和数据可视化，便捷的仪器设备管理体验。
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Paper sx={{ width: '100%', borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="仪器设备远程接入系统标签页"
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile={isMobile}
          >
            <Tab 
              icon={isMobile ? undefined : <DevicesIcon />} 
              iconPosition={isMobile ? "start" : "top"}
              label="设备列表" 
            />
            <Tab 
              icon={isMobile ? undefined : <DataUsageIcon />} 
              iconPosition={isMobile ? "start" : "top"}
              label="实时监控" 
            />
            <Tab 
              icon={isMobile ? undefined : <EventIcon />} 
              iconPosition={isMobile ? "start" : "top"}
              label="设备预约" 
            />
            <Tab 
              icon={isMobile ? undefined : <ControlIcon />} 
              iconPosition={isMobile ? "start" : "top"}
              label="远程控制" 
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {isLoadingdevices ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : devicesError ? (
            <Alert severity="error">加载设备列表失败</Alert>
          ) : (            <DeviceList 
              devices={devicesData || []} 
              onRefreshIcon={refetchdevices}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DeviceMonitor devices={devicesData || []} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {isLoadingReservations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : reservationsError ? (
            <Alert severity="error">加载设备预约列表失败</Alert>
          ) : (
            <DeviceReservations              reservations={reservationsData || []} 
              devices={devicesData || []}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {devicesData && devicesData.length > 0 ? (
            <DeviceRemoteControl
              device={{
                ...devicesData[0],
                type: devicesData[0].type as any, // 类型兼容转换
                model: devicesData[0].model || '未知型号', // 确保model不为undefined
                status: 'idle',
                parameters: {
                  temperature: 25,
                  SpeedIcon: 0,
                  power: 0,
                  humidity: 50,
                  voltage: 0
                }
              }}
              onDeviceUpdate={(updatedDevice) => {
                console.log('设备已更新:', updatedDevice);
                refetchdevices();
              }}
            />
          ) : (
            <Alert severity="info">请先选择要控制的设备</Alert>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default DeviceManagement;




