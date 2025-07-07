// ģ���������
export const templateFixtures = {
  // ����ģ������
  basicTemplates: [
    {
      id: 'template-001',
      name: '����������ѧʵ��ģ��',
      subject: '����',
      grade: 'high',
      difficulty: 'beginner',
      duration: 60,
      description: '�����ڸ���������ѧ����ʵ���ͨ��ģ��',
      version: '1.0.0',
      author: '����������',
      createdAt: '2025-06-15T00:00:00Z',
      updatedAt: '2025-07-01T00:00:00Z',
      tags: ['����', '��ѧ', '����', '����'],
      category: 'physics_experiment',
      isPublic: true,
      downloadCount: 156,
      rating: 4.5,
      content: {
        objectives: [
          '���������ѧ����',
          '����ʵ���������',
          '������ѧ˼ά����'
        ],
        materials: [
          'С��',
          '������',
          '��ʱ��',
          'ֱ��',
          '���'
        ],
        procedures: [
          {
            step: 1,
            title: '׼���׶�',
            description: '������������ԣ���װʵ��װ��',
            duration: 10,
            safety: ['ȷ�����ƽ��', '���С������']
          },
          {
            step: 2,
            title: '�����׶�',
            description: '���ж����������¼����',
            duration: 40,
            safety: ['ע���������', '�����������']
          },
          {
            step: 3,
            title: '�����׶�',
            description: '�������ݣ��������',
            duration: 10,
            safety: []
          }
        ],
        variables: [
          { name: '����', symbol: 'm', unit: 'kg', type: 'independent' },
          { name: '���ٶ�', symbol: 'a', unit: 'm/s2', type: 'dependent' },
          { name: '��', symbol: 'F', unit: 'N', type: 'dependent' }
        ],
        calculations: [
          { formula: 'F = ma', description: 'ţ�ٵڶ�����' },
          { formula: 'a = ��v/��t', description: '���ٶȶ���' }
        ]
      }
    },
    {
      id: 'template-002',
      name: '��ѧ��Ӧ����ѧʵ��ģ��',
      subject: '��ѧ',
      grade: 'high',
      difficulty: 'intermediate',
      duration: 90,
      description: '�о���ѧ��Ӧ���ʼ�Ӱ�����ص�ʵ��ģ��',
      version: '2.1.0',
      author: '��ѧ������',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-06-30T00:00:00Z',
      tags: ['��ѧ', '��Ӧ����ѧ', '����', '����'],
      category: 'chemistry_experiment',
      isPublic: true,
      downloadCount: 89,
      rating: 4.2,
      content: {
        objectives: [
          '���ⷴӦ���ʸ���',
          '̽��Ӱ�췴Ӧ���ʵ�����',
          'ѧ��ʹ��ͼ����������'
        ],
        materials: [
          '��Ӧ��A', '��Ӧ��B', '�߻���',
          '�¶ȼ�', '���', '�Թ�', '�ձ�',
          'ˮԡ��', 'pH��ֽ'
        ],
        procedures: [
          {
            step: 1,
            title: '�Լ�׼��',
            description: '���Ʋ�ͬŨ�ȵķ�Ӧ����Һ',
            duration: 20,
            safety: ['�����Ŀ��', 'ʹ��ͨ���']
          },
          {
            step: 2,
            title: '�¶�ʵ��',
            description: '�ڲ�ͬ�¶��½��з�Ӧ',
            duration: 30,
            safety: ['ע����Ȱ�ȫ', '��������']
          },
          {
            step: 3,
            title: 'Ũ��ʵ��',
            description: 'ʹ�ò�ͬŨ�Ƚ��жԱ�ʵ��',
            duration: 25,
            safety: ['׼ȷ����', '��ֹ����']
          },
          {
            step: 4,
            title: '���ݷ���',
            description: '�������ݣ�����ͼ��',
            duration: 15,
            safety: []
          }
        ],
        variables: [
          { name: '�¶�', symbol: 'T', unit: '��C', type: 'independent' },
          { name: 'Ũ��', symbol: 'C', unit: 'mol/L', type: 'independent' },
          { name: '��Ӧ����', symbol: 'v', unit: 'mol/(L��s)', type: 'dependent' }
        ]
      }
    }
  ],

  // ģ�����
  templateCategories: [
    { id: 'physics_experiment', name: '����ʵ��', count: 45 },
    { id: 'chemistry_experiment', name: '��ѧʵ��', count: 38 },
    { id: 'biology_experiment', name: '����ʵ��', count: 29 },
    { id: 'integrated_ScienceIcon', name: '�ۺϿ�ѧ', count: 15 },
    { id: 'EngineeringIcon_lab', name: '����ʵ��', count: 12 },
    { id: 'medical_lab', name: 'ҽѧʵ��', count: 8 }
  ],

  // ģ�崴������
  createTemplateData: {
    basic: {
      name: '����ʵ��ģ��',
      subject: '����',
      grade: 'middle',
      difficulty: 'beginner',
      duration: 45,
      description: '����һ�������õ�ʵ��ģ��',
      category: 'physics_experiment',
      isPublic: false
    },
    advanced: {
      name: '�߼��ۺϿ�ѧʵ��ģ��',
      subject: '�ۺϿ�ѧ',
      grade: 'high',
      difficulty: 'advanced',
      duration: 120,
      description: '��ѧ���ۺ�ʵ��ģ�壬������������ѧ������ȶ������',
      category: 'integrated_ScienceIcon',
      isPublic: true,
      tags: ['�ۺ�', '��ѧ��', '����', '�߼�'],
      content: {
        objectives: [
          '������ѧ��˼ά',
          '����ۺ�ʵ������',
          '����ѧ�Ƽ���ϵ'
        ],
        materials: [
          '�๦�ܴ�����',
          '��΢��',
          '������',
          '�����',
          '���ݲɼ�ϵͳ'
        ]
      }
    }
  },

  // ģ��汾��ʷ
  templateVersions: {
    'template-001': [
      { version: '1.0.0', date: '2025-06-15T00:00:00Z', changes: '��ʼ�汾����' },
      { version: '1.0.1', date: '2025-06-20T00:00:00Z', changes: '�޸�ʵ�鲽������' },
      { version: '1.1.0', date: '2025-07-01T00:00:00Z', changes: '���Ӱ�ȫע������' }
    ],
    'template-002': [
      { version: '2.0.0', date: '2025-05-20T00:00:00Z', changes: '�ش���£��ع�ʵ������' },
      { version: '2.1.0', date: '2025-06-30T00:00:00Z', changes: '���Ӵ߻���ʵ�鲿��' }
    ]
  },

  // ģ�����ۺͷ���
  templateReviews: {
    'template-001': [
      {
        id: 'review-001',
        userId: 'user-001',
        userName: '����ʦ',
        rating: 5,
        comment: '�ǳ�ʵ�õ�ģ�壬ѧ�������ܺ�',
        date: '2025-06-25T00:00:00Z'
      },
      {
        id: 'review-002',
        userId: 'user-002',
        userName: '����ʦ',
        rating: 4,
        comment: '������ϸ����ʱ�䰲�ſ��Ը����',
        date: '2025-06-28T00:00:00Z'
      }
    ]
  },

  // ģ��ʹ��ͳ��
  templateStats: {
    'template-001': {
      totalDownloads: 156,
      monthlyDownloads: 23,
      averageRating: 4.5,
      totalReviews: 12,
      usageByGrade: {
        'middle': 45,
        'high': 111
      }
    },
    'template-002': {
      totalDownloads: 89,
      monthlyDownloads: 15,
      averageRating: 4.2,
      totalReviews: 8,
      usageByGrade: {
        'high': 89
      }
    }
  }
};

export default templateFixtures;
