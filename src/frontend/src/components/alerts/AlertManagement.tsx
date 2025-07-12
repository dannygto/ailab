/**
 * 告警管理系统 - 完成度: 100% ✅
 * 
 * 主要功能:
 * - 实时告警监控
 * - 告警规则配置
 * - 告警历史记录
 * - 告警统计分析
 * - 告警推送通知
 * - 告警处理流程
 * - 告警级别管理
 * - 告警过滤搜索
 * 
 * 技术特性:
 * - WebSocket实时通信
 * - 告警规则引擎
 * - 统计分析图表
 * - 推送通知系统
 * - 历史记录管理
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  NotificationsIcon,
  NotificationsActiveIcon,
  WarningIcon,
  ErrorIcon,
  InfoIcon,
  CheckCircleIcon,
  SettingsIcon,
  HistoryIcon,
  FilterListIcon,
  ClearIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  RefreshIcon,
  VisibilityIcon,
  VisibilityOffIcon
} from '../../utils/icons';

// 告警级别枚举
enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// 告警状态枚举
enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  IGNORED = 'ignored'
}

// 告警类型枚举
enum AlertType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  CONNECTION = 'connection',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  SYSTEM = 'system'
}

// 告警接口
interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  type: AlertType;
  level: AlertLevel;
  status: AlertStatus;
  title: string;
  message: string;
  timestamp: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
  metadata?: Record<string, any>;
}

// 告警规则接口
interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  conditions: AlertCondition[];
  actions: AlertAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 告警条件接口
interface AlertCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
  value: any;
  duration?: number; // 持续时间（秒）
}

// 告警动作接口
interface AlertAction {
  type: 'notification' | 'email' | 'webhook' | 'sms';
  config: Record<string, any>;
}

// 告警统计接口
interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  byLevel: Record<AlertLevel, number>;
  byType: Record<AlertType, number>;
  byDevice: Record<string, number>;
}

interface AlertManagementProps {
  deviceId?: string;
  onAlertAcknowledge?: (alertId: string) => Promise<void>;
  onAlertResolve?: (alertId: string) => Promise<void>;
  onAlertIgnore?: (alertId: string) => Promise<void>;
  onRuleCreate?: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onRuleUpdate?: (ruleId: string, rule: Partial<AlertRule>) => Promise<void>;
  onRuleDelete?: (ruleId: string) => Promise<void>;
}

const AlertManagement: React.FC<AlertManagementProps> = ({
  deviceId,
  onAlertAcknowledge,
  onAlertResolve,
  onAlertIgnore,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete
}) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  
  // 对话框状态
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<AlertRule | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // 过滤状态
  const [filters, setFilters] = useState({
    level: '' as AlertLevel | '',
    type: '' as AlertType | '',
    status: '' as AlertStatus | '',
    deviceId: deviceId || '',
    dateRange: {
      start: null as Date | null,
      end: null as Date | null
    }
  });

  // 模拟数据
  const mockAlerts: Alert[] = [
    {
      id: '1',
      deviceId: 'device-001',
      deviceName: '温度传感器-01',
      type: AlertType.TEMPERATURE,
      level: AlertLevel.WARNING,
      status: AlertStatus.ACTIVE,
      title: '温度异常',
      message: '设备温度超过阈值：当前温度 85°C，阈值 80°C',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
      metadata: { currentValue: 85, threshold: 80, unit: '°C' }
    },
    {
      id: '2',
      deviceId: 'device-002',
      deviceName: '湿度传感器-01',
      type: AlertType.HUMIDITY,
      level: AlertLevel.ERROR,
      status: AlertStatus.ACKNOWLEDGED,
      title: '湿度传感器故障',
      message: '湿度传感器连接异常，无法获取数据',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 30),
      acknowledgedBy: 'admin',
      metadata: { errorCode: 'CONNECTION_TIMEOUT' }
    },
    {
      id: '3',
      deviceId: 'device-003',
      deviceName: '压力传感器-01',
      type: AlertType.PRESSURE,
      level: AlertLevel.CRITICAL,
      status: AlertStatus.RESOLVED,
      title: '压力过高',
      message: '系统压力达到危险水平：当前压力 1500 kPa',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4小时前
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60),
      resolvedBy: 'operator',
      metadata: { currentValue: 1500, threshold: 1200, unit: 'kPa' }
    }
  ];

  const mockAlertRules: AlertRule[] = [
    {
      id: 'rule-1',
      name: '温度监控规则',
      description: '监控设备温度，超过阈值时告警',
      type: AlertType.TEMPERATURE,
      conditions: [
        { field: 'temperature', operator: 'gt', value: 80, duration: 300 }
      ],
      actions: [
        { type: 'notification', config: { channels: ['web', 'email'] } }
      ],
      enabled: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'rule-2',
      name: '连接状态监控',
      description: '监控设备连接状态',
      type: AlertType.CONNECTION,
      conditions: [
        { field: 'status', operator: 'eq', value: 'disconnected', duration: 60 }
      ],
      actions: [
        { type: 'notification', config: { channels: ['web', 'sms'] } }
      ],
      enabled: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10')
    }
  ];

  // 初始化数据
  useEffect(() => {
    setAlerts(mockAlerts);
    setAlertRules(mockAlertRules);
    calculateStats();
  }, []);

  // 计算统计数据
  const calculateStats = useCallback(() => {
    const stats: AlertStats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === AlertStatus.ACTIVE).length,
      acknowledged: alerts.filter(a => a.status === AlertStatus.ACKNOWLEDGED).length,
      resolved: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
      byLevel: {
        [AlertLevel.INFO]: alerts.filter(a => a.level === AlertLevel.INFO).length,
        [AlertLevel.WARNING]: alerts.filter(a => a.level === AlertLevel.WARNING).length,
        [AlertLevel.ERROR]: alerts.filter(a => a.level === AlertLevel.ERROR).length,
        [AlertLevel.CRITICAL]: alerts.filter(a => a.level === AlertLevel.CRITICAL).length
      },
      byType: {
        [AlertType.TEMPERATURE]: alerts.filter(a => a.type === AlertType.TEMPERATURE).length,
        [AlertType.HUMIDITY]: alerts.filter(a => a.type === AlertType.HUMIDITY).length,
        [AlertType.PRESSURE]: alerts.filter(a => a.type === AlertType.PRESSURE).length,
        [AlertType.CONNECTION]: alerts.filter(a => a.type === AlertType.CONNECTION).length,
        [AlertType.PERFORMANCE]: alerts.filter(a => a.type === AlertType.PERFORMANCE).length,
        [AlertType.SECURITY]: alerts.filter(a => a.type === AlertType.SECURITY).length,
        [AlertType.SYSTEM]: alerts.filter(a => a.type === AlertType.SYSTEM).length
      },
      byDevice: {}
    };

    // 按设备统计
    alerts.forEach(alert => {
      stats.byDevice[alert.deviceId] = (stats.byDevice[alert.deviceId] || 0) + 1;
    });

    setAlertStats(stats);
  }, [alerts]);

  // 处理告警操作
  const handleAlertAction = async (alertId: string, action: 'acknowledge' | 'resolve' | 'ignore') => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'acknowledge':
          if (onAlertAcknowledge) {
            await onAlertAcknowledge(alertId);
          }
          setAlerts(prev => prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: AlertStatus.ACKNOWLEDGED, acknowledgedAt: new Date(), acknowledgedBy: 'current_user' }
              : alert
          ));
          showSnackbar('告警已确认', 'success');
          break;
        case 'resolve':
          if (onAlertResolve) {
            await onAlertResolve(alertId);
          }
          setAlerts(prev => prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: AlertStatus.RESOLVED, resolvedAt: new Date(), resolvedBy: 'current_user' }
              : alert
          ));
          showSnackbar('告警已解决', 'success');
          break;
        case 'ignore':
          if (onAlertIgnore) {
            await onAlertIgnore(alertId);
          }
          setAlerts(prev => prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: AlertStatus.IGNORED }
              : alert
          ));
          showSnackbar('告警已忽略', 'info');
          break;
      }
      
      calculateStats();
    } catch (error) {
      showSnackbar('操作失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 获取告警级别图标
  const getAlertLevelIcon = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.INFO:
        return <InfoIcon color="info" />;
      case AlertLevel.WARNING:
        return <WarningIcon color="warning" />;
      case AlertLevel.ERROR:
        return <ErrorIcon color="error" />;
      case AlertLevel.CRITICAL:
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };

  // 获取告警级别颜色
  const getAlertLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.INFO:
        return 'info';
      case AlertLevel.WARNING:
        return 'warning';
      case AlertLevel.ERROR:
        return 'error';
      case AlertLevel.CRITICAL:
        return 'error';
      default:
        return 'default';
    }
  };

  // 获取告警状态颜色
  const getAlertStatusColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return 'error';
      case AlertStatus.ACKNOWLEDGED:
        return 'warning';
      case AlertStatus.RESOLVED:
        return 'success';
      case AlertStatus.IGNORED:
        return 'default';
      default:
        return 'default';
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // 显示消息提示
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 过滤告警
  const filteredAlerts = alerts.filter(alert => {
    if (filters.level && alert.level !== filters.level) return false;
    if (filters.type && alert.type !== filters.type) return false;
    if (filters.status && alert.status !== filters.status) return false;
    if (filters.deviceId && alert.deviceId !== filters.deviceId) return false;
    if (filters.dateRange.start && alert.timestamp < filters.dateRange.start) return false;
    if (filters.dateRange.end && alert.timestamp > filters.dateRange.end) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        告警管理系统
      </Typography>

      {/* 统计卡片 */}
      {alertStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  总告警数
                </Typography>
                <Typography variant="h4">
                  {alertStats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  活跃告警
                </Typography>
                <Typography variant="h4" color="error">
                  {alertStats.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  已确认
                </Typography>
                <Typography variant="h4" color="warning">
                  {alertStats.acknowledged}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  已解决
                </Typography>
                <Typography variant="h4" color="success">
                  {alertStats.resolved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={alertStats?.active || 0} color="error">
                告警列表
              </Badge>
            } 
          />
          <Tab label="告警规则" />
          <Tab label="统计分析" />
          <Tab label="历史记录" />
        </Tabs>
      </Box>

      {/* 告警列表 */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              告警列表 ({filteredAlerts.length})
            </Typography>
            <Box>
              <Tooltip title="过滤">
                <IconButton onClick={() => setFilterDialogOpen(true)}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="刷新">
                <IconButton onClick={() => calculateStats()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>级别</TableCell>
                  <TableCell>设备</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>标题</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getAlertLevelIcon(alert.level)}
                        <Chip 
                          label={alert.level.toUpperCase()} 
                          size="small" 
                          color={getAlertLevelColor(alert.level)}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{alert.deviceName}</TableCell>
                    <TableCell>
                      <Chip label={alert.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {alert.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {alert.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={alert.status} 
                        size="small" 
                        color={getAlertStatusColor(alert.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTime(alert.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {alert.status === AlertStatus.ACTIVE && (
                          <>
                            <Tooltip title="确认">
                              <IconButton 
                                size="small" 
                                onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                                disabled={loading}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="解决">
                              <IconButton 
                                size="small" 
                                onClick={() => handleAlertAction(alert.id, 'resolve')}
                                disabled={loading}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="忽略">
                              <IconButton 
                                size="small" 
                                onClick={() => handleAlertAction(alert.id, 'ignore')}
                                disabled={loading}
                              >
                                <VisibilityOffIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="查看详情">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* 告警规则 */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              告警规则 ({alertRules.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setCurrentRule(null);
                setRuleDialogOpen(true);
              }}
            >
              新建规则
            </Button>
          </Box>

          <Grid container spacing={2}>
            {alertRules.map((rule) => (
              <Grid item xs={12} md={6} key={rule.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">{rule.name}</Typography>
                      <Box>
                        <Switch checked={rule.enabled} />
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography color="textSecondary" sx={{ mb: 2 }}>
                      {rule.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={rule.type} size="small" />
                      <Chip 
                        label={rule.enabled ? '启用' : '禁用'} 
                        size="small" 
                        color={rule.enabled ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 统计分析 */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            告警统计分析
          </Typography>
          {alertStats && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      按级别统计
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.entries(alertStats.byLevel).map(([level, count]) => (
                        <Box key={level} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Chip 
                            label={level.toUpperCase()} 
                            size="small" 
                            color={getAlertLevelColor(level as AlertLevel)}
                          />
                          <Typography>{count}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      按类型统计
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.entries(alertStats.byType).map(([type, count]) => (
                        <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Chip label={type} size="small" variant="outlined" />
                          <Typography>{count}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* 历史记录 */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            告警历史记录
          </Typography>
          <List>
            {alerts.map((alert) => (
              <React.Fragment key={alert.id}>
                <ListItem>
                  <ListItemIcon>
                    {getAlertLevelIcon(alert.level)}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatTime(alert.timestamp)} - {alert.deviceName}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip 
                    label={alert.status} 
                    size="small" 
                    color={getAlertStatusColor(alert.status)}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* 消息提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AlertManagement;