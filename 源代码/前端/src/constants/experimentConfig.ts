/**
 * ʵ��������ó���
 * 
 * ���ļ�������ʵ����ص����ó�������ѡ���б������趨��ȣ�
 * ���й����Ա���ά���͸��á�
 */

import { Box } from '@mui/material';
import { ExperimentType } from '../types';

/**
 * ʵ�鴴������
 */
export const EXPERIMENT_CREATION_STEPS = [
  'ѡ��ʵ������', 
  'ѡ��ʵ�鷽��', 
  'ѡ��ʵ����Դ', 
  '����AI����', 
  '������Ϣ'
];

/**
 * ʵ��ʱ������ (����)
 */
export const DURATION_LIMITS = {
  MIN: 1,
  MAX: 480, // 8Сʱ
  DEFAULT: 60
};

/**
 * ʵ�������ַ�����
 */
export const NAME_LIMITS = {
  MIN: 1,
  MAX: 100
};

/**
 * ������֤������Ϣ
 */
export const ERROR_MESSAGES = {
  EXPERIMENT_TYPE_REQUIRED: '��ѡ��ʵ������',
  EXPERIMENT_METHOD_REQUIRED: '��ѡ��ʵ�鷽��',
  RESOURCES_REQUIRED: '������ѡ��һ��ʵ����Դ',
  NAME_REQUIRED: 'ʵ�����Ʋ���Ϊ��',
  NAME_TOO_LONG: `ʵ�����Ʋ��ܳ���${NAME_LIMITS.MAX}���ַ�`,
  DESCRIPTION_REQUIRED: 'ʵ����������Ϊ��',
  DURATION_REQUIRED: 'ʵ��ʱ���������0',
  DURATION_TOO_LONG: `ʵ��ʱ�����ܳ���${DURATION_LIMITS.MAX}���ӣ�8Сʱ��`
};

/**
 * ʵ���ʼ״̬
 */
export const INITIAL_EXPERIMENT_STATE = {
  name: '',
  description: '',
  duration: DURATION_LIMITS.DEFAULT,
  selectedType: '' as ExperimentType | '',
  selectedMethod: '',
  selectedResources: [] as string[],
  selectedAIAssistance: [] as string[]
};

export interface ValidationErrors {
  nameError: string;
  descriptionError: string;
  durationError: string;
  typeError: string;
  methodError: string;
  resourcesError: string;
}

export const INITIAL_VALIDATION_ERRORS: ValidationErrors = {
  nameError: '',
  descriptionError: '',
  durationError: '',
  typeError: '',
  methodError: '',
  resourcesError: ''
};

/**
 * ���ݲ��������ֵ��֤��������
 */
export const validateStepData = (
  step: number, 
  data: Partial<typeof INITIAL_EXPERIMENT_STATE>
): Partial<ValidationErrors> => {
  const errors: Partial<ValidationErrors> = {};
  
  switch (step) {
    case 0: // ʵ������
      if (!data.selectedType) {
        errors.typeError = ERROR_MESSAGES.EXPERIMENT_TYPE_REQUIRED;
      }
      break;
      
    case 1: // ʵ�鷽��
      if (!data.selectedMethod) {
        errors.methodError = ERROR_MESSAGES.EXPERIMENT_METHOD_REQUIRED;
      }
      break;
      
    case 2: // ʵ����Դ
      if (!data.selectedResources?.length) {
        errors.resourcesError = ERROR_MESSAGES.RESOURCES_REQUIRED;
      }
      break;
      
    case 4: // ������Ϣ
      // ��֤����
      if (!data.name?.trim()) {
        errors.nameError = ERROR_MESSAGES.NAME_REQUIRED;
      } else if (data.name.length > NAME_LIMITS.MAX) {
        errors.nameError = ERROR_MESSAGES.NAME_TOO_LONG;
      }
      
      // ��֤����
      if (!data.description?.trim()) {
        errors.descriptionError = ERROR_MESSAGES.DESCRIPTION_REQUIRED;
      }
      
      // ��֤ʱ��
      if (!data.duration || data.duration <= 0) {
        errors.durationError = ERROR_MESSAGES.DURATION_REQUIRED;
      } else if (data.duration > DURATION_LIMITS.MAX) {
        errors.durationError = ERROR_MESSAGES.DURATION_TOO_LONG;
      }
      break;
  }
  
  return errors;
};


export default EXPERIMENT_CREATION_STEPS;
