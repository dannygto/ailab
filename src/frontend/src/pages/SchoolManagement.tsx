import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Avatar,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SchoolIcon from '@mui/icons-material/School';
import { toast } from 'react-hot-toast';
import schoolService from '../services/schoolService';
import { useSchool } from '../contexts/SchoolContext';

// 校区表单数据接口
interface SchoolFormData {
  id?: number;
  name: string;
  code: string;
  logoUrl: string;
  active: boolean;
  themeSettings: {
    primaryColor: string;
    secondaryColor: string;
  };
}

/**
 * 校区管理页面
 * 用于创建、编辑和删除校区
 */
const SchoolManagement: React.FC = () => {
  const { schools, refreshSchools } = useSchool();
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolFormData | null>(null);
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    code: '',
    logoUrl: '',
    active: true,
    themeSettings: {
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e'
    }
  });

  // 处理对话框关闭
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      code: '',
      logoUrl: '',
      active: true,
      themeSettings: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e'
      }
    });
  };

  // 处理创建新校区
  const handleCreateSchool = () => {
    setSelectedSchool(null);
    setFormData({
      name: '',
      code: '',
      logoUrl: '',
      active: true,
      themeSettings: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e'
      }
    });
    setOpenDialog(true);
  };

  // 处理编辑校区
  const handleEditSchool = (school: any) => {
    setSelectedSchool(school);
    setFormData({
      id: school.id,
      name: school.name,
      code: school.code,
      logoUrl: school.logoUrl || '',
      active: school.active,
      themeSettings: {
        primaryColor: school.themeSettings?.primaryColor || '#1976d2',
        secondaryColor: school.themeSettings?.secondaryColor || '#dc004e'
      }
    });
    setOpenDialog(true);
  };

  // 处理删除校区
  const handleDeleteConfirm = (school: any) => {
    setSelectedSchool(school);
    setDeleteConfirmOpen(true);
  };

  // 确认删除校区
  const confirmDelete = async () => {
    if (selectedSchool?.id) {
      try {
        await schoolService.deleteSchool(selectedSchool.id);
        await refreshSchools();
        setDeleteConfirmOpen(false);
      } catch (error) {
        console.error('删除校区失败:', error);
      }
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      // 验证表单
      if (!formData.name || !formData.code) {
        toast.error('校区名称和代码不能为空');
        return;
      }

      if (selectedSchool?.id) {
        // 更新校区
        await schoolService.updateSchool(selectedSchool.id, formData);
      } else {
        // 创建校区
        await schoolService.createSchool(formData);
      }

      // 刷新校区列表
      await refreshSchools();
      handleCloseDialog();
    } catch (error) {
      console.error('保存校区失败:', error);
    }
  };

  // 处理表单字段变更
  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      // 处理嵌套字段
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof SchoolFormData] as any,
          [child]: value
        }
      });
    } else {
      // 处理普通字段
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          校区管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateSchool}
        >
          添加校区
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>校区信息</TableCell>
                <TableCell>代码</TableCell>
                <TableCell>主题颜色</TableCell>
                <TableCell>状态</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={school.logoUrl}
                        alt={school.name}
                        sx={{
                          mr: 2,
                          bgcolor: school.themeSettings?.primaryColor || 'primary.main'
                        }}
                      >
                        {school.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body1">{school.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{school.code}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="主色" arrow>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: school.themeSettings?.primaryColor || '#1976d2',
                            border: '1px solid #ddd'
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="辅色" arrow>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: school.themeSettings?.secondaryColor || '#dc004e',
                            border: '1px solid #ddd'
                          }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={school.active ? '已启用' : '已停用'}
                      color={school.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="编辑校区" arrow>
                      <IconButton onClick={() => handleEditSchool(school)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除校区" arrow>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteConfirm(school)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {schools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      暂无校区数据
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleCreateSchool}
                      sx={{ mt: 2 }}
                    >
                      添加第一个校区
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 创建/编辑校区对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedSchool ? '编辑校区' : '创建新校区'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="校区名称"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="校区代码"
                fullWidth
                required
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                disabled={!!selectedSchool} // 编辑时不允许修改代码
                helperText="用于校区标识、子域名等，仅支持英文和数字"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Logo URL"
                fullWidth
                value={formData.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                helperText="校区Logo的URL地址"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ColorLensIcon sx={{ mr: 1, color: formData.themeSettings.primaryColor }} />
                <TextField
                  label="主色调"
                  fullWidth
                  value={formData.themeSettings.primaryColor}
                  onChange={(e) => handleChange('themeSettings.primaryColor', e.target.value)}
                  type="color"
                  InputProps={{
                    sx: { height: 56 }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ColorLensIcon sx={{ mr: 1, color: formData.themeSettings.secondaryColor }} />
                <TextField
                  label="辅助色调"
                  fullWidth
                  value={formData.themeSettings.secondaryColor}
                  onChange={(e) => handleChange('themeSettings.secondaryColor', e.target.value)}
                  type="color"
                  InputProps={{
                    sx: { height: 56 }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => handleChange('active', e.target.checked)}
                  />
                }
                label="启用该校区"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除校区 "{selectedSchool?.name}" 吗？此操作不可恢复，且会同时删除该校区下的所有数据。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={confirmDelete} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolManagement;
