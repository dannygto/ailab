import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  QrCodeIcon,
  PhoneAndroidIcon as SmartphoneIcon,
  SecurityIcon,
  CheckCircleIcon,
  DevicesIcon,
  HistoryIcon,
  SecurityIcon as VerifiedUserIcon
} from '../../utils/icons';
import twoFactorAuthService from '../../services/twoFactorAuthService';

const TwoFactorSetup: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [setupData, setSetupData] = useState<{ otpAuthUrl: string; secret: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [registeredDevices, setRegisteredDevices] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  // 获取两因素认证状态
  useEffect(() => {
    const fetchTwoFactorStatus = async () => {
      try {
        const response = await twoFactorAuthService.getStatus();
        if (response.success && response.data) {
          setEnabled(response.data.enabled);
        }
      } catch (error) {
        console.error('获取两因素认证状态失败', error);
      }
    };

    // 模拟获取登录设备和历史记录
    const fetchSecurityData = () => {
      // 这应该从API获取，但这里我们使用模拟数据
      setRegisteredDevices([
        { id: 1, name: 'iPhone 13 Pro', lastUsed: '2025-07-20 10:30', browser: 'Safari', os: 'iOS 15.5', trusted: true },
        { id: 2, name: '个人笔记本', lastUsed: '2025-07-19 18:45', browser: 'Chrome', os: 'Windows 11', trusted: true },
        { id: 3, name: '工作电脑', lastUsed: '2025-07-18 09:15', browser: 'Edge', os: 'Windows 10', trusted: true },
      ]);

      setLoginHistory([
        { id: 1, date: '2025-07-20 10:30', device: 'iPhone 13 Pro', location: '北京', status: 'success', ip: '192.168.1.1' },
        { id: 2, date: '2025-07-19 18:45', device: '个人笔记本', location: '上海', status: 'success', ip: '192.168.1.2' },
        { id: 3, date: '2025-07-18 09:15', device: '工作电脑', location: '广州', status: 'success', ip: '192.168.1.3' },
        { id: 4, date: '2025-07-17 20:30', device: '未知设备', location: '国外', status: 'blocked', ip: '203.0.113.1' },
      ]);
    };

    fetchTwoFactorStatus();
    fetchSecurityData();
  }, []);

  // 启用两因素认证
  const handleEnableTwoFactor = async () => {
    setSetupDialogOpen(true);
    try {
      setLoading(true);
      const response = await twoFactorAuthService.setup();
      if (response.success && response.data) {
        setSetupData(response.data);
      } else {
        setError('设置两因素认证失败');
      }
    } catch (error) {
      setError('设置两因素认证时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 禁用两因素认证
  const handleDisableTwoFactor = async () => {
    try {
      setLoading(true);
      const response = await twoFactorAuthService.disable({ code: '' });
      if (response.success) {
        setEnabled(false);
        setSuccessMessage('两因素认证已禁用');
      } else {
        setError('禁用两因素认证失败');
      }
    } catch (error) {
      setError('禁用两因素认证时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 验证并完成设置
  const handleVerifyAndEnable = async () => {
    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    try {
      setLoading(true);
      const response = await twoFactorAuthService.enable({ code: verificationCode });
      if (response.success) {
        setEnabled(true);
        setSuccessMessage('两因素认证已成功启用');
        setSetupDialogOpen(false);
        setActiveStep(0);
        setVerificationCode('');
      } else {
        setError('验证失败，请确认验证码是否正确');
      }
    } catch (error) {
      setError('启用两因素认证时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理设置对话框关闭
  const handleCloseSetupDialog = () => {
    if (!loading) {
      setSetupDialogOpen(false);
      setActiveStep(0);
      setVerificationCode('');
      setError(null);
    }
  };

  // 下一步
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // 上一步
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // 删除设备
  const handleRemoveDevice = (deviceId: number) => {
    setRegisteredDevices((prev) => prev.filter((device) => device.id !== deviceId));
  };

  // 设置步骤内容
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              安装一个身份验证器应用，例如Google Authenticator或Microsoft Authenticator。
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                  <SmartphoneIcon fontSize="large" />
                  <Typography>App Store</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                  <SmartphoneIcon fontSize="large" />
                  <Typography>Google Play</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              使用您的身份验证器应用扫描下面的二维码或手动输入密钥。
            </Typography>
            <Box sx={{ textAlign: 'center', my: 2 }}>
              {setupData?.otpAuthUrl && (
                <img
                  src={`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(
                    setupData.otpAuthUrl
                  )}`}
                  alt="两因素认证二维码"
                  style={{ width: 200, height: 200 }}
                />
              )}
            </Box>
            <Typography variant="subtitle2">手动设置密钥：</Typography>
            <Typography
              variant="body2"
              sx={{
                bgcolor: 'background.default',
                p: 1,
                borderRadius: 1,
                fontFamily: 'monospace',
                letterSpacing: 1,
              }}
            >
              {setupData?.secret}
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              在您的身份验证器应用中查看生成的验证码，并在下面输入以完成设置。
            </Typography>
            <TextField
              fullWidth
              label="验证码"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="6位数字验证码"
              margin="normal"
              inputProps={{ maxLength: 6 }}
              error={!!error}
              helperText={error}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <SecurityIcon />
              <Typography variant="h6">两因素认证</Typography>
              {enabled && <Chip size="small" color="success" label="已启用" icon={<CheckCircleIcon />} />}
            </Box>
          }
        />
        <CardContent>
          <Typography variant="body1" paragraph>
            两因素认证为您的账户添加额外的安全层。启用后，登录时除了密码外，您还需要输入验证码。
          </Typography>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Switch checked={enabled} onChange={() => enabled ? handleDisableTwoFactor() : handleEnableTwoFactor()} />}
              label={enabled ? "禁用两因素认证" : "启用两因素认证"}
            />
          </Box>

          {enabled && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                两因素认证已启用。每次登录时，您需要输入身份验证器应用中的验证码。
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}>
              <DevicesIcon />
              已登录设备
            </Box>
          </Typography>

          <List>
            {registeredDevices.map((device) => (
              <ListItem key={device.id} divider>
                <ListItemIcon>
                  <DevicesIcon />
                </ListItemIcon>
                <ListItemText
                  primary={device.name}
                  secondary={`${device.browser} on ${device.os} · 最后使用: ${device.lastUsed}`}
                />
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveDevice(device.id)}
                >
                  移除
                </Button>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            <Box display="flex" alignItems="center" gap={1}>
              <HistoryIcon />
              最近登录历史
            </Box>
          </Typography>

          <List>
            {loginHistory.map((login) => (
              <ListItem key={login.id} divider>
                <ListItemText
                  primary={`${login.device} · ${login.location}`}
                  secondary={`${login.date} · IP: ${login.ip}`}
                />
                <Chip
                  label={login.status === 'success' ? '成功' : '已阻止'}
                  color={login.status === 'success' ? 'success' : 'error'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" color="primary">
              查看完整登录历史
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 两因素认证设置对话框 */}
      <Dialog open={setupDialogOpen} onClose={handleCloseSetupDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <VerifiedUserIcon />
            设置两因素认证
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            <Step>
              <StepLabel>安装应用</StepLabel>
            </Step>
            <Step>
              <StepLabel>扫描二维码</StepLabel>
            </Step>
            <Step>
              <StepLabel>验证</StepLabel>
            </Step>
          </Stepper>

          {loading && activeStep === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            getStepContent(activeStep)
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSetupDialog} disabled={loading}>
            取消
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              上一步
            </Button>
          )}
          {activeStep < 2 ? (
            <Button onClick={handleNext} variant="contained" disabled={loading || (activeStep === 0 && !setupData)}>
              下一步
            </Button>
          ) : (
            <Button onClick={handleVerifyAndEnable} variant="contained" disabled={loading || !verificationCode}>
              {loading ? <CircularProgress size={24} /> : '完成设置'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TwoFactorSetup;
