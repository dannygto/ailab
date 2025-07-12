// 模板测试数据
export const templateFixtures = {
  // 基础模板数据
  basicTemplates: [
    {
      id: 'template-001',
      name: '基础机械物理实验模板',
      subject: '物理',
      grade: 'high',
      difficulty: 'beginner',
      duration: 60,
      description: '适用于高中机械物理实验的通用模板',
      version: '1.0.0',
      author: '实验平台团队',
      createdAt: '2025-06-15T00:00:00Z',
      updatedAt: '2025-07-01T00:00:00Z',
      tags: ['物理', '机械', '基础', '高中'],
      category: 'physics_experiment',
      isPublic: true,
      downloadCount: 156,
      rating: 4.5,
      content: {
        objectives: [
          '理解基础物理概念',
          '掌握实验操作技能',
          '培养科学思维能力'
        ],
        materials: [
          '小球',
          '斜面板',
          '秒表器',
          '直尺',
          '垫块'
        ],
        procedures: [
          {
            step: 1,
            title: '准备阶段',
            description: '检查器材完整性，组装实验装置',
            duration: 10,
            safety: ['确保台面平稳', '小心尖锐器材']
          },
          {
            step: 2,
            title: '测量阶段',
            description: '进行多次测量并记录数据',
            duration: 40,
            safety: ['注意观察角度', '保持测量精度']
          },
          {
            step: 3,
            title: '数据分析',
            description: '整理实验数据，计算结果',
            duration: 10,
            safety: ['仔细核对数据', '注意计算精度']
          }
        ],
        assessmentCriteria: [
          {
            item: '实验操作',
            weight: 0.4,
            description: '实验操作的规范性和熟练程度'
          },
          {
            item: '数据记录',
            weight: 0.3,
            description: '数据记录的完整性和准确性'
          },
          {
            item: '结果分析',
            weight: 0.3,
            description: '对实验结果的分析和理解'
          }
        ]
      }
    },
    {
      id: 'template-002',
      name: '化学反应速率实验模板',
      subject: '化学',
      grade: 'middle',
      difficulty: 'intermediate',
      duration: 90,
      description: '探究化学反应速率影响因素的实验模板',
      version: '1.2.0',
      author: '化学教研组',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-06-28T00:00:00Z',
      tags: ['化学', '反应速率', '中级', '定量分析'],
      category: 'chemistry_experiment',
      isPublic: true,
      downloadCount: 89,
      rating: 4.2,
      content: {
        objectives: [
          '理解化学反应速率的概念',
          '探究影响反应速率的因素',
          '学会定量分析方法'
        ],
        materials: [
          '锌片',
          '盐酸溶液',
          '硫代硫酸钠',
          '量筒',
          '秒表',
          '温度计'
        ],
        procedures: [
          {
            step: 1,
            title: '实验准备',
            description: '配制不同浓度的溶液，准备实验器材',
            duration: 20,
            safety: ['佩戴防护眼镜', '注意酸液安全']
          },
          {
            step: 2,
            title: '温度对比实验',
            description: '在不同温度下测量反应速率',
            duration: 30,
            safety: ['小心热水烫伤', '控制加热温度']
          },
          {
            step: 3,
            title: '浓度对比实验',
            description: '使用不同浓度溶液测量反应速率',
            duration: 30,
            safety: ['避免溶液飞溅', '及时记录数据']
          },
          {
            step: 4,
            title: '数据整理',
            description: '计算反应速率，绘制图表',
            duration: 10,
            safety: ['仔细核对计算', '保存实验数据']
          }
        ],
        assessmentCriteria: [
          {
            item: '实验设计',
            weight: 0.25,
            description: '实验方案的科学性和可行性'
          },
          {
            item: '操作技能',
            weight: 0.35,
            description: '实验操作的准确性和安全性'
          },
          {
            item: '数据分析',
            weight: 0.25,
            description: '数据处理和结果分析的正确性'
          },
          {
            item: '报告撰写',
            weight: 0.15,
            description: '实验报告的完整性和逻辑性'
          }
        ]
      }
    }
  ],

  // 高级模板数据
  advancedTemplates: [
    {
      id: 'template-advanced-001',
      name: 'AI图像识别实验模板',
      subject: '人工智能',
      grade: 'college',
      difficulty: 'advanced',
      duration: 180,
      description: '使用深度学习进行图像分类的高级实验模板',
      version: '2.0.0',
      author: 'AI实验室',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-07-05T00:00:00Z',
      tags: ['AI', '机器学习', '图像识别', '深度学习'],
      category: 'ai_experiment',
      isPublic: true,
      downloadCount: 67,
      rating: 4.8,
      content: {
        objectives: [
          '理解卷积神经网络原理',
          '掌握图像预处理技术',
          '实现端到端的图像分类模型',
          '评估模型性能和优化策略'
        ],
        materials: [
          '高性能计算机',
          'Python环境',
          'TensorFlow/PyTorch框架',
          'CIFAR-10数据集',
          'GPU加速卡（可选）'
        ],
        procedures: [
          {
            step: 1,
            title: '环境配置',
            description: '安装深度学习框架和依赖库',
            duration: 30,
            safety: ['确保软件版本兼容', '备份重要数据']
          },
          {
            step: 2,
            title: '数据预处理',
            description: '加载数据集，进行标准化和增强',
            duration: 45,
            safety: ['验证数据完整性', '注意内存使用']
          },
          {
            step: 3,
            title: '模型构建',
            description: '设计和实现CNN网络架构',
            duration: 60,
            safety: ['逐步验证模型结构', '监控计算资源']
          },
          {
            step: 4,
            title: '训练和评估',
            description: '训练模型并评估性能指标',
            duration: 45,
            safety: ['监控训练过程', '保存模型检查点']
          }
        ],
        assessmentCriteria: [
          {
            item: '理论理解',
            weight: 0.2,
            description: '对深度学习理论的掌握程度'
          },
          {
            item: '代码实现',
            weight: 0.3,
            description: '代码的正确性和可读性'
          },
          {
            item: '模型性能',
            weight: 0.3,
            description: '模型的准确率和泛化能力'
          },
          {
            item: '创新思考',
            weight: 0.2,
            description: '对模型改进的思考和尝试'
          }
        ]
      }
    }
  ]
};

export default templateFixtures;
