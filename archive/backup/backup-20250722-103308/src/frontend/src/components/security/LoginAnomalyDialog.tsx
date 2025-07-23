import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { LocationOnOutlined, DevicesOutlined, AccessTimeOutlined, InfoOutlined } from '@mui/icons-material';

interface AnomalyDetails {
  currentLocation?: string;
  usualLocation?: string;
  currentDevice?: string;
  currentTime?: string;
  additionalInfo?: string;
}

interface LoginAnomalyDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (verificationCode: string) => Promise<boolean>;
  anomalyType: 'location' | 'device' | 'time' | 'other';
  anomalyDetails?: AnomalyDetails;
}

const LoginAnomalyDialog: React.FC<LoginAnomalyDialogProps> = ({
  open,
  onClose,
  onConfirm,
  anomalyType,
  anomalyDetails
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 异常类型对应的图标和标题
  const anomalyTypeInfo = {
    location: {
      icon: <LocationOnOutlined fontSize="large" color="warning" />,
      title: '检测到异地登录',
      description: '您当前的登录位置与常用位置不同，为保障账号安全，请进行验证。'
    },
    device: {
      icon: <DevicesOutlined fontSize="large" color="warning" />,
      title: '检测到新设备登录',
      description: '您当前使用的设备与常用设备不同，为保障账号安全，请进行验证。'
    },
    time: {
      icon: <AccessTimeOutlined fontSize="large" color="warning" />,
      title: '检测到非常规时间登录',
      description: '您当前的登录时间与常规使用时间不同，为保障账号安全，请进行验证。'
    },
    other: {
      icon: <InfoOutlined fontSize="large" color="warning" />,
      title: '检测到异常登录',
      description: '为保障您的账号安全，请进行额外验证。'
    }
  };

  // 处理验证码输入变化
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
    if (error) setError(null);
  };

  // 处理确认验证
  const handleConfirm = async () => {
    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    try {
      const success = await onConfirm(verificationCode);
      if (!success) {
        setError('验证码错误，请重新输入');
      }
    } catch (err) {
      setError('验证失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {anomalyTypeInfo[anomalyType].icon}
          <Typography variant="h6">{anomalyTypeInfo[anomalyType].title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          {anomalyTypeInfo[anomalyType].description}
        </Typography>

        {/* 异常详情 */}
        {anomalyDetails && (
          <Box sx={{ mb: 3, mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Grid container spacing={2}>
              {anomalyDetails.currentLocation && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">当前位置</Typography>
                    <Typography variant="body1">{anomalyDetails.currentLocation}</Typography>
                  </Grid>
                  {anomalyDetails.usualLocation && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">常用位置</Typography>
                      <Typography variant="body1">{anomalyDetails.usualLocation}</Typography>
                    </Grid>
                  )}
                </>
              )}

              {anomalyDetails.currentDevice && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">当前设备</Typography>
                  <Typography variant="body1">{anomalyDetails.currentDevice}</Typography>
                </Grid>
              )}

              {anomalyDetails.currentTime && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">登录时间</Typography>
                  <Typography variant="body1">{anomalyDetails.currentTime}</Typography>
                </Grid>
              )}

              {anomalyDetails.additionalInfo && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">其他信息</Typography>
                  <Typography variant="body1">{anomalyDetails.additionalInfo}</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <Typography variant="body1" sx={{ mb: 2 }}>
          我们已向您的手机/邮箱发送了验证码，请输入验证码完成验证。
        </Typography>

        <TextField
          fullWidth
          label="验证码"
          value={verificationCode}
          onChange={handleVerificationCodeChange}
          autoFocus
          variant="outlined"
          inputProps={{ maxLength: 6 }}
          placeholder="请输入6位验证码"
          disabled={loading}
          error={!!error}
          helperText={error}
        />

        <Box mt={2}>
          <Alert severity="info" sx={{ mb: 1 }}>
            如果您确认是本人操作，请输入验证码继续登录。如果不是您本人操作，请立即修改密码并联系管理员。
          </Alert>
          <Typography variant="body2" color="text.secondary">
            为了您的账户安全，建议定期修改密码并启用两因素认证。
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="text"
              color="primary"
              size="small"
              onClick={() => window.location.href = '/help-center'}
            >
              安全中心
            </Button>
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={() => window.location.href = '/reset-password'}
            >
              立即修改密码
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          disabled={loading || !verificationCode}
        >
          {loading ? <CircularProgress size={24} /> : '确认验证'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginAnomalyDialog;
