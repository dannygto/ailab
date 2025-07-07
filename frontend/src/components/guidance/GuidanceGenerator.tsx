import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Snackbar,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { PsychologyIcon } from '../../utils/icons';
import { BookmarkIcon } from '../../utils/icons';
import { share } from '../../utils/icons';
import { ThumbUpIcon } from '../../utils/icons';
import { ThumbDownIcon } from '../../utils/icons';
import api from '../../services/api';
import { 
  AIGuidanceResponse,
  GenerateGuidanceRequest,
  GuidanceSuggestionType
} from '../../types/guidance';

const experimentTypes = [
  '物理实验',
  '化学实验',
  '生物实验',
  '地理实验',
  '环境科学实验',
  '工程实验',
  '综合实验'
];

const experimentStages = [
  '实验设计',
  '准备阶段',
  '数据收集',
  '实验操作',
  '数据分析',
  '结果解释',
  '实验报告',
  '总结与反思'
];

const GuidanceGenerator: React.FC = () => {
  const [request, setRequest] = useState<GenerateGuidanceRequest>({
    experimentType: '物理实验',
    currentStage: '准备阶段',
    context: '',
    learningStatus: ''
  });
  
  const [response, setResponse] = useState<AIGuidanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setResponse(null);
    setFeedback(null);
    setFeedbackGiven(false);
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    setFeedbackGiven(true);
    
    // 显示感谢信息
    setSnackbarMessage(type === 'positive' ? '感谢您的积极反馈！' : '感谢您的反馈，我们会继续改进。');
    setSnackbarOpen(true);
    
    // 这里可以添加向后端发送反馈的逻辑
  };

  const handleSaveGuidance = () => {
    if (!response) return;
    
    // 实现保存指导建议的逻辑
    setSnackbarMessage('指导建议已保存！');
    setSnackbarOpen(true);
  };

  const handleShareGuidance = () => {
    if (!response) return;
    
    // 实现分享指导建议的逻辑
    navigator.clipboard.writeText(response.guidance);
    setSnackbarMessage('指导建议内容已复制到剪贴板！');
    setSnackbarOpen(true);
  };

  const handleGenerateGuidance = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.generateAIGuidance(request);
      
      if (response.success) {
        setResponse(response.data);
        handleNextStep(); // 生成成功后前进到下一步
      } else {
        setError(response.message || '生成指导失败');
      }
    } catch (error: any) {
      setError(error.message || '生成指导时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: GuidanceSuggestionType): string => {
    switch (type) {
      case GuidanceSuggestionType.CONCEPT:
        return '概念理解';
      case GuidanceSuggestionType.PRACTICAL:
        return '实践技巧';
      case GuidanceSuggestionType.SAFETY:
        return '安全提示';
      case GuidanceSuggestionType.NEXT_STEP:
        return '下一步';
      case GuidanceSuggestionType.CORRECTION:
        return '纠正错误';
      case GuidanceSuggestionType.REINFORCEMENT:
        return '强化理解';
      default:
        return '其他';
    }
  };

  const getChipColor = (type: GuidanceSuggestionType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (type) {
      case GuidanceSuggestionType.CONCEPT:
        return 'primary';
      case GuidanceSuggestionType.PRACTICAL:
        return 'info';
      case GuidanceSuggestionType.SAFETY:
        return 'error';
      case GuidanceSuggestionType.NEXT_STEP:
        return 'success';
      case GuidanceSuggestionType.CORRECTION:
        return 'warning';
      case GuidanceSuggestionType.REINFORCEMENT:
        return 'secondary';
      default:
        return 'default';
    }
  };
  return (
    <div>
      <div sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">AI指导生成</Typography>
      </div>

      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>填写实验信息</StepLabel>
          <StepContent>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                请提供实验信息，帮助AI生成更准确的指导建议。
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="experiment-type-LabelIcon">实验类型</InputLabel>
                    <Select
                      labelId="experiment-type-LabelIcon"
                      name="experimentType"
                      value={request.experimentType}
                      onChange={(e) => setRequest(prev => ({ ...prev, experimentType: e.target.value }))}
                      label="实验类型"
                    >
                      {experimentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="current-stage-LabelIcon">当前阶段</InputLabel>
                    <Select
                      labelId="current-stage-LabelIcon"
                      name="currentStage"
                      value={request.currentStage}
                      onChange={(e) => setRequest(prev => ({ ...prev, currentStage: e.target.value }))}
                      label="当前阶段"
                    >
                      {experimentStages.map((stage) => (
                        <MenuItem key={stage} value={stage}>
                          {stage}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="实验情境描述（可选）"
                    name="context"
                    value={request.context}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    placeholder="请描述您在实验中遇到的具体情况、问题或需求..."
                    helperText="提供详细信息有助于AI生成更准确的指导"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="学习进度状态（可选）"
                    name="learningStatus"
                    value={request.learningStatus}
                    onChange={handleInputChange}
                    placeholder="例如：初次接触此实验、已完成理论学习、需要进阶指导等"
                    helperText="描述您的学习进度有助于提供适合您水平的指导"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleGenerateGuidance}
                    disabled={isLoading || !request.experimentType || !request.currentStage}
                    sx={{ mt: 1 }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        生成中...
                      </>
                    ) : (
                      '生成AI指导'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </StepContent>
        </Step>
        
        <Step>
          <StepLabel>AI指导建议</StepLabel>
          <StepContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
                <Button color="inherit" size="small" onClick={() => setActiveStep(0)}>
                  返回修改
                </Button>
              </Alert>
            )}

            {response && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      AI指导建议
                    </Typography>
                    <Chip 
                      label={getTypeLabel(response.type)} 
                      color={getChipColor(response.type)}
                      size="small"
                    />
                  </div>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {response.guidance}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Typography variant="subtitle2">此指导是否有帮助？</Typography>
                      <div sx={{ display: 'flex', mt: 1 }}>
                        <Tooltip title="有帮助">
                          <IconButton 
                            color={feedback === 'positive' ? 'primary' : 'default'} 
                            onClick={() => handleFeedback('positive')}
                            disabled={feedbackGiven}
                          >
                            <ThumbUpIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="没有帮助">
                          <IconButton 
                            color={feedback === 'negative' ? 'error' : 'default'} 
                            onClick={() => handleFeedback('negative')}
                            disabled={feedbackGiven}
                          >
                            <ThumbDownIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                    <div>
                      <Tooltip title="保存指导建议">
                        <IconButton onClick={handleSaveGuidance}>
                          <BookmarkIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="分享指导建议">
                        <IconButton onClick={handleShareGuidance}>
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  
                  {response.usage && (
                    <div sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Typography variant="caption" color="text.secondary">
                        令牌使用: {response.usage.promptTokens} (提示) + {response.usage.completionTokens} (生成) = {response.usage.totalTokens} (总计)
                      </Typography>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button onClick={() => setActiveStep(0)}>
                返回修改
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleReset}
              >
                新建指导
              </Button>
            </div>
          </StepContent>
        </Step>
      </Stepper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
};

export default GuidanceGenerator;


