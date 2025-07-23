import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';

// 恢复方式类型
type RecoveryMethod = 'email' | 'phone';

// 步骤
const steps = ['选择恢复方式', '验证身份', '重置密码'];

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  // 步骤状态
  const [activeStep, setActiveStep] = useState(0);

  // 表单状态
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('email');
  const [identifier, setIdentifier] = useState(''); // 邮箱或手机号
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI 状态
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // 处理恢复方式切换
  const handleMethodChange = (event: React.SyntheticEvent, newValue: RecoveryMethod) => {
    setRecoveryMethod(newValue);
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!identifier) {
      setError(recoveryMethod === 'email' ? '请输入邮箱地址' : '请输入手机号码');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 开始倒计时
      setCodeSent(true);
      setCountdown(60);

      // 倒计时逻辑
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success(`验证码已发送至${recoveryMethod === 'email' ? '邮箱' : '手机'}`);
    } catch (err) {
      setError(`验证码发送失败，请稍后重试`);
    } finally {
      setLoading(false);
    }
  };

  // 验证身份
  const handleVerifyIdentity = async () => {
    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1200));

      // 验证成功，进入下一步
      setActiveStep(2);
    } catch (err) {
      setError('验证码无效或已过期');
    } finally {
      setLoading(false);
    }
  };

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

    try {
      setLoading(true);
      setError(null);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('密码重置成功，请使用新密码登录');

      // 重定向到登录页
      navigate('/login');
    } catch (err) {
      setError('密码重置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理下一步
  const handleNext = () => {
    if (activeStep === 0) {
      if (!identifier) {
        setError(recoveryMethod === 'email' ? '请输入邮箱地址' : '请输入手机号码');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      handleVerifyIdentity();
    } else if (activeStep === 2) {
      handleResetPassword();
    }
  };

  // 处理上一步
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  // 渲染步骤内容
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Tabs
              value={recoveryMethod}
              onChange={handleMethodChange}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="邮箱找回" value="email" />
              <Tab label="手机号找回" value="phone" />
            </Tabs>

            <TextField
              fullWidth
              label={recoveryMethod === 'email' ? '邮箱地址' : '手机号码'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              margin="normal"
              type={recoveryMethod === 'email' ? 'email' : 'tel'}
              placeholder={recoveryMethod === 'email' ? '请输入注册邮箱' : '请输入注册手机号'}
              required
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              验证码已发送至{recoveryMethod === 'email' ? '您的邮箱' : '您的手机'}，请查收并输入验证码。
            </Alert>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                label="验证码"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                margin="normal"
                required
                sx={{ mr: 1 }}
              />

              <Button
                variant="outlined"
                onClick={handleSendCode}
                disabled={loading || countdown > 0}
                sx={{ mt: 2, height: 56 }}
              >
                {countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码'}
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="新密码"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="确认新密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />
          </Box>
        );
      default:
        return '未知步骤';
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
          maxWidth: 500,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          找回密码
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 3 }} />

        {getStepContent(activeStep)}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            上一步
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              '完成'
            ) : (
              '下一步'
            )}
          </Button>
        </Box>

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

export default ForgotPassword;
