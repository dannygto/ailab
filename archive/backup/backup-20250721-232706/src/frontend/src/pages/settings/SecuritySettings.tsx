import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  Divider,
  Chip,
  FormGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  SecurityIcon,
  DeleteIcon,
  AddIcon,
  EditIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  VpnKeyIcon,
  LockIcon,
  AccessTimeIcon,
  DevicesIcon,
  HistoryIcon
} from '../../utils/icons';
import TwoFactorSetup from '../../components/security/TwoFactorSetup';

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
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `security-tab-${index}`,
    'aria-controls': `security-tabpanel-${index}`,
  };
}

const SecuritySettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [securitySettings, setSecuritySettings] = useState({
    enablePasswordPolicy: true,
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableAuditLog: true,
    enableEncryption: true,
    sslEnabled: true,
    corsEnabled: true,
    allowedOrigins: ['http://localhost:3000', 'https://yourdomain.com']
  });

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'OpenAI API Key', value: '***********', created: '2024-01-15' },
    { id: 2, name: 'Azure API Key', value: '***********', created: '2024-01-20' },
    { id: 3, name: 'Google API Key', value: '***********', created: '2024-01-25' },
  ]);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<{[key: number]: boolean}>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      // 这里应该调用api保存设置
      setSuccess('安全设置已保存');
    } catch (err) {
      setError('保存设置时发生错误');
    }
  };

  const handleAddApiKey = () => {
    // 处理添加API密钥
  };

  const handleDeleteApiKey = (id: number) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
  };

  const toggleShowValue = (id: number) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon />
        安全设置
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="安全设置标签页">
          <Tab icon={<LockIcon />} label="身份验证" {...a11yProps(0)} />
          <Tab icon={<AccessTimeIcon />} label="会话设置" {...a11yProps(1)} />
          <Tab icon={<DevicesIcon />} label="设备管理" {...a11yProps(2)} />
          <Tab icon={<VpnKeyIcon />} label="API密钥" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* 两因素认证 */}
          <Grid item xs={12}>
            <TwoFactorSetup />
          </Grid>

          {/* 密码策略 */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title={
                <Box display="flex" alignItems="center" gap={1}>
                  <LockIcon />
                  <Typography variant="h6">密码策略</Typography>
                </Box>
              } />
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.enablePasswordPolicy}
                      onChange={(e) => handleSettingChange('enablePasswordPolicy', e.target.checked)}
                    />
                  }
                  label="启用密码策略"
                />

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="最小密码长度"
                      type="number"
                      value={securitySettings.minPasswordLength}
                      onChange={(e) => handleSettingChange('minPasswordLength', parseInt(e.target.value))}
                      InputProps={{ inputProps: { min: 6, max: 20 } }}
                      fullWidth
                      disabled={!securitySettings.enablePasswordPolicy}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.requireSpecialChars}
                            onChange={(e) => handleSettingChange('requireSpecialChars', e.target.checked)}
                            disabled={!securitySettings.enablePasswordPolicy}
                          />
                        }
                        label="需要特殊字符"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.requireNumbers}
                            onChange={(e) => handleSettingChange('requireNumbers', e.target.checked)}
                            disabled={!securitySettings.enablePasswordPolicy}
                          />
                        }
                        label="需要数字"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.requireUppercase}
                            onChange={(e) => handleSettingChange('requireUppercase', e.target.checked)}
                            disabled={!securitySettings.enablePasswordPolicy}
                          />
                        }
                        label="需要大写字母"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardHeader title={
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon />
              <Typography variant="h6">会话设置</Typography>
            </Box>
          } />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="会话超时时间（分钟）"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 5, max: 480 } }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="最大登录尝试次数"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 3, max: 10 } }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="锁定时间（分钟）"
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 5, max: 60 } }}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.enableAuditLog}
                    onChange={(e) => handleSettingChange('enableAuditLog', e.target.checked)}
                  />
                }
                label="启用审计日志"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.enableEncryption}
                    onChange={(e) => handleSettingChange('enableEncryption', e.target.checked)}
                  />
                }
                label="启用数据加密"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.sslEnabled}
                    onChange={(e) => handleSettingChange('sslEnabled', e.target.checked)}
                  />
                }
                label="启用SSL/TLS"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.corsEnabled}
                    onChange={(e) => handleSettingChange('corsEnabled', e.target.checked)}
                  />
                }
                label="启用CORS"
              />
            </FormGroup>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TwoFactorSetup />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <VpnKeyIcon />
                <Typography variant="h6">API密钥管理</Typography>
              </Box>
            }
            action={
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddApiKey}
              >
                添加密钥
              </Button>
            }
          />
          <CardContent>
            <List>
              {apiKeys.map((key) => (
                <ListItem key={key.id} divider>
                  <ListItemText
                    primary={key.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {showValues[key.id] ? key.value : '***********'}
                        </Typography>
                        <Chip label={`创建于: ${key.created}`} size="small" />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => toggleShowValue(key.id)}>
                      {showValues[key.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteApiKey(key.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 保存按钮 */}
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSaveSettings}
          sx={{ mr: 2 }}
        >
          保存设置
        </Button>
        <Button variant="outlined">
          重置为默认
        </Button>
      </Box>

      {/* 成功消息 */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* 错误消息 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SecuritySettings;
