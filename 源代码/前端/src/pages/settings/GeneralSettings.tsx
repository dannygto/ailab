import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Avatar,
  Slider
} from '@mui/material';
import {  LanguageIcon, AccessTimeIcon, BusinessIcon as CompanyIcon, SaveIcon, RefreshIcon, CloudIcon } from '../../utils/icons';

const generalSettings: React.FC = () => {
  const [SettingsIcon, setsettings] = useState({
    LanguageIcon: 'zh-CN',
    timezone: 'Asia/Shanghai',
    autoSave: true,
    saveInterval: 30,
    defaultExperimentDuration: 60,
    maxFileSize: 100,
    enableNotificationsIcon: true,
    enableAnalytics: true
  });
  
  const [brandingsettings, setBrandingsettings] = useState({
    siteName: 'AICAM教学管理平台',
    companyName: '未来科技教育有限公司',
    contactemail: 'support@future-edu.com',
    contactPhone: '400-888-9999',
    logoUrl: '/logo.png'
  });
  
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSettingChange = (key: string, value: any) => {
    setsettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleBrandingChange = (key: string, value: any) => {
    setBrandingsettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSavesettings = async () => {
    try {
      // 这里应该调用api保存设置
      console.log('Saving general settings:', settings);
      console.log('Saving branding settings:', brandingsettings);
      setSuccess('通用设置已保存');
    } catch (err) {
      setError('保存设置时发生错误');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        通用设置
      </Typography>

      <Grid container spacing={3}>
        {/* 基本设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="基本设置" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>语言</InputLabel>
                    <Select
                      value={settings.LanguageIcon}
                      label="语言"
                      onChange={(e) => handleSettingChange('LanguageIcon', e.target.value)}
                    >
                      <MenuItem value="zh-CN">简体中文</MenuItem>
                      <MenuItem value="en-US">English</MenuItem>
                      <MenuItem value="ja-JP">日本語</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>时区</InputLabel>
                    <Select
                      value={settings.timezone}
                      label="时区"
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                      <MenuItem value="Asia/Shanghai">Asia/Shanghai (UTC+8)</MenuItem>
                      <MenuItem value="America/New_York">America/New_York (UTC-5)</MenuItem>
                      <MenuItem value="Europe/London">Europe/London (UTC+0)</MenuItem>
                      <MenuItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>自动保存间隔（分钟）</Typography>
                  <Slider
                    value={settings.saveInterval}
                    onChange={(e, value) => handleSettingChange('saveInterval', value)}
                    aria-labelledby="save-interval-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={5}
                    max={60}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>默认实验时长（分钟）</Typography>
                  <Slider
                    value={settings.defaultExperimentDuration}
                    onChange={(e, value) => handleSettingChange('defaultExperimentDuration', value)}
                    aria-labelledby="experiment-duration-slider"
                    valueLabelDisplay="auto"
                    step={15}
                    marks
                    min={15}
                    max={180}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>最大文件大小（MB）</Typography>
                  <Slider
                    value={settings.maxFileSize}
                    onChange={(e, value) => handleSettingChange('maxFileSize', value)}
                    aria-labelledby="max-file-size-slider"
                    valueLabelDisplay="auto"
                    step={10}
                    marks
                    min={10}
                    max={500}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 功能开关 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="功能开关" />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                  }
                  label="启用自动保存"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableNotificationsIcon}
                      onChange={(e) => handleSettingChange('enableNotificationsIcon', e.target.checked)}
                    />
                  }
                  label="启用通知"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableAnalytics}
                      onChange={(e) => handleSettingChange('enableAnalytics', e.target.checked)}
                    />
                  }
                  label="启用数据分析"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* 品牌设置 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="品牌设置" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="站点名称"
                    value={brandingsettings.siteName}
                    onChange={(e) => handleBrandingChange('siteName', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="公司名称"
                    value={brandingsettings.companyName}
                    onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="联系邮箱"
                    type="email"
                    value={brandingsettings.contactemail}
                    onChange={(e) => handleBrandingChange('contactemail', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="联系电话"
                    value={brandingsettings.contactPhone}
                    onChange={(e) => handleBrandingChange('contactPhone', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography>当前Logo:</Typography>
                    <Avatar
                      src={brandingsettings.logoUrl}
                      alt="Logo"
                      sx={{ width: 40, height: 40 }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<UploadFileIcon />}
                      component="label"
                    >
                      上传新Logo
                      <input type="file" hidden accept="image/*" />
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 保存按钮 */}
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSavesettings}
            sx={{ mr: 2 }}
          >
            保存设置
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
          >
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

export default GeneralSettings;


