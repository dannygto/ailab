import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Badge,
  Divider,
  Snackbar,
  Tab,
  Tabs,
  SelectChangeEvent
} from '@mui/material';
import { WarningIcon as WarningIcon, ErrorIcon as ErrorIcon, InfoIcon as InfoIcon, NotificationsIcon as CriticalIcon, AddIcon as AddIcon, EditIcon as EditIcon, DeleteIcon as DeleteIcon, NotificationsIcon as NotificationsIcon, NotificationsOffIcon as NotificationsOffIcon } from '../../utils/icons';
import { DeviceAlert, AlertRule, AlertStats } from '../../types';

interface AlertManagementProps {
  deviceId?: string;
  showCreateRule?: boolean;
}

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
      id={`alert-tabpanel-${index}`}
      aria-labelledby={`alert-tab-${index}`}
      {...other}
    >
      {value === index && <div sx={{ p: 3 }}>{children}</div>}
    </div>
  );
}

const AlertManagement: React.FC<AlertManagementProps> = ({ 
  deviceId,
  showCreateRule = false 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(showCreateRule);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // �½��澯�������״̬
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    deviceId: deviceId || '',
    metric: '',
    operator: 'greater_than',
    threshold: 0,
    severity: 'medium',
    enabled: true,
    name: '',
    description: '',
    cooldownMinutes: 5
  });

  useEffect(() => {
    const loadData = async () => {
      await loadAlerts();
      await loadAlertRules();
      await loadAlertStats();
    };
    loadData();
  }, [deviceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAlerts = async () => {
    setLoading(true);
    try {
      // ģ�����ݼ���
      const mockAlerts: DeviceAlert[] = [
        {
          id: '1',
          deviceId: deviceId || 'device-1',
          type: 'performance', // ����type�ֶ�
          alertType: 'threshold',
          severity: 'high',
          title: '�¶ȹ��߸澯',
          message: '�豸�¶ȳ�����ȫ��ֵ75��C����ǰ�¶ȣ�82��C',
          metric: 'temperature',
          currentValue: 82,
          thresholdValue: 75,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'active', // ����status�ֶ�
          acknowledged: false,
          resolved: false
        },
        {
          id: '2',
          deviceId: deviceId || 'device-1',
          type: 'performance', // ����type�ֶ�
          alertType: 'anomaly',
          severity: 'medium',
          title: 'ѹ���쳣����',
          message: '��⵽ѹ�������������쳣����',
          metric: 'pressure',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'acknowledged', // ����status�ֶ�
          acknowledged: true,
          acknowledgedBy: 'admin',
          acknowledgedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          resolved: false
        }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlertRules = async () => {
    try {
      // ģ�����ݼ���
      const mockRules: AlertRule[] = [
        {
          id: '1',
          deviceId: deviceId || 'device-1',
          name: '�¶ȹ��߸澯',
          description: '���¶ȳ���75��Cʱ�����澯',
          condition: {
            metric: 'temperature',
            operator: 'greater_than',
            value: 75
          },
          metric: 'temperature',
          operator: 'greater_than',
          threshold: 75,
          severity: 'high',
          isEnabled: true,
          enabled: true,
          cooldownMinutes: 10,
          notificationChannels: ['email'],
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          deviceId: deviceId || 'device-1',
          name: 'ѹ����Χ���',
          description: 'ѹ��ֵӦ��10-50 PSI��Χ��',
          condition: {
            metric: 'pressure',
            operator: 'range',
            value: 10
          },
          metric: 'pressure',
          operator: 'range',
          threshold: 10,
          maxThreshold: 50,
          severity: 'medium',
          isEnabled: true,
          enabled: true,
          cooldownMinutes: 5,
          notificationChannels: ['email'],
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setAlertRules(mockRules);
    } catch (error) {
      console.error('Failed to load alert rules:', error);
    }
  };

  const loadAlertStats = async () => {
    try {
      // ģ��ͳ������
      const mockStats: AlertStats = {
        total: 15,
        active: 5,
        resolved: 10,
        unacknowledged: 3,
        bySeverity: {
          low: 5,
          medium: 7,
          high: 2,
          critical: 1
        },
        byType: {
          threshold: 8,
          anomaly: 4,
          offline: 2,
          error: 1,
          maintenance: 0
        },
        recentTrend: [
          { period: '1h', count: 2 },
          { period: '6h', count: 5 },
          { period: '24h', count: 15 }
        ]
      };
      setAlertStats(mockStats);
    } catch (error) {
      console.error('Failed to load alert stats:', error);
    }
  };

  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <CriticalIcon color="error" />;
      case 'high':
        return <ErrorIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      // ģ��ȷ�ϸ澯
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              acknowledged: true, 
              acknowledgedBy: 'current-user',
              acknowledgedAt: new Date().toISOString()
            }
          : alert
      ));
      setSnackbarMessage('�澯��ȷ��');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      // ģ�����澯
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              resolved: true, 
              resolvedAt: new Date().toISOString()
            }
          : alert
      ));
      setSnackbarMessage('�澯�ѽ��');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleCreateRule = async () => {
    try {
      // ģ�ⴴ���澯����
      const rule: AlertRule = {
        ...newRule,
        id: Date.now().toString(),
        deviceId: newRule.deviceId || deviceId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as AlertRule;
      
      setAlertRules(prev => [...prev, rule]);
      setShowCreateRuleDialog(false);
      setNewRule({
        deviceId: deviceId || '',
        metric: '',
        operator: 'greater_than',
        threshold: 0,
        severity: 'medium',
        enabled: true,
        name: '',
        description: '',
        cooldownMinutes: 5
      });
      setSnackbarMessage('�澯���򴴽��ɹ�');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to create alert rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      // ģ��ɾ���澯����
      setAlertRules(prev => prev.filter(rule => rule.id !== ruleId));
      setSnackbarMessage('�澯������ɾ��');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to delete alert rule:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      // ģ���л��澯����״̬
      setAlertRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      ));
      setSnackbarMessage(`�澯������${enabled ? '����' : '����'}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to toggle alert rule:', error);
    }
  };

  const handleRuleFormChange = (field: string, value: any) => {
    setNewRule(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={alertStats?.unacknowledged || 0} color="error">
                  �澯�б�
                </Badge>
              } 
            />
            <Tab label="�澯����" />
            <Tab label="ͳ����Ϣ" />
          </Tabs>
        </div>

        <TabPanel value={tabValue} index={0}>
          {/* �澯�б� */}
          <div sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              �豸�澯
            </Typography>
            <Button
              variant="outlined"
              onClick={loadAlerts}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              ˢ�¸澯
            </Button>
          </div>

          <List>
            {alerts.map((alert) => (
              <React.Fragment key={alert.id}>
                <ListItem>
                  <ListItemIcon>
                    {getSeverityIcon(alert.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {alert.title}
                        </Typography>
                        <Chip 
                          label={alert.severity} 
                          size="small" 
                          color={getSeverityColor(alert.severity) as any}
                        />
                        <Chip 
                          label={alert.alertType} 
                          size="small" 
                          variant="outlined"
                        />
                        {alert.acknowledged && (
                          <Chip 
                            label="��ȷ��" 
                            size="small" 
                            color="success"
                            variant="outlined"
                          />
                        )}
                        {alert.resolved && (
                          <Chip 
                            label="�ѽ��" 
                            size="small" 
                            color="success"
                          />
                        )}
                      </div>
                    }
                    secondary={
                      <div>
                        <Typography variant="body2" color="text.secondary">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.timestamp).toLocaleString()}
                        </Typography>
                      </div>
                    }
                  />
                  <ListItemSecondaryAction>
                    <div sx={{ display: 'flex', gap: 1 }}>
                      {!alert.acknowledged && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          ȷ��
                        </Button>
                      )}
                      {alert.acknowledged && !alert.resolved && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          ���
                        </Button>
                      )}
                    </div>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* �澯���� */}
          <div sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              �澯��������
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateRuleDialog(true)}
            >
              �½�����
            </Button>
          </div>

          <List>
            {alertRules.map((rule) => (
              <React.Fragment key={rule.id}>
                <ListItem>
                  <ListItemIcon>
                    {rule.enabled ? <NotificationsIcon /> : <NotificationsOffIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {rule.name}
                        </Typography>
                        <Chip 
                          label={rule.severity} 
                          size="small" 
                          color={getSeverityColor(rule.severity) as any}
                        />
                        <Chip 
                          label={rule.enabled ? '����' : '����'} 
                          size="small" 
                          color={rule.enabled ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </div>
                    }
                    secondary={
                      <div>
                        <Typography variant="body2" color="text.secondary">
                          {rule.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ָ��: {rule.metric} | ����: {rule.operator} {rule.threshold}
                          {rule.maxThreshold && ` - ${rule.maxThreshold}`}
                        </Typography>
                      </div>
                    }
                  />
                  <ListItemSecondaryAction>
                    <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={rule.enabled}
                        onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={() => console.log('Edit rule:', rule.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* ͳ����Ϣ */}
          <Typography variant="h6" gutterBottom>
            �澯ͳ��
          </Typography>

          {alertStats && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="����ͳ��" />
                  <CardContent>
                    <div sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>�ܸ澯��:</Typography>
                      <Typography fontWeight="bold">{alertStats.total}</Typography>
                    </div>
                    <div sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>δȷ��:</Typography>
                      <Typography fontWeight="bold" color="error.main">
                        {alertStats.unacknowledged}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="�����س̶�" />
                  <CardContent>
                    {Object.entries(alertStats.bySeverity).map(([severity, count]) => (
                      <div key={severity} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getSeverityIcon(severity)}
                          <Typography>{severity}:</Typography>
                        </div>
                        <Typography fontWeight="bold">{count}</Typography>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardHeader title="������ͳ��" />
                  <CardContent>
                    <Grid container spacing={2}>
                      {Object.entries(alertStats.byType).map(([type, count]) => (
                        <Grid item xs={6} sm={4} md={2} key={type}>
                          <div sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold">
                              {count}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {type}
                            </Typography>
                          </div>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* �����澯����Ի��� */}
      <Dialog 
        open={showCreateRuleDialog} 
        onClose={() => setShowCreateRuleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>�����澯����</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="��������"
                value={newRule.name}
                onChange={(e) => handleRuleFormChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>���ָ��</InputLabel>
                <Select
                  value={newRule.metric}
                  onChange={(e: SelectChangeEvent) => handleRuleFormChange('metric', e.target.value)}
                >
                  <MenuItem value="temperature">�¶�</MenuItem>
                  <MenuItem value="pressure">ѹ��</MenuItem>
                  <MenuItem value="humidity">ʪ��</MenuItem>
                  <MenuItem value="voltage">��ѹ</MenuItem>
                  <MenuItem value="current">����</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>����������</InputLabel>
                <Select
                  value={newRule.operator}
                  onChange={(e: SelectChangeEvent) => handleRuleFormChange('operator', e.target.value)}
                >
                  <MenuItem value="greater_than">����</MenuItem>
                  <MenuItem value="less_than">С��</MenuItem>
                  <MenuItem value="equals">����</MenuItem>
                  <MenuItem value="not_equals">������</MenuItem>
                  <MenuItem value="range">��Χ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="��ֵ"
                type="number"
                value={newRule.threshold}
                onChange={(e) => handleRuleFormChange('threshold', parseFloat(e.target.value))}
              />
            </Grid>
            {newRule.operator === 'range' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="�����ֵ"
                  type="number"
                  value={newRule.maxThreshold || ''}
                  onChange={(e) => handleRuleFormChange('maxThreshold', parseFloat(e.target.value))}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>���س̶�</InputLabel>
                <Select
                  value={newRule.severity}
                  onChange={(e: SelectChangeEvent) => handleRuleFormChange('severity', e.target.value)}
                >
                  <MenuItem value="low">��</MenuItem>
                  <MenuItem value="medium">��</MenuItem>
                  <MenuItem value="high">��</MenuItem>
                  <MenuItem value="critical">����</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="��ȴʱ��(����)"
                type="number"
                value={newRule.cooldownMinutes}
                onChange={(e) => handleRuleFormChange('cooldownMinutes', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="����"
                multiline
                rows={3}
                value={newRule.description}
                onChange={(e) => handleRuleFormChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newRule.enabled}
                    onChange={(e) => handleRuleFormChange('enabled', e.target.checked)}
                  />
                }
                label="���ù���"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateRuleDialog(false)}>
            ȡ��
          </Button>
          <Button 
            onClick={handleCreateRule} 
            variant="contained"
            disabled={!newRule.name || !newRule.metric}
          >
            ����
          </Button>
        </DialogActions>
      </Dialog>

      {/* �ɹ���ʾ */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
};

export default AlertManagement;


