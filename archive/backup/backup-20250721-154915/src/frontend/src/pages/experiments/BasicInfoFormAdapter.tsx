import React from 'react';
import { SelectChangeEvent } from '@mui/material';
import BasicInfoForm from '../../components/experiments/BasicInfoForm';

/**
 * 基础信息表单适配器组件
 * 适配器组件，用于简化BasicInfoForm的props使用
 */
export const BasicInfoFormAdapter: React.FC<{
  name: string;
  description: string;
  duration: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDurationChange: (e: SelectChangeEvent) => void;
  errors: {
    name?: string;
    description?: string;
    duration?: string;
  };
  helperText?: {
    name?: string;
    description?: string;
    duration?: string;
  };
}> = (props) => {
  // 为缺失的必需属性提供默认值
  return (
    <BasicInfoForm
      {...props}
      type=""
      difficulty=""
      onTypeChange={(e) => {}}
      onDifficultyChange={(e) => {}}
    />
  );
};

export default BasicInfoFormAdapter;
