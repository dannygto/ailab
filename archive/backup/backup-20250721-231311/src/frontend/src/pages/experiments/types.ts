/**
 * ͳһ��������Ͷ����ļ�
 * ���ڽ����ͬ���������Ͳ�һ������
 */


import { Box } from '@mui/material';
import { ExperimentType } from '../../types';

// �򻯰�ʵ�鷽��ѡ������ӿ�
export interface ExperimentMethodSelectAdapterProps {
  value: string;
  onChange: (value: string) => void;
  error: string;
  experimentType?: ExperimentType;
}

// �򻯰�ʵ����Դѡ������ӿ�
export interface ExperimentResourceSelectAdapterProps {
  value: string;
  onChange: (value: string) => void;
  error: string;
  experimentType?: ExperimentType;
}

// �򻯰�AI����ѡ������ӿ�
export interface AIAssistanceSelectAdapterProps {
  value: string[];
  onChange: (values: string[]) => void;
}

// �򻯰������Ϣ��������ӿ�
export interface BasicInfoFormAdapterProps {
  name: string;
  description: string;
  duration: number;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  nameError: string;
  descriptionError: string;
  durationError: string;
}
