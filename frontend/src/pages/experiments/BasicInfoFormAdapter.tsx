import React from 'react';
import { SelectChangeEvent } from '@mui/material';
import BasicInfoForm from '../../components/experiments/BasicInfoForm';

/**
 * ������Ϣ�������������
 * ��������BasicInfoForm��props����ʹ��
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
  // Ϊȱʧ�ı��������ṩĬ��ֵ
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
