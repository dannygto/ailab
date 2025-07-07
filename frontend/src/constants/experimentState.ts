/**
 * 实验状态初始值常量
 * 包含创建实验和表单验证所需的默认值
 */

import { ExperimentType } from '../types';

/**
 * 实验创建初始状态
 */
export const INITIAL_EXPERIMENT_STATE = {
  name: '',
  description: '',
  duration: 60, // 默认60分钟
  selectedType: '' as ExperimentType | '',
  selectedMethod: '',
  selectedResources: [] as string[],
  selectedAIAssistance: [] as string[],
};

/**
 * 表单验证错误初始状态
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
 * 验证步骤数据的通用函数
 * @param step 当前步骤
 * @param data 表单数据
 */
export const validateStepData = (step: number, data: any) => {
  const errors = { ...INITIAL_VALIDATION_ERRORS };
  
  switch (step) {
    case 0: // 实验类型
      if (!data.selectedType) {
        errors.typeError = '请选择实验类型';
      }
      break;
      
    case 1: // 实验方法
      if (!data.selectedMethod) {
        errors.methodError = '请选择实验方法';
      }
      break;
      
    case 2: // 实验资源
      if (data.selectedResources.length === 0) {
        errors.resourcesError = '请至少选择一种实验资源';
      }
      break;
      
    case 4: // 基本信息
      if (!data.name.trim()) {
        errors.nameError = '实验名称不能为空';
      } else if (data.name.length > 100) {
        errors.nameError = '实验名称不能超过100个字符';
      }
      
      if (!data.description.trim()) {
        errors.descriptionError = '实验描述不能为空';
      }
      
      if (!data.duration || data.duration <= 0) {
        errors.durationError = '实验时长必须大于0';
      } else if (data.duration > 480) {
        errors.durationError = '实验时长不能超过480分钟（8小时）';
      }
      break;
  }
  
  return errors;
};

/**
 * 完整验证实验数据
 * @param experiment 实验数据
 */
export const validateExperiment = (experiment: any) => {
  const errors: Record<string, string> = {};
  
  // 验证必填字段
  if (!experiment.name?.trim()) {
    errors.name = '实验名称不能为空';
  }
  
  if (!experiment.description?.trim()) {
    errors.description = '实验描述不能为空';
  }
  
  if (!experiment.type) {
    errors.type = '请选择实验类型';
  }
  
  if (!experiment.method) {
    errors.method = '请选择实验方法';
  }
  
  if (!experiment.resources || experiment.resources.length === 0) {
    errors.resources = '请至少选择一种实验资源';
  }
  
  // 验证数值范围
  if (!experiment.duration || experiment.duration <= 0) {
    errors.duration = '实验时长必须大于0';
  } else if (experiment.duration > 480) {
    errors.duration = '实验时长不能超过480分钟（8小时）';
  }
  
  return errors;
};

/**
 * 实验类型选项
 */
export const experimentTypes = [
  { label: '图像识别', value: 'image_recognition', description: '训练模型识别图像中的物体或场景' },
  { label: '物体检测', value: 'object_detection', description: '标识图像中物体的位置和类别' },
  { label: '自然语言处理', value: 'nlp', description: '分析和理解人类语言文本' },
  { label: '机器学习基础', value: 'ml_basics', description: '机器学习核心概念和简单模型' },
  { label: '数据集探索', value: 'data_exploration', description: '分析和可视化数据集' },
  { label: '预测建模', value: 'predictive_modeling', description: '创建用于预测未来值的模型' }
];
