/**
 * 实验组件工具函数
 * 
 * 本文件包含与实验组件相关的工具函数，用于实现常见的组件交互和UI效果。
 */

import { Experiment, ExperimentType } from '../types';
import { getExperimentTypeText, getStatusText, getStatusColor } from './experimentUtils';
import { experimentTypes } from './experimentTypes';
import { experimentMethodOptions } from '../pages/experiments/components/ExperimentMethodSelect';
import { experimentResourceOptions } from '../pages/experiments/components/ExperimentResourceSelect';
import { aiAssistOptions } from '../pages/experiments/components/AIAssistanceSelect';

/**
 * 获取实验方法的详细信息
 * @param experimentType 实验类型
 * @param methodValue 方法值
 * @returns 方法的详细信息，如果未找到则返回null
 */
export const getMethodDetails = (experimentType: ExperimentType, methodValue: string) => {
  const methods = experimentMethodOptions[experimentType] || [];
  return methods.find(m => m.value === methodValue) || null;
};

/**
 * 获取实验资源的详细信息
 * @param experimentType 实验类型
 * @param resourceValue 资源值
 * @returns 资源的详细信息，如果未找到则返回null
 */
export const getResourceDetails = (experimentType: ExperimentType, resourceValue: string) => {
  const resources = experimentResourceOptions[experimentType] || [];
  return resources.find(r => r.value === resourceValue) || null;
};

/**
 * 获取AI辅助功能的详细信息
 * @param assistanceValues AI辅助功能值数组
 * @returns AI辅助功能的详细信息数组
 */
export const getAIAssistanceDetails = (assistanceValues: string[]) => {
  return aiAssistOptions.filter(a => assistanceValues.includes(a.value));
};

/**
 * 获取实验类型的详细信息
 * @param typeValue 实验类型值
 * @returns 实验类型的详细信息，如果未找到则返回null
 */
export const getExperimentTypeDetails = (typeValue: ExperimentType) => {
  return experimentTypes.find(t => t.value === typeValue) || null;
};

/**
 * 生成实验的简短摘要
 * @param experiment 实验数据
 * @returns 简短摘要字符串
 */
export const generateExperimentSummary = (experiment: Experiment): string => {
  const typeText = getExperimentTypeText(experiment.type);
  const statusText = getStatusText(experiment.status);
  const methodDetails = experiment.parameters?.experimentMethod ? 
    getMethodDetails(experiment.type, experiment.parameters.experimentMethod) : null;
  
  let summary = `${typeText}实验`;
  
  if (methodDetails) {
    summary += ` - ${methodDetails.label}`;
  }
  
  summary += ` (${statusText})`;
  
  return summary;
};

/**
 * 生成实验的状态标签样式
 * @param status 实验状态
 * @returns 样式对象
 */
export const getStatusLabelStyle = (status: Experiment['status']) => {
  const color = getStatusColor(status);
  
  return {
    backgroundColor: `${color}20`, // 20% 透明度的背景色
    color: color,
    borderColor: color,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'inline-block',
    textTransform: 'uppercase' as const
  };
};

/**
 * 获取适用于特定实验类型的AI辅助功能选项
 * @param experimentType 实验类型
 * @returns 过滤后的AI辅助功能选项
 */
export const GetAppIconlicableAIAssistOptions = (experimentType: ExperimentType) => {
  // 基于实验类型过滤AI辅助选项
  // 目前返回所有选项，可以根据需要实现过滤逻辑
  return aiAssistOptions;
};

/**
 * 格式化创建时间为易读字符串
 * @param date 日期对象
 * @returns 格式化的日期字符串
 */
export const formatCreationDate = (date: Date): string => {
  if (!date) return '未知';
  
  // 如果是字符串日期，转换为Date对象
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (e) {
    return '日期格式错误';
  }
};
