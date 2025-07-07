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
  Divider,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';

import { SaveIcon } from '../../utils/icons';
import { restore } from '../../utils/icons';
import { CloudUploadIcon } from '../../utils/icons';
import { SecurityIcon } from '../../utils/icons';
import { StorageIcon } from '../../utils/icons';
import { NotificationsIcon } from '../../utils/icons';
import { LanguageIcon } from '../../utils/icons';
import { AdminPanelSettingsIcon } from '../../utils/icons';
import { BackupIcon } from '../../utils/icons';

// �������ýӿ�
interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    defaultLanguageIcon: string;
    defaultTheme: string;
    logoUrl: string;
  };
  security: {
    loginAttempts: number;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    twoFactorAuth: boolean;
  };
  StorageIcon: {
    maxUploadSize: number;
    allowedFileTypes: string[];
    StorageIconProvider: string;
    cloudCredentials: {
      apiKey: string;
      region: string;
    };
  };
  NotificationsIcon: {
    emailNotificationsIcon: boolean;
    SmsIconNotificationsIcon: boolean;
    systemNotificationsIcon: boolean;
    emailsettings: {
      smtpServer: string;
      smtpPort: number;
      smtpUsername: string;
      smtpPassword: string;
      senderemail: string;
    };
  };
  localization: {
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
  };
  BackupIcon: {
    autoBackupIcon: boolean;
    BackupIconFrequency: string;
    BackupIconRetention: number;
    BackupIconLocation: string;
  };
}

// ģ��ϵͳ����api����
const settingsService = {
  getSystemConfig: async (): Promise<SystemConfig> => {
    // ģ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          general: {
            siteName: 'AICAMƽ̨',
            siteDescription: 'AI��֪���������ƽ̨',
            maintenanceMode: false,
            defaultLanguageIcon: 'zh_CN',
            defaultTheme: 'light',
            logoUrl: '/logo.png'
          },
          security: {
            loginAttempts: 5,
            sessionTimeout: 60,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSymbols: false
            },
            twoFactorAuth: false
          },
          StorageIcon: {
            maxUploadSize: 50,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'],
            StorageIconProvider: 'local',
            cloudCredentials: {
              apiKey: '',
              region: 'cn-north-1'
            }
          },
          NotificationsIcon: {
            emailNotificationsIcon: true,
            SmsIconNotificationsIcon: false,
            systemNotificationsIcon: true,
            emailsettings: {
              smtpServer: 'smtp.example.com',
              smtpPort: 587,
              smtpUsername: 'NotificationsIcon@aicam.edu',
              smtpPassword: '********',
              senderemail: 'noreply@aicam.edu'
            }
          },
          localization: {
            timezone: 'Asia/Shanghai',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '24h',
            currency: 'CNY'
          },
          BackupIcon: {
            autoBackupIcon: true,
            BackupIconFrequency: 'daily',
            BackupIconRetention: 30,
            BackupIconLocation: 'local'
          }
        });
      }, 800);
    });
  },
  
  saveSystemConfig: async (config: SystemConfig): Promise<boolean> => {
    // ģ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  },
  
  restoreDefaults: async (): Promise<SystemConfig> => {
    // ģ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          general: {
            siteName: 'AICAMƽ̨',
            siteDescription: 'AI��֪���������ƽ̨',
            maintenanceMode: false,
            defaultLanguageIcon: 'zh_CN',
            defaultTheme: 'light',
            logoUrl: '/logo.png'
          },
          security: {
            loginAttempts: 5,
            sessionTimeout: 60,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSymbols: false
            },
            twoFactorAuth: false
          },
          StorageIcon: {
            maxUploadSize: 50,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'],
            StorageIconProvider: 'local',
            cloudCredentials: {
              apiKey: '',
              region: 'cn-north-1'
            }
          },
          NotificationsIcon: {
            emailNotificationsIcon: true,
            SmsIconNotificationsIcon: false,
            systemNotificationsIcon: true,
            emailsettings: {
              smtpServer: 'smtp.example.com',
              smtpPort: 587,
              smtpUsername: 'NotificationsIcon@aicam.edu',
              smtpPassword: '',
              senderemail: 'noreply@aicam.edu'
            }
          },
          localization: {
            timezone: 'Asia/Shanghai',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: '24h',
            currency: 'CNY'
          },
          BackupIcon: {
            autoBackupIcon: true,
            BackupIconFrequency: 'daily',
            BackupIconRetention: 30,
            BackupIconLocation: 'local'
          }
        });
      }, 800);
    });
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ѡ�������
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ padding: '20px 0' }}
    >
      {value === index && children}
    </div>
  );
}

/**
 * ϵͳ����ҳ�����
 * 
 * �ṩϵͳ�������á���ȫ���á��洢���á�֪ͨ���á����ػ����úͱ������õȹ��ܡ�
 */
const Systemsettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // ��ʼ��������
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await settingsService.getSystemConfig();
        setConfig(data);
      } catch (err) {
        console.error('��ȡϵͳ����ʧ��:', err);
        setError('��ȡϵͳ����ʧ�ܣ����Ժ�����');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  // ����ѡ����
  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // �������ñ��
  const handleConfigChange = (section: keyof SystemConfig, field: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };
  
  // ����Ƕ�����ñ��
  const handleNestedConfigChange = (section: keyof SystemConfig, nestedSection: string, field: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [nestedSection]: {
          ...(config[section] as any)[nestedSection],
          [field]: value
        }
      }
    });
  };
  
  // ��������
  const handleSaveConfig = async () => {
    if (!config) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await settingsService.saveSystemConfig(config);
      setSuccess('ϵͳ�����ѳɹ�����');
    } catch (err) {
      console.error('����ϵͳ����ʧ��:', err);
      setError('����ϵͳ����ʧ�ܣ����Ժ�����');
    } finally {
      setSaving(false);
    }
  };
  
  // �ָ�Ĭ������
  const handlerestoreDefaults = async () => {
    setRestoring(true);
    setError(null);
    setSuccess(null);
    
    try {
      const defaultConfig = await settingsService.restoreDefaults();
      setConfig(defaultConfig);
      setSuccess('ϵͳ�����ѻָ�ΪĬ��ֵ');
    } catch (err) {
      console.error('�ָ�Ĭ������ʧ��:', err);
      setError('�ָ�Ĭ������ʧ�ܣ����Ժ�����');
    } finally {
      setRestoring(false);
    }
  };
  
  // ������Ϣ�ر�
  const handleCloseMessage = () => {
    setSuccess(null);
    setError(null);
  };
  
  if (loading) {
    return (
      <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          ����ϵͳ����...
        </Typography>
      </div>
    );
  }
  
  if (!config) {
    return (
      <div sx={{ p: 3 }}>
        <Alert severity="error">
          �޷�����ϵͳ���á���ˢ��ҳ�����ϵϵͳ����Ա��
        </Alert>
      </div>
    );
  }
  
  return (
    <div sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        ϵͳ����
      </Typography>
      
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="ϵͳ����ѡ�"
          >
            <Tab icon={<AdminPanelSettingsIcon />} iconPosition="start" label="����" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="��ȫ" />
            <Tab icon={<StorageIcon />} iconPosition="start" label="�洢" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="֪ͨ" />
            <Tab icon={<LanguageIcon />} iconPosition="start" label="���ػ�" />
            <Tab icon={<BackupIcon />} iconPosition="start" label="����" />
          </Tabs>
        </div>
        
        {/* �������� */}
        <TabPanel value={tabValue} index={0}>
          <div sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="��վ����"
                  value={config.general.siteName}
                  onChange={(e) => handleConfigChange('general', 'siteName', e.target.value)}
                  helperText="��ʾ������������ҳ�涥������վ����"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="��վ����"
                  value={config.general.siteDescription}
                  onChange={(e) => handleConfigChange('general', 'siteDescription', e.target.value)}
                  helperText="���������վ�����ú͹���"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Ĭ������</InputLabel>
                  <Select
                    value={config.general.defaultLanguageIcon}
                    onChange={(e) => handleConfigChange('general', 'defaultLanguageIcon', e.target.value)}
                    label="Ĭ������"
                  >
                    <MenuItem value="zh_CN">��������</MenuItem>
                    <MenuItem value="en_US">English (US)</MenuItem>
                    <MenuItem value="ja_JP">�ձ��Z</MenuItem>
                    <MenuItem value="ko_KR">???</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Ĭ������</InputLabel>
                  <Select
                    value={config.general.defaultTheme}
                    onChange={(e) => handleConfigChange('general', 'defaultTheme', e.target.value)}
                    label="Ĭ������"
                  >
                    <MenuItem value="light">ǳɫ</MenuItem>
                    <MenuItem value="dark">��ɫ</MenuItem>
                    <MenuItem value="system">����ϵͳ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  value={config.general.logoUrl}
                  onChange={(e) => handleConfigChange('general', 'logoUrl', e.target.value)}
                  helperText="��վLogo��URL·��"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.general.maintenanceMode}
                      onChange={(e) => handleConfigChange('general', 'maintenanceMode', e.target.checked)}
                    />
                  }
                  label="ά��ģʽ"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  ����ά��ģʽ��ʹ��վ����ͨ�û����ɷ���
                </Typography>
              </Grid>
            </Grid>
          </div>
        </TabPanel>
        
        {/* ��ȫ���� */}
        <TabPanel value={tabValue} index={1}>
          <div sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  ��¼����
                </Typography>
                
                <TextField
                  fullWidth
                  type="number"
                  label="����¼���Դ���"
                  value={config.security.loginAttempts}
                  onChange={(e) => handleConfigChange('security', 'loginAttempts', parseInt(e.target.value) || 0)}
                  helperText="�û�������ǰ����������¼ʧ�ܴ���"
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  type="number"
                  label="�Ự��ʱʱ��(����)"
                  value={config.security.sessionTimeout}
                  onChange={(e) => handleConfigChange('security', 'sessionTimeout', parseInt(e.target.value) || 0)}
                  helperText="�û��޻���Զ��ǳ���ʱ��"
                  InputProps={{ inputProps: { min: 5, max: 1440 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  �������
                </Typography>
                
                <div sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    ��С���볤��: {config.security.passwordPolicy.minLength}
                  </Typography>
                  <Slider
                    value={config.security.passwordPolicy.minLength}
                    onChange={(e, value) => handleNestedConfigChange('security', 'passwordPolicy', 'minLength', value)}
                    min={6}
                    max={16}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </div>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.security.passwordPolicy.requireUppercase}
                        onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                      />
                    }
                    label="Ҫ�������д��ĸ"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.security.passwordPolicy.requireLowercase}
                        onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                      />
                    }
                    label="Ҫ�����Сд��ĸ"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.security.passwordPolicy.requireNumbers}
                        onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                      />
                    }
                    label="Ҫ���������"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.security.passwordPolicy.requireSymbols}
                        onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireSymbols', e.target.checked)}
                      />
                    }
                    label="Ҫ������������"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.security.twoFactorAuth}
                      onChange={(e) => handleConfigChange('security', 'twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="������������֤"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Ҫ���û��ڵ�¼ʱ�ṩ�������֤��
                </Typography>
              </Grid>
            </Grid>
          </div>
        </TabPanel>
        
        {/* �洢���� */}
        <TabPanel value={tabValue} index={2}>
          <div sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="����ϴ��ļ���С(MB)"
                  value={config.StorageIcon.maxUploadSize}
                  onChange={(e) => handleConfigChange('StorageIcon', 'maxUploadSize', parseInt(e.target.value) || 0)}
                  helperText="�����ϴ�������ļ���С(MB)"
                  InputProps={{ inputProps: { min: 1, max: 1000 } }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="�������ļ�����"
                  value={config.StorageIcon.allowedFileTypes.join(', ')}
                  onChange={(e) => handleConfigChange('StorageIcon', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                  helperText="�Զ��ŷָ��������ϴ����ļ���չ���б�"
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth>
                  <InputLabel>�洢�ṩ��</InputLabel>
                  <Select
                    value={config.StorageIcon.StorageIconProvider}
                    onChange={(e) => handleConfigChange('StorageIcon', 'StorageIconProvider', e.target.value)}
                    label="�洢�ṩ��"
                  >
                    <MenuItem value="local">���ش洢</MenuItem>
                    <MenuItem value="aliyun">������OSS</MenuItem>
                    <MenuItem value="tencent">��Ѷ��COS</MenuItem>
                    <MenuItem value="aws">AWS S3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2, display: config.StorageIcon.StorageIconProvider === 'local' ? 'none' : 'block' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      �ƴ洢ƾ֤
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="api��Կ"
                      value={config.StorageIcon.cloudCredentials.apiKey}
                      onChange={(e) => handleNestedConfigChange('StorageIcon', 'cloudCredentials', 'apiKey', e.target.value)}
                      type="password"
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>����</InputLabel>
                      <Select
                        value={config.StorageIcon.cloudCredentials.region}
                        onChange={(e) => handleNestedConfigChange('StorageIcon', 'cloudCredentials', 'region', e.target.value)}
                        label="����"
                      >
                        <MenuItem value="cn-north-1">���� 1</MenuItem>
                        <MenuItem value="cn-east-1">���� 1</MenuItem>
                        <MenuItem value="cn-south-1">���� 1</MenuItem>
                        <MenuItem value="ap-southeast-1">��̫���� 1</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
                
                <Alert severity="info" variant="outlined">
                  <Typography variant="body2">
                    �����ѡ���ƴ洢����ȷ���ṩ��Ч��apiƾ֤�����ش洢����Ҫ�������ã��������ܵ��������洢�ռ����ơ�
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </div>
        </TabPanel>
        
        {/* ֪ͨ���� */}
        <TabPanel value={tabValue} index={3}>
          <div sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  ֪ͨ����
                </Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.NotificationsIcon.emailNotificationsIcon}
                        onChange={(e) => handleConfigChange('NotificationsIcon', 'emailNotificationsIcon', e.target.checked)}
                      />
                    }
                    label="�����ʼ�֪ͨ"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.NotificationsIcon.SmsIconNotificationsIcon}
                        onChange={(e) => handleConfigChange('NotificationsIcon', 'SmsIconNotificationsIcon', e.target.checked)}
                      />
                    }
                    label="���ö���֪ͨ"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.NotificationsIcon.systemNotificationsIcon}
                        onChange={(e) => handleConfigChange('NotificationsIcon', 'systemNotificationsIcon', e.target.checked)}
                      />
                    }
                    label="����ϵͳ��֪ͨ"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2, display: config.NotificationsIcon.emailNotificationsIcon ? 'block' : 'none' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      �ʼ�����������
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="SMTP������"
                      value={config.NotificationsIcon.emailsettings.smtpServer}
                      onChange={(e) => handleNestedConfigChange('NotificationsIcon', 'emailsettings', 'smtpServer', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      type="number"
                      label="SMTP�˿�"
                      value={config.NotificationsIcon.emailsettings.smtpPort}
                      onChange={(e) => handleNestedConfigChange('NotificationsIcon', 'emailsettings', 'smtpPort', parseInt(e.target.value) || 0)}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="SMTP�û���"
                      value={config.NotificationsIcon.emailsettings.smtpUsername}
                      onChange={(e) => handleNestedConfigChange('NotificationsIcon', 'emailsettings', 'smtpUsername', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="SMTP����"
                      type="password"
                      value={config.NotificationsIcon.emailsettings.smtpPassword}
                      onChange={(e) => handleNestedConfigChange('NotificationsIcon', 'emailsettings', 'smtpPassword', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="����������"
                      value={config.NotificationsIcon.emailsettings.senderemail}
                      onChange={(e) => handleNestedConfigChange('NotificationsIcon', 'emailsettings', 'senderemail', e.target.value)}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>
        </TabPanel>
        
        {/* ���ػ����� */}
        <TabPanel value={tabValue} index={4}>
          <div sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>ʱ��</InputLabel>
                  <Select
                    value={config.localization.timezone}
                    onChange={(e) => handleConfigChange('localization', 'timezone', e.target.value)}
                    label="ʱ��"
                  >
                    <MenuItem value="Asia/Shanghai">�й���׼ʱ�� (UTC+8)</MenuItem>
                    <MenuItem value="Asia/Hong_Kong">���ʱ�� (UTC+8)</MenuItem>
                    <MenuItem value="Asia/Tokyo">�ձ���׼ʱ�� (UTC+9)</MenuItem>
                    <MenuItem value="America/New_York">��������ʱ�� (UTC-5)</MenuItem>
                    <MenuItem value="Europe/London">�������α�׼ʱ�� (UTC+0)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>���ڸ�ʽ</InputLabel>
                  <Select
                    value={config.localization.dateFormat}
                    onChange={(e) => handleConfigChange('localization', 'dateFormat', e.target.value)}
                    label="���ڸ�ʽ"
                  >
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2025-07-05)</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (05/07/2025)</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (07/05/2025)</MenuItem>
                    <MenuItem value="YYYY��MM��DD��">YYYY��MM��DD�� (2025��07��05��)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>ʱ���ʽ</InputLabel>
                  <Select
                    value={config.localization.timeFormat}
                    onChange={(e) => handleConfigChange('localization', 'timeFormat', e.target.value)}
                    label="ʱ���ʽ"
                  >
                    <MenuItem value="24h">24Сʱ�� (14:30)</MenuItem>
                    <MenuItem value="12h">12Сʱ�� (2:30 PM)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>����</InputLabel>
                  <Select
                    value={config.localization.currency}
                    onChange={(e) => handleConfigChange('localization', 'currency', e.target.value)}
                    label="����"
                  >
                    <MenuItem value="CNY">����� (��)</MenuItem>
                    <MenuItem value="USD">��Ԫ ($)</MenuItem>
                    <MenuItem value="EUR">ŷԪ (�)</MenuItem>
                    <MenuItem value="GBP">Ӣ�� (��)</MenuItem>
                    <MenuItem value="JPY">��Ԫ (��)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    ���ػ����ý�Ӱ������ϵͳ�е����ڡ�ʱ��ͻ��Ҹ�ʽ����ȷ��ѡ����ȷ��������ƥ�����ĵ�����׼��
                  </Typography>
                </Alert>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Ԥ��
                    </Typography>
                    
                    <div sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        ���ڸ�ʽ:
                      </Typography>
                      <Typography variant="body1">
                        {config.localization.dateFormat === 'YYYY-MM-DD' ? '2025-07-05' :
                         config.localization.dateFormat === 'DD/MM/YYYY' ? '05/07/2025' :
                         config.localization.dateFormat === 'MM/DD/YYYY' ? '07/05/2025' :
                         config.localization.dateFormat === 'YYYY��MM��DD��' ? '2025��07��05��' : '2025-07-05'}
                      </Typography>
                    </div>
                    
                    <div sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        ʱ���ʽ:
                      </Typography>
                      <Typography variant="body1">
                        {config.localization.timeFormat === '24h' ? '14:30:00' : '2:30:00 PM'}
                      </Typography>
                    </div>
                    
                    <div>
                      <Typography variant="body2" color="text.secondary">
                        ���Ҹ�ʽ:
                      </Typography>
                      <Typography variant="body1">
                        {config.localization.currency === 'CNY' ? '��1,234.56' :
                         config.localization.currency === 'USD' ? '$1,234.56' :
                         config.localization.currency === 'EUR' ? '�1,234.56' :
                         config.localization.currency === 'GBP' ? '��1,234.56' :
                         config.localization.currency === 'JPY' ? '��1,235' : '��1,234.56'}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>
        </TabPanel>
        
        {/* �������� */}
        <TabPanel value={tabValue} index={5}>
          <div sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.BackupIcon.autoBackupIcon}
                      onChange={(e) => handleConfigChange('BackupIcon', 'autoBackupIcon', e.target.checked)}
                    />
                  }
                  label="�����Զ�����"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  �����Զ�����ϵͳ���ݺ�����
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>����Ƶ��</InputLabel>
                  <Select
                    value={config.BackupIcon.BackupIconFrequency}
                    onChange={(e) => handleConfigChange('BackupIcon', 'BackupIconFrequency', e.target.value)}
                    label="����Ƶ��"
                    disabled={!config.BackupIcon.autoBackupIcon}
                  >
                    <MenuItem value="hourly">ÿСʱ</MenuItem>
                    <MenuItem value="daily">ÿ��</MenuItem>
                    <MenuItem value="weekly">ÿ��</MenuItem>
                    <MenuItem value="monthly">ÿ��</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  type="number"
                  label="���ݱ�������"
                  value={config.BackupIcon.BackupIconRetention}
                  onChange={(e) => handleConfigChange('BackupIcon', 'BackupIconRetention', parseInt(e.target.value) || 0)}
                  helperText="�Զ�ɾ������ָ�������ı���"
                  InputProps={{ inputProps: { min: 1, max: 365 } }}
                  disabled={!config.BackupIcon.autoBackupIcon}
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth>
                  <InputLabel>���ݴ洢λ��</InputLabel>
                  <Select
                    value={config.BackupIcon.BackupIconLocation}
                    onChange={(e) => handleConfigChange('BackupIcon', 'BackupIconLocation', e.target.value)}
                    label="���ݴ洢λ��"
                    disabled={!config.BackupIcon.autoBackupIcon}
                  >
                    <MenuItem value="local">���ش洢</MenuItem>
                    <MenuItem value="cloud">�ƴ洢</MenuItem>
                    <MenuItem value="both">���غ��ƴ洢</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      �ֶ�����
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      ��������ʱ����ϵͳ���ֶ����ݣ������Զ�����������Ρ�
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      ��������
                    </Button>
                  </CardContent>
                </Card>
                
                <Alert severity="warning" variant="outlined">
                  <Typography variant="body2">
                    ��ȷ��������֤���ݵ������ԣ������Իָ����̡����齫���ݴ洢�ڶ��λ���Է����ݶ�ʧ��
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </div>
        </TabPanel>
      </Paper>
      
      {/* ������ť */}
      <div sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={handlerestoreDefaults}
          disabled={saving || restoring}
        >
          {restoring ? '�ָ���...' : '�ָ�Ĭ������'}
        </Button>
        
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveConfig}
          disabled={saving || restoring}
        >
          {saving ? '������...' : '��������'}
        </Button>
      </div>
      
      {/* �ɹ���ʾ */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseMessage}
        message={success}
      />
      
      {/* ������ʾ */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseMessage}
      >
        <Alert onClose={handleCloseMessage} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Systemsettings;


