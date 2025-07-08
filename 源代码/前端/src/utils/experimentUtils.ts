import { Box } from '@mui/material';
import { ExperimentType } from '../types';

export const getExperimentTypeText = (type: ExperimentType): string => {
  const typeMap: Record<ExperimentType, string> = {
    observation: '观察实验',
    measurement: '测量实验',
    comparison: '对比实验', 
    exploration: '探究实验',
    design: '设计制作',
    analysis: '分析实验',
    synthesis: '综合实验',
    custom: '自定义实验'
  };
  
  return typeMap[type] || type;
};

export function getBasicExperimentTypes() {
  return ['observation', 'measurement', 'comparison', 'exploration', 'design', 'analysis', 'synthesis'];
}

export function isBasicExperimentType(type: string): boolean {
  return getBasicExperimentTypes().includes(type);
}

export function getRecommendedParameters(type: ExperimentType) {
  const defaults = {
    observation: { duration: 30, participants: 4 },
    measurement: { duration: 40, participants: 2 },
    comparison: { duration: 35, participants: 4 },
    exploration: { duration: 45, participants: 6 },
    design: { duration: 60, participants: 4 },
    analysis: { duration: 50, participants: 2 },
    synthesis: { duration: 90, participants: 6 },
    custom: { duration: 45, participants: 4 }
  };
  
  return defaults[type] || { duration: 45, participants: 4 };
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    paused: '已暂停',
    stopped: '已停止',
    draft: '草稿',
    pending: '等待中'
  };
  
  return statusMap[status] || status;
}

export function getStatusColor(status: string): 'primary' | 'success' | 'error' | 'warning' | 'default' {
  const colorMap: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'default'> = {
    running: 'primary',
    completed: 'success',
    failed: 'error',
    paused: 'warning',
    stopped: 'default',
    draft: 'default',
    pending: 'warning'
  };
  
  return colorMap[status] || 'default';
}


export default getExperimentTypeText;
