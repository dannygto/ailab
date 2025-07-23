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
import { AddIcon } from '../../utils/icons';
import { EditIcon } from '../../utils/icons';
import { DeleteIcon } from '../../utils/icons';
import { SearchIcon } from '../../utils/icons';

import { RefreshIcon } from '../../utils/icons';

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

// 模拟用户api服务
const userService = {
  getUsers: async () => {
    // 模拟api调用
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
    // 模拟api调用
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
    // 模拟api调用
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
    // 模拟api调用
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 800);
    });
  }
};

// ��Ⱦ�û�״̬��ǩ
const StatusChip = ({ status }: { status: UserStatus }) => {
  const theme = useTheme();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { label: '��Ծ', color: theme.palette.success.main };
      case 'inactive':
        return { label: '�ǻ�Ծ', color: theme.palette.text.secondary };
      case 'suspended':
        return { label: '����ͣ', color: theme.palette.error.main };
      case 'pending':
        return { label: '������', color: theme.palette.warning.main };
      default:
        return { label: status, color: theme.palette.text.primary };
    }
  };
  
  const { label, color } = getStatusConfig();
  
  return (
    <Chip 
      label={label } 
      size="small" 
      sx={{ 
        backgroundColor: `${color}20`, 
        color: color,
        fontWeight: 'medium'
      }}
    />
  );
};

// ��Ⱦ�û���ɫ��ǩ
const RoleChip = ({ role }: { role: UserRole }) => {
  const theme = useTheme();
  
  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return { label: '����Ա', color: theme.palette.primary.main };
      case 'researcher':
        return { label: '�о�Ա', color: theme.palette.secondary.main };
      case 'teacher':
        return { label: '��ʦ', color: '#9c27b0' };
      case 'student':
        return { label: 'ѧ��', color: '#009688' };
      case 'guest':
        return { label: '�ÿ�', color: theme.palette.text.secondary };
      default:
        return { label: role, color: theme.palette.text.primary };
    }
  };
  
  const { label, color } = getRoleConfig();
  
  return (
    <Chip 
      label={label } 
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
 * �û�����ҳ�����
 * 
 * �ṩ�û��б���ʾ��������ɸѡ����ҳ�Լ��û������ӡ��༭��ɾ���ȹ��ܡ�
 */
const UserManagement: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ��ҳ״̬
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // ������ɸѡ״̬
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // �Ի���״̬
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // ����״̬
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
  
  // ��ȡ�û�����
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('��ȡ�û��б�ʧ��:', err);
      setError('��ȡ�û��б�ʧ�ܣ����Ժ�����');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // ��ʼ����
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Ӧ��������ɸѡ
  useEffect(() => {
    let result = [...users];
    
    // Ӧ������
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.fullName.toLowerCase().includes(term)
      );
    }
    
    // Ӧ�ý�ɫɸѡ
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Ӧ��״̬ɸѡ
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
    setPage(0); // ����ҳ��
  }, [users, searchTerm, roleFilter, statusFilter]);
  
  // ������ҳ�仯
  const handleChangePage = (Event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(Event.target.value, 10));
    setPage(0);
  };
  
  // ������������仯
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      // ������ֶεĴ���
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };
  
  // ��֤����
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.username) {
      errors.username = '�û�������Ϊ��';
    } else if (formData.username.length < 3) {
      errors.username = '�û���������Ҫ3���ַ�';
    }
    
    if (!formData.email) {
      errors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '邮箱格式无效';
    }
    
    if (!formData.fullName) {
      errors.fullName = 'ȫ������Ϊ��';
    }
    
    if (!isEditMode) {
      if (!formData.password) {
        errors.password = '���벻��Ϊ��';
      } else if (formData.password.length < 6) {
        errors.password = '����������Ҫ6���ַ�';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = '������������벻ƥ��';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // ���������û�
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
  
  // �����༭�û�
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
  
  // ����ɾ���û�
  const handleDeleteUser = (user: User) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };
  
  // ���������ύ
  const handleSubmitForm = async () => {
    if (!validateForm()) return;
    
    setFormSubmitting(true);
    try {
      if (isEditMode && currentUser) {
        // �����û�
        const { password, confirmPassword, ...updateData } = formData;
        const updatedUser = await userService.updateUser(currentUser.id, updateData);
        
        // ���±���״̬
        setUsers(prev => prev.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ));
      } else {
        // �������û�
        const newUser = await userService.createUser(formData);
        
        // ���±���״̬
        setUsers(prev => [...prev, newUser]);
      }
      
      // �رնԻ���
      setOpenUserDialog(false);
    } catch (err) {
      console.error('�����û�ʧ��:', err);
      setFormErrors(prev => ({ ...prev, form: '�����û�ʧ�ܣ����Ժ�����' }));
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // ����ȷ��ɾ��
  const handleConfirmDelete = async () => {
    if (!currentUser) return;
    
    setFormSubmitting(true);
    try {
      await userService.deleteUser(currentUser.id);
      
      // ���±���״̬
      setUsers(prev => prev.filter(user => user.id !== currentUser.id));
      
      // �رնԻ���
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('ɾ���û�ʧ��:', err);
      setError('ɾ���û�ʧ�ܣ����Ժ�����');
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // ��ʽ������
  const formatDate = (date?: Date) => {
    if (!date) return '��δ';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        �û�����
      </Typography>
      
      {/* ������ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="�����û�"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
            placeholder="���û����������ȫ������"
          />
        </Grid>
        
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>��ɫ</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="��ɫ"
            >
              <MenuItem value="all">���н�ɫ</MenuItem>
              <MenuItem value="admin">����Ա</MenuItem>
              <MenuItem value="researcher">�о�Ա</MenuItem>
              <MenuItem value="teacher">��ʦ</MenuItem>
              <MenuItem value="student">ѧ��</MenuItem>
              <MenuItem value="guest">�ÿ�</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>״̬</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="״̬"
            >
              <MenuItem value="all">����״̬</MenuItem>
              <MenuItem value="active">��Ծ</MenuItem>
              <MenuItem value="inactive">�ǻ�Ծ</MenuItem>
              <MenuItem value="suspended">����ͣ</MenuItem>
              <MenuItem value="pending">������</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            �����û�
          </Button>
          
          <Tooltip title="ˢ���б�">
            <IconButton
              onClick={fetchUsers}
              disabled={loading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      
      {/* ������Ϣ */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* �û����� */}
      <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>�û���</TableCell>
                <TableCell>ȫ��</TableCell>
                <TableCell>����</TableCell>
                <TableCell>��ɫ</TableCell>
                <TableCell>״̬</TableCell>
                <TableCell>����¼</TableCell>
                <TableCell>����ʱ��</TableCell>
                <TableCell align="right">����</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      �����û�����...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      û���ҵ�ƥ����û�
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleChip role={user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={user.status} />
                      </TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="�༭�û�">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="ɾ���û�">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="ÿҳ����:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ��${count}��`}
        />
      </Paper>
      
      {/* �û������Ի��� */}
      <Dialog
        open={openUserDialog}
        onClose={() => !formSubmitting && setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? '�༭�û�' : '�������û�'}
        </DialogTitle>
        
        <DialogContent>
          {formErrors.form && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.form}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="�û���"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
                disabled={formSubmitting}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ȫ��"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                disabled={formSubmitting}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="����"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={formSubmitting}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>��ɫ</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={e => handleFormChange(e as any)}
                  label="��ɫ"
                  disabled={formSubmitting}
                >
                  <MenuItem value="admin">����Ա</MenuItem>
                  <MenuItem value="researcher">�о�Ա</MenuItem>
                  <MenuItem value="teacher">��ʦ</MenuItem>
                  <MenuItem value="student">ѧ��</MenuItem>
                  <MenuItem value="guest">�ÿ�</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {!isEditMode && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="����"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    disabled={formSubmitting}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ȷ������"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleFormChange}
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
                    disabled={formSubmitting}
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setOpenUserDialog(false)} 
            disabled={formSubmitting}
          >
            ȡ��
          </Button>
          <Button 
            onClick={handleSubmitForm} 
            variant="contained" 
            disabled={formSubmitting}
            startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
          >
            {formSubmitting ? '������...' : '����'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* ɾ��ȷ�϶Ի��� */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !formSubmitting && setOpenDeleteDialog(false)}
      >
        <DialogTitle>ȷ��ɾ��</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ��ȷ��Ҫɾ���û� "{currentUser?.fullName}" ({currentUser?.username}) �𣿴˲����޷�������
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            disabled={formSubmitting}
          >
            ȡ��
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={formSubmitting}
            startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
          >
            {formSubmitting ? 'ɾ����...' : 'ɾ��'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;


