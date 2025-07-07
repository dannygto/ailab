// ʵ���������
export const experimentFixtures = {
  // ����ʵ������
  basicExperiments: [
    {
      id: '1',
      name: 'ţ�ٵڶ�������֤ʵ��',
      type: 'physics_experiment',
      status: 'active',
      createdAt: '2025-07-01T00:00:00Z',
      updatedAt: '2025-07-01T00:00:00Z',
      description: 'ͨ��С��������ϵͳ��֤ţ�ٵڶ�����',
      duration: 60,
      subject: '����',
      grade: 'high',
      difficulty: 'intermediate',
      tags: ['��ѧ', 'ţ�ٶ���', '��������'],
      materials: ['С��', '����', '��ʱ��', '���'],
      procedures: [
        '׼��ʵ������',
        '����ʵ��װ��',
        '��������',
        '�������'
      ],
      objectives: [
        '���ţ�ٵڶ�����',
        '���տ��Ʊ�����',
        'ѧ�����ݷ���'
      ]
    },
    {
      id: '2',
      name: '��ѧ��Ӧ����ʵ��',
      type: 'chemistry_experiment',
      status: 'completed',
      createdAt: '2025-06-30T00:00:00Z',
      updatedAt: '2025-07-01T00:00:00Z',
      description: '�о��¶ȶԻ�ѧ��Ӧ���ʵ�Ӱ��',
      duration: 90,
      subject: '��ѧ',
      grade: 'high',
      difficulty: 'advanced',
      tags: ['��Ӧ����ѧ', '�¶�ЧӦ', 'ʵ�鼼��'],
      materials: ['��Ӧ��', '�¶ȼ�', '���', '�Թ�'],
      procedures: [
        '���÷�Ӧ��',
        '�����¶�����',
        '�۲췴Ӧ����',
        '��¼����',
        '����Ӱ������'
      ],
      objectives: [
        '��ⷴӦ���ʸ���',
        '����Ӱ������',
        '����ʵ�鼼��'
      ]
    }
  ],

  // ʵ�鴴������
  createExperimentData: {
    basic: {
      name: '����ʵ��',
      type: 'physics_experiment',
      description: '����һ������ʵ��',
      duration: 60,
      subject: '����',
      grade: 'middle',
      difficulty: 'beginner'
    },
    advanced: {
      name: '�߼�����ʵ��',
      type: 'integrated_ScienceIcon',
      description: '����һ���߼�����ʵ�飬������ѧ������',
      duration: 120,
      subject: '�ۺϿ�ѧ',
      grade: 'high',
      difficulty: 'advanced',
      tags: ['�ۺ�', '��ѧ��', '����'],
      materials: ['������', '�����', 'ʵ��̨'],
      procedures: [
        '����ѧϰ',
        'ʵ�����',
        '���ݲɼ�',
        '�������',
        '����׫д'
      ]
    }
  },

  // ʵ��״̬�仯
  statusUpdates: [
    { id: '1', status: 'preparing' },
    { id: '1', status: 'running' },
    { id: '1', status: 'completed' },
    { id: '2', status: 'failed' }
  ],

  // ʵ��������
  experimentResults: {
    '1': {
      experimentId: '1',
      data: [
        { time: 0, force: 0, acceleration: 0 },
        { time: 1, force: 2, acceleration: 2 },
        { time: 2, force: 4, acceleration: 4 },
        { time: 3, force: 6, acceleration: 6 }
      ],
      analysis: {
        correlation: 0.99,
        slope: 1.0,
        intercept: 0.0
      },
      conclusion: 'ʵ����֤��ţ�ٵڶ�����F=ma�Ĺ�ϵ'
    },
    '2': {
      experimentId: '2',
      data: [
        { temperature: 25, rate: 0.1 },
        { temperature: 35, rate: 0.2 },
        { temperature: 45, rate: 0.4 },
        { temperature: 55, rate: 0.8 }
      ],
      analysis: {
        activationEnergy: 45.2,
        rateConstant: 0.02
      },
      conclusion: '�¶������������ӻ�ѧ��Ӧ����'
    }
  }
};

export default experimentFixtures;
