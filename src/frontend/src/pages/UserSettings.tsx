import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { userSettingsService } from '../services/userSettingsService';
import { UserSettings as UserSettingsType, ThemeType, LanguageType, FontSize, EmailDigestType } from '../types';
import TwoFactorAuth from '../components/security/TwoFactorAuth';

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
      id={`user-settings-tabpanel-${index}`}
      aria-labelledby={`user-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserSettings: React.FC = () => {
  // 标签页状态
  const [tabValue, setTabValue] = useState(0);

  // 提示消息状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // 显示成功消息
  const showSuccessMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // 显示错误消息
  const showErrorMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  // 关闭提示消息
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // 用户个人资料状态
  const [profile, setProfile] = useState({
    username: 'john_doe',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/assets/images/avatar.png',
    phone: '+86 123 4567 8901',
    department: '计算机科学与技术',
    title: '副教授',
    bio: '人工智能与机器学习领域研究员，专注于深度学习和自然语言处理。',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'NLP'],
  });

  // 安全设置状态
  const [security, setSecurity] = useState({
    password: '********',
    twoFactorEnabled: true,
    loginNotifications: true,
    lastPasswordChange: '2025-03-15',
    recentLogins: [
      { device: 'Windows PC', location: '北京', time: '2025-07-20 14:30' },
      { device: 'iPhone 16', location: '上海', time: '2025-07-19 09:15' },
      { device: 'MacBook Pro', location: '北京', time: '2025-07-18 18:45' },
    ],
    authorizedApps: [
      { name: 'Tableau', accessLevel: '只读', lastAccess: '2025-07-15' },
      { name: 'MATLAB', accessLevel: '完全访问', lastAccess: '2025-07-10' },
    ],
  });

  // 通知设置状态
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    pushEnabled: true,
    experimentCompleted: true,
    experimentStarted: true,
    resourceAvailable: true,
    systemAnnouncements: true,
    collaborationInvites: true,
    commentMentions: true,
    digestFrequency: 'daily',
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  // 界面偏好设置状态
  const [preferences, setPreferences] = useState({
    theme: 'system',
    colorScheme: 'blue',
    fontSize: 'medium',
    compactMode: false,
    animationsEnabled: true,
    highContrastMode: false,
    defaultPage: 'dashboard',
    experimentView: 'grid',
    language: 'zh-CN',
  });

  // 隐私设置状态
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'all',
    activityVisible: true,
    experimentsVisible: 'collaborators',
    searchable: true,
    dataUsageConsent: true,
    analyticsParticipation: true,
  });

  // 对话框状态
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [passwordValues, setPasswordValues] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
  });

  // 处理标签切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 处理个人资料更新
  const handleProfileChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setProfile({
      ...profile,
      [field]: event.target.value,
    });
  };

  // 处理安全设置切换
  const handleSecurityToggle = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSecurity({
      ...security,
      [field]: event.target.checked,
    });
  };

  // 处理通知设置切换
  const handleNotificationToggle = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNotifications({
      ...notifications,
      [field]: event.target.checked,
    });
  };

  // 处理通知设置变更
  const handleNotificationChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent<string>
  ) => {
    setNotifications({
      ...notifications,
      [field]: event.target.value,
    });
  };

  // 处理界面偏好切换
  const handlePreferenceToggle = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPreferences({
      ...preferences,
      [field]: event.target.checked,
    });
  };

  // 处理界面偏好变更
  const handlePreferenceChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent<string>
  ) => {
    setPreferences({
      ...preferences,
      [field]: event.target.value,
    });
  };

  // 处理隐私设置变更
  const handlePrivacyChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent<string>
  ) => {
    setPrivacy({
      ...privacy,
      [field]: event.target.value,
    });
  };

  // 处理隐私设置切换
  const handlePrivacyToggle = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPrivacy({
      ...privacy,
      [field]: event.target.checked,
    });
  };

  // 处理密码变更对话框
  const handlePasswordDialogOpen = () => {
    setPasswordDialogOpen(true);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setPasswordValues({
      current: '',
      new: '',
      confirm: '',
      showCurrent: false,
      showNew: false,
    });
  };

  const handlePasswordChange = (prop: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordValues({ ...passwordValues, [prop]: event.target.value });
  };

  const handlePasswordVisibility = (field: 'showCurrent' | 'showNew') => () => {
    setPasswordValues({
      ...passwordValues,
      [field]: !passwordValues[field],
    });
  };

  const handlePasswordSubmit = () => {
    // 密码验证逻辑
    if (passwordValues.new !== passwordValues.confirm) {
      setSnackbar({
        open: true,
        message: '新密码与确认密码不匹配',
        severity: 'error',
      });
      return;
    }

    if (passwordValues.new.length < 8) {
      setSnackbar({
        open: true,
        message: '密码必须至少包含8个字符',
        severity: 'error',
      });
      return;
    }

    // 模拟API调用
    setTimeout(() => {
      setSecurity({
        ...security,
        password: '********',
        lastPasswordChange: new Date().toISOString().split('T')[0],
      });

      setSnackbar({
        open: true,
        message: '密码已成功更新',
        severity: 'success',
      });

      handlePasswordDialogClose();
    }, 1000);
  };

  // 处理技能对话框
  const handleSkillDialogOpen = () => {
    setSkillDialogOpen(true);
  };

  const handleSkillDialogClose = () => {
    setSkillDialogOpen(false);
    setNewSkill('');
  };

  const handleAddSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill],
      });
      setNewSkill('');
      setSnackbar({
        open: true,
        message: '技能已添加',
        severity: 'success',
      });
    } else if (profile.skills.includes(newSkill)) {
      setSnackbar({
        open: true,
        message: '该技能已存在',
        severity: 'warning',
      });
    }
  };

  const handleDeleteSkill = (skill: string) => () => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill),
    });
  };

  // 处理保存操作
  const handleSaveProfile = () => {
    // 模拟API调用
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: '个人资料已成功更新',
        severity: 'success',
      });
    }, 1000);
  };

  const handleSaveSecurity = () => {
    // 模拟API调用
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: '安全设置已成功更新',
        severity: 'success',
      });
    }, 1000);
  };

  const handleSaveNotifications = () => {
    // 模拟API调用
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: '通知设置已成功更新',
        severity: 'success',
      });
    }, 1000);
  };

  const handleSavePreferences = () => {
    // 模拟API调用
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: '界面偏好已成功更新',
        severity: 'success',
      });
    }, 1000);
  };

  const handleSavePrivacy = () => {
    // 模拟API调用
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: '隐私设置已成功更新',
        severity: 'success',
      });
    }, 1000);
  };

  // 处理通知关闭
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        用户设置
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<PersonIcon />} label="个人资料" />
          <Tab icon={<SecurityIcon />} label="账户安全" />
          <Tab icon={<NotificationsIcon />} label="通知偏好" />
          <Tab icon={<PaletteIcon />} label="界面与体验" />
          <Tab icon={<VisibilityIcon />} label="隐私控制" />
        </Tabs>

        {/* 个人资料面板 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={profile.avatar}
                  alt={profile.displayName}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 1 }}
                >
                  上传新头像
                </Button>
                <Typography variant="caption" color="text.secondary">
                  支持JPG, PNG格式，最大2MB
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="用户名"
                    value={profile.username}
                    onChange={handleProfileChange('username')}
                    margin="normal"
                    disabled
                    helperText="用户名不可更改"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="显示名称"
                    value={profile.displayName}
                    onChange={handleProfileChange('displayName')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="电子邮箱"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange('email')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="手机号码"
                    value={profile.phone}
                    onChange={handleProfileChange('phone')}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                专业信息
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="部门/院系"
                    value={profile.department}
                    onChange={handleProfileChange('department')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="职位/头衔"
                    value={profile.title}
                    onChange={handleProfileChange('title')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="个人简介"
                    value={profile.bio}
                    onChange={handleProfileChange('bio')}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">技能与专长</Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleSkillDialogOpen}
                    >
                      添加技能
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        onDelete={handleDeleteSkill(skill)}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                >
                  保存变更
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 账户安全面板 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                密码管理
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      密码
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      上次更改: {security.lastPasswordChange}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={handlePasswordDialogOpen}
                  >
                    更改密码
                  </Button>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  两因素认证
                </Typography>
                <TwoFactorAuth
                  enabled={security.twoFactorEnabled}
                  onEnableComplete={() => {
                    setSecurity({
                      ...security,
                      twoFactorEnabled: true
                    });
                    showSuccessMessage('两因素认证已成功启用');
                  }}
                  onDisableComplete={() => {
                    setSecurity({
                      ...security,
                      twoFactorEnabled: false
                    });
                    showSuccessMessage('两因素认证已成功禁用');
                  }}
                />
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={security.loginNotifications}
                      onChange={handleSecurityToggle('loginNotifications')}
                    />
                  }
                  label="登录通知"
                />
                <Typography variant="body2" color="text.secondary">
                  当有新设备或异常位置登录时接收通知。
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                最近登录
              </Typography>

              <Paper variant="outlined" sx={{ p: 0, mb: 3 }}>
                <List disablePadding>
                  {security.recentLogins.map((login, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {login.device.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={login.device}
                          secondary={`${login.location} · ${login.time}`}
                        />
                      </ListItem>
                      {index < security.recentLogins.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>

              <Typography variant="h6" gutterBottom>
                授权应用
              </Typography>

              <Paper variant="outlined" sx={{ p: 0 }}>
                <List disablePadding>
                  {security.authorizedApps.map((app, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {app.name.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={app.name}
                          secondary={`访问级别: ${app.accessLevel} · 上次访问: ${app.lastAccess}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="revoke">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < security.authorizedApps.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSecurity}
                >
                  保存安全设置
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 通知偏好面板 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                接收渠道
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.emailEnabled}
                      onChange={handleNotificationToggle('emailEnabled')}
                    />
                  }
                  label="电子邮件通知"
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  将通知发送到您的电子邮箱 {profile.email}
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.pushEnabled}
                      onChange={handleNotificationToggle('pushEnabled')}
                    />
                  }
                  label="应用内通知"
                />
                <Typography variant="body2" color="text.secondary">
                  在AILAB平台内接收通知
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>
                免打扰时间
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.quietHoursEnabled}
                      onChange={handleNotificationToggle('quietHoursEnabled')}
                    />
                  }
                  label="启用免打扰时间"
                />

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="开始时间"
                      type="time"
                      value={notifications.quietHoursStart}
                      onChange={handleNotificationChange('quietHoursStart')}
                      InputLabelProps={{ shrink: true }}
                      disabled={!notifications.quietHoursEnabled}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="结束时间"
                      type="time"
                      value={notifications.quietHoursEnd}
                      onChange={handleNotificationChange('quietHoursEnd')}
                      InputLabelProps={{ shrink: true }}
                      disabled={!notifications.quietHoursEnabled}
                    />
                  </Grid>
                </Grid>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  在免打扰时间内，仅紧急通知会发送给您
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>
                摘要设置
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="digest-frequency-label">摘要频率</InputLabel>
                  <Select
                    labelId="digest-frequency-label"
                    value={notifications.digestFrequency}
                    label="摘要频率"
                    onChange={handleNotificationChange('digestFrequency')}
                  >
                    <MenuItem value="never">不接收摘要</MenuItem>
                    <MenuItem value="daily">每日摘要</MenuItem>
                    <MenuItem value="weekly">每周摘要</MenuItem>
                    <MenuItem value="monthly">每月摘要</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary">
                  定期摘要包含您的活动统计、实验进展和重要事件概览
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                通知类型
              </Typography>

              <Paper variant="outlined" sx={{ p: 0 }}>
                <List disablePadding>
                  <ListItem>
                    <ListItemText primary="实验完成通知" />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.experimentCompleted}
                        onChange={handleNotificationToggle('experimentCompleted')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText primary="实验开始通知" />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.experimentStarted}
                        onChange={handleNotificationToggle('experimentStarted')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText primary="资源可用通知" />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.resourceAvailable}
                        onChange={handleNotificationToggle('resourceAvailable')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText primary="系统公告" />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.systemAnnouncements}
                        onChange={handleNotificationToggle('systemAnnouncements')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText primary="协作邀请" />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.collaborationInvites}
                        onChange={handleNotificationToggle('collaborationInvites')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />

                  <ListItem>
                    <ListItemText primary="评论与提及" />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={notifications.commentMentions}
                        onChange={handleNotificationToggle('commentMentions')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveNotifications}
                >
                  保存通知设置
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 界面与体验面板 */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                主题设置
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="theme-label">显示主题</InputLabel>
                  <Select
                    labelId="theme-label"
                    value={preferences.theme}
                    label="显示主题"
                    onChange={handlePreferenceChange('theme')}
                  >
                    <MenuItem value="light">浅色模式</MenuItem>
                    <MenuItem value="dark">深色模式</MenuItem>
                    <MenuItem value="system">跟随系统</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="color-scheme-label">颜色方案</InputLabel>
                  <Select
                    labelId="color-scheme-label"
                    value={preferences.colorScheme}
                    label="颜色方案"
                    onChange={handlePreferenceChange('colorScheme')}
                  >
                    <MenuItem value="blue">科技蓝</MenuItem>
                    <MenuItem value="purple">智慧紫</MenuItem>
                    <MenuItem value="green">生态绿</MenuItem>
                    <MenuItem value="orange">活力橙</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.animationsEnabled}
                      onChange={handlePreferenceToggle('animationsEnabled')}
                    />
                  }
                  label="启用动画效果"
                />
              </Paper>

              <Typography variant="h6" gutterBottom>
                辅助功能
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="font-size-label">字体大小</InputLabel>
                  <Select
                    labelId="font-size-label"
                    value={preferences.fontSize}
                    label="字体大小"
                    onChange={handlePreferenceChange('fontSize')}
                  >
                    <MenuItem value="small">小</MenuItem>
                    <MenuItem value="medium">中</MenuItem>
                    <MenuItem value="large">大</MenuItem>
                    <MenuItem value="xlarge">超大</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.compactMode}
                      onChange={handlePreferenceToggle('compactMode')}
                    />
                  }
                  label="紧凑视图模式"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.highContrastMode}
                      onChange={handlePreferenceToggle('highContrastMode')}
                    />
                  }
                  label="高对比度模式"
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                布局与内容
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="default-page-label">默认登录页面</InputLabel>
                  <Select
                    labelId="default-page-label"
                    value={preferences.defaultPage}
                    label="默认登录页面"
                    onChange={handlePreferenceChange('defaultPage')}
                  >
                    <MenuItem value="dashboard">主控台</MenuItem>
                    <MenuItem value="experiments">实验管理</MenuItem>
                    <MenuItem value="devices">设备管理</MenuItem>
                    <MenuItem value="resources">资源管理</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="experiment-view-label">实验视图模式</InputLabel>
                  <Select
                    labelId="experiment-view-label"
                    value={preferences.experimentView}
                    label="实验视图模式"
                    onChange={handlePreferenceChange('experimentView')}
                  >
                    <MenuItem value="grid">网格视图</MenuItem>
                    <MenuItem value="list">列表视图</MenuItem>
                    <MenuItem value="compact">紧凑视图</MenuItem>
                  </Select>
                </FormControl>
              </Paper>

              <Typography variant="h6" gutterBottom>
                语言与地区
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="language-label">界面语言</InputLabel>
                  <Select
                    labelId="language-label"
                    value={preferences.language}
                    label="界面语言"
                    onChange={handlePreferenceChange('language')}
                  >
                    <MenuItem value="zh-CN">简体中文</MenuItem>
                    <MenuItem value="en-US">English (US)</MenuItem>
                    <MenuItem value="ja-JP">日本語</MenuItem>
                    <MenuItem value="ko-KR">한국어</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSavePreferences}
                >
                  保存界面设置
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 隐私控制面板 */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                个人资料隐私
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="profile-visibility-label">个人资料可见性</InputLabel>
                  <Select
                    labelId="profile-visibility-label"
                    value={privacy.profileVisibility}
                    label="个人资料可见性"
                    onChange={handlePrivacyChange('profileVisibility')}
                  >
                    <MenuItem value="all">所有人可见</MenuItem>
                    <MenuItem value="institution">仅本机构用户可见</MenuItem>
                    <MenuItem value="collaborators">仅协作者可见</MenuItem>
                    <MenuItem value="private">完全私密</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={privacy.activityVisible}
                      onChange={handlePrivacyToggle('activityVisible')}
                    />
                  }
                  label="显示我的活动状态"
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  当启用此选项时，其他用户可以看到您的在线状态和最近活动
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>
                实验与成果
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="experiments-visibility-label">实验可见性</InputLabel>
                  <Select
                    labelId="experiments-visibility-label"
                    value={privacy.experimentsVisible}
                    label="实验可见性"
                    onChange={handlePrivacyChange('experimentsVisible')}
                  >
                    <MenuItem value="all">所有人可见</MenuItem>
                    <MenuItem value="institution">仅本机构用户可见</MenuItem>
                    <MenuItem value="collaborators">仅协作者可见</MenuItem>
                    <MenuItem value="private">完全私密</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary">
                  此设置控制您的实验和研究成果的默认可见性，您也可以单独设置每个实验的可见性
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                搜索与发现
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={privacy.searchable}
                      onChange={handlePrivacyToggle('searchable')}
                    />
                  }
                  label="允许在平台内被搜索到"
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  当禁用此选项时，其他用户将无法通过搜索功能找到您
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>
                数据使用
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={privacy.dataUsageConsent}
                      onChange={handlePrivacyToggle('dataUsageConsent')}
                    />
                  }
                  label="同意使用数据改进平台"
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  允许AILAB平台收集使用数据以改进功能和用户体验
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={privacy.analyticsParticipation}
                      onChange={handlePrivacyToggle('analyticsParticipation')}
                    />
                  }
                  label="参与匿名分析"
                />

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  允许您的匿名使用数据用于平台分析和研究目的
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSavePrivacy}
                >
                  保存隐私设置
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* 密码修改对话框 */}
      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose}>
        <DialogTitle>修改密码</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="当前密码"
            type={passwordValues.showCurrent ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordValues.current}
            onChange={handlePasswordChange('current')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handlePasswordVisibility('showCurrent')}
                    edge="end"
                  >
                    {passwordValues.showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="新密码"
            type={passwordValues.showNew ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordValues.new}
            onChange={handlePasswordChange('new')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handlePasswordVisibility('showNew')}
                    edge="end"
                  >
                    {passwordValues.showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="确认新密码"
            type={passwordValues.showNew ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordValues.confirm}
            onChange={handlePasswordChange('confirm')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose}>取消</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" color="primary">
            确认修改
          </Button>
        </DialogActions>
      </Dialog>

      {/* 添加技能对话框 */}
      <Dialog open={skillDialogOpen} onClose={handleSkillDialogClose}>
        <DialogTitle>添加新技能</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="技能名称"
            fullWidth
            variant="outlined"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkillDialogClose}>取消</Button>
          <Button
            onClick={handleAddSkill}
            variant="contained"
            color="primary"
            disabled={!newSkill}
          >
            添加
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示通知 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserSettings;
