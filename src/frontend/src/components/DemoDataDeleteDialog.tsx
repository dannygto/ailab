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
  Step,
  Stepper,
  StepLabel,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { toast } from 'react-hot-toast';
import systemSetupService from '../services/systemSetupService';

interface DemoDataDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 模拟数据删除对话框组件
 * 包含多级确认机制和密码验证
 */
const DemoDataDeleteDialog: React.FC<DemoDataDeleteDialogProps> = ({ 
  open, 
  onClose,
  onSuccess
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [agreement, setAgreement] = useState({
    understand: false,
    cannotRecover: false,
    finalConfirm: false
  });

  // 验证步骤是否完成
  const isStepOneComplete = agreement.understand && agreement.cannotRecover;
  const isStepTwoComplete = confirmText === 'DELETE ALL DEMO DATA';
  const isStepThreeComplete = adminPassword.length >= 6 && agreement.finalConfirm;

  // 处理下一步
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // 处理上一步
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // 处理确认文本变化
  const handleConfirmTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
  };

  // 处理复选框变化
  const handleCheckboxChange = (name: keyof typeof agreement) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAgreement({ ...agreement, [name]: e.target.checked });
  };

  // 处理密码变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminPassword(e.target.value);
  };

  // 处理删除操作
  const handleDelete = async () => {
    if (!isStepThreeComplete) return;

    setLoading(true);
    try {
      await systemSetupService.deleteDemoData({ adminPassword });
      toast.success('模拟数据已成功删除');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('删除模拟数据失败:', error);
      toast.error('删除模拟数据失败，请检查密码是否正确');
    } finally {
      setLoading(false);
    }
  };

  // 处理关闭对话框
  const handleClose = () => {
    // 重置状态
    setActiveStep(0);
    setConfirmText('');
    setAdminPassword('');
    setAgreement({
      understand: false,
      cannotRecover: false,
      finalConfirm: false
    });
    onClose();
  };

  // 步骤内容
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                危险操作警告
              </Typography>
              <Typography variant="body2">
                您正在请求删除系统中的所有模拟数据。此操作不可撤销，请谨慎操作。
              </Typography>
            </Alert>
            
            <Typography variant="body1" paragraph>
              删除模拟数据将会：
            </Typography>
            <ul>
              <li>
                <Typography variant="body2">
                  永久删除所有标记为"模拟"的用户账户
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  永久删除所有标记为"模拟"的实验数据
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  永久删除所有标记为"模拟"的设备数据
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  永久删除所有标记为"模拟"的结果数据
                </Typography>
              </li>
            </ul>
            
            <Divider sx={{ my: 2 }} />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreement.understand}
                  onChange={handleCheckboxChange('understand')}
                  color="primary"
                />
              }
              label="我理解此操作将删除所有模拟数据"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreement.cannotRecover}
                  onChange={handleCheckboxChange('cannotRecover')}
                  color="primary"
                />
              }
              label="我理解删除后的数据无法恢复"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                确认删除
              </Typography>
              <Typography variant="body2">
                请输入以下文本进行确认: "DELETE ALL DEMO DATA"
              </Typography>
            </Alert>
            
            <TextField
              fullWidth
              variant="outlined"
              label="确认文本"
              value={confirmText}
              onChange={handleConfirmTextChange}
              error={confirmText !== '' && confirmText !== 'DELETE ALL DEMO DATA'}
              helperText={
                confirmText !== '' && confirmText !== 'DELETE ALL DEMO DATA'
                  ? '确认文本不匹配'
                  : ''
              }
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                最终确认
              </Typography>
              <Typography variant="body2">
                请输入管理员密码进行最终确认。此操作执行后立即生效且不可撤销。
              </Typography>
            </Alert>
            
            <TextField
              fullWidth
              variant="outlined"
              label="管理员密码"
              type="password"
              value={adminPassword}
              onChange={handlePasswordChange}
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreement.finalConfirm}
                  onChange={handleCheckboxChange('finalConfirm')}
                  color="primary"
                />
              }
              label="我确认我是管理员并授权执行此操作"
            />
          </Box>
        );
      default:
        return '未知步骤';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center' }}>
        <DeleteIcon sx={{ mr: 1 }} />
        删除所有模拟数据
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>警告确认</StepLabel>
          </Step>
          <Step>
            <StepLabel>文本确认</StepLabel>
          </Step>
          <Step>
            <StepLabel>密码验证</StepLabel>
          </Step>
        </Stepper>
        
        {getStepContent(activeStep)}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          取消
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            上一步
          </Button>
        )}
        
        {activeStep < 2 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
            disabled={
              (activeStep === 0 && !isStepOneComplete) ||
              (activeStep === 1 && !isStepTwoComplete)
            }
          >
            下一步
          </Button>
        ) : (
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={!isStepThreeComplete || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {loading ? '处理中...' : '删除所有模拟数据'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DemoDataDeleteDialog;
