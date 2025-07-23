import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import QRCode from 'react-qr-code';
import { toast } from 'react-hot-toast';
import twoFactorAuthService from '../../services/twoFactorAuthService';

// 双因素认证设置组件
const TwoFactorAuth: React.FC<{
  enabled?: boolean;
  onEnableComplete?: () => void;
  onDisableComplete?: () => void;
}> = ({ enabled: initialEnabled = false, onEnableComplete, onDisableComplete }) => {
  // 状态
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  // 获取当前两因素认证状态
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await twoFactorAuthService.getStatus();
        if (response.success) {
          setEnabled(response.data.enabled);
        }
      } catch (err) {
        console.error('获取两因素认证状态失败', err);
      }
    };

    fetchStatus();
  }, []);

  // 启用步骤
  const steps = ['生成密钥', '扫描二维码', '验证并启用'];

  // 处理下一步
  const handleNext = async () => {
    if (activeStep === 0) {
      // 生成密钥
      try {
        setLoading(true);
        setError(null);

        const response = await twoFactorAuthService.setup();
        if (response.success) {
          setSecret(response.data.secret);
          setQrCodeUrl(response.data.otpAuthUrl);
          setActiveStep(1);
        } else {
          setError(response.message || '生成密钥失败，请重试');
        }
      } catch (err: any) {
        setError(err.message || '生成密钥失败，请重试');
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 1) {
      // 进入验证步骤
      setActiveStep(2);
    } else if (activeStep === 2) {
      // 验证并启用
      try {
        setLoading(true);
        setError(null);

        if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
          setError('请输入6位数字验证码');
          setLoading(false);
          return;
        }

        const response = await twoFactorAuthService.enable({ code: verificationCode });

        if (response.success) {
          toast.success('双因素认证已成功启用');
          setEnabled(true);
          if (onEnableComplete) {
            onEnableComplete();
          }
        } else {
          setError(response.message || '验证失败，请确认验证码是否正确');
        }
      } catch (err: any) {
        setError(err.message || '启用双因素认证失败，请重试');
      } finally {
        setLoading(false);
      }
    }
  };

  // 处理上一步
  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };

  // 打开禁用对话框
  const handleOpenDisableDialog = () => {
    setDisableDialogOpen(true);
    setDisableCode('');
    setDisableError(null);
  };

  // 关闭禁用对话框
  const handleCloseDisableDialog = () => {
    setDisableDialogOpen(false);
  };

  // 禁用双因素认证
  const handleDisableTwoFactor = async () => {
    try {
      setDisableLoading(true);
      setDisableError(null);

      if (disableCode.length !== 6 || !/^\d+$/.test(disableCode)) {
        setDisableError('请输入6位数字验证码');
        setDisableLoading(false);
        return;
      }

      const response = await twoFactorAuthService.disable({ code: disableCode });

      if (response.success) {
        toast.success('双因素认证已禁用');
        setEnabled(false);
        handleCloseDisableDialog();
        if (onDisableComplete) {
          onDisableComplete();
        }
      } else {
        setDisableError(response.message || '验证失败，请确认验证码是否正确');
      }
    } catch (err: any) {
      setDisableError(err.message || '禁用双因素认证失败，请重试');
    } finally {
      setDisableLoading(false);
    }
  };

  // 渲染步骤内容
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography>
              双因素认证可以为您的账户提供额外的安全保障。启用后，除了密码外，您还需要提供验证码才能登录。
            </Typography>
            <Typography sx={{ mt: 2 }}>
              点击"下一步"开始设置双因素认证。
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography gutterBottom>
              使用身份验证器应用程序扫描以下二维码：
            </Typography>
            <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: 'white' }}>
              <QRCode value={qrCodeUrl} size={200} />
            </Paper>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              如果无法扫描二维码，请手动输入以下密钥：
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 1,
                bgcolor: 'grey.100',
                width: '100%',
                textAlign: 'center',
                fontFamily: 'monospace',
                letterSpacing: 1
              }}
            >
              {secret}
            </Paper>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              请打开身份验证器应用，输入显示的6位验证码以完成设置：
            </Typography>
            <TextField
              fullWidth
              label="验证码"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              margin="normal"
              placeholder="6位数字验证码"
              inputProps={{ maxLength: 6 }}
            />
          </Box>
        );
      default:
        return '未知步骤';
    }
  };

  return (
    <Box>
      {enabled ? (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            双因素认证已启用，您的账户受到额外保护。
          </Alert>

          <Typography variant="body1" paragraph>
            每次登录时，您需要提供密码和身份验证器应用程序生成的验证码。
          </Typography>

          <Button
            variant="outlined"
            color="error"
            onClick={handleOpenDisableDialog}
          >
            禁用双因素认证
          </Button>

          {/* 禁用双因素认证对话框 */}
          <Dialog open={disableDialogOpen} onClose={handleCloseDisableDialog}>
            <DialogTitle>禁用双因素认证</DialogTitle>
            <DialogContent>
              <Typography gutterBottom sx={{ mb: 2 }}>
                禁用双因素认证将降低您账户的安全性。为确认是您本人操作，请输入当前的验证码：
              </Typography>
              <TextField
                fullWidth
                label="验证码"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="6位数字验证码"
                inputProps={{ maxLength: 6 }}
              />
              {disableError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {disableError}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDisableDialog}>取消</Button>
              <Button
                onClick={handleDisableTwoFactor}
                color="error"
                disabled={disableLoading}
              >
                {disableLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  '确认禁用'
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : (
        <Box>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 3 }}>
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
                variant="outlined"
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
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TwoFactorAuth;
