import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  ThumbUpIcon,
  ThumbDownIcon,
  ShareIcon,
  RefreshIcon
} from '../../utils/icons';

interface GenerateGuidanceRequest {
  experimentType: string;
  currentStage: string;
  specificQuestion?: string;
  context?: string;
}

interface GuidanceResponse {
  content: string;
  suggestions: string[];
  resources: string[];
  nextSteps: string[];
  confidence: number;
  usage?: {
    tokens: number;
    cost: number;
  };
}

const GuidanceGenerator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<GenerateGuidanceRequest>({
    experimentType: '',
    currentStage: '',
    specificQuestion: '',
    context: ''
  });
  const [response, setResponse] = useState<GuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const experimentTypes = [
    { value: 'physics', label: '物理实验' },
    { value: 'chemistry', label: '化学实验' },
    { value: 'biology', label: '生物实验' },
    { value: 'computer', label: '计算机实验' }
  ];

  const currentStages = [
    { value: 'planning', label: '实验规划' },
    { value: 'setup', label: '实验设置' },
    { value: 'execution', label: '实验执行' },
    { value: 'analysis', label: '数据分析' },
    { value: 'conclusion', label: '结论总结' }
  ];

  const handleInputChange = (field: keyof GenerateGuidanceRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleGenerateGuidance = async () => {
    setLoading(true);
    setError(null);

    try {
      // 模拟AI指导生成
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse: GuidanceResponse = {
        content: `基于您的${experimentTypes.find(t => t.value === formData.experimentType)?.label}实验，在${currentStages.find(s => s.value === formData.currentStage)?.label}阶段，我建议您：\n\n1. 确保实验环境的安全性\n2. 检查所有实验设备的工作状态\n3. 准备详细的实验记录表格\n4. 了解可能出现的异常情况及应对措施`,
        suggestions: [
          '建议使用标准化的实验流程',
          '注意记录关键数据点',
          '定期检查设备状态',
          '保持实验环境清洁'
        ],
        resources: [
          '实验安全手册',
          '设备操作指南',
          '数据记录模板',
          '问题排查清单'
        ],
        nextSteps: [
          '完成当前阶段的准备工作',
          '进入下一个实验阶段',
          '记录实验数据',
          '分析初步结果'
        ],
        confidence: 0.92,
        usage: {
          tokens: 256,
          cost: 0.05
        }
      };

      setResponse(mockResponse);
      setActiveStep(1);
    } catch (err) {
      setError('生成指导建议失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRateGuidance = (rating: 'positive' | 'negative') => {
    console.log(`用户评价: ${rating}`);
    setShowSuccess(true);
  };

  const handleShareGuidance = () => {
    console.log('分享指导建议');
  };

  const handleNewGuidance = () => {
    setActiveStep(0);
    setResponse(null);
    setFormData({
      experimentType: '',
      currentStage: '',
      specificQuestion: '',
      context: ''
    });
  };

  return (
    <React.Fragment>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Typography variant="h6">AI指导生成</Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step>
            <StepLabel>填写实验信息</StepLabel>
          </Step>
          <Step>
            <StepLabel>实验建议</StepLabel>
          </Step>
          <Step>
            <StepLabel>资源推荐</StepLabel>
          </Step>
          <Step>
            <StepLabel>确认信息</StepLabel>
          </Step>
        </Stepper>

        {activeStep === 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              请填写实验相关信息
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="experiment-type-label">实验类型</InputLabel>
                  <Select
                    labelId="experiment-type-label"
                    value={formData.experimentType}
                    onChange={handleInputChange('experimentType')}
                    label="实验类型"
                  >
                    {experimentTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="current-stage-label">当前阶段</InputLabel>
                  <Select
                    labelId="current-stage-label"
                    value={formData.currentStage}
                    onChange={handleInputChange('currentStage')}
                    label="当前阶段"
                  >
                    {currentStages.map(stage => (
                      <MenuItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="具体问题"
                  multiline
                  rows={3}
                  value={formData.specificQuestion}
                  onChange={handleInputChange('specificQuestion')}
                  placeholder="请描述您遇到的具体问题或需要帮助的方面"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="实验背景"
                  multiline
                  rows={3}
                  value={formData.context}
                  onChange={handleInputChange('context')}
                  placeholder="请提供实验的背景信息、目标等"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleGenerateGuidance}
                disabled={!formData.experimentType || !formData.currentStage || loading}
              >
                {loading ? <CircularProgress size={20} /> : '生成指导建议'}
              </Button>
            </Box>
          </Paper>
        )}

        {activeStep === 1 && response && (
          <React.Fragment>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI指导建议
              </Typography>
              
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      指导内容
                    </Typography>
                    <Chip 
                      label={`可信度: ${(response.confidence * 100).toFixed(1)}%`}
                      color="success"
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                    {response.content}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    此指导是否有帮助？
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="有帮助">
                      <IconButton 
                        color="success"
                        onClick={() => handleRateGuidance('positive')}
                      >
                        <ThumbUpIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="没有帮助">
                      <IconButton
                        color="error"
                        onClick={() => handleRateGuidance('negative')}
                      >
                        <ThumbDownIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="分享指导">
                      <IconButton onClick={handleShareGuidance}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>

              {response.usage && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    使用情况: {response.usage.tokens} tokens, 费用: ¥{response.usage.cost}
                  </Typography>
                </Paper>
              )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button onClick={() => setActiveStep(0)}>
                返回编辑
              </Button>
              
              <Button variant="contained" onClick={handleNewGuidance}>
                新建指导
              </Button>
            </Box>
          </React.Fragment>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="感谢您的反馈！"
      />
    </React.Fragment>
  );
};

export default GuidanceGenerator;
