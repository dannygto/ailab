/**
 * ���������
 * �ṩͳһ�ӿڣ������������Ͳ�ƥ������
 */
import React from 'react';
import { SelectChangeEvent, Box } from '@mui/material';

// ����ԭʼ���
import ExperimentMethodSelectOriginal from '../../components/experiments/ExperimentMethodSelect';
import ExperimentResourceSelectOriginal from '../../components/experiments/ExperimentResourceSelect';
import AIAssistanceSelectOriginal from '../../components/experiments/AIAssistanceSelect';
import BasicInfoFormOriginal from '../../components/experiments/BasicInfoForm';

// �����������ӿ�
import {
  ExperimentMethodSelectAdapterProps,
  ExperimentResourceSelectAdapterProps,
  AIAssistanceSelectAdapterProps,
  BasicInfoFormAdapterProps
} from './types';

/**
 * ʵ�鷽��ѡ�����������
 */
export const ExperimentMethodSelect: React.FC<ExperimentMethodSelectAdapterProps> = ({
  value,
  onChange,
  error,
  experimentType  // ���������ԭ����в�ʹ�ã�����ʵ�鴴��ҳ���д�����
}) => {
  const handleChange = (Event: SelectChangeEvent) => {
    onChange(Event.target.value);
  };
  
  return (
    <ExperimentMethodSelectOriginal
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error}
    />
  );
};

/**
 * ʵ����Դѡ�����������
 */
export const ExperimentResourceSelect: React.FC<ExperimentResourceSelectAdapterProps> = ({
  value,
  onChange,
  error,
  experimentType  // ���������ԭ����в�ʹ�ã�����ʵ�鴴��ҳ���д�����
}) => {
  // ��Ҫ���ַ���valueת��Ϊ���飬��Ϊԭ�������string[]
  const handleChange = (Event: SelectChangeEvent<string[]>) => {
    // ȡ��һ��ֵ����ַ���
    const newValue = Event.target.value instanceof Array 
      ? Event.target.value[0] || ''
      : Event.target.value;
    onChange(newValue);
  };
  
  return (
    <ExperimentResourceSelectOriginal
      values={value ? [value] : []}
      onChange={handleChange}
      error={!!error}
      helperText={error}
    />
  );
};

/**
 * AI����ѡ�����������
 */
export const AIAssistanceSelect: React.FC<AIAssistanceSelectAdapterProps> = ({
  value,
  onChange
}) => {
  // ��������Ϊ���ͺͼ���
  const assistanceType = value[0] || 'none';
  const assistanceLevel = parseInt(value[1] || '1');
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([e.target.value, value[1] || '1']);
  };
  
  const handleLevelChange = (Event: Event, newValue: number | number[]) => {
    const level = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange([value[0] || '', level.toString()]);
  };
  
  return (
    <AIAssistanceSelectOriginal
      value={assistanceType}
      level={assistanceLevel}
      onTypeChange={handleTypeChange}
      onLevelChange={handleLevelChange}
    />
  );
};

/**
 * ������Ϣ�������������
 */
export const BasicInfoForm: React.FC<BasicInfoFormAdapterProps> = ({
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
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDescriptionChange(e.target.value);
  };
  
  const handleDurationChange = (e: SelectChangeEvent) => {
    onDurationChange(Number(e.target.value));
  };
  
  return (
    <BasicInfoFormOriginal
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


export default ExperimentMethodSelect;
