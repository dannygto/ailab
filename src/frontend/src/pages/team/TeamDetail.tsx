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
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
          <Tab label={t('teamDetail.members')} id="team-tab-0" aria-controls="team-tabpanel-0" />
          <Tab label={t('teamDetail.resources')} id="team-tab-1" aria-controls="team-tabpanel-1" />
          <Tab label={t('teamDetail.experiments')} id="team-tab-2" aria-controls="team-tabpanel-2" />
          <Tab label={t('teamDetail.activities')} id="team-tab-3" aria-controls="team-tabpanel-3" />
          {team.isOwner && (
            <Tab label={t('teamDetail.settings')} id="team-tab-4" aria-controls="team-tabpanel-4" />
          )} '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import StorageIcon from '@mui/icons-material/Storage';
import ExperimentIcon from '@mui/icons-material/Science';
import HistoryIcon from '@mui/icons-material/History';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

// 导入团队服务和用户选择器组件
import { useTeamService } from '../../hooks/useTeamService';
import UserSelector from '../../components/team/UserSelector';
import { Team, TeamMember } from '../../types/teams';
import TeamResourceManagement from './TeamResourceManagement';
import TeamActivityLog from '../../components/team/TeamActivityLog';

// 定义Tab面板接口
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab面板组件
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * 团队详情页面组件
 * 用于显示特定团队的详细信息，成员管理，资源管理等
 */
const TeamDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const teamService = useTeamService();

  // 状态管理
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isRemoveMemberDialogOpen, setIsRemoveMemberDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [alertState, setAlertState] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // 菜单是否打开
  const isMenuOpen = Boolean(menuAnchorEl);

  // 获取团队详情
  useEffect(() => {
    const fetchTeamDetail = async () => {
      if (!teamId) return;

      try {
        setLoading(true);
        const teamDetail = await teamService.getTeamById(teamId);
        setTeam(teamDetail);
        setTeamName(teamDetail.name);
        setTeamDescription(teamDetail.description || '');
      } catch (error) {
        console.error('获取团队详情失败', error);
        setAlertState({
          open: true,
          message: t('teamDetail.fetchError'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetail();
  }, [teamId, teamService, t]);

  // 处理Tab切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 处理返回按钮
  const handleBack = () => {
    navigate('/teams');
  };

  // 处理菜单打开
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // 处理菜单关闭
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // 处理编辑团队对话框
  const handleOpenEditDialog = () => {
    if (!team) return;
    setTeamName(team.name);
    setTeamDescription(team.description || '');
    setIsEditDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleEditTeam = async () => {
    if (!team || !teamName.trim()) {
      setAlertState({
        open: true,
        message: t('teamDetail.nameRequired'),
        severity: 'warning'
      });
      return;
    }

    try {
      const updatedTeam = await teamService.updateTeam({
        ...team,
        name: teamName,
        description: teamDescription
      });

      setTeam(updatedTeam);
      setIsEditDialogOpen(false);
      setAlertState({
        open: true,
        message: t('teamDetail.updateSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('更新团队失败', error);
      setAlertState({
        open: true,
        message: t('teamDetail.updateError'),
        severity: 'error'
      });
    }
  };

  // 处理添加成员对话框
  const handleOpenAddMemberDialog = () => {
    setSelectedUsers([]);
    setIsAddMemberDialogOpen(true);
  };

  const handleCloseAddMemberDialog = () => {
    setIsAddMemberDialogOpen(false);
  };

  const handleAddMembers = async () => {
    if (!team || selectedUsers.length === 0) return;

    try {
      const memberIds = selectedUsers.map(user => user.id);
      const updatedTeam = await teamService.addTeamMembers(team.id, memberIds);
      setTeam(updatedTeam);
      setIsAddMemberDialogOpen(false);
      setAlertState({
        open: true,
        message: t('teamDetail.addMembersSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('添加成员失败', error);
      setAlertState({
        open: true,
        message: t('teamDetail.addMembersError'),
        severity: 'error'
      });
    }
  };

  // 处理移除成员对话框
  const handleOpenRemoveMemberDialog = (member: TeamMember) => {
    setCurrentMember(member);
    setIsRemoveMemberDialogOpen(true);
  };

  const handleCloseRemoveMemberDialog = () => {
    setIsRemoveMemberDialogOpen(false);
  };

  const handleRemoveMember = async () => {
    if (!team || !currentMember) return;

    try {
      const updatedTeam = await teamService.removeTeamMember(team.id, currentMember.id);
      setTeam(updatedTeam);
      setIsRemoveMemberDialogOpen(false);
      setAlertState({
        open: true,
        message: t('teamDetail.removeMemberSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('移除成员失败', error);
      setAlertState({
        open: true,
        message: t('teamDetail.removeMemberError'),
        severity: 'error'
      });
    }
  };

  // 处理角色变更对话框
  const handleOpenRoleDialog = (member: TeamMember) => {
    setCurrentMember(member);
    setNewRole(member.role || 'member');
    setIsRoleDialogOpen(true);
  };

  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
  };

  const handleChangeRole = async () => {
    if (!team || !currentMember) return;

    try {
      const updatedTeam = await teamService.updateMemberRole(team.id, currentMember.id, newRole);
      setTeam(updatedTeam);
      setIsRoleDialogOpen(false);
      setAlertState({
        open: true,
        message: t('teamDetail.changeRoleSuccess'),
        severity: 'success'
      });
    } catch (error) {
      console.error('变更角色失败', error);
      setAlertState({
        open: true,
        message: t('teamDetail.changeRoleError'),
        severity: 'error'
      });
    }
  };

  // 处理用户选择变化
  const handleUserSelectionChange = (users: any[]) => {
    setSelectedUsers(users);
  };

  // 处理提示关闭
  const handleAlertClose = () => {
    setAlertState({...alertState, open: false});
  };

  // 检查当前用户是否是团队管理员或拥有者
  const isAdminOrOwner = team?.isAdmin || team?.isOwner;

  // 加载中状态
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // 团队不存在
  if (!team) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h5" color="error" gutterBottom>
            {t('teamDetail.notFound')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            {t('common.back')}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {team.name}
          </Typography>
          {team.isOwner && (
            <Chip
              label={t('teamDetail.owner')}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
          {team.isAdmin && !team.isOwner && (
            <Chip
              label={t('teamDetail.admin')}
              size="small"
              color="secondary"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        {isAdminOrOwner && (
          <Box>
            <IconButton
              aria-label="more"
              aria-controls="team-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="team-menu"
              anchorEl={menuAnchorEl}
              keepMounted
              open={isMenuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleOpenEditDialog}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                {t('teamDetail.editTeam')}
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {team.description || t('teamDetail.noDescription')}
        </Typography>
        <Box mt={2}>
          <Chip
            icon={<GroupIcon />}
            label={`${t('teamDetail.members')}: ${team.members?.length || 0}`}
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Chip
            icon={<StorageIcon />}
            label={`${t('teamDetail.resources')}: ${team.resources?.length || 0}`}
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Chip
            icon={<ExperimentIcon />}
            label={`${t('teamDetail.experiments')}: ${team.experiments?.length || 0}`}
            variant="outlined"
          />
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="team tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('teamDetail.members')} id="team-tab-0" aria-controls="team-tabpanel-0" />
          <Tab label={t('teamDetail.resources')} id="team-tab-1" aria-controls="team-tabpanel-1" />
          <Tab label={t('teamDetail.experiments')} id="team-tab-2" aria-controls="team-tabpanel-2" />
          {isAdminOrOwner && (
            <Tab label={t('teamDetail.settings')} id="team-tab-3" aria-controls="team-tabpanel-3" />
          )}
        </Tabs>
      </Box>

      {/* 成员Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {t('teamDetail.teamMembers')}
          </Typography>
          {isAdminOrOwner && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddMemberDialog}
            >
              {t('teamDetail.addMembers')}
            </Button>
          )}
        </Box>

        <Paper elevation={2}>
          <List>
            {team.members && team.members.length > 0 ? (
              team.members.map((member) => (
                <React.Fragment key={member.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar alt={member.name} src={member.avatar}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography variant="subtitle1">
                            {member.name}
                          </Typography>
                          {member.role === 'owner' && (
                            <Chip
                              label={t('teamDetail.owner')}
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {member.role === 'admin' && (
                            <Chip
                              label={t('teamDetail.admin')}
                              size="small"
                              color="secondary"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {member.role === 'member' && (
                            <Chip
                              label={t('teamDetail.member')}
                              size="small"
                              variant="outlined"
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
                            {member.email}
                          </Typography>
                          <Box mt={1}>
                            <Typography variant="body2" component="span">
                              {t('teamDetail.joinedAt')}: {new Date(member.joinedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                    {isAdminOrOwner && member.id !== team.ownerId && (
                      <ListItemSecondaryAction>
                        <Tooltip title={t('teamDetail.changeRole')}>
                          <IconButton edge="end" onClick={() => handleOpenRoleDialog(member)} sx={{ mr: 1 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('teamDetail.removeMember')}>
                          <IconButton edge="end" onClick={() => handleOpenRemoveMemberDialog(member)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={t('teamDetail.noMembers')}
                  secondary={t('teamDetail.addMembersPrompt')}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </TabPanel>

      {/* 资源Tab */}
      <TabPanel value={tabValue} index={1}>
        <TeamResourceManagement />
      </TabPanel>

      {/* 实验Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          {t('teamDetail.teamExperiments')}
        </Typography>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="body1">
            {t('teamDetail.experimentsComingSoon')}
          </Typography>
        </Paper>
      </TabPanel>

      {/* 设置Tab */}
      {isAdminOrOwner && (
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            {t('teamDetail.teamSettings')}
          </Typography>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="body1">
              {t('teamDetail.settingsComingSoon')}
            </Typography>
          </Paper>
        </TabPanel>
      )}

      {/* 编辑团队对话框 */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{t('teamDetail.editTeamTitle')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label={t('teamDetail.teamName')}
                fullWidth
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label={t('teamDetail.teamDescription')}
                fullWidth
                multiline
                rows={3}
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
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

      {/* 添加成员对话框 */}
      <Dialog
        open={isAddMemberDialogOpen}
        onClose={handleCloseAddMemberDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{t('teamDetail.addMembersTitle')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t('teamDetail.selectMembers')}
              </Typography>
              <UserSelector
                initialUsers={[]}
                onChange={handleUserSelectionChange}
                excludeUserIds={team.members?.map(member => member.id) || []}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddMemberDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleAddMembers}
            color="primary"
            variant="contained"
            disabled={selectedUsers.length === 0}
          >
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 移除成员确认对话框 */}
      <Dialog
        open={isRemoveMemberDialogOpen}
        onClose={handleCloseRemoveMemberDialog}
      >
        <DialogTitle>{t('teamDetail.removeMemberTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('teamDetail.removeMemberConfirm', { memberName: currentMember?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveMemberDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleRemoveMember} color="error" variant="contained">
            {t('common.remove')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 变更角色对话框 */}
      <Dialog
        open={isRoleDialogOpen}
        onClose={handleCloseRoleDialog}
      >
        <DialogTitle>{t('teamDetail.changeRoleTitle')}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {t('teamDetail.changeRoleFor', { memberName: currentMember?.name })}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant={newRole === 'member' ? 'contained' : 'outlined'}
                color="primary"
                fullWidth
                onClick={() => setNewRole('member')}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                <Box display="flex" flexDirection="column" alignItems="flex-start" width="100%">
                  <Typography variant="subtitle1">{t('teamDetail.memberRole')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('teamDetail.memberRoleDesc')}
                  </Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant={newRole === 'admin' ? 'contained' : 'outlined'}
                color="primary"
                fullWidth
                onClick={() => setNewRole('admin')}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                <Box display="flex" flexDirection="column" alignItems="flex-start" width="100%">
                  <Typography variant="subtitle1">{t('teamDetail.adminRole')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('teamDetail.adminRoleDesc')}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleChangeRole}
            color="primary"
            variant="contained"
            disabled={currentMember?.role === newRole}
          >
            {t('common.change')}
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

export default TeamDetail;
