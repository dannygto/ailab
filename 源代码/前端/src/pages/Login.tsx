import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Divider,
  Alert
} from '@mui/material';

interface LoginFormData {
  username: string;
  password: string;
  userType: 'student' | 'teacher' | 'admin';
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    userType: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUserTypeChange = (event: React.SyntheticEvent, newValue: string) => {
    setFormData(prev => ({
      ...prev,
      userType: newValue as 'student' | 'teacher' | 'admin'
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('登录成功', formData);
    } catch (err) {
      setError('登录失败，请检查用户名和密码');
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
          用户登录
        </Typography>

        <Tabs
          value={formData.userType}
          onChange={handleUserTypeChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="学生" value="student" />
          <Tab label="教师" value="teacher" />
          <Tab label="管理员" value="admin" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

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
            label="密码"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
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
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
