/**
 * 统一表单组件示例
 *
 * 提供一致的表单体验，包括实时验证、状态保存和智能提示
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useToast } from '../providers/ToastProvider';

// 表单验证模式
const validationSchema = z.object({
  name: z.string().min(3, '名称至少需要3个字符').max(50, '名称不能超过50个字符'),
  description: z.string().optional(),
  type: z.string().min(1, '请选择类型'),
  tags: z.array(z.string()).min(1, '至少添加一个标签')
});

type FormValues = z.infer<typeof validationSchema>;

const EnhancedForm: React.FC = () => {
  const [tagInput, setTagInput] = useState('');
  const { showSuccess, showError } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      description: '',
      type: '',
      tags: []
    }
  });

  const tags = watch('tags');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('表单提交数据:', data);

      showSuccess('表单提交成功！');
      reset();
    } catch (error) {
      showError('表单提交失败，请重试');
      console.error('表单提交错误:', error);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        增强表单示例
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* 名称字段 - 带实时验证 */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.name}>
                <TextField
                  {...field}
                  label="名称"
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message || ''}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="名称将用于显示和搜索">
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
              </FormControl>
            )}
          />

          {/* 描述字段 */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="描述"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message || '选填，添加更多详细信息'}
              />
            )}
          />

          {/* 类型选择 */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel id="type-label">类型</InputLabel>
                <Select
                  {...field}
                  labelId="type-label"
                  label="类型"
                >
                  <MenuItem value="type1">类型一</MenuItem>
                  <MenuItem value="type2">类型二</MenuItem>
                  <MenuItem value="type3">类型三</MenuItem>
                </Select>
                {errors.type && (
                  <FormHelperText error>{errors.type.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* 标签输入 */}
          <Box>
            <FormControl fullWidth error={!!errors.tags}>
              <TextField
                label="标签"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      添加
                    </Button>
                  )
                }}
              />
              {errors.tags && (
                <FormHelperText error>{errors.tags.message}</FormHelperText>
              )}
            </FormControl>

            {/* 标签显示 */}
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* 提交按钮 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => reset()}
            >
              重置
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? '提交中...' : '提交'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default EnhancedForm;
