import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useTeamService } from '../../hooks/useTeamService';
import { useMemberService } from '../../hooks/useMemberService';
import { useResourceService } from '../../hooks/useResourceService';
import ShareIcon from '@mui/icons-material/Share';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f8f9fa',
}));

const BatchResourceSharing = ({ teamId, onShareComplete }) => {
  const { batchShareResources, createSharingTemplate, getUserSharingTemplates, applySharingTemplate } = useTeamService();
  const { getTeamMembers } = useMemberService();
  const { getUserResources } = useResourceService();

  const [resources, setResources] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [sharingTemplates, setSharingTemplates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [targetType, setTargetType] = useState('user');
  const [targetId, setTargetId] = useState('');
  const [sharingType, setSharingType] = useState('readonly');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [applyTemplateDialogOpen, setApplyTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareResults, setShareResults] = useState({ successful: [], failed: [] });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResourcesData = await getUserResources();
        setResources(userResourcesData);

        const membersData = await getTeamMembers(teamId);
        setTeamMembers(membersData);

        const templatesData = await getUserSharingTemplates();
        setSharingTemplates(templatesData);
      } catch (error) {
        console.error('获取数据失败:', error);
        setSnackbar({
          open: true,
          message: '获取数据失败，请刷新页面重试',
          severity: 'error'
        });
      }
    };

    fetchData();
  }, [teamId]);

  const handleOpenDialog = () => {
    if (selectedResources.length === 0) {
      setSnackbar({
        open: true,
        message: '请至少选择一个资源',
        severity: 'warning'
      });
      return;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenTemplateDialog = () => {
    if (selectedResources.length === 0) {
      setSnackbar({
        open: true,
        message: '请至少选择一个资源',
        severity: 'warning'
      });
      return;
    }
    setTemplateDialogOpen(true);
  };

  const handleCloseTemplateDialog = () => {
    setTemplateDialogOpen(false);
  };

  const handleOpenApplyTemplateDialog = () => {
    if (selectedResources.length === 0) {
      setSnackbar({
        open: true,
        message: '请至少选择一个资源',
        severity: 'warning'
      });
      return;
    }
    if (sharingTemplates.length === 0) {
      setSnackbar({
        open: true,
        message: '没有可用的共享模板',
        severity: 'info'
      });
      return;
    }
    setApplyTemplateDialogOpen(true);
  };

  const handleCloseApplyTemplateDialog = () => {
    setApplyTemplateDialogOpen(false);
  };

  const handleResourceSelect = (resourceId) => {
    setSelectedResources(prev => {
      if (prev.includes(resourceId)) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedResources(resources.map(resource => resource._id));
    } else {
      setSelectedResources([]);
    }
  };

  const handleBatchShare = async () => {
    setLoading(true);
    try {
      const result = await batchShareResources({
        resourceIds: selectedResources,
        targetType,
        targetId: targetType === 'public' ? null : targetId,
        sharingType
      });

      setShareResults(result);
      setResultDialogOpen(true);

      if (result.successful.length > 0) {
        setSnackbar({
          open: true,
          message: `成功共享 ${result.successful.length} 个资源`,
          severity: 'success'
        });

        if (onShareComplete) {
          onShareComplete();
        }
      }
    } catch (error) {
      console.error('批量共享资源失败:', error);
      setSnackbar({
        open: true,
        message: '批量共享资源失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      await createSharingTemplate({
        name: templateName,
        description: templateDescription,
        targetType,
        targetId: targetType === 'public' ? null : targetId,
        sharingType
      });

      // 刷新模板列表
      const templatesData = await getUserSharingTemplates();
      setSharingTemplates(templatesData);

      setSnackbar({
        open: true,
        message: '成功创建共享模板',
        severity: 'success'
      });
    } catch (error) {
      console.error('创建共享模板失败:', error);
      setSnackbar({
        open: true,
        message: '创建共享模板失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleCloseTemplateDialog();
    }
  };

  const handleApplyTemplate = async () => {
    setLoading(true);
    try {
      const result = await applySharingTemplate({
        templateId: selectedTemplate,
        resourceIds: selectedResources
      });

      setShareResults(result);
      setResultDialogOpen(true);

      if (result.successful.length > 0) {
        setSnackbar({
          open: true,
          message: `成功应用模板到 ${result.successful.length} 个资源`,
          severity: 'success'
        });

        if (onShareComplete) {
          onShareComplete();
        }
      }
    } catch (error) {
      console.error('应用共享模板失败:', error);
      setSnackbar({
        open: true,
        message: '应用共享模板失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleCloseApplyTemplateDialog();
    }
  };

  const handleCloseResultDialog = () => {
    setResultDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <StyledPaper>
        <Typography variant="h6" gutterBottom>
          批量资源共享
        </Typography>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedResources.length === resources.length && resources.length > 0}
                onChange={handleSelectAll}
                color="primary"
              />
            }
            label="全选"
          />

          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ShareIcon />}
              onClick={handleOpenDialog}
              disabled={selectedResources.length === 0}
              sx={{ mr: 1 }}
            >
              批量共享
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={handleOpenTemplateDialog}
              disabled={selectedResources.length === 0}
              sx={{ mr: 1 }}
            >
              保存为模板
            </Button>

            <Button
              variant="outlined"
              color="info"
              onClick={handleOpenApplyTemplateDialog}
              disabled={selectedResources.length === 0 || sharingTemplates.length === 0}
            >
              应用模板
            </Button>
          </Box>
        </Box>

        <List dense>
          {resources.map((resource) => (
            <React.Fragment key={resource._id}>
              <ListItem>
                <Checkbox
                  edge="start"
                  checked={selectedResources.includes(resource._id)}
                  onChange={() => handleResourceSelect(resource._id)}
                />
                <ListItemText
                  primary={resource.name}
                  secondary={`类型: ${resource.type}, 创建于: ${new Date(resource.createdAt).toLocaleString()}`}
                />
                <Chip
                  label={resource.isPublic ? '公开' : '私有'}
                  color={resource.isPublic ? 'success' : 'default'}
                  size="small"
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </StyledPaper>

      {/* 批量共享对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>批量共享资源</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            您已选择 {selectedResources.length} 个资源进行共享
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>共享对象类型</InputLabel>
                <Select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  label="共享对象类型"
                >
                  <MenuItem value="user">用户</MenuItem>
                  <MenuItem value="team">团队</MenuItem>
                  <MenuItem value="public">公开</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {targetType !== 'public' && (
              <Grid item xs={12}>
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
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>共享权限</InputLabel>
                <Select
                  value={sharingType}
                  onChange={(e) => setSharingType(e.target.value)}
                  label="共享权限"
                >
                  <MenuItem value="readonly">只读</MenuItem>
                  <MenuItem value="edit">编辑</MenuItem>
                  <MenuItem value="full">完全控制</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            取消
          </Button>
          <Button
            onClick={handleBatchShare}
            color="primary"
            variant="contained"
            disabled={loading || (targetType !== 'public' && !targetId)}
          >
            {loading ? <CircularProgress size={24} /> : '共享'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 创建模板对话框 */}
      <Dialog open={templateDialogOpen} onClose={handleCloseTemplateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>保存共享模板</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>模板名称</InputLabel>
                <input
                  className="form-control"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="输入模板名称"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>模板描述</InputLabel>
                <textarea
                  className="form-control"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="输入模板描述"
                  rows={3}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>共享对象类型</InputLabel>
                <Select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  label="共享对象类型"
                >
                  <MenuItem value="user">用户</MenuItem>
                  <MenuItem value="team">团队</MenuItem>
                  <MenuItem value="public">公开</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {targetType !== 'public' && (
              <Grid item xs={12}>
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
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>共享权限</InputLabel>
                <Select
                  value={sharingType}
                  onChange={(e) => setSharingType(e.target.value)}
                  label="共享权限"
                >
                  <MenuItem value="readonly">只读</MenuItem>
                  <MenuItem value="edit">编辑</MenuItem>
                  <MenuItem value="full">完全控制</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog} color="primary">
            取消
          </Button>
          <Button
            onClick={handleCreateTemplate}
            color="primary"
            variant="contained"
            disabled={loading || !templateName || (targetType !== 'public' && !targetId)}
          >
            {loading ? <CircularProgress size={24} /> : '保存模板'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 应用模板对话框 */}
      <Dialog open={applyTemplateDialogOpen} onClose={handleCloseApplyTemplateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>应用共享模板</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            您已选择 {selectedResources.length} 个资源应用模板
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>选择模板</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              label="选择模板"
            >
              {sharingTemplates.map(template => (
                <MenuItem key={template._id} value={template._id}>
                  {template.name} - {template.targetType === 'public' ? '公开' : template.targetType === 'user' ? '用户' : '团队'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedTemplate && sharingTemplates.find(t => t._id === selectedTemplate) && (
            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="subtitle2">
                模板详情:
              </Typography>
              <Typography variant="body2">
                {sharingTemplates.find(t => t._id === selectedTemplate).description}
              </Typography>
              <Typography variant="body2">
                共享类型: {
                  {
                    'readonly': '只读',
                    'edit': '编辑',
                    'full': '完全控制'
                  }[sharingTemplates.find(t => t._id === selectedTemplate).sharingType]
                }
              </Typography>
              <Typography variant="body2">
                创建于: {new Date(sharingTemplates.find(t => t._id === selectedTemplate).createdAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApplyTemplateDialog} color="primary">
            取消
          </Button>
          <Button
            onClick={handleApplyTemplate}
            color="primary"
            variant="contained"
            disabled={loading || !selectedTemplate}
          >
            {loading ? <CircularProgress size={24} /> : '应用模板'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 结果对话框 */}
      <Dialog open={resultDialogOpen} onClose={handleCloseResultDialog} maxWidth="md" fullWidth>
        <DialogTitle>共享结果</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                成功共享的资源 ({shareResults.successful.length})
              </Typography>
              <List dense>
                {shareResults.successful.map((resource, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={resource.resourceName}
                      secondary={resource.appliedSettings ? `应用了 ${resource.appliedSettings} 个设置` : null}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="error" gutterBottom>
                失败的资源 ({shareResults.failed.length})
              </Typography>
              <List dense>
                {shareResults.failed.map((resource, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={resource.resourceName}
                      secondary={`原因: ${resource.reason}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResultDialog} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>

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

export default BatchResourceSharing;
