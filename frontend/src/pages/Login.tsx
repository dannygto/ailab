import React, { useState } from 'react';
import { 
  Box, Paper, TextField, Button, Typography, 
  Link, CircularProgress,
  Tabs, Tab, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { UserRole } from '../types';
import { SchoolIcon } from '../utils/icons';
import { PersonIcon } from '../utils/icons';

const Login: React.FC = () => {  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const navigate = useNavigate();
  const { setUser, setAuthenticated } = useUserStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 开发环境模拟登录
      const tempemail = localStorage.getItem('tempRegisteredemail');
      
      // 检查是否是注册过的邮箱（开发环境模拟）
      if (tempemail === email && password.length >= 6) {
        // 模拟登录成功
        const mockUser = {
          id: '1',
          username: email.split('@')[0],
          name: 'Test User',
          email: email,
          role: 'student' as UserRole,
          createdAt: new Date(),
          isActive: true,
        };
        
        const mockToken = 'mock-jwt-token-for-development';
        
        // 保存token和用户信息
        localStorage.setItem('token', mockToken);
        setUser(mockUser);
        setAuthenticated(true);
        
        toast.success('登录成功');
        navigate('/dashboard');
      } else {
        // 尝试通过api服务登录（如果后端实现了）
        try {
          const response = await api.login(email, password);
          
          // 保存token和用户信息
          localStorage.setItem('token', response.token);
          setUser(response.user);
          setAuthenticated(true);
          
          toast.success('登录成功');
          navigate('/dashboard');
        } catch (error) {
          // api登录失败，使用默认测试账户
          if (email === 'test@example.com' && password === 'password') {
            // 使用默认测试账户
            const mockUser = {
              id: '1',
              username: 'testuser',
              name: 'Test User',
              email: 'test@example.com',
              role: 'student' as UserRole,
              createdAt: new Date(),
              isActive: true,
            };
            
            const mockToken = 'mock-jwt-token-for-development';
            
            // 保存token和用户信息
            localStorage.setItem('token', mockToken);
            setUser(mockUser);
            setAuthenticated(true);
            
            toast.success('使用测试账户登录成功');
            navigate('/dashboard');
          } else {
            throw new Error('登录失败，请检查您的邮箱和密码');
          }
        }
      }    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || '登录失败，请检查您的邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >        {/* 标题区域 */}        <div sx={{ textAlign: 'center', mb: 3 }}>          <img            src="/logo18060Q.png" 
            alt="SSLAB-人工智能辅助实验平台"
            style={{ maxWidth: '180px', marginBottom: '16px' }}
          />          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            人工智能辅助实验平台
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            SSLAB普教版 - 让学习更智能
          </Typography>
        </div>

        {/* 用户类型选择 */}
        <div sx={{ mb: 3 }}>
          <Tabs 
            value={userType} 
            onChange={(_, newValue) => setUserType(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 56,
                fontSize: '1rem',
                fontWeight: 500,
              }
            }}
          >
            <Tab 
              value="student" 
              label="学生登录" 
              icon={<PersonIcon />}
              iconPosition="start"
            />
            <Tab 
              value="teacher" 
              label="教师登录" 
              icon={<SchoolIcon />}
              iconPosition="start"
            />
          </Tabs>
        </div>

        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            type="submit"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '登录'}
          </Button>
          
          <div textAlign="center">
            <Link href="/register" variant="body2">
              没有账号？注册
            </Link>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default Login;

