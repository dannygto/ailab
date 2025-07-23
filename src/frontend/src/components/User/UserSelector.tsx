import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  useTheme
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import { User } from '../../types';
import axios from 'axios';
import { debounce } from 'lodash';

// 服务层整合
const userService = {
  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      return response.data.data || [];
    } catch (error) {
      console.error('搜索用户失败:', error);
      return [];
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get('/api/users');
      return response.data.data || [];
    } catch (error) {
      console.error('获取用户失败:', error);
      return [];
    }
  }
};

// 用户选择器组件属性定义
export interface UserSelectorProps {
  selectedUsers: User[];
  onChange: (users: User[]) => void;
  excludeUserIds?: string[];
  maxSelection?: number;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  multiple?: boolean;
  showSelectedList?: boolean;
  onBlur?: () => void;
}

// 获取用户显示名称的工具函数
const getUserDisplayName = (user: User): string => {
  if (user.name) return user.name;
  if (user.username) return user.username;
  return user.email;
};

// 获取用户角色显示名称的工具函数
const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'student': '学生',
    'teacher': '教师',
    'admin': '管理员',
    'super_admin': '超级管理员'
  };
  return roleMap[role] || role;
};

// 用户选择器组件
export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUsers,
  onChange,
  excludeUserIds = [],
  maxSelection,
  label = '选择用户',
  placeholder = '搜索用户...',
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  multiple = true,
  showSelectedList = true,
  onBlur
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 已达到最大选择数量的标志
  const isMaxSelected = useMemo(() => {
    return maxSelection !== undefined && selectedUsers.length >= maxSelection;
  }, [selectedUsers, maxSelection]);

  // 防抖处理的搜索函数
  const searchUsers = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query) {
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const results = await userService.searchUsers(query);
          // 过滤掉已排除的用户
          const filteredResults = results.filter(
            user => !excludeUserIds.includes(user.id) &&
                   !selectedUsers.some(selected => selected.id === user.id)
          );
          setOptions(filteredResults);
        } catch (error) {
          console.error('搜索用户时出错:', error);
        } finally {
          setLoading(false);
        }
      }, 300),
    [excludeUserIds, selectedUsers]
  );

  // 初始加载一些用户选项
  useEffect(() => {
    const loadInitialUsers = async () => {
      try {
        setLoading(true);
        const users = await userService.getUsers();
        // 过滤掉已排除和已选择的用户
        const filteredUsers = users.filter(
          user => !excludeUserIds.includes(user.id) &&
                 !selectedUsers.some(selected => selected.id === user.id)
        ).slice(0, 20); // 限制初始显示数量
        setOptions(filteredUsers);
      } catch (error) {
        console.error('加载初始用户失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && options.length === 0) {
      loadInitialUsers();
    }
  }, [open, excludeUserIds, selectedUsers, options.length]);

  // 输入值变化时触发搜索
  useEffect(() => {
    if (inputValue) {
      searchUsers(inputValue);
    }
  }, [inputValue, searchUsers]);

  // 处理用户选择
  const handleUserSelect = useCallback(
    (event: React.SyntheticEvent, value: User | User[] | null) => {
      if (!value) {
        return;
      }

      let newSelectedUsers: User[];

      if (multiple) {
        newSelectedUsers = Array.isArray(value) ? value : [];
      } else {
        newSelectedUsers = value && !Array.isArray(value) ? [value] : [];
      }

      // 应用最大选择限制
      if (maxSelection !== undefined && newSelectedUsers.length > maxSelection) {
        newSelectedUsers = newSelectedUsers.slice(0, maxSelection);
      }

      onChange(newSelectedUsers);
    },
    [onChange, multiple, maxSelection]
  );

  // 删除选定的用户
  const handleDelete = useCallback(
    (userId: string) => {
      const newSelectedUsers = selectedUsers.filter(user => user.id !== userId);
      onChange(newSelectedUsers);
    },
    [selectedUsers, onChange]
  );

  // 显示选定用户对话框
  const handleOpenSelectedDialog = () => {
    setDialogOpen(true);
  };

  // 渲染用户选项
  const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: User) => {
    return (
      <li {...props}>
        <Box display="flex" alignItems="center" width="100%">
          <Avatar
            src={option.avatarUrl || option.avatar}
            alt={getUserDisplayName(option)}
            sx={{
              width: 32,
              height: 32,
              mr: 1.5,
              bgcolor: option.avatar ? undefined : theme.palette.primary.main
            }}
          >
            {getUserDisplayName(option).charAt(0).toUpperCase()}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="body1" component="div">
              {getUserDisplayName(option)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {option.email} · {getRoleDisplayName(option.role)}
            </Typography>
          </Box>
        </Box>
      </li>
    );
  };

  return (
    <>
      <Box width={fullWidth ? '100%' : 'auto'}>
        <Autocomplete
          multiple={multiple}
          id="user-selector"
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={multiple ? selectedUsers : selectedUsers[0] || null}
          onChange={handleUserSelect}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          options={options}
          loading={loading}
          disabled={disabled || isMaxSelected}
          getOptionLabel={(option) => getUserDisplayName(option)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={renderOption}
          renderTags={(value, getTagProps) =>
            value.slice(0, 3).map((option, index) => (
              <Chip
                avatar={
                  <Avatar
                    src={option.avatarUrl || option.avatar}
                    alt={getUserDisplayName(option)}
                  >
                    {getUserDisplayName(option).charAt(0).toUpperCase()}
                  </Avatar>
                }
                label={getUserDisplayName(option)}
                {...getTagProps({ index })}
                onDelete={() => handleDelete(option.id)}
                size="small"
                sx={{ maxWidth: '180px' }}
              />
            ))
            .concat(
              value.length > 3
                ? [
                    <Chip
                      key="more"
                      label={`+${value.length - 3} 更多`}
                      onClick={handleOpenSelectedDialog}
                      size="small"
                    />
                  ]
                : []
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={selectedUsers.length === 0 ? placeholder : ''}
              variant={variant}
              size={size}
              error={error}
              helperText={helperText}
              onBlur={onBlur}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
                startAdornment: (
                  <>
                    {params.InputProps.startAdornment}
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  </>
                )
              }}
            />
          )}
          PaperComponent={(props) => (
            <Paper {...props} elevation={3} sx={{ mt: 1 }} />
          )}
          noOptionsText="没有找到匹配的用户"
          loadingText="正在搜索..."
        />

        {showSelectedList && selectedUsers.length > 0 && (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
            >
              <Typography variant="subtitle2" color="textSecondary">
                已选择 {selectedUsers.length} 位用户
                {maxSelection && ` (最多 ${maxSelection} 位)`}
              </Typography>
              <Button
                size="small"
                color="primary"
                onClick={handleOpenSelectedDialog}
                disabled={selectedUsers.length === 0}
              >
                查看全部
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* 已选用户列表对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">已选择的用户</Typography>
            <IconButton edge="end" onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedUsers.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center" py={2}>
              尚未选择任何用户
            </Typography>
          ) : (
            <List>
              {selectedUsers.map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemAvatar>
                    <Avatar
                      src={user.avatarUrl || user.avatar}
                      alt={getUserDisplayName(user)}
                      sx={{
                        bgcolor: user.avatar ? undefined : theme.palette.primary.main
                      }}
                    >
                      {getUserDisplayName(user).charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getUserDisplayName(user)}
                    secondary={
                      <>
                        {user.email}
                        <Box component="span" sx={{ display: 'block' }}>
                          {getRoleDisplayName(user.role)}
                        </Box>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDelete(user.id)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            关闭
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// 创建团队成员选择器组件
export interface TeamMemberSelectorProps extends Omit<UserSelectorProps, 'onChange'> {
  onChange: (users: User[], roles: Record<string, string>) => void;
  initialRoles?: Record<string, string>;
}

export const TeamMemberSelector: React.FC<TeamMemberSelectorProps> = ({
  selectedUsers,
  onChange,
  initialRoles = {},
  ...props
}) => {
  const [roles, setRoles] = useState<Record<string, string>>(initialRoles);
  const [selectedUserWithRole, setSelectedUserWithRole] = useState<{user: User, role: string} | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // 当选择的用户改变时
  const handleUserChange = (users: User[]) => {
    // 对于新增的用户，默认分配 'member' 角色
    const newUsers = users.filter(user => !selectedUsers.some(u => u.id === user.id));
    let newRoles = { ...roles };

    newUsers.forEach(user => {
      newRoles[user.id] = 'member';
    });

    // 移除已不在选择列表中的用户角色
    const currentUserIds = users.map(user => user.id);
    Object.keys(newRoles).forEach(userId => {
      if (!currentUserIds.includes(userId)) {
        delete newRoles[userId];
      }
    });

    setRoles(newRoles);
    onChange(users, newRoles);
  };

  // 打开角色选择对话框
  const handleRoleChange = (user: User) => {
    setSelectedUserWithRole({ user, role: roles[user.id] || 'member' });
    setRoleDialogOpen(true);
  };

  // 确认角色更改
  const handleRoleConfirm = (role: string) => {
    if (selectedUserWithRole) {
      const newRoles = { ...roles, [selectedUserWithRole.user.id]: role };
      setRoles(newRoles);
      onChange(selectedUsers, newRoles);
      setRoleDialogOpen(false);
      setSelectedUserWithRole(null);
    }
  };

  // 渲染角色选择对话框
  const renderRoleDialog = () => {
    if (!selectedUserWithRole) return null;

    const roleOptions = [
      { value: 'owner', label: '团队所有者', description: '完全控制团队和所有资源' },
      { value: 'admin', label: '管理员', description: '管理团队成员和大部分资源' },
      { value: 'editor', label: '编辑者', description: '可以编辑团队资源' },
      { value: 'member', label: '成员', description: '基本访问团队资源' },
      { value: 'guest', label: '访客', description: '有限的只读访问' }
    ];

    return (
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>
          设置成员角色 - {getUserDisplayName(selectedUserWithRole.user)}
        </DialogTitle>
        <DialogContent>
          <List>
            {roleOptions.map((option) => (
              <ListItem
                button
                key={option.value}
                onClick={() => handleRoleConfirm(option.value)}
                selected={selectedUserWithRole.role === option.value}
              >
                <ListItemText
                  primary={option.label}
                  secondary={option.description}
                />
                {selectedUserWithRole.role === option.value && (
                  <ListItemSecondaryAction>
                    <CheckIcon color="primary" />
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)} color="primary">
            取消
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <UserSelector
        selectedUsers={selectedUsers}
        onChange={handleUserChange}
        {...props}
      />
      {renderRoleDialog()}
    </>
  );
};

export default UserSelector;
