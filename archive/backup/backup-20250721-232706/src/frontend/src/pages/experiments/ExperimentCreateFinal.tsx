import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Container,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BasicInfoForm from './components/BasicInfoForm';
import { ExperimentType, K12Subject, Experiment } from '../../types';
import api from '../../services/api';

interface ExperimentFormData {
  name: string;
  description: string;
  duration: number;
  type: ExperimentType;
  subject: K12Subject;
  difficulty: 1 | 2 | 3 | 4 | 5;
  objectives: string[];
  materials: string[];
  procedures: string[];
}

const steps = [
  {
    label: '基础信息',
    description: '填写实验的基本信息',
  },
  {
    label: '实验配置',
    description: '配置实验类型和难度',
  },
  {
    label: '实验内容',
    description: '添加实验目标、材料和步骤',
  },
  {
    label: '确认创建',
    description: '确认信息并创建实验',
  },
];

const ExperimentCreateFinal: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExperimentFormData>({
    name: '',
    description: '',
    duration: 30,
    type: 'exploration' as ExperimentType, // 使用有效的实验类型
    subject: 'physics' as K12Subject,
    difficulty: 1,
    objectives: [''],
    materials: [''],
    procedures: ['']
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 辅助函数：获取实验类型标签
  const getExperimentTypeLabel = (type: ExperimentType): string => {
    const typeLabels: Record<ExperimentType, string> = {
      'observation': '观察实验',
      'measurement': '测量实验',
      'comparison': '对比实验',
      'exploration': '探究实验',
      'design': '设计实验',
      'analysis': '分析实验',
      'synthesis': '综合实验',
      'physics': '物理实验',
      'custom': '自定义实验'
    };
    return typeLabels[type] || type;
  };

  // 辅助函数：获取学科标签
  const getSubjectLabel = (subject: K12Subject): string => {
    const subjectLabels: Record<K12Subject, string> = {
      'science': '科学',
      'physics': '物理',
      'chemistry': '化学',
      'biology': '生物',
      'mathematics': '数学',
      'chinese': '语文',
      'english': '英语',
      'geography': '地理',
      'labor': '劳动教育',
      'technology': '信息科技',
      'general_tech': '通用技术'
    };
    return subjectLabels[subject] || subject;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 0: // 基础信息
        if (!formData.name.trim()) {
          newErrors.name = '实验名称不能为空';
        }
        if (!formData.description.trim()) {
          newErrors.description = '实验描述不能为空';
        }
        if (formData.duration < 5 || formData.duration > 480) {
          newErrors.duration = '实验时长应在5-480分钟之间';
        }
        break;
      
      case 1: // 实验配置
        // 类型和学科验证
        if (!formData.type) {
          newErrors.type = '请选择实验类型';
        }
        if (!formData.subject) {
          newErrors.subject = '请选择学科';
        }
        break;
        
      case 2: // 实验内容
        if (formData.objectives.filter(obj => obj.trim()).length === 0) {
          newErrors.objectives = '至少需要一个实验目标';
        }
        if (formData.materials.filter(mat => mat.trim()).length === 0) {
          newErrors.materials = '至少需要一种实验材料';
        }
        if (formData.procedures.filter(proc => proc.trim()).length === 0) {
          newErrors.procedures = '至少需要一个实验步骤';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      const experimentData: Partial<Experiment> = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        subject: formData.subject,
        duration: formData.duration,
        difficulty: formData.difficulty,
        objectives: formData.objectives.filter(obj => obj.trim()),
        materials: formData.materials.filter(mat => mat.trim()),
        procedures: formData.procedures.filter(proc => proc.trim()),
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await api.createExperiment(experimentData);
      toast.success('实验创建成功！');
      navigate('/experiments');
    } catch (error) {
      console.error('创建实验失败:', error);
      toast.error('创建实验失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoForm
            name={formData.name}
            description={formData.description}
            duration={formData.duration}
            onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
            onDescriptionChange={(description) => setFormData(prev => ({ ...prev, description }))}
            onDurationChange={(duration) => setFormData(prev => ({ ...prev, duration }))}
            nameError={errors.name}
            descriptionError={errors.description}
            durationError={errors.duration}
          />
        );
      
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              实验配置
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>实验类型</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ExperimentType }))}
                    label="实验类型"
                  >
                    <MenuItem value="observation">观察实验</MenuItem>
                    <MenuItem value="measurement">测量实验</MenuItem>
                    <MenuItem value="comparison">对比实验</MenuItem>
                    <MenuItem value="exploration">探究实验</MenuItem>
                    <MenuItem value="design">设计实验</MenuItem>
                    <MenuItem value="analysis">分析实验</MenuItem>
                    <MenuItem value="synthesis">综合实验</MenuItem>
                    <MenuItem value="custom">自定义实验</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>学科</InputLabel>
                  <Select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value as K12Subject }))}
                    label="学科"
                  >
                    <MenuItem value="science">科学</MenuItem>
                    <MenuItem value="physics">物理</MenuItem>
                    <MenuItem value="chemistry">化学</MenuItem>
                    <MenuItem value="biology">生物</MenuItem>
                    <MenuItem value="mathematics">数学</MenuItem>
                    <MenuItem value="geography">地理</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>难度等级</InputLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    label="难度等级"
                  >
                    <MenuItem value={1}>1级 - 基础入门</MenuItem>
                    <MenuItem value={2}>2级 - 初级应用</MenuItem>
                    <MenuItem value={3}>3级 - 中级探索</MenuItem>
                    <MenuItem value={4}>4级 - 高级综合</MenuItem>
                    <MenuItem value={5}>5级 - 专家研究</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="预计参与人数"
                  type="number"
                  fullWidth
                  InputProps={{
                    inputProps: { min: 1, max: 50 }
                  }}
                  helperText="建议的实验参与人数"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom>
                    实验特性
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="需要监督" variant="outlined" />
                    <Chip label="小组合作" variant="outlined" />
                    <Chip label="个人独立" variant="outlined" />
                    <Chip label="在线实验" variant="outlined" />
                    <Chip label="线下实验" variant="outlined" />
                  </Box>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              实验内容
            </Typography>
            
            {/* 实验目标 */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                实验目标
              </Typography>
              {formData.objectives.map((objective, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                  <TextField
                    label={`目标 ${index + 1}`}
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...formData.objectives];
                      newObjectives[index] = e.target.value;
                      setFormData(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                    fullWidth
                    sx={{ mr: 1 }}
                    placeholder="输入实验目标..."
                  />
                  <IconButton
                    onClick={() => {
                      const newObjectives = formData.objectives.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                    disabled={formData.objectives.length === 1}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData(prev => ({ ...prev, objectives: [...prev.objectives, ''] }));
                }}
                variant="outlined"
                size="small"
              >
                添加目标
              </Button>
            </Paper>

            {/* 实验材料 */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                实验材料
              </Typography>
              {formData.materials.map((material, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                  <TextField
                    label={`材料 ${index + 1}`}
                    value={material}
                    onChange={(e) => {
                      const newMaterials = [...formData.materials];
                      newMaterials[index] = e.target.value;
                      setFormData(prev => ({ ...prev, materials: newMaterials }));
                    }}
                    fullWidth
                    sx={{ mr: 1 }}
                    placeholder="输入实验材料..."
                  />
                  <IconButton
                    onClick={() => {
                      const newMaterials = formData.materials.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, materials: newMaterials }));
                    }}
                    disabled={formData.materials.length === 1}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData(prev => ({ ...prev, materials: [...prev.materials, ''] }));
                }}
                variant="outlined"
                size="small"
              >
                添加材料
              </Button>
            </Paper>

            {/* 实验步骤 */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                实验步骤
              </Typography>
              {formData.procedures.map((procedure, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'flex-start' }}>
                  <TextField
                    label={`步骤 ${index + 1}`}
                    value={procedure}
                    onChange={(e) => {
                      const newProcedures = [...formData.procedures];
                      newProcedures[index] = e.target.value;
                      setFormData(prev => ({ ...prev, procedures: newProcedures }));
                    }}
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mr: 1 }}
                    placeholder="详细描述实验步骤..."
                  />
                  <IconButton
                    onClick={() => {
                      const newProcedures = formData.procedures.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, procedures: newProcedures }));
                    }}
                    disabled={formData.procedures.length === 1}
                    color="error"
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData(prev => ({ ...prev, procedures: [...prev.procedures, ''] }));
                }}
                variant="outlined"
                size="small"
              >
                添加步骤
              </Button>
            </Paper>

            {/* 安全注意事项 */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                安全注意事项
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="请输入实验的安全注意事项..."
                helperText="描述实验过程中需要注意的安全事项"
              />
            </Paper>
          </Box>
        );
        
        case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              确认创建实验
            </Typography>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                实验基本信息
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>实验名称：</strong>{formData.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>预计时长：</strong>{formData.duration} 分钟</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>实验类型：</strong>{getExperimentTypeLabel(formData.type)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>学科：</strong>{getSubjectLabel(formData.subject)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>难度等级：</strong>{formData.difficulty} 级</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>实验描述：</strong></Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {formData.description}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                实验目标
              </Typography>
              <Box component="ol" sx={{ pl: 2 }}>
                {formData.objectives.filter(obj => obj.trim()).map((objective, index) => (
                  <Typography component="li" key={index} sx={{ mb: 0.5 }}>
                    {objective}
                  </Typography>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                实验材料
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {formData.materials.filter(mat => mat.trim()).map((material, index) => (
                  <Typography component="li" key={index} sx={{ mb: 0.5 }}>
                    {material}
                  </Typography>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main' }}>
                实验步骤
              </Typography>
              <Box component="ol" sx={{ pl: 2 }}>
                {formData.procedures.filter(proc => proc.trim()).map((procedure, index) => (
                  <Typography component="li" key={index} sx={{ mb: 1 }}>
                    {procedure}
                  </Typography>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="body2">
                📝 <strong>提示：</strong>实验创建后，您可以在实验列表中找到并开始执行实验。
                实验数据将自动记录，您也可以随时修改实验配置。
              </Typography>
            </Paper>
          </Box>
        );
        
      default:
        return <Typography>未知步骤</Typography>;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        创建新实验
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                
                {renderStepContent(index)}
                
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      index === steps.length - 1 ? '创建实验' : '下一步'
                    )}
                  </Button>
                  <Button
                    disabled={index === 0 || loading}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    上一步
                  </Button>
                  <Button
                    onClick={() => navigate('/experiments')}
                    sx={{ mt: 1 }}
                    disabled={loading}
                  >
                    取消
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default ExperimentCreateFinal;
