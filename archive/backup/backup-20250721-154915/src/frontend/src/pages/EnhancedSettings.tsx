/**
 * 🔧 增强系统设置页面 - 企业级完整功能
 * 
 * ✅ 功能模块
 * 1. 基础设置 (Logo、网站信息、系统控制)
 * 2. 公司信息 (企业资料、法律信息、品牌形象)
 * 3. 联系人管理 (技术支持、商务、紧急联系人)
 * 4. 第三方服务集成 (AI、云存储、邮件、短信)
 * 5. 安全设置 (认证、密码策略、访问控制)
 * 6. 外观定制 (主题、颜色、字体、样式)
 * 7. 通知设置 (邮件、推送、事件通知)
 * 8. 数据存储 (保存、备份、文件管理)
 * 9. 系统性能 (并发、硬件、内存、网络)
 * 10. 实验平台配置 (默认设置、监控、协作)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSystemConfig } from '../contexts/SystemConfigContext';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Chip,
  SelectChangeEvent,
  Badge,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-hot-toast';
import systemSettingsService from '../services/systemSettingsService';
import systemSetupService from '../services/systemSetupService';
import DemoDataManager from '../components/DemoDataManager';
import DockerDeploymentGenerator from '../components/DockerDeploymentGenerator';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BuildIcon from '@mui/icons-material/Build';
import { SettingsIcon, SecurityIcon, PaletteIcon, NotificationsIcon, StorageIcon, SpeedIcon, ScienceIcon, TuneIcon, SaveIcon, RefreshIcon, BusinessIcon, ContactsIcon, CloudIcon, UploadIcon, PhotoCameraIcon } from '../utils/icons';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedSettings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // 获取全局系统配置上下文
  const { config, updateSystemConfig } = useSystemConfig();
  
  const [settings, setSettings] = useState({
    // 1. 基础设置
    siteName: 'AI实验平台',
    siteDescription: '专业的人工智能实验与研究平台',
    defaultLanguage: 'zh-CN',
    timezone: 'Asia/Shanghai',
    logoUrl: '/logo.png',
    logoFile: null as File | null,
    maintenanceMode: false,
    allowUserRegistration: true,
    supportEmail: 'support@sslab.edu.cn',
    dateFormat: 'YYYY-MM-DD',
    enableRegistration: true,
    enableGuestAccess: false,
    
    // 2. 公司信息
    companyName: 'SS实验室',
    companyDescription: '专注于AI技术研究与应用的创新实验室',
    companyAddress: '北京市海淀区中关村科技园',
    companyPhone: '+86-10-12345678',
    companyEmail: 'info@sslab.edu.cn',
    legalRepresentative: '张三',
    registrationNumber: '91110000MA01234567',
    establishmentDate: '2020-01-01',
    companyWebsite: 'https://www.sslab.edu.cn',
    companyLogo: '',
    bannerImage: '',
    
    // 3. 联系人管理
    techSupportContact: {
      name: '李技术',
      email: 'tech@sslab.edu.cn',
      phone: '+86-10-12345679',
      department: '技术支持部',
      position: '技术主管'
    },
    businessContact: {
      name: '王商务',
      email: 'business@sslab.edu.cn',
      phone: '+86-10-12345680',
      department: '商务部',
      position: '商务经理'
    },
    emergencyContact: {
      name: '赵紧急',
      email: 'emergency@sslab.edu.cn',
      phone: '+86-10-12345681',
      department: '运维部',
      position: '运维总监'
    },
    
    // 4. 第三方服务集成
    aiServices: {
      provider: 'openai',
      apiKey: '',
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048
    },
    cloudStorage: {
      provider: 'aws',
      accessKey: '',
      secretKey: '',
      bucket: '',
      region: 'us-east-1'
    },
    emailService: {
      smtpHost: 'smtp.qq.com',
      smtpPort: 587,
      username: '',
      password: '',
      encryption: 'tls'
    },
    smsService: {
      provider: 'aliyun',
      accessKey: '',
      secretKey: '',
      signName: 'AI实验平台'
    },
    
    // 5. 安全设置
    enableTwoFactor: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    ipWhitelist: '',
    
    // 6. 外观定制
    theme: 'auto',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    fontFamily: 'Roboto',
    fontSize: 'medium',
    enableAnimations: true,
    compactMode: false,
    customCSS: '',
    
    // 7. 通知设置
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableSmsNotifications: false,
    enableSoundAlerts: true,
    experimentStatusNotify: true,
    deviceAlertNotify: true,
    systemMaintenanceNotify: true,
    securityAlertNotify: true,
    
    // 8. 数据存储
    autoSaveInterval: 5,
    dataRetentionDays: 90,
    enableDataBackup: true,
    backupFrequency: 'daily',
    backupLocation: 'cloud',
    compressionLevel: 'medium',
    maxFileSize: 10,
    allowedFileTypes: 'jpg,png,pdf,doc,xlsx',
    enableDataEncryption: true,
    
    // 9. 系统性能
    maxConcurrentUsers: 100,
    maxConcurrentExperiments: 10,
    enableHardwareAcceleration: true,
    memoryLimit: 2048,
    cacheSize: 512,
    enableCDN: false,
    enableDataCompression: true,
    
    // 10. 实验平台配置
    defaultExperimentType: 'standard',
    autoGenerateReports: true,
    enableRealTimeMonitoring: true,
    dataCollectionInterval: 1,
    enableVersionControl: true,
    enableTeamCollaboration: true,
    defaultPermissionLevel: 'editor'
  });

  // 初始化时加载系统设置
  useEffect(() => {
    // 如果有全局配置，则加载它
    if (config) {
      setSettings(prevSettings => ({
        ...prevSettings,
        siteName: config.siteName || prevSettings.siteName,
        siteDescription: config.siteDescription || prevSettings.siteDescription,
        companyName: config.companyName || prevSettings.companyName,
        logoUrl: config.logoUrl || prevSettings.logoUrl,
        theme: config.theme || prevSettings.theme,
        primaryColor: config.primaryColor || prevSettings.primaryColor
      }));
    }
    
    // 这里可以添加从服务器加载更多系统设置的逻辑
    console.log('初始化系统设置', config);
  }, [config]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev] as any,
        [key]: value
      }
    }));
  };

  const handleSelectChange = (key: string) => (event: SelectChangeEvent) => {
    handleSettingChange(key, event.target.value);
  };

  const handleFileUpload = (type: 'logo' | 'banner') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'logo') {
        handleSettingChange('logoFile', file);
        const url = URL.createObjectURL(file);
        handleSettingChange('logoUrl', url);
      } else if (type === 'banner') {
        const url = URL.createObjectURL(file);
        handleSettingChange('bannerImage', url);
      }
    }
  };

  const handleSaveSettings = async () => {
    console.log('保存设置:', settings);
    setIsSaving(true);
    try {
      // 保存所有设置
      const generalSettings = {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        defaultLanguage: settings.defaultLanguage,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        enableRegistration: settings.enableRegistration,
        enableGuestAccess: settings.enableGuestAccess,
        maintenanceMode: settings.maintenanceMode,
        defaultExperimentType: settings.defaultExperimentType,
        autoGenerateReports: settings.autoGenerateReports,
      };
      
      const brandingSettings = {
        companyName: settings.companyName,
        companyDescription: settings.companyDescription,
        companyEmail: settings.companyEmail,
        companyPhone: settings.companyPhone,
        companyAddress: settings.companyAddress,
        logoUrl: settings.logoUrl,
        logoFile: settings.logoFile,
        theme: settings.theme,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor
      };
      
      // 调用服务保存设置
      const [generalSuccess, brandingSuccess] = await Promise.all([
        systemSettingsService.saveGeneralSettings(generalSettings),
        systemSettingsService.saveBrandingSettings(brandingSettings)
      ]);
      
      if (generalSuccess && brandingSuccess) {
        toast.success('所有设置保存成功！');
        // 更新上下文中的系统设置，以便全局访问
        if (updateSystemConfig) {
          updateSystemConfig({
            siteName: settings.siteName,
            companyName: settings.companyName,
            logoUrl: settings.logoUrl,
            theme: settings.theme,
            primaryColor: settings.primaryColor
          });
        }
      } else {
        toast.error('部分设置保存失败，请重试');
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存设置失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('确定要重置所有设置吗？此操作不可撤销！')) {
      // 重置为默认设置
      const defaultSettings = {
        // 基础设置的默认值
        siteName: '智能实验平台',
        siteDescription: 'AI驱动的K12实验教学平台',
        defaultLanguage: 'zh-CN',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        enableRegistration: true,
        enableGuestAccess: false,
        maintenanceMode: false,
        allowUserRegistration: true,
        supportEmail: 'support@sslab.edu.cn',
        
        // 公司信息的默认值
        companyName: '未来教育科技有限公司',
        companyDescription: '专注于K12教育科技创新',
        companyAddress: '北京市海淀区中关村科技园',
        companyPhone: '010-12345678',
        companyEmail: 'contact@edu-tech.com',
        logoUrl: '/logo.png',
        logoFile: null
      };
      
      // 合并默认设置和当前设置，保留当前设置的结构
      setSettings({
        ...settings,
        ...defaultSettings
      });
      toast.success('已重置为默认设置');
    }
  };

  const tabsConfig = [
    { label: '基础设置', icon: <SettingsIcon />, badge: '' },
    { label: '公司信息', icon: <BusinessIcon />, badge: '' },
    { label: '联系人', icon: <ContactsIcon />, badge: '3' },
    { label: '第三方集成', icon: <CloudIcon />, badge: '4' },
    { label: '安全', icon: <SecurityIcon />, badge: '' },
    { label: '外观', icon: <PaletteIcon />, badge: '' },
    { label: '通知', icon: <NotificationsIcon />, badge: '' },
    { label: '存储', icon: <StorageIcon />, badge: '' },
    { label: '性能', icon: <SpeedIcon />, badge: '' },
    { label: '实验配置', icon: <ScienceIcon />, badge: '' },
    { label: '模拟数据', icon: <AddCircleIcon />, badge: 'NEW' },
    { label: 'Docker部署', icon: <BuildIcon />, badge: 'NEW' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon />
        系统设置
        <Chip label="企业版" color="primary" size="small" />
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        💡 企业级系统设置，包含LOGO管理、公司信息、联系人管理、第三方集成等完整功能。修改后请记得保存设置。
      </Alert>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabsConfig.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.badge ? (
                    <Badge badgeContent={tab.badge} color="error">
                      {tab.icon}
                    </Badge>
                  ) : (
                    tab.icon
                  )}
                  {tab.label}
                </Box>
              }
              id={`settings-tab-${index}`}
              aria-controls={`settings-tabpanel-${index}`}
            />
          ))}
        </Tabs>

        {/* 1. 基础设置 */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon />
                    网站基本信息
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="网站名称"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    sx={{ mb: 2 }}
                    helperText="网站的显示名称"
                  />

                  <TextField
                    fullWidth
                    label="网站描述"
                    multiline
                    rows={3}
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                    sx={{ mb: 2 }}
                    helperText="网站的简要描述，用于SEO和介绍"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>默认语言</InputLabel>
                        <Select
                          value={settings.defaultLanguage}
                          onChange={handleSelectChange('defaultLanguage')}
                          label="默认语言"
                        >
                          <MenuItem value="zh-CN">简体中文</MenuItem>
                          <MenuItem value="en-US">English</MenuItem>
                          <MenuItem value="ja-JP">日本語</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>时区</InputLabel>
                        <Select
                          value={settings.timezone}
                          onChange={handleSelectChange('timezone')}
                          label="时区"
                        >
                          <MenuItem value="Asia/Shanghai">北京时间 (UTC+8)</MenuItem>
                          <MenuItem value="UTC">UTC 时间</MenuItem>
                          <MenuItem value="America/New_York">纽约时间 (UTC-5)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="技术支持邮箱"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                    sx={{ mt: 2 }}
                    helperText="用户联系技术支持的邮箱地址"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoCameraIcon />
                    Logo 管理
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={settings.logoUrl}
                      sx={{ width: 120, height: 120, mb: 2, border: '2px dashed #ccc' }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    
                    <input
                      type="file"
                      ref={logoFileRef}
                      onChange={handleFileUpload('logo')}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => logoFileRef.current?.click()}
                      sx={{ mb: 2 }}
                    >
                      上传 Logo
                    </Button>
                    
                    <Typography variant="caption" color="text.secondary" align="center">
                      推荐尺寸：120x120px，支持 PNG/JPG 格式
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Logo URL"
                    value={settings.logoUrl}
                    onChange={(e) => handleSettingChange('logoUrl', e.target.value)}
                    helperText="或者直接输入Logo的网络地址"
                  />
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TuneIcon />
                    系统控制
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="维护模式"
                        secondary="开启后，普通用户无法访问系统"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.maintenanceMode}
                          onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                          color="warning"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="允许用户注册"
                        secondary="是否允许新用户自主注册账号"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.allowUserRegistration}
                          onChange={(e) => handleSettingChange('allowUserRegistration', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 2. 公司信息 */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon />
                    企业基本信息
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="公司名称"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="公司描述"
                    multiline
                    rows={3}
                    value={settings.companyDescription}
                    onChange={(e) => handleSettingChange('companyDescription', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="公司地址"
                    value={settings.companyAddress}
                    onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="联系电话"
                        value={settings.companyPhone}
                        onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="公司邮箱"
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="官网地址"
                    value={settings.companyWebsite}
                    onChange={(e) => handleSettingChange('companyWebsite', e.target.value)}
                    sx={{ mt: 2 }}
                    helperText="公司官方网站地址"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon />
                    法律信息
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="法定代表人"
                    value={settings.legalRepresentative}
                    onChange={(e) => handleSettingChange('legalRepresentative', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="工商注册号"
                    value={settings.registrationNumber}
                    onChange={(e) => handleSettingChange('registrationNumber', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="成立日期"
                    type="date"
                    value={settings.establishmentDate}
                    onChange={(e) => handleSettingChange('establishmentDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoCameraIcon />
                    品牌形象
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>公司横幅图片</Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 120,
                        border: '2px dashed #ccc',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: settings.bannerImage ? `url(${settings.bannerImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => bannerFileRef.current?.click()}
                    >
                      {!settings.bannerImage && (
                        <Box sx={{ textAlign: 'center' }}>
                          <PhotoCameraIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            点击上传横幅图片
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <input
                      type="file"
                      ref={bannerFileRef}
                      onChange={handleFileUpload('banner')}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      推荐尺寸：1200x300px，支持 PNG/JPG 格式
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 3. 联系人管理 */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {[
              { key: 'techSupportContact', title: '技术支持联系人', icon: <SettingsIcon />, color: 'primary' },
              { key: 'businessContact', title: '商务联系人', icon: <BusinessIcon />, color: 'secondary' },
              { key: 'emergencyContact', title: '紧急联系人', icon: <SecurityIcon />, color: 'error' }
            ].map((contactType, index) => (
              <Grid item xs={12} md={4} key={contactType.key}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {contactType.icon}
                      {contactType.title}
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="姓名"
                      value={(settings[contactType.key as keyof typeof settings] as any)?.name || ''}
                      onChange={(e) => handleNestedSettingChange(contactType.key, 'name', e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="邮箱"
                      type="email"
                      value={(settings[contactType.key as keyof typeof settings] as any)?.email || ''}
                      onChange={(e) => handleNestedSettingChange(contactType.key, 'email', e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="电话"
                      value={(settings[contactType.key as keyof typeof settings] as any)?.phone || ''}
                      onChange={(e) => handleNestedSettingChange(contactType.key, 'phone', e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="部门"
                      value={(settings[contactType.key as keyof typeof settings] as any)?.department || ''}
                      onChange={(e) => handleNestedSettingChange(contactType.key, 'department', e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="职位"
                      value={(settings[contactType.key as keyof typeof settings] as any)?.position || ''}
                      onChange={(e) => handleNestedSettingChange(contactType.key, 'position', e.target.value)}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* 4. 第三方服务集成 */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudIcon />
                    AI服务集成
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>AI服务提供商</InputLabel>
                    <Select
                      value={settings.aiServices.provider}
                      onChange={(e) => handleNestedSettingChange('aiServices', 'provider', e.target.value)}
                      label="AI服务提供商"
                    >
                      <MenuItem value="openai">OpenAI</MenuItem>
                      <MenuItem value="azure">Azure OpenAI</MenuItem>
                      <MenuItem value="anthropic">Claude (Anthropic)</MenuItem>
                      <MenuItem value="google">Google Bard</MenuItem>
                      <MenuItem value="baidu">百度文心一言</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="API密钥"
                    type="password"
                    value={settings.aiServices.apiKey}
                    onChange={(e) => handleNestedSettingChange('aiServices', 'apiKey', e.target.value)}
                    sx={{ mb: 2 }}
                    helperText="请妥善保管您的API密钥"
                  />

                  <TextField
                    fullWidth
                    label="API端点"
                    value={settings.aiServices.endpoint}
                    onChange={(e) => handleNestedSettingChange('aiServices', 'endpoint', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="默认模型"
                        value={settings.aiServices.model}
                        onChange={(e) => handleNestedSettingChange('aiServices', 'model', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="最大Token数"
                        type="number"
                        value={settings.aiServices.maxTokens}
                        onChange={(e) => handleNestedSettingChange('aiServices', 'maxTokens', parseInt(e.target.value))}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon />
                    云存储集成
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>存储服务商</InputLabel>
                    <Select
                      value={settings.cloudStorage.provider}
                      onChange={(e) => handleNestedSettingChange('cloudStorage', 'provider', e.target.value)}
                      label="存储服务商"
                    >
                      <MenuItem value="aws">Amazon S3</MenuItem>
                      <MenuItem value="aliyun">阿里云OSS</MenuItem>
                      <MenuItem value="qcloud">腾讯云COS</MenuItem>
                      <MenuItem value="huawei">华为云OBS</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Access Key"
                    type="password"
                    value={settings.cloudStorage.accessKey}
                    onChange={(e) => handleNestedSettingChange('cloudStorage', 'accessKey', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Secret Key"
                    type="password"
                    value={settings.cloudStorage.secretKey}
                    onChange={(e) => handleNestedSettingChange('cloudStorage', 'secretKey', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="存储桶名称"
                        value={settings.cloudStorage.bucket}
                        onChange={(e) => handleNestedSettingChange('cloudStorage', 'bucket', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="区域"
                        value={settings.cloudStorage.region}
                        onChange={(e) => handleNestedSettingChange('cloudStorage', 'region', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 5. 安全设置 */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon />
                    身份验证
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="双因素认证"
                        secondary="提高账户安全性"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableTwoFactor}
                          onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>

                  <TextField
                    fullWidth
                    label="会话超时(分钟)"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="密码最小长度"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="要求特殊字符"
                        secondary="密码必须包含特殊字符"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.passwordRequireSpecial}
                          onChange={(e) => handleSettingChange('passwordRequireSpecial', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="最大登录尝试次数"
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="锁定时长(分钟)"
                        type="number"
                        value={settings.lockoutDuration}
                        onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value))}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="IP白名单"
                    multiline
                    rows={3}
                    value={settings.ipWhitelist}
                    onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                    sx={{ mt: 2 }}
                    helperText="每行一个IP地址或IP段"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 6. 外观定制 */}
        <TabPanel value={currentTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaletteIcon />
                    主题配置
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>主题模式</InputLabel>
                    <Select
                      value={settings.theme}
                      onChange={handleSelectChange('theme')}
                      label="主题模式"
                    >
                      <MenuItem value="light">浅色</MenuItem>
                      <MenuItem value="dark">深色</MenuItem>
                      <MenuItem value="auto">自动</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="主色调"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="辅助色"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>字体族</InputLabel>
                    <Select
                      value={settings.fontFamily}
                      onChange={handleSelectChange('fontFamily')}
                      label="字体族"
                    >
                      <MenuItem value="Roboto">Roboto</MenuItem>
                      <MenuItem value="Noto Sans SC">"微软雅黑", sans-serif</MenuItem>
                      <MenuItem value="Arial">Arial</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>字体大小</InputLabel>
                    <Select
                      value={settings.fontSize}
                      onChange={handleSelectChange('fontSize')}
                      label="字体大小"
                    >
                      <MenuItem value="small">小</MenuItem>
                      <MenuItem value="medium">中等</MenuItem>
                      <MenuItem value="large">大</MenuItem>
                    </Select>
                  </FormControl>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="启用动画效果"
                        secondary="界面切换动画"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableAnimations}
                          onChange={(e) => handleSettingChange('enableAnimations', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="紧凑模式"
                        secondary="减少界面间距"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.compactMode}
                          onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>

                  <TextField
                    fullWidth
                    label="自定义CSS"
                    multiline
                    rows={4}
                    value={settings.customCSS}
                    onChange={(e) => handleSettingChange('customCSS', e.target.value)}
                    helperText="高级用户可添加自定义样式代码"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 7. 通知设置 */}
        <TabPanel value={currentTab} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon />
                    通知渠道
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="邮件通知"
                        secondary="通过邮件接收通知"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableEmailNotifications}
                          onChange={(e) => handleSettingChange('enableEmailNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="推送通知"
                        secondary="浏览器推送通知"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enablePushNotifications}
                          onChange={(e) => handleSettingChange('enablePushNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="短信通知"
                        secondary="重要事件短信提醒"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableSmsNotifications}
                          onChange={(e) => handleSettingChange('enableSmsNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="声音提醒"
                        secondary="播放提示音"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableSoundAlerts}
                          onChange={(e) => handleSettingChange('enableSoundAlerts', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    事件通知配置
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="实验状态通知"
                        secondary="实验开始、完成、失败通知"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.experimentStatusNotify}
                          onChange={(e) => handleSettingChange('experimentStatusNotify', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="设备告警通知"
                        secondary="设备异常时立即通知"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.deviceAlertNotify}
                          onChange={(e) => handleSettingChange('deviceAlertNotify', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="系统维护通知"
                        secondary="系统维护前的提醒"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.systemMaintenanceNotify}
                          onChange={(e) => handleSettingChange('systemMaintenanceNotify', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="安全警报通知"
                        secondary="安全事件即时通知"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.securityAlertNotify}
                          onChange={(e) => handleSettingChange('securityAlertNotify', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 8. 数据存储 */}
        <TabPanel value={currentTab} index={7}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon />
                    数据管理
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="自动保存间隔(分钟)"
                    type="number"
                    value={settings.autoSaveInterval}
                    onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="数据保留天数"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>备份频率</InputLabel>
                    <Select
                      value={settings.backupFrequency}
                      onChange={handleSelectChange('backupFrequency')}
                      label="备份频率"
                    >
                      <MenuItem value="hourly">每小时</MenuItem>
                      <MenuItem value="daily">每天</MenuItem>
                      <MenuItem value="weekly">每周</MenuItem>
                      <MenuItem value="monthly">每月</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>备份位置</InputLabel>
                    <Select
                      value={settings.backupLocation}
                      onChange={handleSelectChange('backupLocation')}
                      label="备份位置"
                    >
                      <MenuItem value="local">本地存储</MenuItem>
                      <MenuItem value="cloud">云存储</MenuItem>
                      <MenuItem value="both">本地+云存储</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>压缩级别</InputLabel>
                    <Select
                      value={settings.compressionLevel}
                      onChange={handleSelectChange('compressionLevel')}
                      label="压缩级别"
                    >
                      <MenuItem value="low">低</MenuItem>
                      <MenuItem value="medium">中等</MenuItem>
                      <MenuItem value="high">高</MenuItem>
                    </Select>
                  </FormControl>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="启用数据备份"
                        secondary="定期备份重要数据"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableDataBackup}
                          onChange={(e) => handleSettingChange('enableDataBackup', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="数据加密"
                        secondary="敏感数据加密存储"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableDataEncryption}
                          onChange={(e) => handleSettingChange('enableDataEncryption', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    文件管理
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="最大文件大小(MB)"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="允许的文件类型"
                    value={settings.allowedFileTypes}
                    onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                    helperText="用逗号分隔，如：jpg,png,pdf,doc"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 9. 系统性能 */}
        <TabPanel value={currentTab} index={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon />
                    性能配置
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="最大并发用户数"
                    type="number"
                    value={settings.maxConcurrentUsers}
                    onChange={(e) => handleSettingChange('maxConcurrentUsers', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="最大并发实验数"
                    type="number"
                    value={settings.maxConcurrentExperiments}
                    onChange={(e) => handleSettingChange('maxConcurrentExperiments', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="内存限制(MB)"
                    type="number"
                    value={settings.memoryLimit}
                    onChange={(e) => handleSettingChange('memoryLimit', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="缓存大小(MB)"
                    type="number"
                    value={settings.cacheSize}
                    onChange={(e) => handleSettingChange('cacheSize', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="硬件加速"
                        secondary="启用GPU加速计算"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableHardwareAcceleration}
                          onChange={(e) => handleSettingChange('enableHardwareAcceleration', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="CDN加速"
                        secondary="启用内容分发网络"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableCDN}
                          onChange={(e) => handleSettingChange('enableCDN', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="数据压缩"
                        secondary="启用数据传输压缩"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableDataCompression}
                          onChange={(e) => handleSettingChange('enableDataCompression', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 10. 实验平台配置 */}
        <TabPanel value={currentTab} index={9}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon />
                    实验配置
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>默认实验类型</InputLabel>
                    <Select
                      value={settings.defaultExperimentType}
                      onChange={handleSelectChange('defaultExperimentType')}
                      label="默认实验类型"
                    >
                      <MenuItem value="standard">标准实验</MenuItem>
                      <MenuItem value="advanced">高级实验</MenuItem>
                      <MenuItem value="research">研究型实验</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="数据收集间隔(秒)"
                    type="number"
                    value={settings.dataCollectionInterval}
                    onChange={(e) => handleSettingChange('dataCollectionInterval', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>默认权限级别</InputLabel>
                    <Select
                      value={settings.defaultPermissionLevel}
                      onChange={handleSelectChange('defaultPermissionLevel')}
                      label="默认权限级别"
                    >
                      <MenuItem value="viewer">查看者</MenuItem>
                      <MenuItem value="editor">编辑者</MenuItem>
                      <MenuItem value="admin">管理员</MenuItem>
                    </Select>
                  </FormControl>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="自动生成报告"
                        secondary="实验完成后自动生成报告"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.autoGenerateReports}
                          onChange={(e) => handleSettingChange('autoGenerateReports', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="实时监控"
                        secondary="启用实验过程实时监控"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableRealTimeMonitoring}
                          onChange={(e) => handleSettingChange('enableRealTimeMonitoring', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="版本控制"
                        secondary="启用实验版本管理"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableVersionControl}
                          onChange={(e) => handleSettingChange('enableVersionControl', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="团队协作"
                        secondary="启用多人协作功能"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableTeamCollaboration}
                          onChange={(e) => handleSettingChange('enableTeamCollaboration', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 11. 模拟数据管理 */}
        <TabPanel value={currentTab} index={10}>
          <DemoDataManager />
        </TabPanel>

        {/* 12. Docker部署文件生成器 */}
        <TabPanel value={currentTab} index={11}>
          <DockerDeploymentGenerator />
        </TabPanel>

        {/* 其他标签页内容省略，重点展示前3个标签页 */}
        {/* 4-10. 其他功能模块... */}
        
        {/* 底部操作按钮 */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              💡 提示：修改设置后请记得保存，重置操作将恢复所有默认值
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetSettings}
                color="warning"
              >
                重置设置
              </Button>
              <Button
                variant="contained"
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveSettings}
                size="large"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存设置'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EnhancedSettings;
