import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link
} from '@mui/material';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('密码不匹配');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('注册成功', formData);
    } catch (err) {
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          用户注册
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            value={formData.username}
            onChange={handleInputChange('username')}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="邮箱"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="确认密码"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            margin="normal"
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          已有账号？
          <Link href="/login" underline="hover">
            立即登录
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
