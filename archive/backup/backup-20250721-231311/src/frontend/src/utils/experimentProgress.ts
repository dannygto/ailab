/**
 * 实验进度管理工具
 * 
 * 本文件包含与实验进度和状态管理相关的工具函数�?
 */

import { Experiment, ExperimentStatus } from '../types';

/**
 * 计算实验进度百分�?
 * @param experiment 实验对象
 * @returns 进度百分比（0-100�?
 */
export const calculateExperimentProgress = (experiment: Experiment): number => {
  // 根据不同状态返回不同的进度百分�?
  switch (experiment.status) {
    case 'draft':
      return 0;
    case 'ready':
      return 10;
    case 'pending':
      return 20;
    case 'running':
      // 如果有细粒度的进度数据，可以使用�?
      if (experiment.metadata?.progress) {
        return Math.min(20 + experiment.metadata.progress * 0.7, 90);
      }
      // 根据开始时间估算进�?
      if (experiment.startedAt) {
        const totalDuration = experiment.parameters.duration * 60 * 1000; // 转换为毫�?
        const elapsed = Date.now() - new Date(experiment.startedAt).getTime();
        const estimatedProgress = Math.min((elapsed / totalDuration) * 70, 70);
        return 20 + estimatedProgress;
      }
      return 50; // 默认�?
    case 'paused':
      return experiment.metadata?.progress || 60;
    case 'completed':
      return 100;
    case 'failed':
      // 保留失败前的进度
      return experiment.metadata?.progress || 70;
    case 'stopped':
    case 'cancelled':
      // 保留停止前的进度
      return experiment.metadata?.progress || 50;
    default:
      return 0;
  }
};

/**
 * 获取实验已运行时间（分钟�?
 * @param experiment 实验对象
 * @returns 已运行时间（分钟�?
 */
export const getExperimentRunningTime = (experiment: Experiment): number => {
  if (!experiment.startedAt) {
    return 0;
  }
  
  const startTime = new Date(experiment.startedAt).getTime();
  const endTime = experiment.completedAt 
    ? new Date(experiment.completedAt).getTime() 
    : Date.now();
  
  return Math.round((endTime - startTime) / (60 * 1000));
};

/**
 * 获取实验预计剩余时间（分钟）
 * @param experiment 实验对象
 * @returns 预计剩余时间（分钟）
 */
export const getEstimatedTimeRemaining = (experiment: Experiment): number => {
  if (experiment.status !== 'running') {
    return 0;
  }
  
  if (!experiment.startedAt) {
    return experiment.parameters.duration || 0;
  }
  
  const totalDuration = experiment.parameters.duration || 0;
  const elapsed = getExperimentRunningTime(experiment);
  
  return Math.max(0, totalDuration - elapsed);
};

/**
 * 检查实验是否可以执行特定操�?
 * @param experiment 实验对象
 * @param action 操作类型
 * @returns 是否可以执行该操�?
 */
export const canPerformAction = (
  experiment: Experiment, 
  action: 'start' | 'pause' | 'resume' | 'stop' | 'delete'
): boolean => {
  switch (action) {
    case 'start':
      return ['draft', 'ready'].includes(experiment.status);
    case 'pause':
      return experiment.status === 'running';
    case 'resume':
      return experiment.status === 'paused';
    case 'stop':
      return ['running', 'paused', 'pending'].includes(experiment.status);
    case 'delete':
      return ['draft', 'completed', 'failed', 'stopped', 'CancelIconled'].includes(experiment.status);
    default:
      return false;
  }
};

/**
 * 获取下一个状态（基于当前操作�?
 * @param currentStatus 当前状�?
 * @param action 操作类型
 * @returns 操作后的新状�?
 */
export const getNextStatus = (
  currentStatus: ExperimentStatus, 
  action: 'start' | 'pause' | 'resume' | 'stop' | 'complete' | 'fail'
): ExperimentStatus => {
  switch (action) {
    case 'start':
      return 'running';
    case 'pause':
      return 'paused';
    case 'resume':
      return 'running';
    case 'stop':
      return 'stopped';
    case 'complete':
      return 'completed';
    case 'fail':
      return 'failed';
    default:
      return currentStatus;
  }
};


export default calculateExperimentProgress;
