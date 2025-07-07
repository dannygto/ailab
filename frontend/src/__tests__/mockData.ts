// �����õ�ģ������
export const mockdevices = [
  {
    id: '1',
    name: '�¶ȴ�����-001',
    type: 'sensor',
    status: 'online',
    location: 'ʵ����A',
    metrics: { temperature: 25.5, cpu: 15, MemoryIcon: 30 }
  },
  {
    id: '2',
    name: '����ͷ-002',
    type: 'camera',
    status: 'offline',
    location: 'ʵ����B',
    metrics: { cpu: 0, MemoryIcon: 0 }
  },
  {
    id: '3',
    name: 'ѹ��������-003',
    type: 'sensor',
    status: 'error',
    location: 'ʵ����C',
    metrics: { temperature: 50.2, cpu: 90, MemoryIcon: 85 }
  }
];

export const mockExperimentData = [
  { x: 1, y: 10, label: '��һ����' },
  { x: 2, y: 15, label: '�ڶ�����' },
  { x: 3, y: 12, label: '��������' },
  { x: 4, y: 18 },
  { x: 5, y: 20 },
  { x: 6, y: 22 },
  { x: 7, y: 25 }
];

export const mockSystemSettings = {
  general: {
    LanguageIcon: 'zh-CN',
    timezone: 'Asia/Shanghai',
    autoSave: true,
    NotificationsIcon: true,
    autoUpdate: false
  },
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    fontSize: 'medium',
    compactMode: false
  },
  data: {
    autoBackupIcon: true,
    BackupIconInterval: 24,
    StorageIconLocation: 'local',
    compression: true,
    retentionDays: 30
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    ipRestriction: false
  }
};

export const mockExperiments = [
  {
    id: 'exp-001',
    name: '�¶ȶԲ���ǿ��Ӱ��ʵ��',
    status: 'completed',
    startDate: '2023-05-10T08:00:00',
    endDate: '2023-05-10T14:30:00',
    description: '�о���ͬ�¶��²���ǿ�ȱ仯',
    createdBy: 'user1',
    results: {
      summary: '�¶����ߵ��²���ǿ���½�Լ15%',
      dataPoints: 120,
      success: true
    }
  },
  {
    id: 'exp-002',
    name: '����ǿ�ȶ�ֲ����������Ӱ��',
    status: 'in-progress',
    startDate: '2023-06-01T09:15:00',
    endDate: null,
    description: '������ͬ����ǿ����ֲ���������ʱ仯',
    createdBy: 'user2',
    results: {
      summary: 'ʵ�������',
      dataPoints: 85,
      success: null
    }
  },
  {
    id: 'exp-003',
    name: 'ʪ�ȶԵ���Ԫ���ȶ���Ӱ��',
    status: 'planned',
    startDate: '2023-06-15T10:00:00',
    endDate: null,
    description: '������ͬʪ�Ȼ����µ���Ԫ�����ܱ仯',
    createdBy: 'user1',
    results: null
  }
];
