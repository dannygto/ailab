import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Divider,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';

// 密码强度检查
const checkPasswordStrength = (password: string): number => {
  let score = 0;
  if (!password) return score;

  // 长度检查
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // 复杂度检查
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 5);
};

// 获取强度文本和颜色
const getStrengthDetails = (strength: number): { text: string; color: string } => {
  switch (strength) {
    case 0:
      return { text: '非常弱', color: '#e53935' };
    case 1:
      return { text: '弱', color: '#ff9800' };
    case 2:
      return { text: '一般', color: '#fdd835' };
    case 3:
      return { text: '强', color: '#7cb342' };
    case 4:
    case 5:
      return { text: '非常强', color: '#43a047' };
    default:
      return { text: '', color: '#e0e0e0' };
  }
};

const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  // 表单状态
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // 密码强度
  const [passwordStrength, setPasswordStrength] = useState(0);
  const strengthDetails = getStrengthDetails(passwordStrength);

  // UI 状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 验证重置令牌
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true);

        // 模拟API调用验证token
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 在实际实现中，这里应该调用API验证token
        // const response = await authService.verifyResetToken(token);
        // setTokenValid(response.success);

        // 模拟验证结果
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setError('密码重置链接无效或已过期');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setError('缺少重置令牌');
    }
  }, [token]);

  // 更新密码强度
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(newPassword));
  }, [newPassword]);

  // 重置密码
  const handleResetPassword = async () => {
    if (!newPassword) {
      setError('请输入新密码');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (passwordStrength < 2) {
      setError('密码强度太弱，请设置更复杂的密码');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 在实际实现中，这里应该调用API重置密码
      // await authService.resetPassword(token, newPassword);

      toast.success('密码已成功重置，请使用新密码登录');

      // 重定向到登录页
      navigate('/login');
    } catch (err) {
      setError('密码重置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 正在验证令牌
  if (tokenValid === null) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          p: 3
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 500,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" gutterBottom>
            正在验证...
          </Typography>
          <LinearProgress sx={{ mt: 2, mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            正在验证您的密码重置请求，请稍候...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // 令牌无效
  if (tokenValid === false) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          p: 3
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 500,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            链接无效或已过期
          </Typography>
          <Typography variant="body1" paragraph>
            您的密码重置链接无效或已过期。请重新发起密码重置请求。
          </Typography>
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            sx={{ mt: 2 }}
          >
            重新发起密码重置
          </Button>
        </Paper>
      </Box>
    );
  }

  // 重置密码表单
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
          maxWidth: 500,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          重置密码
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" sx={{ mb: 3 }}>
          请设置您的新密码。建议使用字母、数字和特殊字符的组合，增强密码安全性。
        </Typography>

        <TextField
          fullWidth
          label="新密码"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          required
        />

        {newPassword && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">密码强度：</Typography>
              <Typography variant="body2" sx={{ color: strengthDetails.color }}>
                {strengthDetails.text}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(passwordStrength / 5) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: strengthDetails.color,
                },
              }}
            />
          </Box>
        )}

        <TextField
          fullWidth
          label="确认新密码"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
          error={Boolean(confirmPassword && newPassword !== confirmPassword)}
          helperText={confirmPassword && newPassword !== confirmPassword ? '两次输入的密码不一致' : ''}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleResetPassword}
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : '重置密码'}
        </Button>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            记起密码了？
            <Link component={RouterLink} to="/login" sx={{ ml: 1 }}>
              返回登录
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PasswordReset;
