import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Avatar,
  CircularProgress,
  Typography,
  Box,
  Paper
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { User } from '../../types/users';
import { debounce } from '../../utils/helpers';

interface UserSelectorProps {
  /** 初始已选择的用户数组 */
  initialUsers?: User[];
  /** 选择变更时的回调函数 */
  onChange: (selectedUsers: User[]) => void;
  /** 是否允许多选 */
  multiple?: boolean;
  /** 选择器标签 */
  label?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否禁用特定用户的选择 */
  disabledUserIds?: string[];
  /** 排除特定用户不在列表中显示 */
  excludeUserIds?: string[];
  /** 限制为特定角色的用户 */
  roleFilter?: string[];
  /** 是否显示默认为在线用户 */
  defaultToOnline?: boolean;
  /** 是否禁用组件 */
  disabled?: boolean;
}

/**
 * 用户选择器组件
 *
 * 提供搜索、选择用户的功能，支持单选和多选模式
 */
const UserSelector: React.FC<UserSelectorProps> = ({
  initialUsers = [],
  onChange,
  multiple = true,
  label = '选择用户',
  placeholder = '搜索用户...',
  disabledUserIds = [],
  excludeUserIds = [],
  roleFilter = [],
  defaultToOnline = false,
  disabled = false
}) => {
  const [options, setOptions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>(initialUsers);

  // 初始加载已选择的用户
  useEffect(() => {
    // 如果提供了初始用户，不需要加载
    if (initialUsers && initialUsers.length > 0) {
      return;
    }
  }, [initialUsers]);

  // 监听选择变化，通知父组件
  useEffect(() => {
    onChange(selectedUsers);
  }, [selectedUsers, onChange]);

  // 搜索用户的防抖函数
  const searchUsers = debounce(async (term: string) => {
    if (!term && !defaultToOnline) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query: any = { search: term };

      if (roleFilter.length > 0) {
        query.roles = roleFilter;
      }

      if (defaultToOnline) {
        query.status = 'online';
      }

      const response = await axios.get(`${API_BASE_URL}/users/search`, { params: query });

      // 过滤掉被排除的用户
      const filteredUsers = response.data.filter(
        (user: User) => !excludeUserIds.includes(user.id)
      );

      setOptions(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  }, 300);

  // 处理搜索输入
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    searchUsers(term);
  };

  // 处理选择变化
  const handleSelectionChange = (_event: React.SyntheticEvent, value: User | User[] | null) => {
    if (!value) {
      setSelectedUsers([]);
      return;
    }

    if (multiple) {
      const users = value as User[];
      setSelectedUsers(users);
    } else {
      const user = value as User;
      setSelectedUsers([user]);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      disabled={disabled}
      options={options}
      value={multiple ? selectedUsers : selectedUsers[0] || null}
      getOptionLabel={(option) => `${option.name} (${option.username})`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={loading}
      onChange={handleSelectionChange}
      filterSelectedOptions
      disableCloseOnSelect={multiple}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          onChange={handleSearchChange}
          value={searchTerm}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const isDisabled = disabledUserIds.includes(option.id);
        return (
          <li {...props} key={option.id} style={{ opacity: isDisabled ? 0.5 : 1 }}>
            <Box display="flex" alignItems="center" width="100%">
              <Avatar
                src={option.avatar}
                alt={option.name}
                sx={{ width: 32, height: 32, mr: 2 }}
              >
                {option.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.username} • {option.department || '未指定部门'}
                </Typography>
              </Box>
              {isDisabled && (
                <Typography variant="caption" color="text.secondary" ml="auto">
                  已添加
                </Typography>
              )}
              {option.status === 'online' && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    ml: 'auto'
                  }}
                />
              )}
            </Box>
          </li>
        );
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            avatar={<Avatar src={option.avatar} alt={option.name}>{option.name.charAt(0)}</Avatar>}
            label={option.name}
            {...getTagProps({ index })}
            disabled={disabledUserIds.includes(option.id) || disabled}
          />
        ))
      }
      ListboxComponent={(props) => (
        <Paper elevation={3} sx={{ mt: 1 }}>
          {options.length === 0 && !loading ? (
            <Box p={2} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? '未找到匹配用户' : '请输入搜索关键词'}
              </Typography>
            </Box>
          ) : (
            <ul {...props} />
          )}
        </Paper>
      )}
    />
  );
};

export default UserSelector;
