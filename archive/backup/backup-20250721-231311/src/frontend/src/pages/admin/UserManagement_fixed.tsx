import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, RefreshIcon } from '../../utils/icons';

// 用户角色枚举
type UserRole = 'admin' | 'researcher' | 'teacher' | 'student' | 'guest';

// 用户状态枚举
type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// 用户数据接口
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
}

// 用户表单数据接口
interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
  confirmPassword?: string;
}

// 模拟用户API服务
const userService = {
  getUsers: async () => {
    // 模拟API调用
    return new Promise<User[]>((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', username: 'admin', email: 'admin@aicam.edu', fullName: '系统管理员', role: 'admin', status: 'active', lastLogin: new Date(), createdAt: new Date(2023, 0, 15) },
          { id: '2', username: 'researcher1', email: 'researcher1@aicam.edu', fullName: '研究员一号', role: 'researcher', status: 'active', lastLogin: new Date(), createdAt: new Date(2023, 1, 20) },
          { id: '3', username: 'teacher1', email: 'teacher1@aicam.edu', fullName: '老师一号', role: 'teacher', status: 'active', lastLogin: new Date(), createdAt: new Date(2023, 2, 10) },
          { id: '4', username: 'student1', email: 'student1@aicam.edu', fullName: '学生一号', role: 'student', status: 'active', lastLogin: new Date(), createdAt: new Date(2023, 3, 5) },
          { id: '5', username: 'student2', email: 'student2@aicam.edu', fullName: '学生二号', role: 'student', status: 'inactive', createdAt: new Date(2023, 3, 15) },
          { id: '6', username: 'guest1', email: 'guest1@example.com', fullName: '访客一号', role: 'guest', status: 'pending', createdAt: new Date(2023, 4, 20) },
          { id: '7', username: 'researcher2', email: 'researcher2@aicam.edu', fullName: '研究员二号', role: 'researcher', status: 'suspended', lastLogin: new Date(2023, 5, 1), createdAt: new Date(2023, 2, 25) },
          { id: '8', username: 'teacher2', email: 'teacher2@aicam.edu', fullName: '老师二号', role: 'teacher', status: 'active', lastLogin: new Date(), createdAt: new Date(2023, 1, 15) },
          { id: '9', username: 'student3', email: 'student3@aicam.edu', fullName: '学生三号', role: 'student', status: 'active', lastLogin: new Date(), createdAt: new Date(2023, 3, 25) },
          { id: '10', username: 'student4', email: 'student4@aicam.edu', fullName: '学生四号', role: 'student', status: 'active', lastLogin: new Date(), createdAt: new Date(2023, 4, 1) }
        ]);
      }, 800);
    });
  },
  
  createUser: async (userData: UserFormData) => {
    // 模拟API调用
    return new Promise<User>((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          ...userData,
          status: 'active' as UserStatus,
          createdAt: new Date()
        });
      }, 800);
    });
  },
  
  updateUser: async (id: string, userData: Partial<UserFormData>) => {
    // 模拟API调用
    return new Promise<User>((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          username: userData.username || 'username',
          email: userData.email || 'email',
          fullName: userData.fullName || 'Full Name',
          role: userData.role || 'student' as UserRole,
          status: 'active' as UserStatus,
          lastLogin: new Date(),
          createdAt: new Date()
        });
      }, 800);
    });
  },
  
  deleteUser: async (id: string) => {
    // 模拟API调用
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 800);
    });
  }
};

// 渲染用户状态标签
const StatusChip = ({ status }: { status: UserStatus }) => {
  const theme = useTheme();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { label: '活跃', color: theme.palette.success.main };
      case 'inactive':
        return { label: '非活跃', color: theme.palette.text.secondary };
      case 'suspended':
        return { label: '已暂停', color: theme.palette.error.main };
      case 'pending':
        return { label: '待审核', color: theme.palette.warning.main };
      default:
        return { label: status, color: theme.palette.text.primary };
    }
  };
  
  const { label, color } = getStatusConfig();
  
  return (
    <Chip 
      label={label} 
      size="small" 
      sx={{ 
        backgroundColor: `${color}20`, 
        color: color,
        fontWeight: 'medium'
      }}
    />
  );
};

// 渲染用户角色标签
const RoleChip = ({ role }: { role: UserRole }) => {
  const theme = useTheme();
  
  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return { label: '管理员', color: theme.palette.primary.main };
      case 'researcher':
        return { label: '研究员', color: theme.palette.secondary.main };
      case 'teacher':
        return { label: '老师', color: '#9c27b0' };
      case 'student':
        return { label: '学生', color: '#009688' };
      case 'guest':
        return { label: '访客', color: theme.palette.text.secondary };
      default:
        return { label: role, color: theme.palette.text.primary };
    }
  };
  
  const { label, color } = getRoleConfig();
  
  return (
    <Chip 
      label={label} 
      size="small" 
      sx={{ 
        backgroundColor: `${color}20`, 
        color: color,
        fontWeight: 'medium'
      }}
    />
  );
};

/**
 * 用户管理页面组件
 * 
 * 提供用户列表展示、搜索、筛选、分页以及用户的添加、编辑、删除等功能。
 */
const UserManagement: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 分页状态
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 对话框状态
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    fullName: '',
    role: 'student',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // 获取用户数据
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('获取用户列表失败:', err);
      setError('获取用户列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 初始化数据
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // 应用搜索和筛选
  useEffect(() => {
    let result = [...users];
    
    // 应用搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.fullName.toLowerCase().includes(term)
      );
    }
    
    // 应用角色筛选
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // 应用状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
    setPage(0); // 重置页码
  }, [users, searchTerm, roleFilter, statusFilter]);
  
  // 处理分页变化
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // 处理表单输入变化
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      // 清除该字段的错误
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };
  
  // 验证表单
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.username) {
      errors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少需要3个字符';
    }
    
    if (!formData.email) {
      errors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '邮箱格式无效';
    }
    
    if (!formData.fullName) {
      errors.fullName = '全名不能为空';
    }
    
    if (!isEditMode) {
      if (!formData.password) {
        errors.password = '密码不能为空';
      } else if (formData.password.length < 6) {
        errors.password = '密码至少需要6个字符';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = '确认密码与密码不匹配';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 处理添加用户
  const handleAddUser = () => {
    setIsEditMode(false);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'student',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setOpenUserDialog(true);
  };
  
  // 处理编辑用户
  const handleEditUser = (user: User) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
    setFormErrors({});
    setOpenUserDialog(true);
  };
  
  // 处理删除用户
  const handleDeleteUser = (user: User) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };
  
  // 处理表单提交
  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    
    setFormSubmitting(true);
    try {
      if (isEditMode && currentUser) {
        // 更新用户
        const { password, confirmPassword, ...updateData } = formData;
        const updatedUser = await userService.updateUser(currentUser.id, updateData);
        
        // 更新本地状态
        setUsers(prev => prev.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ));
      } else {
        // 创建新用户
        const newUser = await userService.createUser(formData);
        setUsers(prev => [...prev, newUser]);
      }
      
      setOpenUserDialog(false);
      setFormData({
        username: '',
        email: '',
        fullName: '',
        role: 'student',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('保存用户失败:', err);
      setError('保存用户失败，请稍后重试');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // 确认删除用户
  const handleConfirmDelete = async () => {
    if (!currentUser) return;
    
    try {
      await userService.deleteUser(currentUser.id);
      setUsers(prev => prev.filter(user => user.id !== currentUser.id));
      setOpenDeleteDialog(false);
      setCurrentUser(null);
    } catch (err) {
      console.error('删除用户失败:', err);
      setError('删除用户失败，请稍后重试');
    }
  };
  
  // 格式化日期
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // 计算分页显示的用户
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          加载中...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ padding: 3 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          用户管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{ borderRadius: 2 }}
        >
          添加用户
        </Button>
      </Box>
      
      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* 搜索和筛选 */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="搜索用户名、邮箱或姓名"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>角色</InputLabel>
              <Select
                value={roleFilter}
                label="角色"
                onChange={(e) => setRoleFilter(e.target.value as string)}
              >
                <MenuItem value="all">全部角色</MenuItem>
                <MenuItem value="admin">管理员</MenuItem>
                <MenuItem value="researcher">研究员</MenuItem>
                <MenuItem value="teacher">老师</MenuItem>
                <MenuItem value="student">学生</MenuItem>
                <MenuItem value="guest">访客</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select
                value={statusFilter}
                label="状态"
                onChange={(e) => setStatusFilter(e.target.value as string)}
              >
                <MenuItem value="all">全部状态</MenuItem>
                <MenuItem value="active">活跃</MenuItem>
                <MenuItem value="inactive">非活跃</MenuItem>
                <MenuItem value="suspended">已暂停</MenuItem>
                <MenuItem value="pending">待审核</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchUsers}
                sx={{ borderRadius: 2 }}
              >
                刷新
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 用户列表 */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 'bold' }}>用户名</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>邮箱</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>姓名</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>角色</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>状态</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>最后登录</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>创建时间</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: theme.palette.grey[50] } }}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>
                    <RoleChip role={user.role} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={user.status} />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? formatDate(user.lastLogin) : '从未登录'}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="编辑用户">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除用户">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {filteredUsers.length === 0 ? '没有找到匹配的用户' : '没有用户数据'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* 分页 */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页行数："
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} 共 ${count !== -1 ? count : `超过 ${to}`} 条`
          }
        />
      </Paper>
      
      {/* 用户表单对话框 */}
      <Dialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? '编辑用户' : '添加新用户'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="用户名"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                  disabled={formSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="邮箱"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={formSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="姓名"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                  disabled={formSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>角色</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="角色"
                    onChange={(e) => handleFormChange(e as any)}
                    disabled={formSubmitting}
                  >
                    <MenuItem value="admin">管理员</MenuItem>
                    <MenuItem value="researcher">研究员</MenuItem>
                    <MenuItem value="teacher">老师</MenuItem>
                    <MenuItem value="student">学生</MenuItem>
                    <MenuItem value="guest">访客</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {!isEditMode && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="密码"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      disabled={formSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="确认密码"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      error={!!formErrors.confirmPassword}
                      helperText={formErrors.confirmPassword}
                      disabled={formSubmitting}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)} disabled={formSubmitting}>
            取消
          </Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            disabled={formSubmitting}
            startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
          >
            {formSubmitting ? '保存中...' : (isEditMode ? '更新' : '创建')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 删除确认对话框 */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除用户 "{currentUser?.fullName}" 吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            取消
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
