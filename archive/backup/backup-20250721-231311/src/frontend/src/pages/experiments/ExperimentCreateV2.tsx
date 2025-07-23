import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// 假设的组件
const BasicInfoForm = ({ data, onChange }: any) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">基本信息表单</Typography>
    <Typography variant="body2" color="text.secondary">
      配置实验的基本信息
    </Typography>
  </Box>
);

const ConfigurationForm = ({ data, onChange }: any) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">实验配置</Typography>
    <Typography variant="body2" color="text.secondary">
      设置实验参数和配置
    </Typography>
  </Box>
);

const ResourceForm = ({ data, onChange }: any) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">资源推荐</Typography>
    <Typography variant="body2" color="text.secondary">
      选择和配置实验资源
    </Typography>
  </Box>
);

const ConfirmationForm = ({ data }: any) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">确认信息</Typography>
    <Typography variant="body2" color="text.secondary">
      确认实验配置并创建
    </Typography>
  </Box>
);

const ExperimentCreateV2: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const steps = ['基本信息', '实验配置', '资源推荐', '确认信息'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 实际的提交逻辑
      // console.log removed
      navigate('/experiments');
    } catch (err) {
      setError('创建实验失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BasicInfoForm data={formData} onChange={handleFormChange} />;
      case 1:
        return <ConfigurationForm data={formData} onChange={handleFormChange} />;
      case 2:
        return <ResourceForm data={formData} onChange={handleFormChange} />;
      case 3:
        return <ConfirmationForm data={formData} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          创建新实验
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {renderStepContent(activeStep)}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
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
            {activeStep === steps.length - 1 ? '创建实验' : '下一步'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ExperimentCreateV2;

