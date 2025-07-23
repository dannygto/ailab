/**
 * 🔧 系统设置页面 - 完整功能
 * 
 * ✅ 功能模块
 * - AI模型配置
 * - 用户安全设置
 * - 主题和外观
 * - 通知设置
 * - 数据存储设置
 * - 系统性能设置
 * - 实验配置
 * - 高级设置
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
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
  CardActions,
  Chip,
  IconButton,
  Slider,
  SelectChangeEvent
} from '@mui/material';
import {
  SettingsIcon,
  SecurityIcon,
  PaletteIcon,
  NotificationsIcon,
  StorageIcon,
  SpeedIcon,
  ScienceIcon,
  TuneIcon,
  SaveIcon,
  RefreshIcon,
  EditIcon
} from '../utils/icons';

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

const Settings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({
    // AI模型配置
    aiModel: 'gpt-4',
    aiApiKey: '****-****-****-****',
    aiTemperature: 0.7,
    aiMaxTokens: 2048,
    enableAIAssistant: true,
    enableVoiceInput: false,
    
    // 用户安全
    enableTwoFactor: false,
    sessionTimeout: 30,
    passwordStrength: 'strong',
    enableLoginNotifications: true,
    
    // 主题外观
    theme: 'auto',
    language: 'zh-CN',
    fontSize: 'medium',
    enableAnimations: true,
    compactMode: false,
    
    // 通知设置
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableSoundAlerts: true,
    experimentStatusNotify: true,
    deviceAlertNotify: true,
    
    // 数据存储
    autoSaveInterval: 5,
    dataRetentionDays: 90,
    enableDataBackup: true,
    compressionLevel: 'medium',
    
    // 系统性能
    maxConcurrentExperiments: 10,
    enableHardwareAcceleration: true,
    memoryLimit: 2048,
    cacheSize: 512,
    
    // 实验配置
    defaultExperimentType: 'standard',
    autoGenerateReports: true,
    enableRealTimeMonitoring: true,
    dataCollectionInterval: 1
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSelectChange = (key: string) => (event: SelectChangeEvent) => {
    handleSettingChange(key, event.target.value);
  };

  const handleSaveSettings = () => {
    // 保存设置逻辑
    // console.log removed
    // 显示成功消息
  };

  const handleResetSettings = () => {
    // 重置为默认设置
    if (window.confirm('确定要重置所有设置吗？')) {
      // console.log removed
    }
  };

  const tabsConfig = [
    { label: 'AI模型', icon: <SettingsIcon /> },
    { label: '安全', icon: <SecurityIcon /> },
    { label: '外观', icon: <PaletteIcon /> },
    { label: '通知', icon: <NotificationsIcon /> },
    { label: '存储', icon: <StorageIcon /> },
    { label: '性能', icon: <SpeedIcon /> },
    { label: '实验', icon: <ScienceIcon /> },
    { label: '高级', icon: <TuneIcon /> }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon />
        系统设置
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        在这里可以配置系统的各项参数，修改后请记得保存设置。
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
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`settings-tab-${index}`}
              aria-controls={`settings-tabpanel-${index}`}
            />
          ))}
        </Tabs>

        {/* AI模型配置 */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>AI模型设置</Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>AI模型</InputLabel>
                    <Select
                      value={settings.aiModel}
                      onChange={handleSelectChange('aiModel')}
                      label="AI模型"
                    >
                      <MenuItem value="gpt-4">GPT-4</MenuItem>
                      <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                      <MenuItem value="claude-3">Claude 3</MenuItem>
                      <MenuItem value="doubao">豆包</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="API密钥"
                    type="password"
                    value={settings.aiApiKey}
                    onChange={(e) => handleSettingChange('aiApiKey', e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      )
                    }}
                  />

                  <Typography variant="body2" gutterBottom>
                    温度设置: {settings.aiTemperature}
                  </Typography>
                  <Slider
                    value={settings.aiTemperature}
                    onChange={(_, value) => handleSettingChange('aiTemperature', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    marks
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="最大Token数"
                    type="number"
                    value={settings.aiMaxTokens}
                    onChange={(e) => handleSettingChange('aiMaxTokens', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>AI功能控制</Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="启用AI助手"
                        secondary="开启智能对话和实验指导"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableAIAssistant}
                          onChange={(e) => handleSettingChange('enableAIAssistant', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="语音输入"
                        secondary="支持语音交互功能"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableVoiceInput}
                          onChange={(e) => handleSettingChange('enableVoiceInput', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 安全设置 */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>账户安全</Typography>
                  
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
                    
                    <ListItem>
                      <ListItemText
                        primary="登录通知"
                        secondary="异地登录时发送通知"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableLoginNotifications}
                          onChange={(e) => handleSettingChange('enableLoginNotifications', e.target.checked)}
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
                    sx={{ mt: 2 }}
                  />

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>密码强度要求</InputLabel>
                    <Select
                      value={settings.passwordStrength}
                      onChange={handleSelectChange('passwordStrength')}
                      label="密码强度要求"
                    >
                      <MenuItem value="weak">弱</MenuItem>
                      <MenuItem value="medium">中等</MenuItem>
                      <MenuItem value="strong">强</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 外观设置 */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>界面外观</Typography>
                  
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

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>语言</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={handleSelectChange('language')}
                      label="语言"
                    >
                      <MenuItem value="zh-CN">简体中文</MenuItem>
                      <MenuItem value="en-US">English</MenuItem>
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
                      <MenuItem value="medium">中</MenuItem>
                      <MenuItem value="large">大</MenuItem>
                    </Select>
                  </FormControl>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="启用动画"
                        secondary="界面过渡动画效果"
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
                        secondary="缩小界面元素间距"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.compactMode}
                          onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 通知设置 */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>通知偏好</Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="邮件通知"
                        secondary="重要事件邮件提醒"
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
                        secondary="浏览器推送消息"
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
                    
                    <ListItem>
                      <ListItemText
                        primary="实验状态通知"
                        secondary="实验完成或异常时通知"
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
                        primary="设备报警通知"
                        secondary="设备异常时立即通知"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.deviceAlertNotify}
                          onChange={(e) => handleSettingChange('deviceAlertNotify', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 数据存储设置 */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>数据管理</Typography>
                  
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
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 系统性能设置 */}
        <TabPanel value={currentTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>性能优化</Typography>
                  
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
                        secondary="启用GPU加速运算"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.enableHardwareAcceleration}
                          onChange={(e) => handleSettingChange('enableHardwareAcceleration', e.target.checked)}
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
                  <Typography variant="h6" gutterBottom>系统状态</Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      CPU使用率
                    </Typography>
                    <Chip label="32%" color="success" size="small" />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      内存使用率
                    </Typography>
                    <Chip label="45%" color="info" size="small" />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      存储空间
                    </Typography>
                    <Chip label="78% 已用" color="warning" size="small" />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      活跃实验数
                    </Typography>
                    <Chip label="3 个" color="primary" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 实验配置 */}
        <TabPanel value={currentTab} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>实验默认设置</Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>默认实验类型</InputLabel>
                    <Select
                      value={settings.defaultExperimentType}
                      onChange={handleSelectChange('defaultExperimentType')}
                      label="默认实验类型"
                    >
                      <MenuItem value="standard">标准实验</MenuItem>
                      <MenuItem value="advanced">高级实验</MenuItem>
                      <MenuItem value="simulation">仿真实验</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="数据采集间隔(秒)"
                    type="number"
                    value={settings.dataCollectionInterval}
                    onChange={(e) => handleSettingChange('dataCollectionInterval', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

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
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 高级设置 */}
        <TabPanel value={currentTab} index={7}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  高级设置可能影响系统稳定性，请谨慎修改。
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>系统配置</Typography>
                  
                  <TextField
                    fullWidth
                    label="调试模式"
                    select
                    defaultValue="off"
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="off">关闭</MenuItem>
                    <MenuItem value="basic">基础</MenuItem>
                    <MenuItem value="verbose">详细</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    label="日志级别"
                    select
                    defaultValue="info"
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="error">错误</MenuItem>
                    <MenuItem value="warn">警告</MenuItem>
                    <MenuItem value="info">信息</MenuItem>
                    <MenuItem value="debug">调试</MenuItem>
                  </TextField>

                  <Button 
                    variant="outlined" 
                    color="error" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={handleResetSettings}
                  >
                    重置所有设置
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>实验性功能</Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="beta功能预览"
                        secondary="启用未正式发布的新功能"
                      />
                      <ListItemSecondaryAction>
                        <Switch defaultChecked={false} />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="性能监控"
                        secondary="详细的性能数据收集"
                      />
                      <ListItemSecondaryAction>
                        <Switch defaultChecked={false} />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 底部操作按钮 */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetSettings}
            >
              重置
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              保存设置
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
