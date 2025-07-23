import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tab,
  Tabs,
  TextField,
  Switch,
  FormGroup,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';

import { SaveIcon } from '../../utils/icons';
import { RestoreIcon } from '../../utils/icons';
import { CloudUploadIcon } from '../../utils/icons';
import { SecurityIcon } from '../../utils/icons';
import { StorageIcon } from '../../utils/icons';
import { NotificationsIcon } from '../../utils/icons';
import { LanguageIcon } from '../../utils/icons';
import { AdminPanelSettingsIcon } from '../../utils/icons';
import { BackupIcon } from '../../utils/icons';

// 系统配置接口
interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    defaultLanguage: string;
    defaultTheme: string;
    logoUrl: string;
  };
  security: {
    loginAttempts: number;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuth: boolean;
  };
  storage: {
    maxFileSize: number;
    allowedExtensions: string[];
    cloudProvider: string;
    backupEnabled: boolean;
    backupInterval: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    slackWebhook: string;
  };
  performance: {
    cacheEnabled: boolean;
    cacheTTL: number;
    compressionEnabled: boolean;
    cdnEnabled: boolean;
    maxConcurrentUsers: number;
  };
  backup: {
    autoBackup: boolean;
    backupLocation: string;
    retentionDays: number;
    scheduleTime: string;
  };
  integrations: {
    googleAnalytics: string;
    sentry: string;
    slack: string;
    github: string;
  };
  advanced: {
    debugMode: boolean;
    logLevel: string;
    customCSS: string;
    customJS: string;
  };
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
      id={`system-settings-tabpanel-${index}`}
      aria-labelledby={`system-settings-tab-${index}`}
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

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模拟加载配置
  const loadConfig = async (): Promise<SystemConfig> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          general: {
            siteName: 'AI实验平台',
            siteDescription: 'AI智能实验研究平台',
            maintenanceMode: false,
            defaultLanguage: 'zh_CN',
            defaultTheme: 'light',
            logoUrl: '/logo.png'
          },
          security: {
            loginAttempts: 5,
            sessionTimeout: 60,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireNumbers: true,
              requireSpecialChars: false
            },
            twoFactorAuth: false
          },
          storage: {
            maxFileSize: 10,
            allowedExtensions: ['jpg', 'png', 'pdf', 'doc', 'docx'],
            cloudProvider: 'aliyun',
            backupEnabled: true,
            backupInterval: 24
          },
          notifications: {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            slackWebhook: ''
          },
          performance: {
            cacheEnabled: true,
            cacheTTL: 3600,
            compressionEnabled: true,
            cdnEnabled: false,
            maxConcurrentUsers: 100
          },
          backup: {
            autoBackup: true,
            backupLocation: 'cloud',
            retentionDays: 30,
            scheduleTime: '02:00'
          },
          integrations: {
            googleAnalytics: '',
            sentry: '',
            slack: '',
            github: ''
          },
          advanced: {
            debugMode: false,
            logLevel: 'info',
            customCSS: '',
            customJS: ''
          }
        });
      }, 1000);
    });
  };

  // 模拟保存配置
  const saveConfig = async (newConfig: SystemConfig): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  useEffect(() => {
    loadConfig().then(setConfig).finally(() => setLoading(false));
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConfigChange = (section: keyof SystemConfig, key: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [key]: value
      }
    });
  };

  const handleNestedConfigChange = (section: keyof SystemConfig, subsection: string, key: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [subsection]: {
          ...(config[section] as any)[subsection],
          [key]: value
        }
      }
    });
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await saveConfig(config);
      setSuccess(true);
    } catch (err) {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('确定要重置所有设置吗？')) {
      setLoading(true);
      loadConfig().then(setConfig).finally(() => setLoading(false));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">加载配置失败</Alert>
      </Box>
    );
  }

  const tabs = [
    { label: '基础设置', icon: <AdminPanelSettingsIcon /> },
    { label: '安全设置', icon: <SecurityIcon /> },
    { label: '存储设置', icon: <StorageIcon /> },
    { label: '通知设置', icon: <NotificationsIcon /> },
    { label: '性能优化', icon: <CloudUploadIcon /> },
    { label: '备份设置', icon: <BackupIcon /> },
    { label: '集成设置', icon: <LanguageIcon /> },
    { label: '高级设置', icon: <RestoreIcon /> }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        系统管理
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                id={`system-settings-tab-${index}`}
                aria-controls={`system-settings-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {/* 基础设置 */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            基础设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    站点信息
                  </Typography>
                  <TextField
                    fullWidth
                    label="站点名称"
                    value={config.general.siteName}
                    onChange={(e) => handleConfigChange('general', 'siteName', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="站点描述"
                    value={config.general.siteDescription}
                    onChange={(e) => handleConfigChange('general', 'siteDescription', e.target.value)}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>默认语言</InputLabel>
                    <Select
                      value={config.general.defaultLanguage}
                      onChange={(e) => handleConfigChange('general', 'defaultLanguage', e.target.value)}
                    >
                      <MenuItem value="zh_CN">简体中文</MenuItem>
                      <MenuItem value="en_US">English</MenuItem>
                      <MenuItem value="ja_JP">日本語</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>默认主题</InputLabel>
                    <Select
                      value={config.general.defaultTheme}
                      onChange={(e) => handleConfigChange('general', 'defaultTheme', e.target.value)}
                    >
                      <MenuItem value="light">浅色主题</MenuItem>
                      <MenuItem value="dark">深色主题</MenuItem>
                      <MenuItem value="auto">自动切换</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.general.maintenanceMode}
                        onChange={(e) => handleConfigChange('general', 'maintenanceMode', e.target.checked)}
                      />
                    }
                    label="维护模式"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 安全设置 */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            安全设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    登录安全
                  </Typography>
                  <TextField
                    fullWidth
                    label="最大登录尝试次数"
                    type="number"
                    value={config.security.loginAttempts}
                    onChange={(e) => handleConfigChange('security', 'loginAttempts', parseInt(e.target.value))}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="会话超时时间（分钟）"
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => handleConfigChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    margin="normal"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.security.twoFactorAuth}
                        onChange={(e) => handleConfigChange('security', 'twoFactorAuth', e.target.checked)}
                      />
                    }
                    label="启用双因素认证"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    密码策略
                  </Typography>
                  <TextField
                    fullWidth
                    label="最小长度"
                    type="number"
                    value={config.security.passwordPolicy.minLength}
                    onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                    margin="normal"
                  />
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.security.passwordPolicy.requireUppercase}
                          onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                        />
                      }
                      label="要求大写字母"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.security.passwordPolicy.requireNumbers}
                          onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                        />
                      }
                      label="要求数字"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.security.passwordPolicy.requireSpecialChars}
                          onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                        />
                      }
                      label="要求特殊字符"
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 存储设置 */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            存储设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    文件设置
                  </Typography>
                  <TextField
                    fullWidth
                    label="最大文件大小（MB）"
                    type="number"
                    value={config.storage.maxFileSize}
                    onChange={(e) => handleConfigChange('storage', 'maxFileSize', parseInt(e.target.value))}
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>云存储提供商</InputLabel>
                    <Select
                      value={config.storage.cloudProvider}
                      onChange={(e) => handleConfigChange('storage', 'cloudProvider', e.target.value)}
                    >
                      <MenuItem value="aliyun">阿里云</MenuItem>
                      <MenuItem value="tencent">腾讯云</MenuItem>
                      <MenuItem value="aws">AWS S3</MenuItem>
                      <MenuItem value="local">本地存储</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.storage.backupEnabled}
                        onChange={(e) => handleConfigChange('storage', 'backupEnabled', e.target.checked)}
                      />
                    }
                    label="启用自动备份"
                  />
                  <TextField
                    fullWidth
                    label="备份间隔（小时）"
                    type="number"
                    value={config.storage.backupInterval}
                    onChange={(e) => handleConfigChange('storage', 'backupInterval', parseInt(e.target.value))}
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 通知设置 */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            通知设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    通知渠道
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notifications.emailEnabled}
                          onChange={(e) => handleConfigChange('notifications', 'emailEnabled', e.target.checked)}
                        />
                      }
                      label="邮件通知"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notifications.smsEnabled}
                          onChange={(e) => handleConfigChange('notifications', 'smsEnabled', e.target.checked)}
                        />
                      }
                      label="短信通知"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.notifications.pushEnabled}
                          onChange={(e) => handleConfigChange('notifications', 'pushEnabled', e.target.checked)}
                        />
                      }
                      label="推送通知"
                    />
                  </FormGroup>
                  <TextField
                    fullWidth
                    label="Slack Webhook"
                    value={config.notifications.slackWebhook}
                    onChange={(e) => handleConfigChange('notifications', 'slackWebhook', e.target.value)}
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 性能优化 */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            性能优化
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    缓存设置
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.performance.cacheEnabled}
                        onChange={(e) => handleConfigChange('performance', 'cacheEnabled', e.target.checked)}
                      />
                    }
                    label="启用缓存"
                  />
                  <TextField
                    fullWidth
                    label="缓存过期时间（秒）"
                    type="number"
                    value={config.performance.cacheTTL}
                    onChange={(e) => handleConfigChange('performance', 'cacheTTL', parseInt(e.target.value))}
                    margin="normal"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.performance.compressionEnabled}
                        onChange={(e) => handleConfigChange('performance', 'compressionEnabled', e.target.checked)}
                      />
                    }
                    label="启用压缩"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.performance.cdnEnabled}
                        onChange={(e) => handleConfigChange('performance', 'cdnEnabled', e.target.checked)}
                      />
                    }
                    label="启用CDN"
                  />
                  <TextField
                    fullWidth
                    label="最大并发用户数"
                    type="number"
                    value={config.performance.maxConcurrentUsers}
                    onChange={(e) => handleConfigChange('performance', 'maxConcurrentUsers', parseInt(e.target.value))}
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 备份设置 */}
        <TabPanel value={activeTab} index={5}>
          <Typography variant="h6" gutterBottom>
            备份设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    自动备份
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.backup.autoBackup}
                        onChange={(e) => handleConfigChange('backup', 'autoBackup', e.target.checked)}
                      />
                    }
                    label="启用自动备份"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>备份位置</InputLabel>
                    <Select
                      value={config.backup.backupLocation}
                      onChange={(e) => handleConfigChange('backup', 'backupLocation', e.target.value)}
                    >
                      <MenuItem value="local">本地</MenuItem>
                      <MenuItem value="cloud">云端</MenuItem>
                      <MenuItem value="both">本地+云端</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="保留天数"
                    type="number"
                    value={config.backup.retentionDays}
                    onChange={(e) => handleConfigChange('backup', 'retentionDays', parseInt(e.target.value))}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="备份时间"
                    type="time"
                    value={config.backup.scheduleTime}
                    onChange={(e) => handleConfigChange('backup', 'scheduleTime', e.target.value)}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 集成设置 */}
        <TabPanel value={activeTab} index={6}>
          <Typography variant="h6" gutterBottom>
            集成设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    第三方集成
                  </Typography>
                  <TextField
                    fullWidth
                    label="Google Analytics"
                    value={config.integrations.googleAnalytics}
                    onChange={(e) => handleConfigChange('integrations', 'googleAnalytics', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Sentry DSN"
                    value={config.integrations.sentry}
                    onChange={(e) => handleConfigChange('integrations', 'sentry', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Slack Token"
                    value={config.integrations.slack}
                    onChange={(e) => handleConfigChange('integrations', 'slack', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="GitHub Token"
                    value={config.integrations.github}
                    onChange={(e) => handleConfigChange('integrations', 'github', e.target.value)}
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 高级设置 */}
        <TabPanel value={activeTab} index={7}>
          <Typography variant="h6" gutterBottom>
            高级设置
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    开发者选项
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.advanced.debugMode}
                        onChange={(e) => handleConfigChange('advanced', 'debugMode', e.target.checked)}
                      />
                    }
                    label="调试模式"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>日志级别</InputLabel>
                    <Select
                      value={config.advanced.logLevel}
                      onChange={(e) => handleConfigChange('advanced', 'logLevel', e.target.value)}
                    >
                      <MenuItem value="error">错误</MenuItem>
                      <MenuItem value="warn">警告</MenuItem>
                      <MenuItem value="info">信息</MenuItem>
                      <MenuItem value="debug">调试</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="自定义CSS"
                    value={config.advanced.customCSS}
                    onChange={(e) => handleConfigChange('advanced', 'customCSS', e.target.value)}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                  <TextField
                    fullWidth
                    label="自定义JavaScript"
                    value={config.advanced.customJS}
                    onChange={(e) => handleConfigChange('advanced', 'customJS', e.target.value)}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* 操作按钮 */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={handleReset}
          startIcon={<RestoreIcon />}
          disabled={saving}
        >
          重置
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </Box>

      {/* 成功提示 */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="设置保存成功"
      />

      {/* 错误提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        message={error}
      />
    </Box>
  );
};

export default SystemSettings;
