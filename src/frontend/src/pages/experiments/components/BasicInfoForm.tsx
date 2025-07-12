import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import { HelpIcon as HelpIconIcon } from '../../../utils/icons';
import { DURATION_LIMITS, NAME_LIMITS } from '../../../constants/experimentConfig';

interface BasicInfoFormProps {
  name: string;
  description: string;
  duration: number;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  nameError?: string;
  descriptionError?: string;
  durationError?: string;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  name,
  description,
  duration,
  onNameChange,
  onDescriptionChange,
  onDurationChange,
  nameError,
  descriptionError,
  durationError
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        实验基础信息
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="实验名称"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            fullWidth
            error={!!nameError}
            helperText={nameError || '请输入实验的一个描述性的名称'}            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="实验名称应清楚描述实验内容和目标">
                    <IconButton edge="end" size="small">
                      <HelpIconIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              inputProps: { 
                maxLength: NAME_LIMITS.MAX 
              }
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="实验描述"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            fullWidth
            multiline
            rows={4}
            error={!!descriptionError}
            helperText={descriptionError || '描述实验的目标、方法和预期结果'}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="预计时长(分钟)"
            type="number"
            value={duration || ''}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            fullWidth
            error={!!durationError}
            helperText={durationError}
            InputProps={{
              inputProps: { min: DURATION_LIMITS.MIN, max: DURATION_LIMITS.MAX },
              endAdornment: <InputAdornment position="end">分钟</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BasicInfoForm;

