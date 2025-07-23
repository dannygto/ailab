import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Link
} from '@mui/material';
import twoFactorAuthService from '../../services/twoFactorAuthService';

interface TwoFactorVerifyDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: (token: string) => void;
  username?: string;
}

type VerificationMethod = 'app' | 'sms' | 'email';

const TwoFactorVerifyDialog: React.FC<TwoFactorVerifyDialogProps> = ({
  open,
  onClose,
  onVerified,
  username
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<VerificationMethod>('app');
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await twoFactorAuthService.verify({
        code: verificationCode,
        method: method
      });

      if (response.success && response.data?.token) {
        onVerified(response.data.token);
      } else {
        setError(response.message || '验证失败，请确认验证码是否正确');
      }
    } catch (err: any) {
      setError(err.message || '验证失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVerificationCode('');
    setError(null);
    onClose();
  };

  // 发送验证码到邮箱或手机
  const handleSendCode = async (sendMethod: 'sms' | 'email') => {
    if (!username) {
      setError('无法获取用户信息');
      return;
    }

    try {
      setSendingCode(true);
      setError(null);

      // 调用发送验证码的API
      const response = await twoFactorAuthService.sendCode({
        username,
        method: sendMethod
      });

      if (response.success) {
        // 设置倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.message || `发送${sendMethod === 'sms' ? '短信' : '邮箱'}验证码失败`);
      }
    } catch (err: any) {
      setError(err.message || '发送验证码失败，请稍后重试');
    } finally {
      setSendingCode(false);
    }
  };

  // 切换验证方式
  const handleMethodChange = (_event: React.SyntheticEvent, newMethod: VerificationMethod) => {
    setMethod(newMethod);
    setVerificationCode('');
    setError(null);
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="xs">
      <DialogTitle>两因素认证</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={method}
            onChange={handleMethodChange}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="认证器应用" value="app" />
            <Tab label="短信验证" value="sms" />
            <Tab label="邮箱验证" value="email" />
          </Tabs>

          {method === 'app' && (
            <Typography variant="body1" gutterBottom>
              请输入您的认证器应用中显示的6位验证码
            </Typography>
          )}

          {method === 'sms' && (
            <Typography variant="body1" gutterBottom>
              请输入发送到您手机的6位验证码
            </Typography>
          )}

          {method === 'email' && (
            <Typography variant="body1" gutterBottom>
              请输入发送到您邮箱的6位验证码
            </Typography>
          )}
        </Box>

        <TextField
          autoFocus
          fullWidth
          label="验证码"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          variant="outlined"
          placeholder="6位数字验证码"
          margin="dense"
          inputProps={{ maxLength: 6 }}
        />

        {(method === 'sms' || method === 'email') && (
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="text"
              color="primary"
              onClick={() => handleSendCode(method)}
              disabled={countdown > 0 || sendingCode}
            >
              {sendingCode
                ? '发送中...'
                : countdown > 0
                ? `${countdown}秒后重试`
                : `发送${method === 'sms' ? '短信' : '邮箱'}验证码`}
            </Button>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            如果您无法接收验证码或遇到问题，请
            <Link href="/help-center" target="_blank" underline="hover">
              访问帮助中心
            </Link>
            或联系管理员
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>取消</Button>
        <Button
          onClick={handleVerify}
          variant="contained"
          color="primary"
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? <CircularProgress size={24} /> : '验证'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TwoFactorVerifyDialog;
