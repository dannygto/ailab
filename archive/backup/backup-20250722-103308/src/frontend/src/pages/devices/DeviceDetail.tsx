import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import {
  Memory as MemoryIcon,
  NetworkWifi as NetworkIcon,
  Sensors as SensorsIcon,
  BatteryChargingFull as BatteryIcon,
  SignalCellularAlt as SignalIcon,
  History as HistoryIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  SettingsRemote as RemoteIcon,
  CenterFocusStrong as CalibrationIcon,
  Assignment as AssignmentIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../services/api';
import { Device, DeviceDataPoint, DeviceStatus, DeviceConnectionStatus } from '../../types/devices';
import { StatusBadge } from '../../components/common/StatusBadge';
import DeviceActivityTimeline from '../../components/devices/DeviceActivityTimeline';
import DeviceDataChart from '../../components/devices/DeviceDataChart';
import DeviceRemoteControl from '../../components/devices/DeviceRemoteControl';
import LoadingState from '../../components/common/LoadingState';

/**
 * 设备详情页面
 * 显示设备的详细信息、状态、日志和控制功能
 */
const DeviceDetail: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<Device | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (!deviceId) return;

    const fetchDeviceDetails = async () => {
      setLoading(true);
      try {
        const deviceData = await api.getDeviceById(deviceId);
        setDevice(deviceData);

        // 获取设备数据点
        const dataPoints = await api.getDeviceDataPoints(deviceId, {
          limit: 100,
          timeRange: '24h'
        });
        setDeviceData(dataPoints);

        setError(null);
      } catch (err) {
        setError('无法加载设备详情');
        toast.error('加载设备详情失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceDetails();
  }, [deviceId]);

  const fetchDeviceLogs = async () => {
    if (!deviceId) return;

    setLoadingLogs(true);
    try {
      const logs = await api.getDeviceActivityLogs(deviceId);
      setActivityLogs(logs);
    } catch (err) {
      toast.error('加载设备日志失败');
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 2) {
      fetchDeviceLogs();
    }
  }, [activeTab, deviceId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <LoadingState message="加载设备详情..." />;
  }

  if (error || !device) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || '设备不存在'}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/devices')}>
            返回设备列表
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <IconButton onClick={() => navigate('/devices')}>
              <ArrowBackIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h4">
              {device.name}
            </Typography>
          </Grid>
          <Grid item>
            <StatusBadge status={device.status} />
          </Grid>
          <Grid item xs />
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RemoteIcon />}
              onClick={() => setActiveTab(3)}
            >
              远程控制
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="基本信息" />
          <Tab label="数据监控" />
          <Tab label="活动日志" />
          <Tab label="远程控制" />
        </Tabs>
      </Box>

      {/* 基本信息 */}
      <Box hidden={activeTab !== 0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="设备信息" />
              <Divider />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon><InfoIcon /></ListItemIcon>
                    <ListItemText primary="设备类型" secondary={device.type} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><BuildIcon /></ListItemIcon>
                    <ListItemText primary="设备型号" secondary={device.model} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><MemoryIcon /></ListItemIcon>
                    <ListItemText primary="序列号" secondary={device.serialNumber} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><TimeIcon /></ListItemIcon>
                    <ListItemText
                      primary="添加时间"
                      secondary={format(new Date(device.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationIcon /></ListItemIcon>
                    <ListItemText primary="位置" secondary={device.location || '未指定'} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="状态信息" />
              <Divider />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemIcon><SignalIcon /></ListItemIcon>
                    <ListItemText
                      primary="连接状态"
                      secondary={
                        <Chip
                          size="small"
                          label={device.connectionStatus === DeviceConnectionStatus.ONLINE ? '在线' : '离线'}
                          color={device.connectionStatus === DeviceConnectionStatus.ONLINE ? 'success' : 'error'}
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><BatteryIcon /></ListItemIcon>
                    <ListItemText
                      primary="电池状态"
                      secondary={`${device.batteryLevel || 'N/A'}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SensorsIcon /></ListItemIcon>
                    <ListItemText
                      primary="传感器状态"
                      secondary={device.sensorStatus || '正常'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><NetworkIcon /></ListItemIcon>
                    <ListItemText
                      primary="网络连接"
                      secondary={device.networkType || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><TimeIcon /></ListItemIcon>
                    <ListItemText
                      primary="最后活动时间"
                      secondary={format(new Date(device.lastActiveTime), 'yyyy-MM-dd HH:mm:ss')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="设备描述"
                action={
                  <Button startIcon={<EditIcon />} size="small">
                    编辑
                  </Button>
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {device.description || '没有提供设备描述'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader title="维护信息" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      上次维护
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {device.lastMaintenance ?
                        format(new Date(device.lastMaintenance), 'yyyy-MM-dd') :
                        '无记录'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      下次维护
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {device.nextMaintenance ?
                        format(new Date(device.nextMaintenance), 'yyyy-MM-dd') :
                        '未安排'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button startIcon={<CalibrationIcon />} variant="outlined" fullWidth>
                      安排维护
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* 数据监控 */}
      <Box hidden={activeTab !== 1}>
        <Card>
          <CardHeader
            title="设备数据"
            action={
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => {
                  // 刷新数据逻辑
                }}
              >
                刷新
              </Button>
            }
          />
          <Divider />
          <CardContent>
            {deviceData.length > 0 ? (
              <DeviceDataChart data={deviceData} />
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  没有可用的设备数据
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* 活动日志 */}
      <Box hidden={activeTab !== 2}>
        <Card>
          <CardHeader
            title="设备活动日志"
            action={
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchDeviceLogs}
                disabled={loadingLogs}
              >
                刷新
              </Button>
            }
          />
          <Divider />
          <CardContent>
            {loadingLogs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : activityLogs.length > 0 ? (
              <DeviceActivityTimeline logs={activityLogs} />
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  没有设备活动日志
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* 远程控制 */}
      <Box hidden={activeTab !== 3}>
        <Card>
          <CardHeader title="设备远程控制" />
          <Divider />
          <CardContent>
            {device.connectionStatus === DeviceConnectionStatus.ONLINE ? (
              <DeviceRemoteControl device={device} />
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="error">
                  设备当前离线，无法进行远程控制
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    // 尝试重新连接
                    toast.info('正在尝试连接设备...');
                  }}
                >
                  尝试连接
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default DeviceDetail;
