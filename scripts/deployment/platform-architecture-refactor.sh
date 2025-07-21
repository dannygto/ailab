#!/bin/bash

# 🏗️ AILAB平台架构重构脚本 - 解决功能重复和API问题

set -e

echo "=========================================="
echo "🚀 开始AILAB平台架构重构"
echo "=========================================="

# 1. 修复API端口配置问题
echo "🔧 1. 修复API端口配置..."

# 确保环境变量正确
cat > /home/ubuntu/ailab/src/frontend/.env << 'EOL'
REACT_APP_API_URL=http://82.156.75.232:3001
GENERATE_SOURCEMAP=false
EOL

# 修复API配置文件
cat > /home/ubuntu/ailab/src/frontend/src/config/api.ts << 'EOL'
// API基础配置
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://82.156.75.232:3001';

// API端点
export const API_ENDPOINTS = {
  schools: '/api/schools',
  devices: '/api/devices',
  templates: '/api/templates',
  experiments: '/api/experiments',
  settings: '/api/settings',
  guidance: '/api/guidance'
};

// HTTP客户端配置
export const httpConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 校区服务API
export const schoolAPI = {
  // 获取所有校区
  getAllSchools: async () => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.schools}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // 根据代码获取校区
  getSchoolByCode: async (code: string) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.schools}/${code}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // 创建校区
  createSchool: async (schoolData: any) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.schools}`, {
      method: 'POST',
      headers: httpConfig.headers,
      body: JSON.stringify(schoolData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // 更新校区
  updateSchool: async (id: number, schoolData: any) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.schools}/${id}`, {
      method: 'PUT',
      headers: httpConfig.headers,
      body: JSON.stringify(schoolData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // 删除校区
  deleteSchool: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.schools}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
};
EOL

# 2. 重新设计页面结构和侧边栏
echo "🎨 2. 重新设计页面结构..."

# 创建新的侧边栏配置
cat > /home/ubuntu/ailab/src/frontend/src/config/navigation.ts << 'EOL'
/**
 * 导航菜单配置
 * 重新设计避免功能重复
 */

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  children?: MenuItem[];
  permission?: string;
  badge?: string;
}

export const navigationConfig: MenuItem[] = [
  // 主要功能区
  {
    id: 'dashboard',
    label: '工作台',
    icon: 'Dashboard',
    path: '/dashboard'
  },
  {
    id: 'experiments',
    label: '实验管理',
    icon: 'Science',
    path: '/experiments',
    children: [
      { id: 'exp-list', label: '实验列表', icon: 'List', path: '/experiments' },
      { id: 'exp-create', label: '创建实验', icon: 'Add', path: '/experiments/create' },
      { id: 'exp-templates', label: '实验模板', icon: 'Template', path: '/templates' }
    ]
  },
  {
    id: 'devices',
    label: '设备管理',
    icon: 'DeviceHub',
    path: '/devices',
    children: [
      { id: 'device-list', label: '设备列表', icon: 'List', path: '/devices' },
      { id: 'device-monitor', label: '设备监控', icon: 'Monitor', path: '/devices/monitoring' },
      { id: 'device-control', label: '设备控制', icon: 'Settings', path: '/devices/advanced-control' }
    ]
  },
  {
    id: 'data',
    label: '数据分析',
    icon: 'Analytics',
    path: '/data',
    children: [
      { id: 'data-collection', label: '数据收集', icon: 'CollectionsBookmark', path: '/data/collection' },
      { id: 'data-analysis', label: '数据分析', icon: 'Analytics', path: '/data/analysis' }
    ]
  },

  // 管理功能区 (仅管理员可见)
  {
    id: 'admin',
    label: '系统管理',
    icon: 'AdminPanelSettings',
    path: '/admin',
    permission: 'admin',
    children: [
      { id: 'school-mgmt', label: '校区管理', icon: 'School', path: '/admin/schools' },
      { id: 'user-mgmt', label: '用户管理', icon: 'People', path: '/admin/users' },
      { id: 'system-settings', label: '系统设置', icon: 'Settings', path: '/admin/system-settings' }
    ]
  },

  // 个人设置区
  {
    id: 'settings',
    label: '个人设置',
    icon: 'Settings',
    path: '/settings',
    children: [
      { id: 'profile', label: '个人资料', icon: 'Person', path: '/settings/profile' },
      { id: 'preferences', label: '偏好设置', icon: 'Tune', path: '/settings/preferences' },
      { id: 'security', label: '安全设置', icon: 'Security', path: '/settings/security' }
    ]
  },

  // 帮助和支持
  {
    id: 'help',
    label: '帮助支持',
    icon: 'Help',
    path: '/help',
    children: [
      { id: 'docs', label: '使用文档', icon: 'MenuBook', path: '/help/docs' },
      { id: 'ai-assistant', label: 'AI助手', icon: 'SmartToy', path: '/ai-assistant' },
      { id: 'feedback', label: '意见反馈', icon: 'Feedback', path: '/help/feedback' }
    ]
  }
];

// 页面权限配置
export const pagePermissions = {
  '/admin': ['admin'],
  '/admin/schools': ['admin'],
  '/admin/users': ['admin'],
  '/admin/system-settings': ['admin'],
  '/experiments/create': ['teacher', 'admin'],
  '/templates/create': ['teacher', 'admin'],
  '/devices/advanced-control': ['teacher', 'admin']
};

// 用户角色定义
export const userRoles = {
  student: '学生',
  teacher: '教师',
  admin: '管理员',
  guest: '访客'
};
EOL

# 3. 重新设计EnhancedSettings页面 - 仅作为个人设置
echo "📝 3. 重新设计个人设置页面..."
cat > /home/ubuntu/ailab/src/frontend/src/pages/settings/PersonalSettings.tsx << 'EOL'
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Card, CardContent, CardHeader,
  Grid, TextField, Switch, FormControlLabel, Button, Alert,
  Avatar, FormControl, InputLabel, Select, MenuItem, Slider
} from '@mui/material';
import {
  Person as PersonIcon,
  Tune as TuneIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Save as SaveIcon
} from '@mui/icons-material';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PersonalSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // 个人资料
    name: '张老师',
    email: 'zhang@school.edu.cn',
    phone: '13800138000',
    avatar: '/assets/avatar.jpg',
    department: 'computer',
    title: 'teacher',

    // 偏好设置
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    theme: 'light',
    fontSize: 14,
    autoSave: true,
    saveInterval: 30,

    // 通知设置
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    experimentAlerts: true,
    systemUpdates: true,

    // 安全设置
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 120
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // 保存设置到后端
    console.log('保存个人设置:', settings);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <PersonIcon />
        个人设置
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        在这里管理您的个人资料、偏好设置和安全选项
      </Alert>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<PersonIcon />} label="个人资料" />
            <Tab icon={<TuneIcon />} label="偏好设置" />
            <Tab icon={<NotificationsIcon />} label="通知设置" />
            <Tab icon={<SecurityIcon />} label="安全设置" />
          </Tabs>
        </Box>

        {/* 个人资料 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={settings.avatar}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  />
                  <Button variant="outlined" component="label">
                    更换头像
                    <input type="file" hidden accept="image/*" />
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="基本信息" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="姓名"
                        value={settings.name}
                        onChange={(e) => handleSettingChange('name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="邮箱"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="手机号"
                        value={settings.phone}
                        onChange={(e) => handleSettingChange('phone', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>职位</InputLabel>
                        <Select
                          value={settings.title}
                          onChange={(e) => handleSettingChange('title', e.target.value)}
                        >
                          <MenuItem value="teacher">教师</MenuItem>
                          <MenuItem value="admin">管理员</MenuItem>
                          <MenuItem value="assistant">助教</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 偏好设置 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="语言和地区" />
                <CardContent>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>语言</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <MenuItem value="zh-CN">简体中文</MenuItem>
                      <MenuItem value="en-US">English</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal">
                    <InputLabel>时区</InputLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                      <MenuItem value="Asia/Shanghai">北京时间</MenuItem>
                      <MenuItem value="America/New_York">纽约时间</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="界面设置" />
                <CardContent>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>主题</InputLabel>
                    <Select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">浅色主题</MenuItem>
                      <MenuItem value="dark">深色主题</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>字体大小</Typography>
                    <Slider
                      value={settings.fontSize}
                      onChange={(e, value) => handleSettingChange('fontSize', value)}
                      min={12}
                      max={18}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSave}
                        onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                      />
                    }
                    label="自动保存"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 通知设置 */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader title="通知偏好" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label="邮件通知"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                    }
                    label="浏览器推送"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.experimentAlerts}
                        onChange={(e) => handleSettingChange('experimentAlerts', e.target.checked)}
                      />
                    }
                    label="实验进度通知"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.systemUpdates}
                        onChange={(e) => handleSettingChange('systemUpdates', e.target.checked)}
                      />
                    }
                    label="系统更新通知"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* 安全设置 */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardHeader title="账户安全" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      />
                    }
                    label="启用双因子认证"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.loginAlerts}
                        onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                      />
                    }
                    label="异常登录提醒"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>会话超时时间 (分钟)</Typography>
                    <Slider
                      value={settings.sessionTimeout}
                      onChange={(e, value) => handleSettingChange('sessionTimeout', value)}
                      min={30}
                      max={480}
                      step={30}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* 保存按钮 */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            保存设置
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PersonalSettings;
EOL

# 4. 创建专门的校区管理页面
echo "🏫 4. 创建校区管理页面..."
cat > /home/ubuntu/ailab/src/frontend/src/pages/admin/SchoolManagementPage.tsx << 'EOL'
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Card, CardContent, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Chip, Avatar, Alert, Snackbar
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { schoolAPI } from '../../config/api';

interface School {
  id: number;
  name: string;
  code: string;
  logoUrl?: string;
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  active: boolean;
}

const SchoolManagementPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    code: '',
    logoUrl: '',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e'
  });

  // 获取校区列表
  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await schoolAPI.getAllSchools();
      if (response.success) {
        setSchools(response.data || []);
      } else {
        throw new Error(response.error || '获取校区失败');
      }
    } catch (error) {
      console.error('获取校区列表失败:', error);
      setSnackbar({
        open: true,
        message: `获取校区列表失败: ${error instanceof Error ? error.message : '未知错误'}`,
        severity: 'error'
      });
    }
    setLoading(false);
  };

  // 保存校区
  const saveSchool = async () => {
    setLoading(true);
    try {
      const schoolData = {
        name: schoolForm.name,
        code: schoolForm.code,
        logoUrl: schoolForm.logoUrl,
        themeSettings: {
          primaryColor: schoolForm.primaryColor,
          secondaryColor: schoolForm.secondaryColor
        }
      };

      let response;
      if (editingSchool) {
        response = await schoolAPI.updateSchool(editingSchool.id, schoolData);
      } else {
        response = await schoolAPI.createSchool(schoolData);
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: editingSchool ? '校区更新成功' : '校区创建成功',
          severity: 'success'
        });
        setDialogOpen(false);
        resetForm();
        fetchSchools();
      } else {
        throw new Error(response.error || '保存校区失败');
      }
    } catch (error) {
      console.error('保存校区失败:', error);
      setSnackbar({
        open: true,
        message: `保存校区失败: ${error instanceof Error ? error.message : '未知错误'}`,
        severity: 'error'
      });
    }
    setLoading(false);
  };

  // 删除校区
  const deleteSchool = async (schoolId: number) => {
    if (!window.confirm('确定要删除这个校区吗？')) return;

    setLoading(true);
    try {
      const response = await schoolAPI.deleteSchool(schoolId);
      if (response.success) {
        setSnackbar({ open: true, message: '校区删除成功', severity: 'success' });
        fetchSchools();
      } else {
        throw new Error(response.error || '删除校区失败');
      }
    } catch (error) {
      console.error('删除校区失败:', error);
      setSnackbar({
        open: true,
        message: `删除校区失败: ${error instanceof Error ? error.message : '未知错误'}`,
        severity: 'error'
      });
    }
    setLoading(false);
  };

  // 重置表单
  const resetForm = () => {
    setEditingSchool(null);
    setSchoolForm({
      name: '',
      code: '',
      logoUrl: '',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e'
    });
  };

  // 编辑校区
  const editSchool = (school: School) => {
    setEditingSchool(school);
    setSchoolForm({
      name: school.name,
      code: school.code,
      logoUrl: school.logoUrl || '',
      primaryColor: school.themeSettings?.primaryColor || '#1976d2',
      secondaryColor: school.themeSettings?.secondaryColor || '#dc004e'
    });
    setDialogOpen(true);
  };

  // 添加校区
  const addSchool = () => {
    resetForm();
    setDialogOpen(true);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SchoolIcon />
        校区管理
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        管理系统中的所有校区，包括创建、编辑和删除校区信息
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addSchool}
          disabled={loading}
        >
          添加校区
        </Button>
      </Box>

      {loading && schools.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          正在加载校区数据...
        </Alert>
      )}

      <Grid container spacing={3}>
        {schools.map((school) => (
          <Grid item xs={12} md={6} lg={4} key={school.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={school.logoUrl}
                    sx={{
                      mr: 2,
                      bgcolor: school.themeSettings?.primaryColor || '#1976d2'
                    }}
                  >
                    {school.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{school.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      代码: {school.code}
                    </Typography>
                  </Box>
                  <Chip
                    label={school.active ? "活跃" : "停用"}
                    color={school.active ? "success" : "default"}
                    size="small"
                  />
                </Box>

                {school.themeSettings && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      主题颜色:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: school.themeSettings.primaryColor,
                          border: '1px solid #ccc'
                        }}
                      />
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: school.themeSettings.secondaryColor,
                          border: '1px solid #ccc'
                        }}
                      />
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    onClick={() => editSchool(school)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => deleteSchool(school.id)}
                    disabled={loading}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {schools.length === 0 && !loading && (
        <Alert severity="info">
          暂无校区信息，点击"添加校区"按钮开始添加
        </Alert>
      )}

      {/* 校区编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSchool ? '编辑校区' : '添加校区'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="校区名称"
              value={schoolForm.name}
              onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="校区代码"
              value={schoolForm.code}
              onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value })}
              margin="normal"
              required
              disabled={!!editingSchool}
              helperText="校区代码一旦创建不可修改"
            />
            <TextField
              fullWidth
              label="Logo URL"
              value={schoolForm.logoUrl}
              onChange={(e) => setSchoolForm({ ...schoolForm, logoUrl: e.target.value })}
              margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>主题颜色</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="主色调"
                  type="color"
                  value={schoolForm.primaryColor}
                  onChange={(e) => setSchoolForm({ ...schoolForm, primaryColor: e.target.value })}
                  sx={{ width: 100 }}
                />
                <TextField
                  label="辅助色"
                  type="color"
                  value={schoolForm.secondaryColor}
                  onChange={(e) => setSchoolForm({ ...schoolForm, secondaryColor: e.target.value })}
                  sx={{ width: 100 }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button
            onClick={saveSchool}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading || !schoolForm.name || !schoolForm.code}
          >
            {editingSchool ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SchoolManagementPage;
EOL

# 5. 修复路由配置
echo "🛣️ 5. 修复路由配置..."

# 6. 重新构建前端
echo "🔨 6. 重新构建前端..."
cd /home/ubuntu/ailab/src/frontend
npm run build

# 7. 重启前端服务
echo "🔄 7. 重启前端服务..."
pm2 restart ailab-frontend

echo "=========================================="
echo "✅ AILAB平台架构重构完成"
echo "=========================================="
echo ""
echo "🎯 重构成果:"
echo "1. ✅ 修复API端口配置问题"
echo "2. ✅ 重新设计页面结构，避免功能重复"
echo "3. ✅ 分离个人设置和校区管理功能"
echo "4. ✅ 创建统一的导航菜单配置"
echo "5. ✅ 完善权限管理和角色划分"
echo ""
echo "📋 新的页面结构:"
echo "- /settings → 个人设置 (个人资料、偏好、通知、安全)"
echo "- /admin/schools → 校区管理 (仅管理员)"
echo "- /admin/system-settings → 系统设置 (仅管理员)"
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001"
echo "- 校区管理: http://82.156.75.232:3000/admin/schools"
echo ""
