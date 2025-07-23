import React, { useState, useEffect } from 'react';
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
import {
  Business as BusinessIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import { apiRequest, API_ENDPOINTS } from '../../config/api';

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    autoSave: true,
    saveInterval: 30,
    defaultExperimentDuration: 60,
    maxFileSize: 100,
    enableNotifications: true,
    enableAnalytics: true
  });

  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: '示范学校',
    schoolType: 'middle_school',
    schoolCode: 'DEMO001',
    principalName: '张校长',
    principalPhone: '010-12345678',
    principalEmail: 'principal@demo-school.edu.cn',
    establishedYear: 1985,
    studentCount: 2000,
    teacherCount: 150,
    classCount: 60,
    schoolAddress: '北京市朝阳区示范路123号',
    schoolPhone: '010-12345678',
    schoolEmail: 'admin@demo-school.edu.cn',
    schoolWebsite: 'www.demo-school.edu.cn',
    schoolFax: '010-12345679',
    logoUrl: '/assets/school-logo.png',
    motto: '求实创新，全面发展',
    description: '一所历史悠久、特色鲜明的现代化学校',
    currentCampus: 'main',
    campuses: [
      {
        id: 'main',
        name: '主校区',
        address: '北京市朝阳区示范路123号',
        phone: '010-12345678',
        contactPerson: '李主任',
        email: 'main@demo-school.edu.cn',
        isMain: true,
        isActive: true,
        studentCount: 1500,
        teacherCount: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    systemName: 'AILAB智能实验教学平台',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    academicYear: '2024-2025',
    semester: '第一学期',
    allowCampusSwitching: true,
    dataIsolation: true,
    edition: 'general' as const,
    version: 'v1.0.0'
  });

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 组件加载时获取设置数据
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        // 从服务器获取设置
        const response = await apiRequest('/api/settings/general');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // 更新通用设置
            if (data.data.general) {
              setSettings(prev => ({ ...prev, ...data.data.general }));
            }

            // 更新学校设置
            if (data.data.school) {
              setSchoolSettings(prev => ({ ...prev, ...data.data.school }));
            }
          }
        } else {
          console.warn('无法从服务器获取设置，使用默认值');
        }

        // 从本地存储获取备份数据
        const localGeneralSettings = localStorage.getItem('general-settings');
        const localSchoolSettings = localStorage.getItem('school-settings');

        if (localGeneralSettings) {
          try {
            const parsed = JSON.parse(localGeneralSettings);
            setSettings(prev => ({ ...prev, ...parsed }));
          } catch (e) {
            console.warn('本地通用设置解析失败:', e);
          }
        }

        if (localSchoolSettings) {
          try {
            const parsed = JSON.parse(localSchoolSettings);
            setSchoolSettings(prev => ({ ...prev, ...parsed }));
          } catch (e) {
            console.warn('本地学校设置解析失败:', e);
          }
        }

      } catch (error) {
        console.error('加载设置失败:', error);
        setError('加载设置失败，使用默认配置');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSchoolChange = (key: string, value: any) => {
    setSchoolSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);

      // 构建要保存的数据
      const saveData = {
        general: settings,
        school: schoolSettings
      };

      const response = await apiRequest('/api/settings/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('学校设置已保存');
        localStorage.setItem('general-settings', JSON.stringify(settings));
        localStorage.setItem('school-settings', JSON.stringify(schoolSettings));
      } else {
        throw new Error(result.message || '保存失败');
      }
    } catch (err) {
      console.error('保存设置错误:', err);
      setError('保存设置时发生错误: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const getEditionName = (edition: string) => {
    switch (edition) {
      case 'general': return '普教版';
      case 'vocational': return '职教版';
      case 'higher': return '高校版';
      default: return '未知版本';
    }
  };

  const getSchoolTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'elementary': '小学',
      'middle_school': '初中',
      'high_school': '高中',
      'vocational': '职业学校',
      'college': '大专院校',
      'university': '大学',
      'comprehensive': '综合学校'
    };
    return types[type] || '未知类型';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          正在加载设置，请稍候...
        </Typography>
      </Box>
    );
  }

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
                      value={settings.language}
                      label="语言"
                      onChange={(e) => handleSettingChange('language', e.target.value)}
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
                      checked={settings.enableNotifications}
                      onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
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

        {/* 学校信息设置 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="学校信息设置"
              avatar={<BusinessIcon />}
              action={
                <Chip
                  label={getEditionName(schoolSettings.edition)}
                  color="primary"
                  size="small"
                />
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                {/* 基本信息 */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    基本信息
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="学校名称"
                    value={schoolSettings.schoolName}
                    onChange={(e) => handleSchoolChange('schoolName', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="学校代码"
                    value={schoolSettings.schoolCode}
                    onChange={(e) => handleSchoolChange('schoolCode', e.target.value)}
                    fullWidth
                    helperText="教育部门统一编码"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>学校类型</InputLabel>
                    <Select
                      value={schoolSettings.schoolType}
                      label="学校类型"
                      onChange={(e) => handleSchoolChange('schoolType', e.target.value)}
                    >
                      <MenuItem value="elementary">小学</MenuItem>
                      <MenuItem value="middle_school">初中</MenuItem>
                      <MenuItem value="high_school">高中</MenuItem>
                      <MenuItem value="vocational">职业学校</MenuItem>
                      <MenuItem value="college">大专院校</MenuItem>
                      <MenuItem value="university">大学</MenuItem>
                      <MenuItem value="comprehensive">综合学校</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="建校年份"
                    type="number"
                    value={schoolSettings.establishedYear || ''}
                    onChange={(e) => handleSchoolChange('establishedYear', parseInt(e.target.value) || undefined)}
                    fullWidth
                    InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
                  />
                </Grid>

                {/* 管理信息 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom color="primary">
                    管理信息
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="校长姓名"
                    value={schoolSettings.principalName}
                    onChange={(e) => handleSchoolChange('principalName', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="校长电话"
                    value={schoolSettings.principalPhone || ''}
                    onChange={(e) => handleSchoolChange('principalPhone', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="校长邮箱"
                    type="email"
                    value={schoolSettings.principalEmail || ''}
                    onChange={(e) => handleSchoolChange('principalEmail', e.target.value)}
                    fullWidth
                  />
                </Grid>

                {/* 联系信息 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom color="primary">
                    联系信息
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="学校地址"
                    value={schoolSettings.schoolAddress}
                    onChange={(e) => handleSchoolChange('schoolAddress', e.target.value)}
                    fullWidth
                    required
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="学校电话"
                    value={schoolSettings.schoolPhone}
                    onChange={(e) => handleSchoolChange('schoolPhone', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="学校邮箱"
                    type="email"
                    value={schoolSettings.schoolEmail}
                    onChange={(e) => handleSchoolChange('schoolEmail', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="学校网站"
                    value={schoolSettings.schoolWebsite || ''}
                    onChange={(e) => handleSchoolChange('schoolWebsite', e.target.value)}
                    fullWidth
                    placeholder="https://www.example.edu.cn"
                  />
                </Grid>

                {/* 品牌信息 */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom color="primary">
                    品牌形象
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="校训"
                    value={schoolSettings.motto || ''}
                    onChange={(e) => handleSchoolChange('motto', e.target.value)}
                    fullWidth
                    placeholder="如：求实创新，全面发展"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="学校简介"
                    value={schoolSettings.description || ''}
                    onChange={(e) => handleSchoolChange('description', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="请简要介绍学校的办学特色、历史沿革等"
                  />
                </Grid>

                {/* Logo显示 */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={schoolSettings.logoUrl}
                      sx={{ width: 64, height: 64 }}
                      variant="rounded"
                    >
                      {schoolSettings.schoolName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        size="small"
                      >
                        上传Logo
                        <input type="file" hidden accept="image/*" />
                      </Button>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        建议尺寸：256x256像素，支持PNG/JPG格式
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 校区管理 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="校区管理"
              action={
                <Button variant="outlined" size="small">
                  添加校区
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>当前校区</InputLabel>
                    <Select
                      value={schoolSettings.currentCampus}
                      label="当前校区"
                      onChange={(e) => handleSchoolChange('currentCampus', e.target.value)}
                    >
                      {schoolSettings.campuses.map((campus) => (
                        <MenuItem key={campus.id} value={campus.id}>
                          {campus.name} {campus.isMain ? '(主校区)' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={schoolSettings.allowCampusSwitching}
                        onChange={(e) => handleSchoolChange('allowCampusSwitching', e.target.checked)}
                      />
                    }
                    label="允许用户切换校区"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={schoolSettings.dataIsolation}
                        onChange={(e) => handleSchoolChange('dataIsolation', e.target.checked)}
                      />
                    }
                    label="启用校区数据隔离"
                  />
                </Grid>

                {/* 校区列表 */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    校区列表：
                  </Typography>
                  {schoolSettings.campuses.map((campus) => (
                    <Box key={campus.id} sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1
                    }}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {campus.name}
                          {campus.isMain && <Chip label="主校区" size="small" color="primary" sx={{ ml: 1 }} />}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {campus.address}
                        </Typography>
                        {campus.contactPerson && (
                          <Typography variant="caption" color="text.secondary">
                            联系人：{campus.contactPerson} {campus.phone}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Button size="small" color="primary">编辑</Button>
                        {!campus.isMain && (
                          <Button size="small" color="error">删除</Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 系统信息 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="系统信息" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="系统名称"
                    value={schoolSettings.systemName}
                    onChange={(e) => handleSchoolChange('systemName', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="当前学年"
                    value={schoolSettings.academicYear}
                    onChange={(e) => handleSchoolChange('academicYear', e.target.value)}
                    fullWidth
                    placeholder="如：2024-2025"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>当前学期</InputLabel>
                    <Select
                      value={schoolSettings.semester}
                      label="当前学期"
                      onChange={(e) => handleSchoolChange('semester', e.target.value)}
                    >
                      <MenuItem value="第一学期">第一学期</MenuItem>
                      <MenuItem value="第二学期">第二学期</MenuItem>
                      <MenuItem value="暑期">暑期</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    当前系统为{getEditionName(schoolSettings.edition)}，
                    专为{getSchoolTypeName(schoolSettings.schoolType)}设计。
                    版本：{schoolSettings.version}
                  </Alert>
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
            onClick={handleSaveSettings}
            sx={{ mr: 2 }}
          >
            保存设置
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            重置设置
          </Button>
        </Grid>
      </Grid>

      {/* 成功提示 */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* 错误提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GeneralSettings;
