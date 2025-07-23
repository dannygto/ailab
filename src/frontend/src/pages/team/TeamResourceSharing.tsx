import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  FormHelperText,
  Grid,
  Paper,
  Tooltip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ShareIcon,
  PeopleIcon,
  PersonIcon,
  DeleteIcon,
  EditIcon,
  AddIcon,
  CheckCircleIcon,
  ErrorIcon,
  InfoIcon,
  AccessTimeIcon
} from '../../utils/icons';
import { useTeamService } from '../../hooks/useTeamService';
import { useUserService } from '../../hooks/useUserService';
import { teamResourceSharingService, ResourceSharingType, SharingTargetType } from '../../services/teamResourceSharing.service';
import { Team } from '../../types/teams';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useTranslation } from 'react-i18next';

interface TeamResourceSharingProps {
  teamId: string;
  resourceId: string;
  resourceType: string;
  resourceName: string;
  onClose: () => void;
  open: boolean;
}

/**
 * 团队资源共享组件
 * 允许用户控制如何共享团队资源，并管理已有的共享配置
 */
const TeamResourceSharing: React.FC<TeamResourceSharingProps> = ({
  teamId,
  resourceId,
  resourceType,
  resourceName,
  onClose,
  open
}) => {
  const { t } = useTranslation();
  const { getTeamDetails } = useTeamService();
  const { searchUsers } = useUserService();

  // 状态管理
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingSharings, setExistingSharings] = useState<any[]>([]);

  // 新建共享表单状态
  const [sharingType, setSharingType] = useState<ResourceSharingType>(ResourceSharingType.READONLY);
  const [targetType, setTargetType] = useState<SharingTargetType>(SharingTargetType.USER);
  const [targetUsers, setTargetUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [userSearchText, setUserSearchText] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // 加载团队和资源共享信息
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取团队详情
        const teamDetails = await getTeamDetails(teamId);
        setTeam(teamDetails);

        // 获取资源的已有共享配置
        const sharings = await teamResourceSharingService.getResourceSharings(resourceId, resourceType);
        setExistingSharings(sharings);
      } catch (err) {
        console.error('加载资源共享数据失败:', err);
        setError(t('resourceSharing.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamId, resourceId, resourceType, open, getTeamDetails, t]);

  // 处理用户搜索
  useEffect(() => {
    if (!userSearchText || userSearchText.length < 2) {
      setUserSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        const results = await searchUsers(userSearchText);
        setUserSearchResults(results);
      } catch (err) {
        console.error('搜索用户失败:', err);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [userSearchText, searchUsers]);

  // 处理添加用户到目标列表
  const handleAddUser = (userId: string) => {
    const user = userSearchResults.find(u => u.id === userId);
    if (!user) return;

    if (!targetUsers.some(u => u.id === userId)) {
      setTargetUsers([...targetUsers, user]);
    }

    setSelectedUserId('');
    setUserSearchText('');
  };

  // 处理从目标列表移除用户
  const handleRemoveUser = (userId: string) => {
    setTargetUsers(targetUsers.filter(u => u.id !== userId));
  };

  // 处理共享类型变更
  const handleSharingTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSharingType(event.target.value as ResourceSharingType);
  };

  // 处理目标类型变更
  const handleTargetTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newTargetType = event.target.value as SharingTargetType;
    setTargetType(newTargetType);

    // 重置相关状态
    if (newTargetType !== SharingTargetType.USER) {
      setTargetUsers([]);
      setUserSearchText('');
    }

    if (newTargetType !== SharingTargetType.TEAM_ROLE) {
      setSelectedRole('');
    }
  };

  // 处理角色选择变更
  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedRole(event.target.value as string);
  };

  // 处理到期时间变更
  const handleExpirationChange = (date: Date | null) => {
    setExpirationDate(date);
  };

  // 处理启用/禁用到期时间
  const handleExpirationToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExpirationEnabled(event.target.checked);
    if (!event.target.checked) {
      setExpirationDate(null);
    } else if (!expirationDate) {
      // 默认设置为一周后
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setExpirationDate(nextWeek);
    }
  };

  // 创建新的共享配置
  const handleCreateSharing = async () => {
    try {
      setFormError(null);

      // 验证表单
      if (targetType === SharingTargetType.USER && targetUsers.length === 0) {
        setFormError(t('resourceSharing.errorNoUsers'));
        return;
      }

      if (targetType === SharingTargetType.TEAM_ROLE && !selectedRole) {
        setFormError(t('resourceSharing.errorNoRole'));
        return;
      }

      if (expirationEnabled && !expirationDate) {
        setFormError(t('resourceSharing.errorNoExpiration'));
        return;
      }

      // 根据不同的目标类型创建共享
      let success = false;

      if (targetType === SharingTargetType.TEAM) {
        // 与整个团队共享
        success = await teamResourceSharingService.shareWithTeam(
          teamId,
          resourceId,
          resourceType,
          sharingType
        );
      } else if (targetType === SharingTargetType.TEAM_ROLE) {
        // 与特定团队角色共享
        success = await teamResourceSharingService.shareWithTeamRole(
          teamId,
          selectedRole,
          resourceId,
          resourceType,
          sharingType
        );
      } else if (targetType === SharingTargetType.USER) {
        // 与特定用户共享
        // 为每个选定的用户创建共享
        for (const user of targetUsers) {
          await teamResourceSharingService.createResourceSharing({
            resourceId,
            resourceType,
            targetType: SharingTargetType.USER,
            targetId: user.id,
            sharingType,
            expiresAt: expirationEnabled ? expirationDate : undefined,
            createdBy: localStorage.getItem('userId') || ''
          });
        }
        success = true;
      } else if (targetType === SharingTargetType.PUBLIC) {
        // 公开共享
        await teamResourceSharingService.createResourceSharing({
          resourceId,
          resourceType,
          targetType: SharingTargetType.PUBLIC,
          sharingType,
          expiresAt: expirationEnabled ? expirationDate : undefined,
          createdBy: localStorage.getItem('userId') || ''
        });
        success = true;
      }

      if (success) {
        // 重新加载共享配置
        const sharings = await teamResourceSharingService.getResourceSharings(resourceId, resourceType);
        setExistingSharings(sharings);

        // 重置表单
        resetForm();
      }
    } catch (err) {
      console.error('创建资源共享失败:', err);
      setFormError(t('resourceSharing.errorCreating'));
    }
  };

  // 删除共享配置
  const handleDeleteSharing = async (sharingId: string) => {
    try {
      const success = await teamResourceSharingService.deleteResourceSharing(sharingId);

      if (success) {
        // 从列表中移除被删除的共享
        setExistingSharings(existingSharings.filter(s => s.id !== sharingId));
      }
    } catch (err) {
      console.error('删除资源共享失败:', err);
    }
  };

  // 重置表单
  const resetForm = () => {
    setSharingType(ResourceSharingType.READONLY);
    setTargetType(SharingTargetType.USER);
    setTargetUsers([]);
    setSelectedUserId('');
    setSelectedRole('');
    setUserSearchText('');
    setExpirationEnabled(false);
    setExpirationDate(null);
    setFormError(null);
  };

  // 获取目标类型的显示文本
  const getTargetTypeDisplay = (type: SharingTargetType, target?: any) => {
    switch (type) {
      case SharingTargetType.USER:
        return t('resourceSharing.targetTypes.user', { name: target?.name || target?.id || '' });
      case SharingTargetType.TEAM:
        return t('resourceSharing.targetTypes.team', { name: team?.name || '' });
      case SharingTargetType.TEAM_ROLE:
        return t('resourceSharing.targetTypes.teamRole', { role: target?.role || '' });
      case SharingTargetType.PUBLIC:
        return t('resourceSharing.targetTypes.public');
      default:
        return '';
    }
  };

  // 获取共享类型的显示文本
  const getSharingTypeDisplay = (type: ResourceSharingType) => {
    switch (type) {
      case ResourceSharingType.READONLY:
        return t('resourceSharing.sharingTypes.readonly');
      case ResourceSharingType.EDIT:
        return t('resourceSharing.sharingTypes.edit');
      case ResourceSharingType.FULL:
        return t('resourceSharing.sharingTypes.full');
      default:
        return '';
    }
  };

  // 渲染加载中状态
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{t('resourceSharing.title', { name: resourceName })}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <ShareIcon sx={{ mr: 1 }} />
          {t('resourceSharing.title', { name: resourceName })}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 现有共享列表 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t('resourceSharing.existingSharing')}
            </Typography>

            {existingSharings.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('resourceSharing.noExistingSharing')}
              </Alert>
            ) : (
              <Paper variant="outlined">
                <List>
                  {existingSharings.map((sharing, index) => (
                    <React.Fragment key={sharing.id}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem>
                        <ListItemAvatar>
                          {sharing.targetType === SharingTargetType.USER ? (
                            <Avatar src={sharing.targetUser?.avatar}>
                              <PersonIcon />
                            </Avatar>
                          ) : sharing.targetType === SharingTargetType.TEAM ? (
                            <Avatar>
                              <PeopleIcon />
                            </Avatar>
                          ) : (
                            <Avatar>
                              <ShareIcon />
                            </Avatar>
                          )}
                        </ListItemAvatar>

                        <ListItemText
                          primary={getTargetTypeDisplay(sharing.targetType, sharing.targetUser || sharing.targetRole)}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="textPrimary">
                                {getSharingTypeDisplay(sharing.sharingType)}
                              </Typography>
                              {sharing.expiresAt && (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  {t('resourceSharing.expires')}: {new Date(sharing.expiresAt).toLocaleString()}
                                </Box>
                              )}
                            </React.Fragment>
                          }
                        />

                        <ListItemSecondaryAction>
                          <Tooltip title={t('common.delete')}>
                            <IconButton edge="end" onClick={() => handleDeleteSharing(sharing.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>

          {/* 创建新共享表单 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t('resourceSharing.createNew')}
            </Typography>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {/* 共享类型选择 */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('resourceSharing.sharingTypeLabel')}</InputLabel>
                    <Select
                      value={sharingType}
                      onChange={handleSharingTypeChange as any}
                      label={t('resourceSharing.sharingTypeLabel')}
                    >
                      <MenuItem value={ResourceSharingType.READONLY}>
                        {t('resourceSharing.sharingTypes.readonly')}
                      </MenuItem>
                      <MenuItem value={ResourceSharingType.EDIT}>
                        {t('resourceSharing.sharingTypes.edit')}
                      </MenuItem>
                      <MenuItem value={ResourceSharingType.FULL}>
                        {t('resourceSharing.sharingTypes.full')}
                      </MenuItem>
                    </Select>
                    <FormHelperText>
                      {sharingType === ResourceSharingType.READONLY
                        ? t('resourceSharing.sharingTypeHelp.readonly')
                        : sharingType === ResourceSharingType.EDIT
                        ? t('resourceSharing.sharingTypeHelp.edit')
                        : t('resourceSharing.sharingTypeHelp.full')}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                {/* 目标类型选择 */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('resourceSharing.targetTypeLabel')}</InputLabel>
                    <Select
                      value={targetType}
                      onChange={handleTargetTypeChange as any}
                      label={t('resourceSharing.targetTypeLabel')}
                    >
                      <MenuItem value={SharingTargetType.USER}>
                        {t('resourceSharing.targetTypes.userOption')}
                      </MenuItem>
                      <MenuItem value={SharingTargetType.TEAM}>
                        {t('resourceSharing.targetTypes.teamOption')}
                      </MenuItem>
                      <MenuItem value={SharingTargetType.TEAM_ROLE}>
                        {t('resourceSharing.targetTypes.teamRoleOption')}
                      </MenuItem>
                      <MenuItem value={SharingTargetType.PUBLIC}>
                        {t('resourceSharing.targetTypes.publicOption')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 用户选择（当目标类型为用户时显示） */}
                {targetType === SharingTargetType.USER && (
                  <>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <TextField
                          label={t('resourceSharing.searchUsers')}
                          value={userSearchText}
                          onChange={(e) => setUserSearchText(e.target.value)}
                          placeholder={t('resourceSharing.searchUsersPlaceholder')}
                        />
                      </FormControl>
                    </Grid>

                    {userSearchResults.length > 0 && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>{t('resourceSharing.selectUser')}</InputLabel>
                          <Select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value as string)}
                            label={t('resourceSharing.selectUser')}
                            displayEmpty
                          >
                            <MenuItem value="">{t('common.none')}</MenuItem>
                            {userSearchResults.map(user => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </MenuItem>
                            ))}
                          </Select>
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              disabled={!selectedUserId}
                              onClick={() => handleAddUser(selectedUserId)}
                            >
                              {t('resourceSharing.addUser')}
                            </Button>
                          </Box>
                        </FormControl>
                      </Grid>
                    )}

                    {targetUsers.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('resourceSharing.selectedUsers')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {targetUsers.map(user => (
                            <Chip
                              key={user.id}
                              avatar={<Avatar src={user.avatar}>{user.name[0]}</Avatar>}
                              label={user.name}
                              onDelete={() => handleRemoveUser(user.id)}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </>
                )}

                {/* 角色选择（当目标类型为团队角色时显示） */}
                {targetType === SharingTargetType.TEAM_ROLE && team && (
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>{t('resourceSharing.selectRole')}</InputLabel>
                      <Select
                        value={selectedRole}
                        onChange={handleRoleChange as any}
                        label={t('resourceSharing.selectRole')}
                      >
                        <MenuItem value="owner">{t('teamRoles.owner')}</MenuItem>
                        <MenuItem value="admin">{t('teamRoles.admin')}</MenuItem>
                        <MenuItem value="editor">{t('teamRoles.editor')}</MenuItem>
                        <MenuItem value="member">{t('teamRoles.member')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* 过期时间设置 */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={expirationEnabled}
                        onChange={handleExpirationToggle}
                        color="primary"
                      />
                    }
                    label={t('resourceSharing.enableExpiration')}
                  />

                  {expirationEnabled && (
                    <Box sx={{ mt: 2 }}>
                      <DateTimePicker
                        label={t('resourceSharing.expirationDate')}
                        value={expirationDate}
                        onChange={handleExpirationChange}
                        minDateTime={new Date()}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Box>
                  )}
                </Grid>

                {/* 表单错误提示 */}
                {formError && (
                  <Grid item xs={12}>
                    <Alert severity="error">{formError}</Alert>
                  </Grid>
                )}

                {/* 创建按钮 */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ShareIcon />}
                      onClick={handleCreateSharing}
                    >
                      {t('resourceSharing.shareButton')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamResourceSharing;
