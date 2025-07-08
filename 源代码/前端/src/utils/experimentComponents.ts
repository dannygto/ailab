/**
 * ʵ��������ߺ���
 * 
 * ���ļ�������ʵ�������صĹ��ߺ���������ʵ�ֳ��������������UIЧ����
 */

import { Box } from '@mui/material';
import { Experiment, ExperimentType } from '../types';
import { getExperimentTypeText, getStatusText, getStatusColor } from './experimentUtils';
import { experimentTypes } from './experimentTypes';
import { experimentMethodOptions } from '../pages/experiments/components/ExperimentMethodSelect';
import { experimentResourceOptions } from '../pages/experiments/components/ExperimentResourceSelect';
import { aiAssistOptions } from '../pages/experiments/components/AIAssistanceSelect';

/**
 * ��ȡʵ�鷽������ϸ��Ϣ
 * @param experimentType ʵ������
 * @param methodValue ����ֵ
 * @returns ��������ϸ��Ϣ�����δ�ҵ��򷵻�null
 */
export const getMethodDetails = (experimentType: ExperimentType, methodValue: string) => {
  const methods = experimentMethodOptions[experimentType] || [];
  return methods.find(m => m.value === methodValue) || null;
};

/**
 * ��ȡʵ����Դ����ϸ��Ϣ
 * @param experimentType ʵ������
 * @param resourceValue ��Դֵ
 * @returns ��Դ����ϸ��Ϣ�����δ�ҵ��򷵻�null
 */
export const getResourceDetails = (experimentType: ExperimentType, resourceValue: string) => {
  const resources = experimentResourceOptions[experimentType] || [];
  return resources.find(r => r.value === resourceValue) || null;
};

/**
 * ��ȡAI�������ܵ���ϸ��Ϣ
 * @param assistanceValues AI��������ֵ����
 * @returns AI�������ܵ���ϸ��Ϣ����
 */
export const getAIAssistanceDetails = (assistanceValues: string[]) => {
  return aiAssistOptions.filter(a => assistanceValues.includes(a.value));
};

/**
 * ��ȡʵ�����͵���ϸ��Ϣ
 * @param typeValue ʵ������ֵ
 * @returns ʵ�����͵���ϸ��Ϣ�����δ�ҵ��򷵻�null
 */
export const getExperimentTypeDetails = (typeValue: ExperimentType) => {
  return experimentTypes.find(t => t.value === typeValue) || null;
};

/**
 * ����ʵ��ļ��ժҪ
 * @param experiment ʵ������
 * @returns ���ժҪ�ַ���
 */
export const generateExperimentSummary = (experiment: Experiment): string => {
  const typeText = getExperimentTypeText(experiment.type);
  const statusText = getStatusText(experiment.status);
  const methodDetails = experiment.parameters?.experimentMethod ? 
    getMethodDetails(experiment.type, experiment.parameters.experimentMethod) : null;
  
  let summary = `${typeText}ʵ��`;
  
  if (methodDetails) {
    summary += ` - ${methodDetails.label}`;
  }
  
  summary += ` (${statusText})`;
  
  return summary;
};

/**
 * ����ʵ���״̬��ǩ��ʽ
 * @param status ʵ��״̬
 * @returns ��ʽ����
 */
export const getStatusLabelStyle = (status: Experiment['status']) => {
  const color = getStatusColor(status);
  
  return {
    backgroundColor: `${color}20`, // 20% ͸���ȵı���ɫ
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
 * ��ȡ�������ض�ʵ�����͵�AI��������ѡ��
 * @param experimentType ʵ������
 * @returns ���˺��AI��������ѡ��
 */
export const GetAppIconlicableAIAssistOptions = (experimentType: ExperimentType) => {
  // ����ʵ�����͹���AI����ѡ��
  // Ŀǰ��������ѡ����Ը�����Ҫʵ�ֹ����߼�
  return aiAssistOptions;
};

/**
 * ��ʽ������ʱ��Ϊ�׶��ַ���
 * @param date ���ڶ���
 * @returns ��ʽ���������ַ���
 */
export const formatCreationDate = (date: Date): string => {
  if (!date) return 'δ֪';
  
  // ������ַ������ڣ�ת��ΪDate����
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
    return '���ڸ�ʽ����';
  }
};


export default getMethodDetails;
