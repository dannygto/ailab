/**
 * 实验状态和权限管理工具
 * 
 * 本文件提供实验状态转换和操作权限相关的工具和函数
 */

import { Experiment, ExperimentStatus, User } from '../types';

/**
 * ��ȡ�û���ʵ���Ȩ��
 * @param experiment ʵ�����
 * @param user ��ǰ�û�
 * @returns Ȩ�޶���
 */
export const getExperimentPermissions = (experiment: Experiment, user: User) => {
  // ϵͳ����Աӵ������Ȩ��
  if (user.role === 'admin') {
    return {
      canView: true,
      canEdit: true,
      canStart: true,
      canStop: true,
      canDelete: true,
      canShare: true,
      isOwner: experiment.userId === user.id
    };
  }
  
  // ʵ�鴴����ӵ�д󲿷�Ȩ��
  const isOwner = experiment.userId === user.id;
  if (isOwner) {
    return {
      canView: true,
      canEdit: ['draft', 'ready'].includes(experiment.status),
      canStart: ['draft', 'ready'].includes(experiment.status),
      canStop: ['running', 'paused', 'pending'].includes(experiment.status),
      canDelete: ['draft', 'completed', 'failed', 'stopped', 'CancelIconled'].includes(experiment.status),
      canShare: true,
      isOwner: true
    };
  }
  
  // ��ʦ���Բ鿴ѧ����ʵ��
  if (user.role === 'teacher') {
    return {
      canView: true,
      canEdit: false,
      canStart: false,
      canStop: false,
      canDelete: false,
      canShare: true,
      isOwner: false
    };
  }
  
  // Ĭ��Ȩ�ޣ����ʵ�鱻������
  return {
    canView: experiment.metadata?.isPublic || experiment.metadata?.sharedWith?.includes(user.id) || false,
    canEdit: false,
    canStart: false,
    canStop: false,
    canDelete: false,
    canShare: false,
    isOwner: false
  };
};

/**
 * ״̬��תӳ�䣺������Щ״̬����ת������Щ״̬
 */
const STATUS_TRANSITIONS: Record<ExperimentStatus, ExperimentStatus[]> = {
  'draft': ['ready', 'running', 'cancelled'],
  'ready': ['running', 'cancelled'],
  'pending': ['running', 'cancelled'],
  'running': ['paused', 'completed', 'failed', 'stopped'],
  'paused': ['running', 'stopped', 'cancelled'],
  'completed': [],
  'failed': ['draft', 'ready'],
  'stopped': ['draft', 'ready'],
  'cancelled': ['draft']
};

/**
 * ���״̬ת���Ƿ���Ч
 * @param fromStatus ��ǰ״̬
 * @param toStatus Ŀ��״̬
 * @returns �Ƿ�����Ч��״̬ת��
 */
export const isValidStatusTransition = (
  fromStatus: ExperimentStatus, 
  toStatus: ExperimentStatus
): boolean => {
  return STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) || false;
};

/**
 * ��ȡʵ�鵱ǰ���õĲ���
 * @param experiment ʵ�����
 * @param userPermissions �û�Ȩ�޶���
 * @returns ���ò�������
 */
export const getAvailableActions = (
  experiment: Experiment,
  userPermissions: ReturnType<typeof getExperimentPermissions>
) => {
  const actions: {id: string, label: string, enabled: boolean}[] = [];
  
  // ��ʼʵ��
  if (['draft', 'ready'].includes(experiment.status) && userPermissions.canStart) {
    actions.push({
      id: 'start',
      label: '��ʼʵ��',
      enabled: true
    });
  }
  
  // ��ͣʵ��
  if (experiment.status === 'running' && userPermissions.canStop) {
    actions.push({
      id: 'pause',
      label: '��ͣʵ��',
      enabled: true
    });
  }
  
  // �ָ�ʵ��
  if (experiment.status === 'paused' && userPermissions.canStart) {
    actions.push({
      id: 'resume',
      label: '�ָ�ʵ��',
      enabled: true
    });
  }
  
  // ֹͣʵ��
  if (['running', 'paused', 'pending'].includes(experiment.status) && userPermissions.canStop) {
    actions.push({
      id: 'stop',
      label: 'ֹͣʵ��',
      enabled: true
    });
  }
  
  // ɾ��ʵ��
  if (['draft', 'completed', 'failed', 'stopped', 'CancelIconled'].includes(experiment.status) && userPermissions.canDelete) {
    actions.push({
      id: 'delete',
      label: 'ɾ��ʵ��',
      enabled: true
    });
  }
  
  // �༭ʵ��
  if (['draft', 'ready'].includes(experiment.status) && userPermissions.canEdit) {
    actions.push({
      id: 'edit',
      label: '�༭ʵ��',
      enabled: true
    });
  }
  
  // ����ʵ��
  if (userPermissions.canShare) {
    actions.push({
      id: 'share',
      label: '����ʵ��',
      enabled: true
    });
  }
  
  // ����ʵ��
  actions.push({
    id: 'duplicate',
    label: '����ʵ��',
    enabled: userPermissions.canView
  });
  
  return actions;
};

/**
 * ����û��Ƿ��в鿴�ض�ʵ������Ȩ��
 * @param experiment ʵ�����
 * @param user ��ǰ�û�
 * @returns �Ƿ���Ȩ�޲鿴���
 */
export const canViewExperimentResults = (experiment: Experiment, user: User): boolean => {
  // ʵ�������ɲ��ܲ鿴���
  if (experiment.status !== 'completed') {
    return false;
  }
  
  // Ȩ�޼��
  const permissions = getExperimentPermissions(experiment, user);
  return permissions.canView;
};


export default getExperimentPermissions;
