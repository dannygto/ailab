/**
 * ������԰�װ�� - �޸���
 * ���ڽ�����props�����ݵ�����
 */
import React from 'react';
import { SelectChangeEvent } from '@mui/material';
import { ChangeEvent } from 'react';

// ����ԭʼ���
import OriginalExperimentMethodSelect from '../../components/experiments/ExperimentMethodSelect';
import OriginalExperimentResourceSelect from '../../components/experiments/ExperimentResourceSelect';
import OriginalAIAssistanceSelect from '../../components/experiments/AIAssistanceSelect';
import OriginalBasicInfoForm from '../../components/experiments/BasicInfoForm';
import { ExperimentType } from '../../types';

// ����ѡ�������װ��
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

// ��Դѡ�������װ��
export const ExperimentResourceSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error: string;
  experimentType: ExperimentType;
}> = ({ value, onChange, error, experimentType }) => {
  // ��Ҫ��ֵת��Ϊ�����ʽ����Ϊԭ�����Ҫstring[]����
  const handleChange = (Event: SelectChangeEvent<string[]>) => {
    // ��������ת��
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

// AI����ѡ�������װ��
export const AIAssistanceSelect: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ value, onChange }) => {
  // ��������Ϊ���ͺͼ���
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

// ������Ϣ������װ��
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
  
  // �����ʺ�ԭ�����props
  return (
    <OriginalBasicInfoForm
      name={name}
      description={description}
      type="" // ԭ�����Ҫ������������δʹ��
      difficulty="" // ԭ�����Ҫ������������δʹ��
      duration={duration.toString()}
      onNameChange={handleNameChange}
      onDescriptionChange={handleDescriptionChange}
      onTypeChange={() => {}} // ԭ�����Ҫ������������δʹ��
      onDifficultyChange={() => {}} // ԭ�����Ҫ������������δʹ��
      onDurationChange={handleDurationChange}
      errors={{
        name: nameError,
        description: descriptionError,
        duration: durationError
      }}
    />
  );
};
