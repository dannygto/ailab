import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  VisibilityOff as PrivateIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  ResourceType,
  PermissionAction,
  PermissionTargetType,
  ResourcePermissionConfig,
  UpdateResourcePermissionConfigRequest,
} from '../../types/permission';
import { permissionService } from '../../services';
import { User } from '../../types';

interface ResourcePermissionControlProps {
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  onPermissionChange?: (newConfig: ResourcePermissionConfig) => void;
}

/**
 * 资源权限控制组件
 * 用于管理特定资源的权限设置
 */
const ResourcePermissionControl: React.FC<ResourcePermissionControlProps> = ({
  resourceType,
  resourceId,
  resourceName,
  onPermissionChange,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionConfig, setPermissionConfig] = useState<ResourcePermissionConfig | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editConfig, setEditConfig] = useState<UpdateResourcePermissionConfigRequest>({
    isPublic: false,
    sharedWith: {
      users: [],
      teams: [],
      organizations: [],
    },
  });

  // 用于用户选择器的状态
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserActions, setSelectedUserActions] = useState<PermissionAction[]>([PermissionAction.READ]);

  // 加载资源权限配置
  useEffect(() => {
    loadResourcePermissions();
  }, [resourceType, resourceId]);

  const loadResourcePermissions = async () => {
    setLoading(true);
    try {
      const config = await permissionService.getResourcePermissions(resourceType, resourceId);
      setPermissionConfig(config);
      // 初始化编辑状态
      setEditConfig({
        isPublic: config.isPublic,
        sharedWith: {
          users: config.sharedWith.users.map(u => ({
            userId: u.userId,
            actions: [...u.actions],
          })),
          teams: config.sharedWith.teams.map(t => ({
            teamId: t.teamId,
            actions: [...t.actions],
          })),
          organizations: config.sharedWith.organizations.map(o => ({
            organizationId: o.organizationId,
            actions: [...o.actions],
          })),
        },
      });

      // 模拟加载可用用户列表 (实际应用中应该从API获取)
      // TODO: 替换为真实的用户API调用
      setAvailableUsers([
        { id: '1', username: 'user1', email: 'user1@example.com', role: 'student', isActive: true, createdAt: new Date() },
        { id: '2', username: 'user2', email: 'user2@example.com', role: 'student', isActive: true, createdAt: new Date() },
        { id: '3', username: 'user3', email: 'user3@example.com', role: 'teacher', isActive: true, createdAt: new Date() },
      ]);
    } catch (error) {
      console.error('Failed to load resource permissions', error);
      enqueueSnackbar('加载资源权限失败', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    if (editMode) {
      // 取消编辑，重置为当前配置
      if (permissionConfig) {
        setEditConfig({
          isPublic: permissionConfig.isPublic,
          sharedWith: {
            users: permissionConfig.sharedWith.users.map(u => ({
              userId: u.userId,
              actions: [...u.actions],
            })),
            teams: permissionConfig.sharedWith.teams.map(t => ({
              teamId: t.teamId,
              actions: [...t.actions],
            })),
            organizations: permissionConfig.sharedWith.organizations.map(o => ({
              organizationId: o.organizationId,
              actions: [...o.actions],
            })),
          },
        });
      }
    }
    setEditMode(!editMode);
  };

  // 保存权限配置
  const savePermissionConfig = async () => {
    if (!permissionConfig) return;

    setSaving(true);
    try {
      const updatedConfig = await permissionService.updateResourcePermissions(
        resourceType,
        resourceId,
        editConfig
      );
      setPermissionConfig(updatedConfig);
      setEditMode(false);

      if (onPermissionChange) {
        onPermissionChange(updatedConfig);
      }

      enqueueSnackbar('权限设置已保存', { variant: 'success' });
    } catch (error) {
      console.error('Failed to save resource permissions', error);
      enqueueSnackbar('保存权限设置失败', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // 切换公共访问权限
  const handlePublicToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditConfig({
      ...editConfig,
      isPublic: event.target.checked,
    });
  };

  // 添加用户共享
  const handleAddUserShare = () => {
    if (!selectedUser) return;

    // 检查用户是否已在共享列表中
    const existingUserIndex = editConfig.sharedWith?.users?.findIndex(
      u => u.userId === selectedUser.id
    );

    if (existingUserIndex !== undefined && existingUserIndex >= 0) {
      // 更新现有用户的权限
      const updatedUsers = [...(editConfig.sharedWith?.users || [])];
      updatedUsers[existingUserIndex] = {
        userId: selectedUser.id,
        actions: selectedUserActions,
      };

      setEditConfig({
        ...editConfig,
        sharedWith: {
          ...editConfig.sharedWith,
          users: updatedUsers,
        },
      });
    } else {
      // 添加新用户
      setEditConfig({
        ...editConfig,
        sharedWith: {
          ...editConfig.sharedWith,
          users: [
            ...(editConfig.sharedWith?.users || []),
            {
              userId: selectedUser.id,
              actions: selectedUserActions,
            },
          ],
        },
      });
    }

    setSelectedUser(null);
    setSelectedUserActions([PermissionAction.READ]);
    setUserDialogOpen(false);
  };

  // 移除用户共享
  const handleRemoveUserShare = (userId: string) => {
    setEditConfig({
      ...editConfig,
      sharedWith: {
        ...editConfig.sharedWith,
        users: (editConfig.sharedWith?.users || []).filter(u => u.userId !== userId),
      },
    });
  };

  // 获取权限操作的中文名称
  const getPermissionActionName = (action: PermissionAction): string => {
    const actionNames: Record<PermissionAction, string> = {
      [PermissionAction.CREATE]: '创建',
      [PermissionAction.READ]: '查看',
      [PermissionAction.UPDATE]: '编辑',
      [PermissionAction.DELETE]: '删除',
      [PermissionAction.EXECUTE]: '执行',
      [PermissionAction.SHARE]: '分享',
      [PermissionAction.APPROVE]: '审批',
      [PermissionAction.ASSIGN]: '分配',
      [PermissionAction.MANAGE]: '管理',
    };

    return actionNames[action] || action;
  };

  // 获取资源类型的中文名称
  const getResourceTypeName = (type: ResourceType): string => {
    const typeNames: Record<ResourceType, string> = {
      [ResourceType.EXPERIMENT]: '实验',
      [ResourceType.TEMPLATE]: '模板',
      [ResourceType.DEVICE]: '设备',
      [ResourceType.RESOURCE]: '资源',
      [ResourceType.TEAM]: '团队',
      [ResourceType.REPORT]: '报告',
      [ResourceType.SETTING]: '设置',
      [ResourceType.USER]: '用户',
      [ResourceType.ORGANIZATION]: '组织',
    };

    return typeNames[type] || type;
  };

  // 处理权限操作选择变化
  const handleActionChange = (event: SelectChangeEvent<PermissionAction[]>) => {
    const value = event.target.value as unknown as PermissionAction[];
    setSelectedUserActions(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!permissionConfig) {
    return (
      <Alert severity="error">无法加载权限配置</Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {getResourceTypeName(resourceType)}权限设置: {resourceName}
        </Typography>

        {!editMode ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={toggleEditMode}
          >
            编辑权限
          </Button>
        ) : (
          <Box>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={toggleEditMode}
              sx={{ mr: 1 }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={savePermissionConfig}
              disabled={saving}
            >
              保存
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 资源所有者 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          资源所有者
        </Typography>
        <Chip
          icon={<PersonIcon />}
          label={permissionConfig.owner?.name || permissionConfig.owner?.username || '未知用户'}
          color="primary"
        />
      </Box>

      {/* 公共访问设置 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          公共访问权限
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={editMode ? editConfig.isPublic : permissionConfig.isPublic}
              onChange={handlePublicToggle}
              disabled={!editMode}
            />
          }
          label={
            <>
              {(editMode ? editConfig.isPublic : permissionConfig.isPublic) ? (
                <Chip size="small" icon={<PublicIcon />} label="公开" color="success" sx={{ ml: 1 }} />
              ) : (
                <Chip size="small" icon={<PrivateIcon />} label="私有" color="default" sx={{ ml: 1 }} />
              )}
            </>
          }
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {(editMode ? editConfig.isPublic : permissionConfig.isPublic)
            ? '所有用户都可以查看此资源'
            : '只有资源所有者和被授权的用户才能访问此资源'}
        </Typography>
      </Box>

      {/* 用户共享 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1">
            共享给用户
          </Typography>

          {editMode && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setUserDialogOpen(true)}
            >
              添加用户
            </Button>
          )}
        </Box>

        <List dense>
          {(editMode ? editConfig.sharedWith?.users : permissionConfig.sharedWith.users)?.length ? (
            (editMode ? editConfig.sharedWith?.users : permissionConfig.sharedWith.users).map((userShare) => {
              const user = editMode
                ? permissionConfig.sharedWith.users.find(u => u.userId === userShare.userId)?.user
                : userShare.user;

              return (
                <ListItem key={userShare.userId}>
                  <ListItemText
                    primary={user?.name || user?.username || userShare.userId}
                    secondary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {userShare.actions.map(action => (
                          <Chip
                            key={action}
                            label={getPermissionActionName(action)}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    }
                  />

                  {editMode && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemoveUserShare(userShare.userId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })
          ) : (
            <ListItem>
              <ListItemText primary="未共享给任何用户" />
            </ListItem>
          )}
        </List>
      </Box>

      {/* 团队共享和组织共享部分可以类似实现，这里省略 */}

      {/* 用户选择对话框 */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加用户共享</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={availableUsers}
                getOptionLabel={(option) => `${option.name || option.username} (${option.email})`}
                value={selectedUser}
                onChange={(_, newValue) => setSelectedUser(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="选择用户" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>权限</InputLabel>
                <Select
                  multiple
                  value={selectedUserActions}
                  onChange={handleActionChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as PermissionAction[]).map((value) => (
                        <Chip key={value} label={getPermissionActionName(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(PermissionAction).map((action) => (
                    <MenuItem key={action} value={action}>
                      {getPermissionActionName(action)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={handleAddUserShare}
            disabled={!selectedUser || selectedUserActions.length === 0}
          >
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ResourcePermissionControl;
