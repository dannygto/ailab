/**
 * ʵ��״̬��ʼֵ����
 * ��������ʵ��ͱ�����֤�����Ĭ��ֵ
 */

import { Box } from '@mui/material';
import { ExperimentType } from '../types';

/**
 * ʵ�鴴����ʼ״̬
 */
export const INITIAL_EXPERIMENT_STATE = {
  name: '',
  description: '',
  duration: 60, // Ĭ��60����
  selectedType: '' as ExperimentType | '',
  selectedMethod: '',
  selectedResources: [] as string[],
  selectedAIAssistance: [] as string[],
};

/**
 * ������֤�����ʼ״̬
 */
export const INITIAL_VALIDATION_ERRORS = {
  nameError: '',
  descriptionError: '',
  durationError: '',
  typeError: '',
  methodError: '',
  resourcesError: '',
  aiAssistanceError: ''
};

/**
 * ��֤�������ݵ�ͨ�ú���
 * @param step ��ǰ����
 * @param data ��������
 */
export const validateStepData = (step: number, data: any) => {
  const errors = { ...INITIAL_VALIDATION_ERRORS };
  
  switch (step) {
    case 0: // ʵ������
      if (!data.selectedType) {
        errors.typeError = '��ѡ��ʵ������';
      }
      break;
      
    case 1: // ʵ�鷽��
      if (!data.selectedMethod) {
        errors.methodError = '��ѡ��ʵ�鷽��';
      }
      break;
      
    case 2: // ʵ����Դ
      if (data.selectedResources.length === 0) {
        errors.resourcesError = '������ѡ��һ��ʵ����Դ';
      }
      break;
      
    case 4: // ������Ϣ
      if (!data.name.trim()) {
        errors.nameError = 'ʵ�����Ʋ���Ϊ��';
      } else if (data.name.length > 100) {
        errors.nameError = 'ʵ�����Ʋ��ܳ���100���ַ�';
      }
      
      if (!data.description.trim()) {
        errors.descriptionError = 'ʵ����������Ϊ��';
      }
      
      if (!data.duration || data.duration <= 0) {
        errors.durationError = 'ʵ��ʱ���������0';
      } else if (data.duration > 480) {
        errors.durationError = 'ʵ��ʱ�����ܳ���480���ӣ�8Сʱ��';
      }
      break;
  }
  
  return errors;
};

/**
 * ������֤ʵ������
 * @param experiment ʵ������
 */
export const validateExperiment = (experiment: any) => {
  const errors: Record<string, string> = {};
  
  // ��֤�����ֶ�
  if (!experiment.name?.trim()) {
    errors.name = 'ʵ�����Ʋ���Ϊ��';
  }
  
  if (!experiment.description?.trim()) {
    errors.description = 'ʵ����������Ϊ��';
  }
  
  if (!experiment.type) {
    errors.type = '��ѡ��ʵ������';
  }
  
  if (!experiment.method) {
    errors.method = '��ѡ��ʵ�鷽��';
  }
  
  if (!experiment.resources || experiment.resources.length === 0) {
    errors.resources = '������ѡ��һ��ʵ����Դ';
  }
  
  // ��֤��ֵ��Χ
  if (!experiment.duration || experiment.duration <= 0) {
    errors.duration = 'ʵ��ʱ���������0';
  } else if (experiment.duration > 480) {
    errors.duration = 'ʵ��ʱ�����ܳ���480���ӣ�8Сʱ��';
  }
  
  return errors;
};

/**
 * ʵ������ѡ��
 */
export const experimentTypes = [
  { label: 'ͼ��ʶ��', value: 'image_recognition', description: 'ѵ��ģ��ʶ��ͼ���е�����򳡾�' },
  { label: '������', value: 'object_detection', description: '��ʶͼ���������λ�ú����' },
  { label: '��Ȼ���Դ���', value: 'nlp', description: '�������������������ı�' },
  { label: '����ѧϰ����', value: 'ml_basics', description: '����ѧϰ���ĸ���ͼ�ģ��' },
  { label: '���ݼ�̽��', value: 'data_exploration', description: '�����Ϳ��ӻ����ݼ�' },
  { label: 'Ԥ�⽨ģ', value: 'predictive_modeling', description: '��������Ԥ��δ��ֵ��ģ��' }
];


export default INITIAL_EXPERIMENT_STATE;
