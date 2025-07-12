import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { SearchIcon, RefreshIcon, MoreVertIcon, AddIcon } from '../../utils/icons';
import { Device, DeviceConnectionStatus, DeviceType, DataSourceType, DeviceStatus } from '../../types/devices';
import BatchOperations from '../common/BatchOperations';
import { toast } from 'react-hot-toast';

interface DeviceListProps {
  devices: Device[];
  loading?: boolean;
  onRefreshIcon?: () => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, loading, onRefreshIcon }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selecteddevices, setSelecteddevices] = useState<string[]>([]);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [newDeviceForm, setNewDeviceForm] = useState({
    name: '',
    type: DeviceType.SENSOR,
    model: '',
    manufacturer: '',
    location: '',
    description: '',
    dataSourceType: DataSourceType.USB
  });
  // 过滤搜索设备
  const filtereddevices = devices.filter(device => 
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(device.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (device.model && device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (device.manufacturer && device.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (device.location && device.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenDetails = (device: Device) => {
    setSelectedDevice(device);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  // 批量操作处理
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelecteddevices(filtereddevices.map(device => device.id));
    } else {
      setSelecteddevices([]);
    }
  };

  const handleClearSelection = () => {
    setSelecteddevices([]);
  };

  const handledeviceselect = (deviceId: string, selected: boolean) => {
    if (selected) {
      setSelecteddevices(prev => [...prev, deviceId]);
    } else {
      setSelecteddevices(prev => prev.filter(id => id !== deviceId));
    }
  };

  const handleBatchDelete = async (deviceIds: string[]) => {
    console.log('批量删除设备:', deviceIds);
    // 这里应该调用api删除设备
    setSelecteddevices([]);
    onRefreshIcon?.();
  };

  const handleBatchArchive = async (deviceIds: string[]) => {
    console.log('批量归档设备:', deviceIds);
    // 这里应该调用api归档设备
    setSelecteddevices([]);
    onRefreshIcon?.();
  };

  const handleBatchTag = async (deviceIds: string[], tags: string[]) => {
    console.log('批量添加标签:', deviceIds, tags);
    // 这里应该调用api为设备添加标签
    setSelecteddevices([]);
    onRefreshIcon?.();
  };

  const handleBatchExport = async (deviceIds: string[], format: string) => {
    console.log('批量导出设备:', deviceIds, format);
    // 这里应调用相应api导出设备数据
  };

  // 处理添加设备
  const handleAddDevice = () => {
    setAddDeviceOpen(true);
  };

  const handleCloseAddDevice = () => {
    setAddDeviceOpen(false);
    setNewDeviceForm({
      name: '',
      type: DeviceType.SENSOR,
      model: '',
      manufacturer: '',
      location: '',
      description: '',
      dataSourceType: DataSourceType.USB
    });
  };

  const handleSaveDevice = async () => {
    try {
      // 验证表单
      if (!newDeviceForm.name.trim()) {
        toast.error('请输入设备名称');
        return;
      }

      // 创建新设备数据
      const newDevice: Partial<Device> = {
        id: `device_${Date.now()}`, // 临时ID，实际应由后端生成
        name: newDeviceForm.name,
        type: newDeviceForm.type,
        model: newDeviceForm.model,
        manufacturer: newDeviceForm.manufacturer,
        location: newDeviceForm.location,
        description: newDeviceForm.description,
        status: DeviceStatus.OFFLINE,
        connectionStatus: DeviceConnectionStatus.OFFLINE,
        lastSeen: new Date(),
        metadata: {
          dataSourceType: newDeviceForm.dataSourceType,
          isActive: true
        }
      };

      console.log('创建新设备:', newDevice);
      
      // 这里应该调用API创建设备
      // await api.createDevice(newDevice);
      
      toast.success(`设备 "${newDeviceForm.name}" 添加成功！接下来请配置数据源`);
      handleCloseAddDevice();
      onRefreshIcon?.();
      
      // 提示用户配置数据源
      setTimeout(() => {
        toast(`请前往"数据源配置"标签页为设备 "${newDeviceForm.name}" 配置${getDataSourceTypeLabel(newDeviceForm.dataSourceType)}数据源`, {
          duration: 5000,
          icon: '🔧'
        });
      }, 1000);
      
    } catch (error) {
      console.error('添加设备失败:', error);
      toast.error('添加设备失败，请稍后重试');
    }
  };

  const getDataSourceTypeLabel = (type: DataSourceType): string => {
    switch (type) {
      case DataSourceType.USB: return 'USB串口';
      case DataSourceType.MQTT: return 'MQTT';
      case DataSourceType.MODBUS_RTU: return 'Modbus RTU';
      case DataSourceType.MODBUS_TCP: return 'Modbus TCP';
      case DataSourceType.HTTP_API: return 'HTTP API';
      case DataSourceType.DATABASE: return '数据库';
      default: return '未知';
    }
  };

  const getStatusColor = (status?: DeviceConnectionStatus | string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (!status) return 'default';
    switch (status) {
      case DeviceConnectionStatus.ONLINE:
      case 'online':
      case 'connected':
        return 'success';
      case DeviceConnectionStatus.CONNECTING:
      case 'reconnecting':
        return 'info';
      case DeviceConnectionStatus.OFFLINE:
      case 'offline':
      case 'disconnected':
        return 'default';
      case DeviceConnectionStatus.ERROR:
      case 'error':
        return 'error';
      case DeviceConnectionStatus.MAINTENANCE:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: DeviceConnectionStatus | string): string => {
    if (!status) return '未知';
    switch (status) {
      case DeviceConnectionStatus.ONLINE:
      case 'online':
      case 'connected':
        return '在线';
      case DeviceConnectionStatus.CONNECTING:
      case 'reconnecting':
        return '连接中';
      case DeviceConnectionStatus.OFFLINE:
      case 'offline':
      case 'disconnected':
        return '离线';
      case DeviceConnectionStatus.ERROR:
      case 'error':
        return '错误';
      case DeviceConnectionStatus.MAINTENANCE:
        return '维护中';
      default:
        return '未知';
    }
  };

  const getDeviceTypeIcon = (type: DeviceType | string): string => {
    switch (type) {
      case DeviceType.SENSOR:
      case 'sensor':
        return '??';
      case DeviceType.METER:
      case 'meter':
        return '??';
      case DeviceType.MICROSCOPE:
      case 'microscope':
        return '??';
      case DeviceType.SPECTROSCOPE:
      case 'spectroscope':
        return '??';
      case DeviceType.DATALOGGER:
      case 'datalogger':
        return '??';
      case DeviceType.CAMERA:
      case 'camera':
        return '??';
      case DeviceType.CONTROL_UNIT:
      case 'control_unit':
        return '??';
      case DeviceType.OTHER:
      case 'other':
        return '??';
      default:
        return '??';
    }
  };

  const getDeviceTypeLabel = (type: DeviceType | string): string => {
    switch (type) {
      case DeviceType.SENSOR:
      case 'sensor':
        return '传感器';
      case DeviceType.METER:
      case 'meter':
        return '测量仪';
      case DeviceType.MICROSCOPE:
      case 'microscope':
        return '显微镜';
      case DeviceType.SPECTROSCOPE:
      case 'spectroscope':
        return '光谱仪';
      case DeviceType.DATALOGGER:
      case 'datalogger':
        return '数据采集器';
      case DeviceType.CAMERA:
      case 'camera':
        return '摄像设备';
      case DeviceType.CONTROL_UNIT:
      case 'control_unit':
        return '控制单元';
      case DeviceType.OTHER:
      case 'other':
        return '其他设备';
      default:
        return '未知设备';
    }
  };

  return (
    <Box>
      {/* 顶部操作工具栏 */}
      {selecteddevices.length > 0 && (
        <BatchOperations
          selectedItems={selecteddevices}
          totalItems={filtereddevices.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBatchDelete={handleBatchDelete}
          onBatchArchive={handleBatchArchive}
          onBatchTag={handleBatchTag}
          onBatchExport={handleBatchExport}
          itemType="设备"
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">设备列表</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={onRefreshIcon}
            sx={{ mr: 1 }}
          >
            刷新
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddDevice}
          >
            添加设备
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="搜索设备名称、类型、型号、制造商或位置..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary">
          找到 {filtereddevices.length} 个设备
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filtereddevices.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            没有找到匹配的设备
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtereddevices.map((device) => (
            <Grid item xs={12} sm={6} md={4} key={device.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Checkbox
                        checked={selecteddevices.includes(device.id)}
                        onChange={(e) => handledeviceselect(device.id, e.target.checked)}
                        sx={{ mr: 1 }}
                      />
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                        {getDeviceTypeIcon(device.type)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                          {device.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getDeviceTypeLabel(device.type)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={getStatusLabel(device.connectionStatus)}
                      color={getStatusColor(device.connectionStatus)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      λ��: {device.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ������: {device.manufacturer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      �ͺ�: {device.model}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 2, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {device.description}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button size="small" onClick={() => handleOpenDetails(device)}>
                    ��ϸ��Ϣ
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    disabled={device.connectionStatus !== DeviceConnectionStatus.ONLINE}
                  >
                    ����
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* �豸����Ի��� */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedDevice && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                  {getDeviceTypeIcon(selectedDevice.type)}
                </Avatar>
                <Box>
                  {selectedDevice.name}
                  <Typography variant="body2" color="text.secondary">
                    {selectedDevice.id}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Chip
                  label={getStatusLabel(selectedDevice.connectionStatus)}
                  color={getStatusColor(selectedDevice.connectionStatus)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    ������Ϣ
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="�豸����" 
                        secondary={getDeviceTypeLabel(selectedDevice.type)} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="������" 
                        secondary={selectedDevice.manufacturer} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="�ͺ�" 
                        secondary={selectedDevice.model} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="λ��" 
                        secondary={selectedDevice.location} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="�̼��汾" 
                        secondary={selectedDevice.firmware || 'δ֪'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    ά����Ϣ
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="�ϴ�ά��" 
                        secondary={selectedDevice.lastMaintenance ? new Date(selectedDevice.lastMaintenance).toLocaleDateString() : 'δ֪'} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="�´�ά��" 
                        secondary={selectedDevice.nextMaintenance ? new Date(selectedDevice.nextMaintenance).toLocaleDateString() : 'δ֪'} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="����ʱ��" 
                        secondary={new Date(selectedDevice.createdAt).toLocaleDateString()} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText 
                        primary="����ʱ��" 
                        secondary={new Date(selectedDevice.updatedAt).toLocaleDateString()} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    �豸����
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">
                      {selectedDevice.description}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    ������Э��
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      ����
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {selectedDevice.capabilities?.map((capability, index) => (
                        <Chip key={index} label={capability} size="small" />
                      )) || <Typography variant="body2" color="text.secondary">�޹�����Ϣ</Typography>}
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      ֧�ֵ�Э��
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedDevice.supportedProtocols?.map((protocol, index) => (
                        <Chip key={index} label={protocol} size="small" />
                      )) || <Typography variant="body2" color="text.secondary">��Э����Ϣ</Typography>}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    ��������
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      IP��ַ
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedDevice.ipAddress || 'δ����'}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      MAC��ַ
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedDevice.macAddress || 'δ����'}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      ֧�ֵ����ݸ�ʽ
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedDevice.dataFormats?.map((format, index) => (
                        <Chip key={index} label={format} size="small" />
                      )) || <Typography variant="body2" color="text.secondary">�޸�ʽ��Ϣ</Typography>}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>�ر�</Button>
              <Button 
                variant="contained" 
                color="primary" 
                disabled={selectedDevice.connectionStatus !== DeviceConnectionStatus.ONLINE}
              >
                �����豸
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 添加设备对话框 */}
      <Dialog 
        open={addDeviceOpen} 
        onClose={handleCloseAddDevice}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>添加新设备</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="设备名称"
                value={newDeviceForm.name}
                onChange={(e) => setNewDeviceForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
                helperText="输入设备的名称"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>设备类型</InputLabel>
                <Select
                  value={newDeviceForm.type}
                  onChange={(e) => setNewDeviceForm(prev => ({ ...prev, type: e.target.value as DeviceType }))}
                  label="设备类型"
                >
                  <MenuItem value={DeviceType.SENSOR}>传感器</MenuItem>
                  <MenuItem value={DeviceType.ACTUATOR}>执行器</MenuItem>
                  <MenuItem value={DeviceType.CONTROLLER}>控制器</MenuItem>
                  <MenuItem value={DeviceType.CAMERA}>摄像设备</MenuItem>
                  <MenuItem value={DeviceType.METER}>测量仪</MenuItem>
                  <MenuItem value={DeviceType.MICROSCOPE}>显微镜</MenuItem>
                  <MenuItem value={DeviceType.SPECTROSCOPE}>光谱仪</MenuItem>
                  <MenuItem value={DeviceType.DATALOGGER}>数据采集器</MenuItem>
                  <MenuItem value={DeviceType.OTHER}>其他</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="设备型号"
                value={newDeviceForm.model}
                onChange={(e) => setNewDeviceForm(prev => ({ ...prev, model: e.target.value }))}
                fullWidth
                helperText="输入设备的型号信息"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="制造商"
                value={newDeviceForm.manufacturer}
                onChange={(e) => setNewDeviceForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                fullWidth
                helperText="输入设备制造商"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="设备位置"
                value={newDeviceForm.location}
                onChange={(e) => setNewDeviceForm(prev => ({ ...prev, location: e.target.value }))}
                fullWidth
                required
                helperText="设备的物理位置"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>数据源类型</InputLabel>
                <Select
                  value={newDeviceForm.dataSourceType}
                  onChange={(e) => setNewDeviceForm(prev => ({ ...prev, dataSourceType: e.target.value as DataSourceType }))}
                  label="数据源类型"
                >
                  <MenuItem value={DataSourceType.USB}>USB串口</MenuItem>
                  <MenuItem value={DataSourceType.MQTT}>MQTT</MenuItem>
                  <MenuItem value={DataSourceType.MODBUS_RTU}>Modbus RTU</MenuItem>
                  <MenuItem value={DataSourceType.MODBUS_TCP}>Modbus TCP</MenuItem>
                  <MenuItem value={DataSourceType.HTTP_API}>HTTP API</MenuItem>
                  <MenuItem value={DataSourceType.DATABASE}>数据库</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="设备描述"
                value={newDeviceForm.description}
                onChange={(e) => setNewDeviceForm(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={3}
                helperText="描述设备的功能和特点"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Alert severity="info">
                设备添加后，您需要在"数据源配置"标签页中为该设备配置具体的数据源参数，才能开始数据采集。
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDevice}>取消</Button>
          <Button onClick={handleSaveDevice} variant="contained">
            添加设备
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeviceList;


