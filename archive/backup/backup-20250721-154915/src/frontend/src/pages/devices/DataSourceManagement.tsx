import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Usb as UsbIcon,
  Cloud as CloudIcon,
  Cable as CableIcon,
  Http as HttpIcon,
  Storage as DatabaseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { 
  DataSourceType, 
  DeviceDataSource,
  USBConfiguration,
  MQTTConfiguration,
  ModbusConfiguration,
  HTTPAPIConfiguration,
  DatabaseConfiguration
} from '../../types/devices';
import USBDataSourceConfig from '../../components/devices/datasource/USBDataSourceConfig';
import MQTTDataSourceConfig from '../../components/devices/datasource/MQTTDataSourceConfig';
import ModbusDataSourceConfig from '../../components/devices/datasource/ModbusDataSourceConfig';
import HTTPAPIDataSourceConfig from '../../components/devices/datasource/HTTPAPIDataSourceConfig';
import DatabaseDataSourceConfig from '../../components/devices/datasource/DatabaseDataSourceConfig';

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
      id={`datasource-tabpanel-${index}`}
      aria-labelledby={`datasource-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DataSourceManagementProps {
  deviceId?: string;
}

const DataSourceManagement: React.FC<DataSourceManagementProps> = ({ deviceId }) => {
  const [tabValue, setTabValue] = useState(0);
  const [dataSources, setDataSources] = useState<DeviceDataSource[]>([]);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedDataSourceType, setSelectedDataSourceType] = useState<DataSourceType | null>(null);
  const [editingDataSource, setEditingDataSource] = useState<DeviceDataSource | null>(null);

  const dataSourceTypes = [
    {
      type: DataSourceType.USB,
      label: 'USB串口',
      icon: <UsbIcon />,
      description: '通过USB串口连接设备，支持多种串口参数配置'
    },
    {
      type: DataSourceType.MQTT,
      label: 'MQTT消息队列',
      icon: <CloudIcon />,
      description: '通过MQTT协议订阅设备数据，支持多主题订阅'
    },
    {
      type: DataSourceType.MODBUS_RTU,
      label: 'Modbus RTU',
      icon: <CableIcon />,
      description: '通过串口连接Modbus RTU设备'
    },
    {
      type: DataSourceType.MODBUS_TCP,
      label: 'Modbus TCP',
      icon: <CableIcon />,
      description: '通过TCP网络连接Modbus设备'
    },
    {
      type: DataSourceType.HTTP_API,
      label: 'HTTP API',
      icon: <HttpIcon />,
      description: '通过RESTful API获取设备数据'
    },
    {
      type: DataSourceType.DATABASE,
      label: '数据库',
      icon: <DatabaseIcon />,
      description: '直接从数据库读取设备数据'
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateDataSource = (type: DataSourceType) => {
    setSelectedDataSourceType(type);
    setEditingDataSource(null);
    setConfigDialogOpen(true);
  };

  const handleEditDataSource = (dataSource: DeviceDataSource) => {
    setSelectedDataSourceType(dataSource.type);
    setEditingDataSource(dataSource);
    setConfigDialogOpen(true);
  };

  const handleSaveDataSource = (config: any) => {
    const newDataSource: DeviceDataSource = {
      id: editingDataSource?.id || `ds_${Date.now()}`,
      deviceId: deviceId || 'default',
      name: `${selectedDataSourceType} 数据源`,
      type: selectedDataSourceType!,
      configuration: config,
      enabled: true,
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingDataSource) {
      setDataSources(prev => prev.map(ds => ds.id === editingDataSource.id ? newDataSource : ds));
    } else {
      setDataSources(prev => [...prev, newDataSource]);
    }

    setConfigDialogOpen(false);
    setSelectedDataSourceType(null);
    setEditingDataSource(null);
  };

  const handleDeleteDataSource = (id: string) => {
    setDataSources(prev => prev.filter(ds => ds.id !== id));
  };

  const handleTestDataSource = async (config: any): Promise<boolean> => {
    // 模拟测试连接
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.3); // 70%成功率
      }, 2000);
    });
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      active: { label: '运行中', color: 'success' as const },
      inactive: { label: '未激活', color: 'default' as const },
      error: { label: '错误', color: 'error' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const renderConfigComponent = () => {
    if (!selectedDataSourceType) return null;

    const baseProps = {
      deviceId,
      onSave: handleSaveDataSource,
      onTest: handleTestDataSource
    };

    switch (selectedDataSourceType) {
      case DataSourceType.USB:
        return <USBDataSourceConfig 
          {...baseProps} 
          initialConfig={editingDataSource?.configuration as USBConfiguration} 
        />;
      case DataSourceType.MQTT:
        return <MQTTDataSourceConfig 
          {...baseProps} 
          initialConfig={editingDataSource?.configuration as MQTTConfiguration} 
        />;
      case DataSourceType.MODBUS_RTU:
      case DataSourceType.MODBUS_TCP:
        return <ModbusDataSourceConfig 
          {...baseProps} 
          initialConfig={editingDataSource?.configuration as ModbusConfiguration} 
        />;
      case DataSourceType.HTTP_API:
        return <HTTPAPIDataSourceConfig 
          {...baseProps} 
          initialConfig={editingDataSource?.configuration as HTTPAPIConfiguration} 
        />;
      case DataSourceType.DATABASE:
        return <DatabaseDataSourceConfig 
          {...baseProps} 
          initialConfig={editingDataSource?.configuration as DatabaseConfiguration} 
        />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          设备数据源管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          配置和管理设备的多种数据来源，包括USB、MQTT、Modbus、HTTP API和数据库
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="数据源列表" />
            <Tab label="添加数据源" />
          </Tabs>
        </Box>

        {/* 数据源列表 */}
        <TabPanel value={tabValue} index={0}>
          {dataSources.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                暂无数据源
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                请添加数据源以开始收集设备数据
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTabValue(1)}
              >
                添加数据源
              </Button>
            </Box>
          ) : (
            <List>
              {dataSources.map((dataSource) => {
                const typeInfo = dataSourceTypes.find(t => t.type === dataSource.type);
                return (
                  <ListItem key={dataSource.id}>
                    <ListItemIcon>
                      {typeInfo?.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{dataSource.name}</span>
                          {getStatusChip(dataSource.status)}
                        </Box>
                      }
                      secondary={`类型: ${typeInfo?.label} | 创建时间: ${new Date(dataSource.createdAt).toLocaleString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditDataSource(dataSource)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteDataSource(dataSource.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </TabPanel>

        {/* 添加数据源 */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            选择数据源类型
          </Typography>
          <Grid container spacing={3}>
            {dataSourceTypes.map((type) => (
              <Grid item xs={12} sm={6} md={4} key={type.type}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleCreateDataSource(type.type)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2, fontSize: 48, color: 'primary.main' }}>
                      {type.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {type.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* 配置对话框 */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editingDataSource ? '编辑数据源' : '添加数据源'}
        </DialogTitle>
        <DialogContent>
          {renderConfigComponent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DataSourceManagement;
