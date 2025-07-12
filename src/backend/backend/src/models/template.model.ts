// 实验模板系统模型定义

// 实验模板难度级别
export enum TemplateDifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// 实验模板教育阶段
export enum TemplateGradeLevel {
  ELEMENTARY = 'elementary',
  MIDDLE = 'middle',
  HIGH = 'high',
  UNIVERSITY = 'university'
}

// 实验步骤
export interface TemplateStep {
  title: string;
  content: string;
  duration?: number; // 分钟
  imageUrl?: string;
}

// 实验材料
export interface TemplateMaterial {
  name: string;
  quantity: number;
  unit: string;
}

// 评估标准
export interface AssessmentCriterion {
  name: string;
  weight: number; // 百分比
}

// 相关资源
export interface RelatedResource {
  id: string;
  type: 'video' | 'document' | 'template' | 'external';
  title: string;
  url: string;
}

// 作者信息
export interface TemplateAuthor {
  id: string;
  name: string;
  title?: string;
}

// 实验模板接口
export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  subject: string;
  grade: TemplateGradeLevel;
  difficulty: TemplateDifficultyLevel;
  duration: number; // 分钟
  popularity: number; // 评分，1-5
  usageCount: number;
  author: TemplateAuthor;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  thumbnailUrl?: string;
  steps: TemplateStep[];
  materials?: TemplateMaterial[];
  learningObjectives?: string[];
  assessmentCriteria?: AssessmentCriterion[];
  relatedResourcesUrls?: string[];
}

// 模板搜索参数
export interface TemplateSearchParams {
  search?: string;
  subject?: string;
  grade?: TemplateGradeLevel;
  difficulty?: TemplateDifficultyLevel;
  tags?: string[];
  duration?: {
    min?: number;
    max?: number;
  };
}
