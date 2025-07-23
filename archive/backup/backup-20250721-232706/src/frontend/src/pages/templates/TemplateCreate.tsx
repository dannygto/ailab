import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Autocomplete
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ExperimentType, K12Subject } from '../../types';

interface TemplateFormData {
  name: string;
  description: string;
  type: ExperimentType;
  subject: K12Subject;
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: number;
  objectives: string[];
  materials: string[];
  procedures: string[];
  tags: string[];
}

const TemplateCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    type: 'exploration' as ExperimentType, // 使用有效的实验类型
    subject: 'physics' as K12Subject,
    difficulty: 1,
    duration: 45,
    objectives: [''],
    materials: [''],
    procedures: [''],
    tags: []
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = '模板名称不能为空';
    }
    if (!formData.description.trim()) {
      newErrors.description = '模板描述不能为空';
    }
    if (formData.duration < 5 || formData.duration > 480) {
      newErrors.duration = '时长应在5-480分钟之间';
    }
    if (formData.objectives.filter(obj => obj.trim()).length === 0) {
      newErrors.objectives = '至少需要一个实验目标';
    }
    if (formData.materials.filter(mat => mat.trim()).length === 0) {
      newErrors.materials = '至少需要一种实验材料';
    }
    if (formData.procedures.filter(proc => proc.trim()).length === 0) {
      newErrors.procedures = '至少需要一个实验步骤';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        subject: formData.subject,
        difficulty: formData.difficulty,
        duration: formData.duration,
        objectives: formData.objectives.filter(obj => obj.trim()),
        materials: formData.materials.filter(mat => mat.trim()),
        procedures: formData.procedures.filter(proc => proc.trim()),
        tags: formData.tags,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 这里应该调用API创建模板
      // await api.createTemplate(templateData);
      // console.log removed
      
      toast.success('模板创建成功！');
      navigate('/templates');
    } catch (error) {
      console.error('创建模板失败:', error);
      toast.error('创建模板失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, '']
    }));
  };

  const updateMaterial = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((mat, i) => i === index ? value : mat)
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const addProcedure = () => {
    setFormData(prev => ({
      ...prev,
      procedures: [...prev.procedures, '']
    }));
  };

  const updateProcedure = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.map((proc, i) => i === index ? value : proc)
    }));
  };

  const removeProcedure = (index: number) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter((_, i) => i !== index)
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        创建实验模板
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 基础信息 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              基础信息
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="模板名称"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              error={!!errors.name}
              helperText={errors.name || '为模板起一个描述性的名称'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="模板描述"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description || '描述模板的用途和特点'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>实验类型</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ExperimentType }))}
                label="实验类型"
              >
                <MenuItem value="physics">物理实验</MenuItem>
                <MenuItem value="chemistry">化学实验</MenuItem>
                <MenuItem value="biology">生物实验</MenuItem>
                <MenuItem value="mathematics">数学实验</MenuItem>
                <MenuItem value="observation">观察实验</MenuItem>
                <MenuItem value="exploration">探究实验</MenuItem>
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
                <MenuItem value="physics">物理</MenuItem>
                <MenuItem value="chemistry">化学</MenuItem>
                <MenuItem value="biology">生物</MenuItem>
                <MenuItem value="mathematics">数学</MenuItem>
                <MenuItem value="science">科学</MenuItem>
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
                <MenuItem value={1}>初级</MenuItem>
                <MenuItem value={2}>中级</MenuItem>
                <MenuItem value={3}>高级</MenuItem>
                <MenuItem value={4}>专家级</MenuItem>
                <MenuItem value={5}>研究级</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="预计时长(分钟)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
              fullWidth
              error={!!errors.duration}
              helperText={errors.duration}
              inputProps={{ min: 5, max: 480 }}
            />
          </Grid>

          {/* 实验目标 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              实验目标
            </Typography>
            {formData.objectives.map((objective, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  label={`目标 ${index + 1}`}
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <Button
                  onClick={() => removeObjective(index)}
                  color="error"
                  disabled={formData.objectives.length === 1}
                >
                  删除
                </Button>
              </Box>
            ))}
            <Button onClick={addObjective} variant="outlined" size="small">
              添加目标
            </Button>
          </Grid>

          {/* 材料清单 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              材料清单
            </Typography>
            {formData.materials.map((material, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  label={`材料 ${index + 1}`}
                  value={material}
                  onChange={(e) => updateMaterial(index, e.target.value)}
                  fullWidth
                  sx={{ mr: 1 }}
                />
                <Button
                  onClick={() => removeMaterial(index)}
                  color="error"
                  disabled={formData.materials.length === 1}
                >
                  删除
                </Button>
              </Box>
            ))}
            <Button onClick={addMaterial} variant="outlined" size="small">
              添加材料
            </Button>
          </Grid>

          {/* 实验步骤 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              实验步骤
            </Typography>
            {formData.procedures.map((procedure, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  label={`步骤 ${index + 1}`}
                  value={procedure}
                  onChange={(e) => updateProcedure(index, e.target.value)}
                  fullWidth
                  multiline
                  sx={{ mr: 1 }}
                />
                <Button
                  onClick={() => removeProcedure(index)}
                  color="error"
                  disabled={formData.procedures.length === 1}
                >
                  删除
                </Button>
              </Box>
            ))}
            <Button onClick={addProcedure} variant="outlined" size="small">
              添加步骤
            </Button>
          </Grid>

          {/* 标签 */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={[]}
              freeSolo
              value={formData.tags}
              onChange={(event, newValue) => setFormData(prev => ({ ...prev, tags: newValue }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="标签"
                  placeholder="输入标签并按回车"
                  helperText="添加相关标签便于搜索和分类"
                />
              )}
            />
          </Grid>

          {/* 操作按钮 */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : '创建模板'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/templates')}
                disabled={loading}
              >
                取消
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TemplateCreate;

