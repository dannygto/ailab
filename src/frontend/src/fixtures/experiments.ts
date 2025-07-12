// 实验测试数据
export const experimentFixtures = {
  // 基础实验数据
  basicExperiments: [
    {
      id: '1',
      name: '牛顿第二定律验证实验',
      type: 'physics_experiment',
      status: 'active',
      createdAt: '2025-07-01T00:00:00Z',
      updatedAt: '2025-07-01T00:00:00Z',
      description: '通过小车和砝码系统验证牛顿第二定律',
      duration: 60,
      subject: '物理',
      grade: 'high',
      difficulty: 'intermediate',
      tags: ['力学', '牛顿定律', '经典物理'],
      materials: ['小车', '砝码', '计时器', '轨道'],
      procedures: [
        '准备实验器材',
        '设置实验装置',
        '测量数据',
        '分析结果'
      ],
      objectives: [
        '理解牛顿第二定律',
        '掌握控制变量法',
        '学会数据分析'
      ]
    },
    {
      id: '2',
      name: '化学反应速率实验',
      type: 'chemistry_experiment',
      status: 'completed',
      createdAt: '2025-06-30T00:00:00Z',
      updatedAt: '2025-07-01T00:00:00Z',
      description: '研究温度对化学反应速率的影响',
      duration: 90,
      subject: '化学',
      grade: 'high',
      difficulty: 'advanced',
      tags: ['反应动力学', '温度效应', '实验技能'],
      materials: ['反应物', '温度计', '秒表', '试管'],
      procedures: [
        '配置反应物',
        '控制温度条件',
        '观察反应过程',
        '记录数据',
        '分析影响因素'
      ],
      objectives: [
        '理解反应速率概念',
        '掌握影响因素',
        '培养实验技能'
      ]
    }
  ],

  // 实验创建数据
  createExperimentData: {
    basic: {
      name: '测试实验',
      type: 'physics_experiment',
      description: '这是一个测试实验',
      duration: 60,
      subject: '物理',
      grade: 'middle',
      difficulty: 'beginner'
    },
    advanced: {
      name: '高级测试实验',
      type: 'integrated_ScienceIcon',
      description: '这是一个高级测试实验，包含多学科内容',
      duration: 120,
      subject: '综合科学',
      grade: 'high',
      difficulty: 'advanced',
      tags: ['综合', '跨学科', '创新'],
      materials: ['传感器', '计算机', '实验台'],
      procedures: [
        '理论学习',
        '实验设计',
        '数据采集',
        '结果分析',
        '报告撰写'
      ]
    }
  },

  // 实验状态变化
  statusUpdates: [
    { id: '1', status: 'preparing' },
    { id: '1', status: 'running' },
    { id: '1', status: 'completed' },
    { id: '2', status: 'failed' }
  ],

  // 实验结果数据
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
      conclusion: '实验验证了牛顿第二定律F=ma的关系'
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
      conclusion: '温度升高显著增加化学反应速率'
    }
  }
};

export default experimentFixtures;
