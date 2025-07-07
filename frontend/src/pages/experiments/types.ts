/**
 * 统一的组件类型定义文件
 * 用于解决不同组件间的类型不一致问题
 */


import { ExperimentType } from '../../types';

// 简化版实验方法选择组件接口
export interface ExperimentMethodSelectAdapterProps {
  value: string;
  onChange: (value: string) => void;
  error: string;
  experimentType?: ExperimentType;
}

// 简化版实验资源选择组件接口
export interface ExperimentResourceSelectAdapterProps {
  value: string;
  onChange: (value: string) => void;
  error: string;
  experimentType?: ExperimentType;
}

// 简化版AI辅助选择组件接口
export interface AIAssistanceSelectAdapterProps {
  value: string[];
  onChange: (values: string[]) => void;
}

// 简化版基本信息表单组件接口
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
