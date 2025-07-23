import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// 导入团队服务和用户选择器组件
import { useTeamService } from '../../hooks/useTeamService';
import UserSelector from '../../components/team/UserSelector';
import { ITeam } from '../../types/team';
import { usePermission } from '../../contexts/PermissionContext';
import { ResourceType, PermissionAction } from '../../types/permission';
import { PermissionButtonWrapper } from '../../components/common/PermissionGuard';

/**
 * 团队管理页面组件
 * 用于显示用户所有团队，并提供创建、编辑、删除团队功能
 */
const TeamManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const teamService = useTeamService();
  const { canAccess } = usePermission();

  // 状态管理
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<ITeam | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // 获取所有团队数据
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const userTeams = await teamService.getUserTeams();
        setTeams(userTeams);
      } catch (error) {
        console.error('获取团队列表失败', error);
        setAlertState({
          open: true,
          message: t('teamManagement.fetchError'),
          severity: 'error'
        });
      }
    };

    fetchTeams();
  }, [teamService, t]);

  // 处理创建团队对话框
  const handleOpenCreateDialog = () => {
    setNewTeamName('');
    setNewTeamDescription('');
    setSelectedUsers([]);
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setAlertState({
        open: true,
        message: t('teamManagement.nameRequired'),
        severity: 'warning'
      });
      return;
    }

    try {
      const memberIds = selectedUsers.map(user => user.id);
      const newTeam = await teamService.createTeam({
        name: newTeamName,
        description: newTeamDescription,
        members: memberIds
      });

      setTeams([...teams, newTeam]);
      setIsCreateDialogOpen(false);
      setAlertState({
        open: true,
        message: t('teamManagement.createSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('创建团队失败', error);
      setAlertState({
        open: true,
        message: t('teamManagement.createError'),
        severity: 'error'
      });
    }
  };

  // 处理编辑团队对话框
  const handleOpenEditDialog = (team: ITeam) => {
    setCurrentTeam(team);
    setNewTeamName(team.name);
    setNewTeamDescription(team.description || '');
    setSelectedUsers(team.members || []);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleEditTeam = async () => {
    if (!currentTeam || !newTeamName.trim()) {
      setAlertState({
        open: true,
        message: t('teamManagement.nameRequired'),
        severity: 'warning'
      });
      return;
    }

    try {
      const memberIds = selectedUsers.map(user => user.id);
      const updatedTeam = await teamService.updateTeam({
        ...currentTeam,
        name: newTeamName,
        description: newTeamDescription,
        members: memberIds
      });

      setTeams(teams.map(team =>
        team.id === currentTeam.id ? updatedTeam : team
      ));
      setIsEditDialogOpen(false);
      setAlertState({
        open: true,
        message: t('teamManagement.updateSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('更新团队失败', error);
      setAlertState({
        open: true,
        message: t('teamManagement.updateError'),
        severity: 'error'
      });
    }
  };

  // 处理删除团队对话框
  const handleOpenDeleteDialog = (team: ITeam) => {
    setCurrentTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteTeam = async () => {
    if (!currentTeam) return;

    try {
      await teamService.deleteTeam(currentTeam.id);
      setTeams(teams.filter(team => team.id !== currentTeam.id));
      setIsDeleteDialogOpen(false);
      setAlertState({
        open: true,
        message: t('teamManagement.deleteSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('删除团队失败', error);
      setAlertState({
        open: true,
        message: t('teamManagement.deleteError'),
        severity: 'error'
      });
    }
  };

  // 导航到团队详情页
  const handleTeamClick = (teamId: string) => {
    navigate(`/teams/${teamId}`);
  };

  // 处理用户选择变化
  const handleUserSelectionChange = (users: any[]) => {
    setSelectedUsers(users);
  };

  // 处理提示关闭
  const handleAlertClose = () => {
    setAlertState({...alertState, open: false});
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('teamManagement.title')}
        </Typography>
        <PermissionButtonWrapper
          resourceType={ResourceType.TEAM}
          action={PermissionAction.CREATE}
          render={(hasPermission) => (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              disabled={!hasPermission}
            >
              {t('teamManagement.createTeam')}
            </Button>
          )}
          tooltipText={t('permissions.noTeamCreatePermission')}
        />
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('teamManagement.myTeams')}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {teams.length === 0 ? (
          <Box textAlign="center" py={4}>
            <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {t('teamManagement.noTeams')}
            </Typography>
            <PermissionButtonWrapper
              resourceType={ResourceType.TEAM}
              action={PermissionAction.CREATE}
              render={(hasPermission) => (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  onClick={handleOpenCreateDialog}
                  disabled={!hasPermission}
                >
                  {t('teamManagement.createFirst')}
                </Button>
              )}
              tooltipText={t('permissions.noTeamCreatePermission')}
            />
          </Box>
        ) : (
          <List>
            {teams.map((team) => (
              <React.Fragment key={team.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  secondaryAction={
                    <Box>
                      <PermissionButtonWrapper
                        resourceType={ResourceType.TEAM}
                        action={PermissionAction.UPDATE}
                        resourceId={team.id}
                        render={(hasPermission) => (
                          <Tooltip title={hasPermission ? t('common.edit') : t('permissions.noTeamEditPermission')}>
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditDialog(team);
                              }}
                              disabled={!hasPermission}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      />
                      <PermissionButtonWrapper
                        resourceType={ResourceType.TEAM}
                        action={PermissionAction.DELETE}
                        resourceId={team.id}
                        render={(hasPermission) => (
                          <Tooltip title={hasPermission ? t('common.delete') : t('permissions.noTeamDeletePermission')}>
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteDialog(team);
                              }}
                              disabled={!hasPermission}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      />
                    </Box>
                  }
                  onClick={() => handleTeamClick(team.id)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <GroupIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" component="span">
                          {team.name}
                        </Typography>
                        {team.isOwner && (
                          <Chip
                            label={t('teamManagement.owner')}
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                        {team.isAdmin && !team.isOwner && (
                          <Chip
                            label={t('teamManagement.admin')}
                            size="small"
                            color="secondary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {team.description || t('teamManagement.noDescription')}
                        </Typography>
                        <Box mt={1}>
                          <Typography variant="body2" component="span">
                            {t('teamManagement.members')}: {team.members?.length || 0}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* 创建团队对话框 */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{t('teamManagement.createTeamTitle')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label={t('teamManagement.teamName')}
                fullWidth
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label={t('teamManagement.teamDescription')}
                fullWidth
                multiline
                rows={3}
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t('teamManagement.addMembers')}
              </Typography>
              <UserSelector
                initialUsers={[]}
                onChange={handleUserSelectionChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateTeam} color="primary" variant="contained">
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 编辑团队对话框 */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{t('teamManagement.editTeamTitle')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label={t('teamManagement.teamName')}
                fullWidth
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label={t('teamManagement.teamDescription')}
                fullWidth
                multiline
                rows={3}
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t('teamManagement.teamMembers')}
              </Typography>
              <UserSelector
                initialUsers={selectedUsers}
                onChange={handleUserSelectionChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleEditTeam} color="primary" variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除团队确认对话框 */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>{t('teamManagement.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('teamManagement.deleteConfirmMessage', { teamName: currentTeam?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteTeam} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 全局提示消息 */}
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alertState.severity}>
          {alertState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeamManagement;
