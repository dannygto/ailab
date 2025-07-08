import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  FormGroup,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { NotificationsIcon as NotificationIcon, EmailIcon, DeleteIcon, AddIcon, EditIcon, SmsIcon, PhoneIcon } from '../../utils/icons';

const NotificationSettings: React.FC = () => {
  const [notificationSettings, setnotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    systemNotifications: true,
    experimentNotifications: true,
    errorNotifications: true,
    reportNotifications: true,
    maintenanceNotifications: true,
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    },
    emailsettings: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'your-email@gmail.com',
      smtpPass: '***********',
      fromAddress: 'noreply@yourcompany.com',
      fromName: 'AICAM系统'
    },
    SmsIconsettings: {
      provider: 'twilio',
      apiKey: '***********',
      fromNumber: '+1234567890'
    }
  });

  const [notificationRules, setNotificationRules] = useState([
    { id: 1, name: '实验完成通知', type: 'experiment', enabled: true, channels: ['email', 'push'] },
    { id: 2, name: '系统错误通知', type: 'error', enabled: true, channels: ['email', 'SmsIcon', 'push'] },
    { id: 3, name: '设备离线通知', type: 'device', enabled: true, channels: ['email', 'push'] },
    { id: 4, name: '报告生成通知', type: 'report', enabled: true, channels: ['email'] },
    { id: 5, name: '维护通知', type: 'maintenance', enabled: true, channels: ['email', 'push'] }
  ]);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSettingChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [key]: value
      }
    }));
  };

  const handleSavesettings = async () => {
    try {
      // 这里应该调用api保存设置
      console.log('Saving notification settings:', notificationSettings);
      setSuccess('通知设置已保存');
    } catch (err) {
      setError('保存设置时发生错误');
    }
  };

  const handleTestNotification = (type: string) => {
    console.log(`Testing ${type} notification`);
    setSuccess(`${type} 测试通知已发送`);
  };

  const handleDeleteRule = (id: number) => {
    setNotificationRules(prev => prev.filter(rule => rule.id !== id));
  };

  const getChannelChips = (channels: string[]) => {
    return channels.map(channel => (
      <Chip
        key={channel}
        label={channel}
        size="small"
        sx={{ mr: 0.5 }}
        color={channel === 'email' ? 'primary' : channel === 'SmsIcon' ? 'secondary' : 'default'}
      />
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationIcon />
        通知设置
      </Typography>

      <Grid container spacing={3}>
        {/* 基本通知设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="基本通知设置" />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailEnabled}
                      onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                    />
                  }
                  label="启用邮件通知"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsEnabled}
                      onChange={(e) => handleSettingChange('smsEnabled', e.target.checked)}
                    />
                  }
                  label="启用短信通知"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.pushEnabled}
                      onChange={(e) => handleSettingChange('pushEnabled', e.target.checked)}
                    />
                  }
                  label="启用推送通知"
                />
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                通知类型
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.systemNotifications}
                      onChange={(e) => handleSettingChange('systemNotifications', e.target.checked)}
                    />
                  }
                  label="系统通知"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.experimentNotifications}
                      onChange={(e) => handleSettingChange('experimentNotifications', e.target.checked)}
                    />
                  }
                  label="实验通知"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.errorNotifications}
                      onChange={(e) => handleSettingChange('errorNotifications', e.target.checked)}
                    />
                  }
                  label="错误通知"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.reportNotifications}
                      onChange={(e) => handleSettingChange('reportNotifications', e.target.checked)}
                    />
                  }
                  label="报告通知"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.maintenanceNotifications}
                      onChange={(e) => handleSettingChange('maintenanceNotifications', e.target.checked)}
                    />
                  }
                  label="维护通知"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* 静音时间设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="静音时间设置" />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.quietHours.enabled}
                    onChange={(e) => handleNestedSettingChange('quietHours', 'enabled', e.target.checked)}
                  />
                }
                label="启用静音时间"
              />
              
              {notificationSettings.quietHours.enabled && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="开始时间"
                      type="time"
                      value={notificationSettings.quietHours.startTime}
                      onChange={(e) => handleNestedSettingChange('quietHours', 'startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="结束时间"
                      type="time"
                      value={notificationSettings.quietHours.endTime}
                      onChange={(e) => handleNestedSettingChange('quietHours', 'endTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                测试通知
              </Typography>
              <Grid container spacing={1}>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EmailIcon />}
                    onClick={() => handleTestNotification('邮件')}
                    disabled={!notificationSettings.emailEnabled}
                  >
                    测试邮件
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SmsIcon />}
                    onClick={() => handleTestNotification('短信')}
                    disabled={!notificationSettings.smsEnabled}
                  >
                    测试短信
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PhoneIcon />}
                    onClick={() => handleTestNotification('推送')}
                    disabled={!notificationSettings.pushEnabled}
                  >
                    测试推送
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 邮件设置 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="邮件设置" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="SMTP主机"
                    value={notificationSettings.emailsettings.smtpHost}
                    onChange={(e) => handleNestedSettingChange('emailsettings', 'smtpHost', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="SMTP端口"
                    type="number"
                    value={notificationSettings.emailsettings.smtpPort}
                    onChange={(e) => handleNestedSettingChange('emailsettings', 'smtpPort', parseInt(e.target.value))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="SMTP用户名"
                    value={notificationSettings.emailsettings.smtpUser}
                    onChange={(e) => handleNestedSettingChange('emailsettings', 'smtpUser', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="SMTP密码"
                    type="password"
                    value={notificationSettings.emailsettings.smtpPass}
                    onChange={(e) => handleNestedSettingChange('emailsettings', 'smtpPass', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="发送方邮箱"
                    value={notificationSettings.emailsettings.fromAddress}
                    onChange={(e) => handleNestedSettingChange('emailsettings', 'fromAddress', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="发送方名称"
                    value={notificationSettings.emailsettings.fromName}
                    onChange={(e) => handleNestedSettingChange('emailsettings', 'fromName', e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 通知规则 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="通知规则" 
              action={
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => console.log('Add notification rule')}
                >
                  添加规则
                </Button>
              }
            />
            <CardContent>
              <List>
                {notificationRules.map((rule) => (
                  <ListItem key={rule.id}>
                    <ListItemText
                      primary={rule.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            通知方式:
                          </Typography>
                          {getChannelChips(rule.channels)}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={rule.enabled}
                        onChange={(e) => {
                          setNotificationRules(prev => 
                            prev.map(r => r.id === rule.id ? { ...r, enabled: e.target.checked } : r)
                          );
                        }}
                      />
                      <IconButton>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteRule(rule.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 保存按钮 */}
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            onClick={handleSavesettings}
            sx={{ mr: 2 }}
          >
            保存设置
          </Button>
          <Button variant="outlined">
            重置为默认
          </Button>
        </Grid>
      </Grid>

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

export default NotificationSettings;


