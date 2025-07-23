import React, { useState } from 'react';
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
  Snackbar,
  Alert
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userSettingsService } from '../services/userSettingsService';
import { UserSettings as UserSettingsType } from '../types';
import LoadingState from '../components/common/ui/LoadingState';

// 标签面板组件
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

const UserSettingsSimplified: React.FC = () => {
  // 查询客户端
  const queryClient = useQueryClient();

  // 标签页状态
  const [tabValue, setTabValue] = useState(0);

  // 提示消息状态
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // 获取用户设置
  const { data: userSettings, isLoading, error } = useQuery<UserSettingsType>(
    'userSettings',
    () => userSettingsService.getUserSettings()
  );

  // 更新用户个人资料
  const updateProfileMutation = useMutation(
    (profileData: Partial<any>) =>
      userSettingsService.updateUserProfile(profileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userSettings');
        setSnackbar({
          open: true,
          message: '个人资料已成功更新',
          severity: 'success'
        });
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: `更新失败: ${error.message}`,
          severity: 'error'
        });
      }
    }
  );

  // 更新用户偏好设置
  const updatePreferencesMutation = useMutation(
    (preferencesData: Partial<any>) =>
      userSettingsService.updateUserPreferences(preferencesData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userSettings');
        setSnackbar({
          open: true,
          message: '偏好设置已成功更新',
          severity: 'success'
        });
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: `更新失败: ${error.message}`,
          severity: 'error'
        });
      }
    }
  );

  // 更新通知设置
  const updateNotificationsMutation = useMutation(
    (notificationData: Partial<any>) =>
      userSettingsService.updateNotificationSettings(notificationData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userSettings');
        setSnackbar({
          open: true,
          message: '通知设置已成功更新',
          severity: 'success'
        });
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: `更新失败: ${error.message}`,
          severity: 'error'
        });
      }
    }
  );

  // 表单状态
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    department: '',
    bio: ''
  });

  // 密码表单状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 密码表单错误
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 初始化表单数据
  React.useEffect(() => {
    if (userSettings) {
      // 假设userSettings中有这些字段，根据实际结构调整
      setProfileForm({
        name: userSettings.branding?.companyName || '',
        email: userSettings.branding?.contactemail || '',
        department: '',  // 实际数据结构中可能没有此字段
        bio: ''  // 实际数据结构中可能没有此字段
      });
    }
  }, [userSettings]);

  // 处理标签页变化
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 处理表单提交
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  // 处理表单字段变化
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  // 切换主题设置
  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    if (userSettings) {
      updatePreferencesMutation.mutate({
        theme
      });
    }
  };

  // 切换显示设置
  const handleDisplaySettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userSettings && userSettings.preferences) {
      const { name, checked } = e.target;
      updatePreferencesMutation.mutate({
        preferences: {
          ...userSettings.preferences,
          [name]: checked
        }
      });
    }
  };

  // 切换邮件通知
  const handleEmailNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userSettings && userSettings.NotificationsIcon) {
      const { name, checked } = e.target;
      updateNotificationsMutation.mutate({
        NotificationsIcon: {
          ...userSettings.NotificationsIcon,
          [name]: checked
        }
      });
    }
  };

  // 密码修改函数
  const changePasswordMutation = useMutation(
    (passwordData: { currentPassword: string; newPassword: string }) =>
      userSettingsService.changePassword(passwordData.currentPassword, passwordData.newPassword),
    {
      onSuccess: (data) => {
        if (data.success) {
          setSnackbar({
            open: true,
            message: data.message,
            severity: 'success'
          });
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setPasswordErrors({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          setPasswordErrors({
            ...passwordErrors,
            currentPassword: data.message
          });
        }
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: `密码修改失败: ${error.message}`,
          severity: 'error'
        });
      }
    }
  );

  // 处理密码表单字段变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });

    // 清除对应字段的错误
    setPasswordErrors({
      ...passwordErrors,
      [name]: ''
    });
  };

  // 处理密码表单提交
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!passwordForm.currentPassword) {
      errors.currentPassword = '请输入当前密码';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = '请输入新密码';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = '密码长度至少为8个字符';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '请确认新密码';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    // 检查是否有错误
    if (errors.currentPassword || errors.newPassword || errors.confirmPassword) {
      setPasswordErrors(errors);
      return;
    }

    // 提交表单
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };  // 关闭提示消息
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg">
      <LoadingState
        loading={isLoading}
        error={(error as Error)?.message}
        isEmpty={!userSettings}
        emptyMessage="无法加载用户设置"
        onRetry={() => queryClient.invalidateQueries('userSettings')}
      >
      <Box sx={{ pt: 4, pb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          用户设置
        </Typography>

        <Paper sx={{ mt: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="个人资料" />
            <Tab label="偏好设置" />
            <Tab label="通知设置" />
          </Tabs>

          {/* 个人资料标签页 */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={userSettings.branding?.logoUrl || '/assets/avatars/default.png'}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mt: 2 }}
                >
                  上传新头像
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        userSettingsService.uploadAvatar(file).then(() => {
                          queryClient.invalidateQueries('userSettings');
                          setSnackbar({
                            open: true,
                            message: '头像已成功更新',
                            severity: 'success'
                          });
                        }).catch(error => {
                          setSnackbar({
                            open: true,
                            message: `上传头像失败: ${error.message}`,
                            severity: 'error'
                          });
                        });
                      }
                    }}
                  />
                </Button>
              </Grid>

              <Grid item xs={12} md={8}>
                <form onSubmit={handleProfileSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="姓名"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="邮箱"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="部门"
                        name="department"
                        value={profileForm.department}
                        onChange={handleProfileChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="个人简介"
                        name="bio"
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        multiline
                        rows={4}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={updateProfileMutation.isLoading}
                      >
                        {updateProfileMutation.isLoading ? '保存中...' : '保存资料'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                修改密码
              </Typography>
              <Paper sx={{ p: 3 }}>
                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="当前密码"
                        name="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="新密码"
                        name="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword || '密码至少需要8个字符'}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="确认新密码"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={changePasswordMutation.isLoading}
                        sx={{ mt: 1 }}
                      >
                        {changePasswordMutation.isLoading ? '修改中...' : '修改密码'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Box>
          </TabPanel>

          {/* 偏好设置标签页 */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  主题设置
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Button
                        variant={userSettings.theme === 'light' ? 'contained' : 'outlined'}
                        onClick={() => handleThemeChange('light')}
                        fullWidth
                        sx={{ justifyContent: 'flex-start', p: 2 }}
                      >
                        浅色主题
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant={userSettings.theme === 'dark' ? 'contained' : 'outlined'}
                        onClick={() => handleThemeChange('dark')}
                        fullWidth
                        sx={{ justifyContent: 'flex-start', p: 2 }}
                      >
                        深色主题
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant={userSettings.theme === 'auto' ? 'contained' : 'outlined'}
                        onClick={() => handleThemeChange('auto')}
                        fullWidth
                        sx={{ justifyContent: 'flex-start', p: 2 }}
                      >
                        跟随系统
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  显示设置
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="autoSave"
                            checked={userSettings.preferences?.autoSave || false}
                            onChange={handleDisplaySettingChange}
                          />
                        }
                        label="自动保存"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="autoBackupIcon"
                            checked={userSettings.preferences?.autoBackupIcon || false}
                            onChange={handleDisplaySettingChange}
                          />
                        }
                        label="自动备份"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="showTips"
                            checked={userSettings.experiments?.showTips || false}
                            onChange={(e) => {
                              if (userSettings && userSettings.experiments) {
                                const { name, checked } = e.target;
                                updatePreferencesMutation.mutate({
                                  experiments: {
                                    ...userSettings.experiments,
                                    [name]: checked
                                  }
                                });
                              }
                            }}
                          />
                        }
                        label="显示提示"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* 通知设置标签页 */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  邮件通知
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="email"
                            checked={userSettings.NotificationsIcon?.email || false}
                            onChange={handleEmailNotificationChange}
                          />
                        }
                        label="启用邮件通知"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="experimentUpdates"
                            checked={userSettings.NotificationsIcon?.experimentUpdates || false}
                            onChange={handleEmailNotificationChange}
                            disabled={!userSettings.NotificationsIcon?.email}
                          />
                        }
                        label="实验更新"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="systemAlerts"
                            checked={userSettings.NotificationsIcon?.systemAlerts || false}
                            onChange={handleEmailNotificationChange}
                            disabled={!userSettings.NotificationsIcon?.email}
                          />
                        }
                        label="系统通知"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  浏览器通知
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="push"
                            checked={userSettings.NotificationsIcon?.push || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                Notification.requestPermission().then(permission => {
                                  if (permission === 'granted') {
                                    updateNotificationsMutation.mutate({
                                      NotificationsIcon: {
                                        ...userSettings.NotificationsIcon,
                                        push: true
                                      }
                                    });
                                  } else {
                                    setSnackbar({
                                      open: true,
                                      message: '需要浏览器通知权限才能启用此功能',
                                      severity: 'warning'
                                    });
                                  }
                                });
                              } else {
                                updateNotificationsMutation.mutate({
                                  NotificationsIcon: {
                                    ...userSettings.NotificationsIcon,
                                    push: false
                                  }
                                });
                              }
                            }}
                          />
                        }
                        label="启用浏览器通知"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Box>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserSettingsSimplified;
