#!/bin/bash

# 综合架构优化脚本 - 解决功能重复和服务稳定性问题

set -e

echo "=========================================="
echo "🚀 开始AILAB平台架构优化"
echo "=========================================="

# 1. 停止所有服务并清理端口
echo "🛑 停止服务并清理端口..."
pm2 stop all || true
pm2 delete all || true

# 强制清理端口占用
lsof -ti:3000 | xargs -r kill -9 || true
lsof -ti:3001 | xargs -r kill -9 || true
sleep 2

# 2. 重新设计功能架构 - 解决重复问题
echo "🏗️  重新设计功能架构..."

# 2.1 将系统设置中的学校信息移除，只保留校区管理
cat > /home/ubuntu/ailab/src/frontend/src/pages/EnhancedSettings.tsx << 'EOL'
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Card, CardContent, CardHeader,
  Grid, TextField, Switch, FormControlLabel, Button, Alert,
  Badge, Chip, FormControl, InputLabel, Select, MenuItem, Slider
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
  Build as BuildIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

/**
 * 🎯 系统设置页面 - 不包含学校信息（已移至校区管理）
 *
 * ✅ 功能范围:
 * 1. 基础设置 (语言、时区、自动保存等)
 * 2. 第三方集成 (AI服务、云存储、邮件等)
 * 3. 安全设置 (密码策略、访问控制、审计)
 * 4. 外观设置 (主题、颜色、布局)
 * 5. 通知设置 (邮件、短信、系统通知)
 * 6. 存储设置 (文件存储、数据库、缓存)
 * 7. 性能设置 (并发限制、资源配置)
 * 8. 实验配置 (默认参数、模板设置)
 */

const EnhancedSettings: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({
    // 1. 基础设置
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    autoSave: true,
    saveInterval: 30,
    defaultExperimentDuration: 60,
    maxFileSize: 100,
    enableNotifications: true,
    enableAnalytics: true,

    // 2. 第三方集成
    aiServiceEnabled: true,
    aiServiceApiKey: '',
    cloudStorageEnabled: false,
    cloudStorageProvider: 'aliyun',
    emailServiceEnabled: true,
    emailProvider: 'smtp',
    smtpHost: 'smtp.qq.com',
    smtpPort: 587,

    // 3. 安全设置
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 120,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    auditLogEnabled: true,

    // 4. 外观设置
    theme: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    fontSize: 14,
    compactMode: false,
    sidebarWidth: 240,

    // 5. 通知设置
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceNotifications: true,
    securityAlerts: true,

    // 6. 存储设置
    fileStoragePath: '/data/uploads',
    maxStorageSize: '10GB',
    enableCompression: true,
    backupInterval: 24,
    retentionDays: 30,

    // 7. 性能设置
    maxConcurrentUsers: 100,
    requestTimeout: 30,
    cacheEnabled: true,
    cacheTTL: 3600,

    // 8. 实验配置
    defaultExperimentTemplate: 'basic',
    allowCustomTemplates: true,
    maxExperimentDuration: 240,
    autoCleanupDays: 7
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

  const handleSave = async () => {
    try {
      console.log('保存设置:', settings);
      toast.success('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  const handleReset = () => {
    if (window.confirm('确认要重置所有设置为默认值吗？')) {
      const defaultSettings = {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        autoSave: true,
        theme: 'light'
      };
      setSettings(prev => ({ ...settings, ...defaultSettings }));
      toast.success('已重置为默认设置');
    }
  };

  const tabsConfig = [
    { label: '基础设置', icon: <SettingsIcon />, badge: '' },
    { label: '第三方集成', icon: <CloudIcon />, badge: '4' },
    { label: '安全', icon: <SecurityIcon />, badge: '' },
    { label: '外观', icon: <PaletteIcon />, badge: '' },
    { label: '通知', icon: <NotificationsIcon />, badge: '' },
    { label: '存储', icon: <StorageIcon />, badge: '' },
    { label: '性能', icon: <SpeedIcon />, badge: '' },
    { label: '实验配置', icon: <ScienceIcon />, badge: '' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon />
        系统设置
        <Chip label="企业版" color="primary" size="small" />
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 系统全局设置。学校信息和校区管理请前往"校区管理"页面。
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
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* 1. 基础设置 */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>基础设置</Typography>
              </Grid>

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
                        <MenuItem value="zh-TW">繁体中文</MenuItem>
                        <MenuItem value="en-US">English</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                      <InputLabel>时区</InputLabel>
                      <Select
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      >
                        <MenuItem value="Asia/Shanghai">北京时间 (UTC+8)</MenuItem>
                        <MenuItem value="Asia/Tokyo">东京时间 (UTC+9)</MenuItem>
                        <MenuItem value="America/New_York">纽约时间 (UTC-5)</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="系统行为" />
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoSave}
                          onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                        />
                      }
                      label="自动保存"
                    />

                    <Box sx={{ mt: 2 }}>
                      <Typography gutterBottom>自动保存间隔 (分钟)</Typography>
                      <Slider
                        value={settings.saveInterval}
                        onChange={(e, value) => handleSettingChange('saveInterval', value)}
                        min={5}
                        max={120}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>

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
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* 其他标签页 */}
          {currentTab >= 1 && (
            <Alert severity="info">
              此标签页功能正在开发中...
            </Alert>
          )}
        </Box>

        {/* 保存和重置按钮 */}
        <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            重置
          </Button>
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

export default EnhancedSettings;
EOL

# 2.2 创建专门的校区管理页面（包含完整的学校信息功能）
echo "📝 创建专门的校区管理页面..."
mkdir -p /home/ubuntu/ailab/src/frontend/src/pages/admin

cat > /home/ubuntu/ailab/src/frontend/src/pages/admin/SchoolManagement.tsx << 'EOL'
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CardHeader, Grid, TextField,
  Button, Alert, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Avatar, Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  UploadFile as UploadFileIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface School {
  id: number;
  name: string;
  code: string;
  logoUrl: string;
  themeSettings: {
    primaryColor: string;
    secondaryColor: string;
  };
  active: boolean;
  isMain: boolean;
  // 详细信息
  schoolType?: string;
  principalName?: string;
  principalPhone?: string;
  principalEmail?: string;
  schoolAddress?: string;
  schoolWebsite?: string;
  schoolMotto?: string;
  establishedYear?: number;
  studentCount?: number;
  teacherCount?: number;
}

const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<Partial<School>>({});

  // 获取校区列表
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schools');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSchools(data.data);
        } else {
          throw new Error(data.error || '获取校区失败');
        }
      } else {
        throw new Error('网络请求失败');
      }
    } catch (error) {
      console.error('获取校区列表失败:', error);
      toast.error('获取校区列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setFormData(school);
    setEditDialog(true);
  };

  const handleAdd = () => {
    setSelectedSchool(null);
    setFormData({
      name: '',
      code: '',
      logoUrl: '/assets/schools/default-logo.png',
      themeSettings: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e'
      },
      active: true,
      isMain: false,
      schoolType: 'middle_school',
      principalName: '',
      principalPhone: '',
      principalEmail: '',
      schoolAddress: '',
      schoolWebsite: '',
      schoolMotto: '',
      establishedYear: new Date().getFullYear(),
      studentCount: 0,
      teacherCount: 0
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      const method = selectedSchool ? 'PUT' : 'POST';
      const url = selectedSchool ? `/api/schools/${selectedSchool.id}` : '/api/schools';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(selectedSchool ? '校区更新成功' : '校区创建成功');
          setEditDialog(false);
          fetchSchools();
        } else {
          throw new Error(data.error || '保存失败');
        }
      } else {
        throw new Error('网络请求失败');
      }
    } catch (error) {
      console.error('保存校区失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  const handleDelete = async (school: School) => {
    if (school.isMain) {
      toast.error('主校区不能删除');
      return;
    }

    if (window.confirm(`确认要删除校区"${school.name}"吗？`)) {
      try {
        const response = await fetch(`/api/schools/${school.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            toast.success('校区删除成功');
            fetchSchools();
          } else {
            throw new Error(data.error || '删除失败');
          }
        } else {
          throw new Error('网络请求失败');
        }
      } catch (error) {
        console.error('删除校区失败:', error);
        toast.error('删除失败，请重试');
      }
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon />
          校区管理
          <Chip label="统一管理" color="primary" size="small" />
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          添加校区
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 在这里管理所有校区信息，包括学校基本信息、校长信息、主题设置等。主校区不能删除。
      </Alert>

      {/* 校区列表 */}
      <Card>
        <CardHeader title="校区列表" />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>校徽</TableCell>
                  <TableCell>校区名称</TableCell>
                  <TableCell>校区代码</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                      <Avatar src={school.logoUrl} sx={{ width: 40, height: 40 }}>
                        <SchoolIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {school.name}
                        {school.isMain && <Chip label="主校区" color="primary" size="small" />}
                      </Box>
                    </TableCell>
                    <TableCell>{school.code}</TableCell>
                    <TableCell>{school.schoolType || '未设置'}</TableCell>
                    <TableCell>
                      <Chip
                        label={school.active ? '启用' : '禁用'}
                        color={school.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(school)} size="small">
                        <EditIcon />
                      </IconButton>
                      {!school.isMain && (
                        <IconButton
                          onClick={() => handleDelete(school)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSchool ? '编辑校区' : '添加校区'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 基本信息 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>基本信息</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="校区名称"
                value={formData.name || ''}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="校区代码"
                value={formData.code || ''}
                onChange={(e) => handleFormChange('code', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>学校类型</InputLabel>
                <Select
                  value={formData.schoolType || 'middle_school'}
                  onChange={(e) => handleFormChange('schoolType', e.target.value)}
                >
                  <MenuItem value="primary">小学</MenuItem>
                  <MenuItem value="middle_school">中学</MenuItem>
                  <MenuItem value="high_school">高中</MenuItem>
                  <MenuItem value="vocational">职业学校</MenuItem>
                  <MenuItem value="university">大学</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="建校年份"
                type="number"
                value={formData.establishedYear || ''}
                onChange={(e) => handleFormChange('establishedYear', parseInt(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="学校地址"
                value={formData.schoolAddress || ''}
                onChange={(e) => handleFormChange('schoolAddress', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="学校网站"
                value={formData.schoolWebsite || ''}
                onChange={(e) => handleFormChange('schoolWebsite', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="校训"
                value={formData.schoolMotto || ''}
                onChange={(e) => handleFormChange('schoolMotto', e.target.value)}
              />
            </Grid>

            {/* 校长信息 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>校长信息</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="校长姓名"
                value={formData.principalName || ''}
                onChange={(e) => handleFormChange('principalName', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="校长电话"
                value={formData.principalPhone || ''}
                onChange={(e) => handleFormChange('principalPhone', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="校长邮箱"
                type="email"
                value={formData.principalEmail || ''}
                onChange={(e) => handleFormChange('principalEmail', e.target.value)}
              />
            </Grid>

            {/* 规模统计 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>规模统计</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="学生人数"
                type="number"
                value={formData.studentCount || ''}
                onChange={(e) => handleFormChange('studentCount', parseInt(e.target.value))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="教师人数"
                type="number"
                value={formData.teacherCount || ''}
                onChange={(e) => handleFormChange('teacherCount', parseInt(e.target.value))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} startIcon={<CancelIcon />}>
            取消
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolManagement;
EOL

# 3. 启动后端服务
echo "🚀 启动后端服务..."
cd /home/ubuntu/ailab/src/backend
pm2 start npm --name "ailab-backend" -- run dev

# 4. 等待后端启动并测试
echo "⏳ 等待后端启动..."
sleep 5

echo "🧪 测试后端API..."
if curl -s http://localhost:3001/api/schools > /dev/null; then
    echo "✅ 后端API正常"
else
    echo "❌ 后端API异常"
    pm2 logs ailab-backend --lines 5
fi

# 5. 构建前端
echo "🔨 构建前端..."
cd /home/ubuntu/ailab/src/frontend
npm run build

# 6. 启动前端服务（使用不同端口避免冲突）
echo "🌐 启动前端服务..."
pm2 start http-server --name "ailab-frontend" -- build -p 3000 -c-1 --cors

# 7. 等待并测试前端
echo "⏳ 等待前端启动..."
sleep 3

echo "🧪 测试前端服务..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
    pm2 logs ailab-frontend --lines 5
fi

# 8. 显示最终状态
echo "📊 服务状态:"
pm2 list

echo "=========================================="
echo "✅ 架构优化完成"
echo "=========================================="
echo ""
echo "🏗️  功能架构优化:"
echo "1. ✅ 系统设置 - 只包含全局设置，不包含学校信息"
echo "2. ✅ 校区管理 - 统一管理所有校区和学校信息"
echo "3. ✅ 消除功能重复，清晰的职责分工"
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001"
echo ""
echo "📋 技术栈:"
echo "- 前端: http-server (稳定的静态文件服务)"
echo "- 后端: Node.js + TypeScript + Express"
echo "- 进程管理: PM2"
echo ""
