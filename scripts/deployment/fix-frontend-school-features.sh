#!/bin/bash

# 🖥️ 修复前端校区功能脚本
echo "🔧 开始修复前端校区功能..."

# 1. 修复EnhancedSettings.tsx中的API调用
echo "📝 修复EnhancedSettings.tsx..."
cat > /home/ubuntu/ailab/src/frontend/src/pages/EnhancedSettings.tsx << 'EOL'
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  ColorLens as ColorLensIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { API_BASE_URL } from '../config/api';

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

const EnhancedSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
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
      const response = await fetch(`${API_BASE_URL}/api/schools`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setSchools(data.data || []);
      } else {
        throw new Error(data.error || '获取校区失败');
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

  // 创建或更新校区
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

      const url = editingSchool
        ? `${API_BASE_URL}/api/schools/${editingSchool.id}`
        : `${API_BASE_URL}/api/schools`;

      const method = editingSchool ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSnackbar({
          open: true,
          message: editingSchool ? '校区更新成功' : '校区创建成功',
          severity: 'success'
        });
        setDialogOpen(false);
        setEditingSchool(null);
        setSchoolForm({
          name: '',
          code: '',
          logoUrl: '',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e'
        });
        fetchSchools();
      } else {
        throw new Error(data.error || '保存校区失败');
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
      const response = await fetch(`${API_BASE_URL}/api/schools/${schoolId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: '校区删除成功', severity: 'success' });
        fetchSchools();
      } else {
        throw new Error(data.error || '删除校区失败');
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

  // 组件挂载时获取数据
  useEffect(() => {
    fetchSchools();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ width: '100%', bgcolor: 'background.paper', minHeight: '80vh' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="设置标签">
          <Tab icon={<SchoolIcon />} label="学校信息" />
          <Tab label="系统配置" />
          <Tab label="第三方集成" />
          <Tab label="安全设置" />
        </Tabs>
      </Box>

      {/* 学校信息标签页 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            学校信息管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理学校基本信息、校区设置和主题配置
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingSchool(null);
              setSchoolForm({
                name: '',
                code: '',
                logoUrl: '',
                primaryColor: '#1976d2',
                secondaryColor: '#dc004e'
              });
              setDialogOpen(true);
            }}
            disabled={loading}
          >
            添加校区
          </Button>
        </Box>

        {loading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            正在加载...
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
      </TabPanel>

      {/* 系统配置标签页 */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>系统配置</Typography>
        <Alert severity="info">系统配置功能开发中...</Alert>
      </TabPanel>

      {/* 第三方集成标签页 */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>第三方集成</Typography>
        <Alert severity="info">第三方集成功能开发中...</Alert>
      </TabPanel>

      {/* 安全设置标签页 */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>安全设置</Typography>
        <Alert severity="info">安全设置功能开发中...</Alert>
      </TabPanel>

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
    </Paper>
  );
};

export default EnhancedSettings;
EOL

# 2. 确保API配置文件正确
echo "📝 检查API配置..."
if [ ! -f "/home/ubuntu/ailab/src/frontend/src/config/api.ts" ]; then
    echo "创建API配置文件..."
    mkdir -p /home/ubuntu/ailab/src/frontend/src/config
    cat > /home/ubuntu/ailab/src/frontend/src/config/api.ts << 'EOL'
// API基础配置
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
EOL
fi

# 3. 修复SystemSetup.tsx
echo "📝 修复SystemSetup.tsx..."
sed -i 's/公司信息/学校信息/g' /home/ubuntu/ailab/src/frontend/src/pages/SystemSetup.tsx
sed -i 's/企业/学校/g' /home/ubuntu/ailab/src/frontend/src/pages/SystemSetup.tsx

# 4. 创建校区管理组件
echo "📝 创建校区管理组件..."
mkdir -p /home/ubuntu/ailab/src/frontend/src/components/school
cat > /home/ubuntu/ailab/src/frontend/src/components/school/SchoolCard.tsx << 'EOL'
import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

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

interface SchoolCardProps {
  school: School;
  onEdit: (school: School) => void;
  onDelete: (schoolId: number) => void;
  loading?: boolean;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school, onEdit, onDelete, loading = false }) => {
  return (
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
            onClick={() => onEdit(school)}
            disabled={loading}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => onDelete(school.id)}
            disabled={loading}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SchoolCard;
EOL

# 5. 重新构建前端
echo "🔨 重新构建前端..."
cd /home/ubuntu/ailab/src/frontend
npm run build

# 6. 重启前端服务
echo "🔄 重启前端服务..."
pm2 restart ailab-frontend || pm2 start npm --name "ailab-frontend" -- start

echo "✅ 前端校区功能修复完成"
