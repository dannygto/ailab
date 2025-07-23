import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import { useTeamService } from '../../hooks/useTeamService';
import { useMemberService } from '../../hooks/useMemberService';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import { useParams } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3)
}));

const TemplateCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
  }
}));

interface SharingTemplate {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  teamId: string;
  targetType: 'user' | 'team' | 'public';
  targetId?: string;
  sharingType: 'readonly' | 'edit' | 'full';
  createdAt: string;
  updatedAt: string;
}

/**
 * 共享模板管理页面
 */
const SharingTemplateManagement: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { getUserSharingTemplates, createSharingTemplate } = useTeamService();
  const { getTeamMembers } = useMemberService();

  const [templates, setTemplates] = useState<SharingTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Partial<SharingTemplate> | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });

  // 表单字段
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [targetType, setTargetType] = useState<'user' | 'team' | 'public'>('user');
  const [targetId, setTargetId] = useState('');
  const [sharingType, setSharingType] = useState<'readonly' | 'edit' | 'full'>('readonly');

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载模板
      const templatesData = await getUserSharingTemplates();
      setTemplates(templatesData);

      // 加载团队成员（用于选择目标用户）
      if (teamId) {
        const membersData = await getTeamMembers(teamId);
        setTeamMembers(membersData);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      setSnackbar({
        open: true,
        message: '加载数据失败，请刷新页面重试',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template?: SharingTemplate) => {
    if (template) {
      setEditTemplate(template);
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      setTargetType(template.targetType);
      setTargetId(template.targetId || '');
      setSharingType(template.sharingType);
    } else {
      setEditTemplate(null);
      setTemplateName('');
      setTemplateDescription('');
      setTargetType('user');
      setTargetId('');
      setSharingType('readonly');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName) {
      setSnackbar({
        open: true,
        message: '请输入模板名称',
        severity: 'error'
      });
      return;
    }

    if (targetType !== 'public' && !targetId) {
      setSnackbar({
        open: true,
        message: '请选择目标用户或团队',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const templateData = {
        ...(editTemplate ? { id: editTemplate._id } : {}),
        name: templateName,
        description: templateDescription,
        targetType,
        targetId: targetType === 'public' ? null : targetId,
        sharingType,
        teamId
      };

      await createSharingTemplate(templateData);

      // 重新加载模板列表
      const templatesData = await getUserSharingTemplates();
      setTemplates(templatesData);

      setSnackbar({
        open: true,
        message: editTemplate ? '模板更新成功' : '模板创建成功',
        severity: 'success'
      });

      handleCloseDialog();
    } catch (error) {
      console.error('保存模板失败:', error);
      setSnackbar({
        open: true,
        message: '保存模板失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    setLoading(true);
    try {
      // 实现删除模板的API调用
      // await deleteTemplate(templateToDelete);

      // 临时从本地状态中移除
      setTemplates(prev => prev.filter(t => t._id !== templateToDelete));

      setSnackbar({
        open: true,
        message: '模板删除成功',
        severity: 'success'
      });
    } catch (error) {
      console.error('删除模板失败:', error);
      setSnackbar({
        open: true,
        message: '删除模板失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 获取目标类型和共享权限的可读文本
  const getTargetTypeText = (type: string) => {
    switch (type) {
      case 'user': return '用户';
      case 'team': return '团队';
      case 'public': return '公开';
      default: return type;
    }
  };

  const getSharingTypeText = (type: string) => {
    switch (type) {
      case 'readonly': return '只读';
      case 'edit': return '编辑';
      case 'full': return '完全控制';
      default: return type;
    }
  };

  // 渲染目标名称
  const renderTargetName = (template: SharingTemplate) => {
    if (template.targetType === 'public') {
      return '所有用户';
    }

    if (template.targetType === 'user' && template.targetId) {
      const member = teamMembers.find(m => m.userId === template.targetId);
      return member ? `${member.userName} (${member.userEmail})` : '未知用户';
    }

    if (template.targetType === 'team' && template.targetId) {
      // 需要实现获取团队名称的逻辑
      return `团队 (ID: ${template.targetId})`;
    }

    return '未指定';
  };

  return (
    <Box>
      <StyledPaper>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">共享模板管理</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShareIcon />}
            onClick={() => handleOpenDialog()}
          >
            创建新模板
          </Button>
        </Box>

        {loading && templates.length === 0 ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : templates.length === 0 ? (
          <Alert severity="info">
            您还没有创建任何共享模板。点击"创建新模板"按钮开始创建。
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {templates.map(template => (
              <Grid item xs={12} md={6} lg={4} key={template._id}>
                <TemplateCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>

                    {template.description && (
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {template.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2">
                      <strong>共享给:</strong> {getTargetTypeText(template.targetType)} - {renderTargetName(template)}
                    </Typography>

                    <Typography variant="body2">
                      <strong>权限类型:</strong> {getSharingTypeText(template.sharingType)}
                    </Typography>

                    <Typography variant="body2">
                      <strong>创建时间:</strong> {new Date(template.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(template)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteConfirm(template._id)}
                    >
                      删除
                    </Button>
                  </CardActions>
                </TemplateCard>
              </Grid>
            ))}
          </Grid>
        )}
      </StyledPaper>

      {/* 创建/编辑模板对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editTemplate ? '编辑共享模板' : '创建共享模板'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="模板名称"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="模板描述"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>共享对象类型</InputLabel>
            <Select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as any)}
              label="共享对象类型"
            >
              <MenuItem value="user">用户</MenuItem>
              <MenuItem value="team">团队</MenuItem>
              <MenuItem value="public">公开</MenuItem>
            </Select>
          </FormControl>

          {targetType !== 'public' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>{targetType === 'user' ? '选择用户' : '选择团队'}</InputLabel>
              <Select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                label={targetType === 'user' ? '选择用户' : '选择团队'}
              >
                {targetType === 'user' && teamMembers.map(member => (
                  <MenuItem key={member.userId} value={member.userId}>
                    {member.userName} ({member.userEmail})
                  </MenuItem>
                ))}
                {/* 团队选择选项会在这里添加 */}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>共享权限</InputLabel>
            <Select
              value={sharingType}
              onChange={(e) => setSharingType(e.target.value as any)}
              label="共享权限"
            >
              <MenuItem value="readonly">只读</MenuItem>
              <MenuItem value="edit">编辑</MenuItem>
              <MenuItem value="full">完全控制</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            取消
          </Button>
          <Button
            onClick={handleSaveTemplate}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (editTemplate ? '更新' : '创建')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            您确定要删除此共享模板吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleDeleteTemplate}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '删除'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SharingTemplateManagement;
