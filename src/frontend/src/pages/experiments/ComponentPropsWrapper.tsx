/**
 * 组件属性包装器 - 修复版
 * 用于解决组件props不匹配的问题
 */
import React from 'react';
import { SelectChangeEvent } from '@mui/material';
import { ChangeEvent } from 'react';

// 导入原始组件
import OriginalExperimentMethodSelect from '../../components/experiments/ExperimentMethodSelect';
import OriginalExperimentResourceSelect from '../../components/experiments/ExperimentResourceSelect';
import OriginalAIAssistanceSelect from '../../components/experiments/AIAssistanceSelect';
import OriginalBasicInfoForm from '../../components/experiments/BasicInfoForm';
import { ExperimentType } from '../../types';

// 方法选择器组件包装器
export const ExperimentMethodSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error: string;
  experimentType: ExperimentType;
}> = ({ value, onChange, error, experimentType }) => {
  const handleChange = (Event: SelectChangeEvent) => {
    onChange(Event.target.value);
  };
  
  return (
    <OriginalExperimentMethodSelect
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error}
    />
  );
};

// 资源选择器组件包装器
export const ExperimentResourceSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error: string;
  experimentType: ExperimentType;
}> = ({ value, onChange, error, experimentType }) => {
  // 需要将值转换为数组格式，因为原组件需要string[]类型
  const handleChange = (Event: SelectChangeEvent<string[]>) => {
    // 数据类型转换
    const newValue = Array.isArray(Event.target.value) 
      ? Event.target.value[0] || ''
      : Event.target.value;
    onChange(newValue);
  };
  
  return (
    <OriginalExperimentResourceSelect
      values={value ? [value] : []}
      onChange={handleChange}
      error={!!error}
      helperText={error}
    />
  );
};

// AI辅助选择器组件包装器
export const AIAssistanceSelect: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ value, onChange }) => {
  // 将数组拆为类型和级别
  const currentType = value[0] || 'none';
  const currentLevel = value[1] ? parseInt(value[1]) : 1;
  
  const handleTypeChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = Event.target.value;
    onChange([newType, currentLevel.toString()]);
  };
  
  const handleLevelChange = (_Event: Event, newValue: number | number[]) => {
    const newLevel = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange([currentType, newLevel.toString()]);
  };
  
  return (
    <OriginalAIAssistanceSelect
      value={currentType}
      level={currentLevel}
      onTypeChange={handleTypeChange}
      onLevelChange={handleLevelChange}
    />
  );
};

// 基础信息表单包装器
export const BasicInfoForm: React.FC<{
  name: string;
  description: string;
  duration: number;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  nameError: string;
  descriptionError: string;
  durationError: string;
}> = ({ 
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
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  };
  
  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    onDescriptionChange(e.target.value);
  };
  
  const handleDurationChange = (e: SelectChangeEvent) => {
    onDurationChange(Number(e.target.value));
  };
  
  // 转换适合原组件的props
  return (
    <OriginalBasicInfoForm
      name={name}
      description={description}
      type="" // 原组件需要此属性但我们未使用
      difficulty="" // 原组件需要此属性但我们未使用
      duration={duration.toString()}
      onNameChange={handleNameChange}
      onDescriptionChange={handleDescriptionChange}
      onTypeChange={() => {}} // 原组件需要此属性但我们未使用
      onDifficultyChange={() => {}} // 原组件需要此属性但我们未使用
      onDurationChange={handleDurationChange}
      errors={{
        name: nameError,
        description: descriptionError,
        duration: durationError
      }}
    />
  );
};


export default ExperimentMethodSelect;
