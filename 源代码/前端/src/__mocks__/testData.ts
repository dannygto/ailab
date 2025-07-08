// ����ģ������

// ģ��ʵ������
export const mockExperiments = [
  {
    id: '1',
    name: '����ʵ��1',
    description: '����һ������ʵ��',
    status: 'running',
    type: 'image_analysis',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    results: [],
    parameters: {
      threshold: 0.5,
      iterations: 100
    }
  },
  {
    id: '2',
    name: '����ʵ��2',
    description: '��һ������ʵ��',
    status: 'completed',
    type: 'data_processing',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    results: [
      { metric: 'accuracy', value: 0.95 },
      { metric: 'precision', value: 0.88 }
    ],
    parameters: {
      algorithm: 'svm',
      kernelType: 'rbf'
    }
  }
];

// ģ���豸����
export const mockdevices = [
  {
    id: '1',
    name: '��΢���豸1',
    type: 'microscope',
    status: 'online',
    location: 'ʵ����A',
    lastHeartbeat: '2023-01-01T00:00:00.000Z',
    capabilities: ['imaging', 'zoom'],
    config: {
      resolution: '1920x1080',
      magnification: '100x'
    }
  },
  {
    id: '2',
    name: '�������豸2',
    type: 'sensor',
    status: 'offline',
    location: 'ʵ����B',
    lastHeartbeat: '2023-01-01T00:00:00.000Z',
    capabilities: ['temperature', 'humidity'],
    config: {
      sampleRate: 1000,
      range: '0-100'
    }
  }
];

// ģ���������
export const mockTableData = [
  {
    id: '1',
    name: '��Ŀ1',
    status: '������',
    progress: 75,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-15'
  },
  {
    id: '2', 
    name: '��Ŀ2',
    status: '�����',
    progress: 100,
    createdAt: '2023-01-02',
    updatedAt: '2023-01-20'
  },
  {
    id: '3',
    name: '��Ŀ3', 
    status: '��ͣ',
    progress: 30,
    createdAt: '2023-01-03',
    updatedAt: '2023-01-10'
  }
];

// ģ������������
export const mockAnalysisResults = [
  {
    id: '1',
    experimentId: '1',
    type: 'statistical',
    data: {
      mean: 12.5,
      std: 2.3,
      count: 100,
      distribution: 'normal'
    },
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    experimentId: '2',
    type: 'classification',
    data: {
      accuracy: 0.95,
      precision: 0.88,
      recall: 0.92,
      f1Score: 0.90
    },
    createdAt: '2023-01-02T00:00:00.000Z'
  }
];

// ģ���û�����
export const mockUsers = [
  {
    id: '1',
    username: 'testuser1',
    email: 'test1@example.com',
    role: 'researcher',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    username: 'testuser2',
    email: 'test2@example.com',
    role: 'admin',
    isActive: true,
    createdAt: '2023-01-02T00:00:00.000Z'
  }
];

// ģ��ý������
export const mockMediaItems = [
  {
    id: '1',
    type: 'image',
    url: '/test-image.jpg',
    title: '����ͼƬ1',
    description: '����һ������ͼƬ',
    experimentId: '1',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    type: 'video',
    url: '/test-video.mp4',
    title: '������Ƶ1',
    description: '����һ��������Ƶ',
    experimentId: '2',
    createdAt: '2023-01-02T00:00:00.000Z'
  }
];

// ģ��ָ������
export const mockMetrics = [
  {
    id: '1',
    name: 'CPUʹ����',
    value: 65,
    unit: '%',
    timestamp: '2023-01-01T00:00:00.000Z',
    deviceId: '1'
  },
  {
    id: '2',
    name: '�ڴ�ʹ����',
    value: 45,
    unit: '%',
    timestamp: '2023-01-01T00:00:00.000Z',
    deviceId: '1'
  },
  {
    id: '3',
    name: '�¶�',
    value: 23.5,
    unit: '��C',
    timestamp: '2023-01-01T00:00:00.000Z',
    deviceId: '2'
  }
];

// ģ��api��Ӧ
export const mockapiResponse = {
  success: true,
  data: mockExperiments,
  message: '�����ɹ�',
  timestamp: '2023-01-01T00:00:00.000Z'
};

// ����Ĭ������
export const testData = {
  experiments: mockExperiments,
  devices: mockdevices,
  tableData: mockTableData,
  analysisResults: mockAnalysisResults,
  users: mockUsers,
  mediaItems: mockMediaItems,
  metrics: mockMetrics,
  apiResponse: mockapiResponse
};

export default testData;
