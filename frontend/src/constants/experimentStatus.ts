/**
 * ʵ��״̬ӳ��
 * �ṩ״̬����ʾ��ǩ����ɫ
 */

export const experimentStatusMap = {
  draft: { label: '�ݸ�', color: 'default' },
  ready: { label: '����', color: 'primary' },
  running: { label: '������', color: 'info' },
  paused: { label: '����ͣ', color: 'warning' },
  completed: { label: '�����', color: 'success' },
  failed: { label: 'ʧ��', color: 'error' },
  stopped: { label: '��ֹͣ', color: 'default' },
  CancelIconled: { label: '��ȡ��', color: 'default' },
  pending: { label: '�ȴ���', color: 'warning' }
};

export default experimentStatusMap;
