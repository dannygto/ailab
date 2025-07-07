/**
 * 实验相关配置常量
 * 
 * 本文件包含与实验相关的配置常量，如选项列表、步骤定义等，
 * 集中管理以便于维护和复用。
 */

import { ExperimentType } from '../types';

/**
 * 实验创建步骤
 */
export const EXPERIMENT_CREATION_STEPS = [
  '选择实验类型', 
  '选择实验方法', 
  '选择实验资源', 
  '配置AI辅助', 
  '基本信息'
];

/**
 * 实验时长限制 (分钟)
 */
export const DURATION_LIMITS = {
  MIN: 1,
  MAX: 480, // 8小时
  DEFAULT: 60
};

/**
 * 实验名称字符限制
 */
export const NAME_LIMITS = {
  MIN: 1,
  MAX: 100
};

/**
 * 创建验证错误消息
 */
export const ERROR_MESSAGES = {
  EXPERIMENT_TYPE_REQUIRED: '请选择实验类型',
  EXPERIMENT_METHOD_REQUIRED: '请选择实验方法',
  RESOURCES_REQUIRED: '请至少选择一种实验资源',
  NAME_REQUIRED: '实验名称不能为空',
  NAME_TOO_LONG: `实验名称不能超过${NAME_LIMITS.MAX}个字符`,
  DESCRIPTION_REQUIRED: '实验描述不能为空',
  DURATION_REQUIRED: '实验时长必须大于0',
  DURATION_TOO_LONG: `实验时长不能超过${DURATION_LIMITS.MAX}分钟（8小时）`
};

/**
 * 实验初始状态
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
 * 根据步骤和输入值验证表单数据
 */
export const validateStepData = (
  step: number, 
  data: Partial<typeof INITIAL_EXPERIMENT_STATE>
): Partial<ValidationErrors> => {
  const errors: Partial<ValidationErrors> = {};
  
  switch (step) {
    case 0: // 实验类型
      if (!data.selectedType) {
        errors.typeError = ERROR_MESSAGES.EXPERIMENT_TYPE_REQUIRED;
      }
      break;
      
    case 1: // 实验方法
      if (!data.selectedMethod) {
        errors.methodError = ERROR_MESSAGES.EXPERIMENT_METHOD_REQUIRED;
      }
      break;
      
    case 2: // 实验资源
      if (!data.selectedResources?.length) {
        errors.resourcesError = ERROR_MESSAGES.RESOURCES_REQUIRED;
      }
      break;
      
    case 4: // 基本信息
      // 验证名称
      if (!data.name?.trim()) {
        errors.nameError = ERROR_MESSAGES.NAME_REQUIRED;
      } else if (data.name.length > NAME_LIMITS.MAX) {
        errors.nameError = ERROR_MESSAGES.NAME_TOO_LONG;
      }
      
      // 验证描述
      if (!data.description?.trim()) {
        errors.descriptionError = ERROR_MESSAGES.DESCRIPTION_REQUIRED;
      }
      
      // 验证时长
      if (!data.duration || data.duration <= 0) {
        errors.durationError = ERROR_MESSAGES.DURATION_REQUIRED;
      } else if (data.duration > DURATION_LIMITS.MAX) {
        errors.durationError = ERROR_MESSAGES.DURATION_TOO_LONG;
      }
      break;
  }
  
  return errors;
};
