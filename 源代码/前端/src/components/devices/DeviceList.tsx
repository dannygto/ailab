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
  Checkbox
} from '@mui/material';
import { SearchIcon, RefreshIcon, MoreVertIcon, AddIcon } from '../../utils/icons';
import { Device, DeviceConnectionStatus, DeviceType } from '../../types/devices';
import BatchOperations from '../common/BatchOperations';

interface DeviceListProps {
  devices: Device[];
  onRefreshIcon?: () => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onRefreshIcon }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selecteddevices, setSelecteddevices] = useState<string[]>([]);
  
  // ���������ʹ����豸
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

  // ����������������
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
    console.log('����ɾ���豸:', deviceIds);
    // ����Ӧ�õ���apiɾ���豸
    setSelecteddevices([]);
    onRefreshIcon?.();
  };

  const handleBatchArchive = async (deviceIds: string[]) => {
    console.log('�����鵵�豸:', deviceIds);
    // ����Ӧ�õ���api�鵵�豸
    setSelecteddevices([]);
    onRefreshIcon?.();
  };

  const handleBatchTag = async (deviceIds: string[], tags: string[]) => {
    console.log('�������ӱ�ǩ:', deviceIds, tags);
    // ����Ӧ�õ���apiΪ�豸���ӱ�ǩ
    setSelecteddevices([]);
    onRefreshIcon?.();
  };

  const handleBatchExport = async (deviceIds: string[], format: string) => {
    console.log('���������豸:', deviceIds, format);
    // ����Ӧ�õ���api�����豸����
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
    if (!status) return 'δ֪';
    switch (status) {
      case DeviceConnectionStatus.ONLINE:
      case 'online':
      case 'connected':
        return '����';
      case DeviceConnectionStatus.CONNECTING:
      case 'reconnecting':
        return '������';
      case DeviceConnectionStatus.OFFLINE:
      case 'offline':
      case 'disconnected':
        return '����';
      case DeviceConnectionStatus.ERROR:
      case 'error':
        return '����';
      case DeviceConnectionStatus.MAINTENANCE:
        return 'ά����';
      default:
        return 'δ֪';
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
        return '������';
      case DeviceType.METER:
      case 'meter':
        return '������';
      case DeviceType.MICROSCOPE:
      case 'microscope':
        return '��΢��';
      case DeviceType.SPECTROSCOPE:
      case 'spectroscope':
        return '������';
      case DeviceType.DATALOGGER:
      case 'datalogger':
        return '���ݲɼ���';
      case DeviceType.CAMERA:
      case 'camera':
        return '�����豸';
      case DeviceType.CONTROL_UNIT:
      case 'control_unit':
        return '���Ƶ�Ԫ';
      case DeviceType.OTHER:
      case 'other':
        return '�����豸';
      default:
        return 'δ֪�豸';
    }
  };

  return (
    <Box>
      {/* �������������� */}
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
          itemType="�豸"
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">�����豸�б�</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={onRefreshIcon}
            sx={{ mr: 1 }}
          >
            ˢ��
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
          >
            �����豸
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="�����豸���ơ����͡��ͺš������̻�λ��..."
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
          �ҵ� {filtereddevices.length} ���豸
        </Typography>
      </Paper>

      {filtereddevices.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            û���ҵ�ƥ����豸
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
    </Box>
  );
};

export default DeviceList;


