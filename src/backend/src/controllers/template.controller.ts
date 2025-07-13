import { Request, Response } from 'express';
import {
  ExperimentTemplate,
  TemplateDifficultyLevel,
  TemplateGradeLevel,
  TemplateSearchParams
} from '../models/template.model.js';

// 模拟数据存储
const templates: Map<string, ExperimentTemplate> = new Map();

// 初始化一些示例模板
function initializeTemplates() {
  const sampleTemplates: ExperimentTemplate[] = [
    {
      id: '1',
      name: '磁铁性质探究实验',
      description: '本实验通过观察与测试，探究磁铁的基本性质、磁极特性以及磁场分布规律',
      detailedDescription: `
        # 磁铁性质探究实验

        ## 实验目的
        1. 探究磁铁的基本性质
        2. 掌握磁极间相互作用规律
        3. 观察磁力线分布特点
        4. 了解磁铁在日常生活中的应用

        ## 实验原理
        磁铁是具有吸引铁、钴、镍等铁磁性物质能力的物体，它的磁性表现为在其周围产生磁场。磁铁具有两个磁极——北极（N极）和南极（S极）。同名磁极相互排斥，异名磁极相互吸引。

        ## 安全注意事项
        1. 使用大型磁铁时注意手指安全，防止夹伤
        2. 保持磁铁远离精密电子设备和磁卡
        3. 小心处理易碎实验器材
      `,
      subject: '物理',
      grade: TemplateGradeLevel.MIDDLE,
      difficulty: TemplateDifficultyLevel.BEGINNER,
      duration: 45,
      popularity: 4.7,
      usageCount: 1289,
      author: {
        id: '101',
        name: '张教授',
        title: '特级教师'
      },
      createdAt: '2025-01-05T08:30:00Z',
      updatedAt: '2025-05-10T14:15:00Z',
      tags: ['磁学', '物理实验', '初中物理', '磁铁', '科学探究'],
      thumbnailUrl: '/assets/templates/magnet-experiment.jpg',
      steps: [
        {
          title: '实验准备',
          content: '准备条形磁铁、指南针、铁粉、纸片、铁钉、铝片、木块等材料',
          duration: 5,
          imageUrl: '/assets/steps/preparation.jpg'
        },
        {
          title: '磁极判断',
          content: '使用指南针判断条形磁铁的南北极，观察并记录指南针指针的偏转情况',
          duration: 10,
          imageUrl: '/assets/steps/magnet-poles.jpg'
        },
        {
          title: '磁力探究',
          content: '探究磁力大小与距离的关系，记录不同距离下吸引到的回形针数量',
          duration: 15,
          imageUrl: '/assets/steps/magnetic-force.jpg'
        },
        {
          title: '磁场可视化',
          content: '在磁铁上覆盖一张白纸，撒上铁粉，轻轻敲打纸张，观察铁粉形成的磁力线图案',
          duration: 10,
          imageUrl: '/assets/steps/magnetic-field.jpg'
        },
        {
          title: '数据分析',
          content: '整理实验数据，分析磁力与距离的关系，绘制磁力-距离关系图',
          duration: 5,
          imageUrl: '/assets/steps/data-analysis.jpg'
        }
      ],
      materials: [
        { name: '条形磁铁', quantity: 2, unit: '根' },
        { name: '指南针', quantity: 1, unit: '个' },
        { name: '铁粉', quantity: 50, unit: '克' },
        { name: '白纸', quantity: 5, unit: '张' },
        { name: '回形针', quantity: 20, unit: '个' },
        { name: '铁钉', quantity: 10, unit: '个' },
        { name: '铝片', quantity: 2, unit: '片' },
        { name: '木块', quantity: 2, unit: '块' },
        { name: '秒表', quantity: 1, unit: '个' }
      ],
      learningObjectives: [
        '理解磁铁的基本特性及磁极规律',
        '掌握使用指南针确定磁极的方法',
        '认识磁力与距离的关系',
        '了解磁场概念及磁力线分布特点',
        '学会设计控制变量的科学实验'
      ],
      assessmentCriteria: [
        { name: '实验操作规范性', weight: 25 },
        { name: '数据记录准确性', weight: 20 },
        { name: '结果分析合理性', weight: 25 },
        { name: '实验报告完整性', weight: 20 },
        { name: '团队合作与参与度', weight: 10 }
      ],
      relatedResourcesUrls: [
        'https://www.youtube.com/watch?v=example1',
        'https://www.sciencedirect.com/topics/physics/magnetism',
        'https://www.physicsclassroom.com/class/magnetism'
      ]
    },
    {
      id: '2',
      name: '植物细胞观察实验',
      description: '通过显微镜观察植物细胞结构，理解细胞的基本组成和功能',
      subject: '生物',
      grade: TemplateGradeLevel.MIDDLE,
      difficulty: TemplateDifficultyLevel.INTERMEDIATE,
      duration: 60,
      popularity: 4.5,
      usageCount: 950,
      author: {
        id: '102',
        name: '李博士',
        title: '高级教师'
      },
      createdAt: '2025-02-12T10:20:00Z',
      updatedAt: '2025-05-15T11:30:00Z',
      tags: ['植物学', '细胞结构', '显微镜使用', '初中生物'],
      thumbnailUrl: '/assets/templates/plant-cell.jpg',
      steps: [
        {
          title: '材料准备',
          content: '准备显微镜、载玻片、盖玻片、洋葱、碘液等'
        },
        {
          title: '制作临时装片',
          content: '制作洋葱表皮细胞临时装片'
        },
        {
          title: '显微观察',
          content: '在显微镜下观察细胞结构并记录'
        }
      ]
    },
    {
      id: '3',
      name: '化学反应速率测定实验',
      description: '研究影响化学反应速率的因素，包括浓度、温度、催化剂等',
      subject: '化学',
      grade: TemplateGradeLevel.HIGH,
      difficulty: TemplateDifficultyLevel.ADVANCED,
      duration: 90,
      popularity: 4.8,
      usageCount: 720,
      author: {
        id: '103',
        name: '王研究员',
        title: '学科带头人'
      },
      createdAt: '2025-03-20T14:10:00Z',
      updatedAt: '2025-06-01T09:45:00Z',
      tags: ['化学反应', '反应动力学', '高中化学', '高级实验'],
      thumbnailUrl: '/assets/templates/chemical-kinetics.jpg',
      steps: [
        {
          title: '实验设计',
          content: '设计对照实验研究不同因素对反应速率的影响'
        },
        {
          title: '数据收集',
          content: '使用计时器记录反应时间，通过颜色变化观察反应进度'
        },
        {
          title: '数据分析',
          content: '绘制反应速率曲线并分析影响因素'
        }
      ]
    },
    {
      id: '4',
      name: '简单电路搭建实验',
      description: '通过动手搭建简单电路，理解电路的基本原理和串并联电路的特点',
      subject: '物理',
      grade: TemplateGradeLevel.ELEMENTARY,
      difficulty: TemplateDifficultyLevel.BEGINNER,
      duration: 45,
      popularity: 4.9,
      usageCount: 2150,
      author: {
        id: '104',
        name: '陈老师',
        title: '高级教师'
      },
      createdAt: '2025-01-15T11:20:00Z',
      updatedAt: '2025-04-20T15:30:00Z',
      tags: ['电学', '电路', '小学科学', '入门实验'],
      thumbnailUrl: '/assets/templates/simple-circuit.jpg',
      steps: [
        {
          title: '材料准备',
          content: '准备电池、导线、小灯泡、开关等材料'
        },
        {
          title: '电路连接',
          content: '按图示连接简单电路'
        },
        {
          title: '电路测试',
          content: '测试电路并观察灯泡亮度变化'
        }
      ]
    }
  ];

  // 将示例模板添加到Map中
  sampleTemplates.forEach(template => {
    templates.set(template.id, template);
  });
}

// 初始化示例数据
initializeTemplates();

export class TemplateController {
  // 获取所有模板
  public getAllTemplates = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      // 获取所有模板
      const allTemplates = Array.from(templates.values());

      // 应用搜索过滤
      const filteredTemplates = allTemplates.filter(template => {
        if (!search) return true;

        const searchLower = search.toLowerCase();
        return (
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.subject.toLowerCase().includes(searchLower) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });

      // 分页
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

      // 返回结果
      res.json({
        success: true,
        data: {
          data: paginatedTemplates,
          total: filteredTemplates.length,
          page,
          limit,
          totalPages: Math.ceil(filteredTemplates.length / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '获取模板列表失败'
      });
    }
  };

  // 获取单个模板
  public getTemplateById = (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // 查找对应ID的模板
      const template = templates.get(id);

      if (template) {
        res.json({
          success: true,
          data: template
        });
      } else {
        res.status(404).json({
          success: false,
          message: '未找到请求的实验模板'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '获取模板详情失败'
      });
    }
  };

  // 创建新模板
  public createTemplate = (req: Request, res: Response) => {
    try {
      const newTemplate = req.body;

      // 验证必要字段
      if (!newTemplate.name || !newTemplate.description || !newTemplate.subject || !newTemplate.grade) {
        return res.status(400).json({
          success: false,
          message: '缺少必要字段'
        });
      }

      // 生成一个随机ID
      const templateId = 'tmpl-' + Math.floor(Math.random() * 10000);

      // 设置创建和更新时间
      const now = new Date().toISOString();

      // 创建完整的模板对象
      const completeTemplate: ExperimentTemplate = {
        id: templateId,
        name: newTemplate.name,
        description: newTemplate.description,
        detailedDescription: newTemplate.detailedDescription,
        subject: newTemplate.subject,
        grade: newTemplate.grade,
        difficulty: newTemplate.difficulty || TemplateDifficultyLevel.BEGINNER,
        duration: newTemplate.duration || 60,
        popularity: 0,
        usageCount: 0,
        author: newTemplate.author || {
          id: 'system',
          name: '系统管理员'
        },
        createdAt: now,
        updatedAt: now,
        tags: newTemplate.tags || [],
        thumbnailUrl: newTemplate.thumbnailUrl,
        steps: newTemplate.steps || [],
        materials: newTemplate.materials,
        learningObjectives: newTemplate.learningObjectives,
        assessmentCriteria: newTemplate.assessmentCriteria,
        relatedResourcesUrls: newTemplate.relatedResourcesUrls
      };

      // 保存到模拟数据库
      templates.set(templateId, completeTemplate);

      res.status(201).json({
        success: true,
        message: '实验模板创建成功',
        data: completeTemplate
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '创建模板失败'
      });
    }
  };

  // 更新模板
  public updateTemplate = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedTemplate = req.body;

      // 检查模板是否存在
      if (!templates.has(id)) {
        return res.status(404).json({
          success: false,
          message: '未找到指定的实验模板'
        });
      }

      // 获取现有模板
      const existingTemplate = templates.get(id)!;

      // 更新模板
      const mergedTemplate: ExperimentTemplate = {
        ...existingTemplate,
        ...updatedTemplate,
        id, // 确保ID不变
        updatedAt: new Date().toISOString()
      };

      // 保存更新后的模板
      templates.set(id, mergedTemplate);

      res.json({
        success: true,
        message: '实验模板更新成功',
        data: mergedTemplate
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '更新模板失败'
      });
    }
  };

  // 删除模板
  public deleteTemplate = (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // 检查模板是否存在
      if (!templates.has(id)) {
        return res.status(404).json({
          success: false,
          message: '未找到指定的实验模板'
        });
      }

      // 从模拟数据库中删除
      templates.delete(id);

      res.json({
        success: true,
        message: '实验模板删除成功',
        data: { id }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '删除模板失败'
      });
    }
  };

  // 搜索模板
  public searchTemplates = (req: Request, res: Response) => {
    try {
      const searchParams: TemplateSearchParams = req.body;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // 获取所有模板
      const allTemplates = Array.from(templates.values());

      // 应用复杂搜索过滤
      const filteredTemplates = allTemplates.filter(template => {
        // 文本搜索
        if (searchParams.search) {
          const searchLower = searchParams.search.toLowerCase();
          const textMatch =
            template.name.toLowerCase().includes(searchLower) ||
            template.description.toLowerCase().includes(searchLower) ||
            template.subject.toLowerCase().includes(searchLower) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchLower));

          if (!textMatch) return false;
        }

        // 学科过滤
        if (searchParams.subject && template.subject !== searchParams.subject) {
          return false;
        }

        // 年级过滤
        if (searchParams.grade && template.grade !== searchParams.grade) {
          return false;
        }

        // 难度过滤
        if (searchParams.difficulty && template.difficulty !== searchParams.difficulty) {
          return false;
        }

        // 标签过滤
        if (searchParams.tags && searchParams.tags.length > 0) {
          const hasAllTags = searchParams.tags.every(tag =>
            template.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
          );
          if (!hasAllTags) return false;
        }

        // 时长过滤
        if (searchParams.duration) {
          if (searchParams.duration.min !== undefined && template.duration < searchParams.duration.min) {
            return false;
          }
          if (searchParams.duration.max !== undefined && template.duration > searchParams.duration.max) {
            return false;
          }
        }

        return true;
      });

      // 分页
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

      // 返回结果
      res.json({
        success: true,
        data: {
          data: paginatedTemplates,
          total: filteredTemplates.length,
          page,
          limit,
          totalPages: Math.ceil(filteredTemplates.length / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '搜索模板失败'
      });
    }
  };

  // 获取热门模板
  public getPopularTemplates = (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      // 获取所有模板
      const allTemplates = Array.from(templates.values());

      // 按使用次数和受欢迎程度排序
      const sortedTemplates = allTemplates.sort((a, b) => {
        // 首先按使用次数排序
        const usageDiff = b.usageCount - a.usageCount;
        if (usageDiff !== 0) return usageDiff;

        // 其次按受欢迎程度排序
        return b.popularity - a.popularity;
      });

      // 获取前N个
      const popularTemplates = sortedTemplates.slice(0, limit);

      res.json({
        success: true,
        data: popularTemplates
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || '获取热门模板失败'
      });
    }
  };
}

export const templateController = new TemplateController();
