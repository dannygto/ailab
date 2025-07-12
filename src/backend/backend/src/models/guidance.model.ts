// 智能指导系统模型定义
// 定义智能指导相关的数据类型和接口

// 学习进度类型
export enum LearningProgressStatus {
  BEGINNING = 'beginning',
  PROGRESSING = 'progressing',
  ADVANCED = 'advanced',
  MASTERED = 'mastered'
}

// 学习进度记录
export interface LearningProgress {
  studentId: string;
  subjectId: string;
  topicId: string;
  status: LearningProgressStatus;
  completedExperiments: string[];
  assessmentScores: {
    [assessmentId: string]: number;
  };
  lastUpdated: string; // ISO日期字符串
}

// 指导建议类型
export enum GuidanceSuggestionType {
  CONCEPT = 'concept',
  PRACTICAL = 'practical',
  SAFETY = 'safety',
  NEXT_STEP = 'next_step',
  CORRECTION = 'correction',
  REINFORCEMENT = 'reinforcement'
}

// 指导建议
export interface GuidanceSuggestion {
  id: string;
  type: GuidanceSuggestionType;
  title: string;
  content: string;
  importance: number; // 1-5
  triggerConditions: {
    progressStatus?: LearningProgressStatus[];
    errorPatterns?: string[];
    timeTrigger?: boolean;
    manualTrigger?: boolean;
  };
  relatedResources?: {
    id: string;
    type: 'video' | 'document' | 'template' | 'external';
    title: string;
    url: string;
  }[];
  createdAt: string;
}

// 实验监控记录
export interface ExperimentMonitoringRecord {
  id: string;
  experimentId: string;
  studentId: string;
  timestamp: string;
  stage: string;
  metrics: {
    timeSpent: number; // 秒
    completionPercentage: number;
    errorCount: number;
    attentionLevel?: number; // 可选，注意力水平 1-5
  };
  observations: {
    type: 'system' | 'ai' | 'teacher';
    content: string;
    timestamp: string;
  }[];
}

// 智能指导会话
export interface GuidanceSession {
  id: string;
  studentId: string;
  experimentId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed';
  interactions: {
    timestamp: string;
    source: 'student' | 'system' | 'teacher';
    type: 'question' | 'guidance' | 'feedback' | 'action';
    content: string;
    relatedStage?: string;
  }[];
  learningObjectives: {
    id: string;
    description: string;
    achieved: boolean;
    evidence?: string;
  }[];
}

// 实验错误模式
export interface ExperimentErrorPattern {
  id: string;
  experimentType: string;
  pattern: string; // 错误描述或正则表达式
  frequency: number; // 出现频率
  suggestedCorrections: {
    description: string;
    difficulty: number; // 1-5，纠正难度
  }[];
  preventionTips: string[];
}

// 自适应指导策略
export interface AdaptiveGuidanceStrategy {
  id: string;
  name: string;
  targetProgress: LearningProgressStatus[];
  triggerConditions: {
    timeBasedTriggers?: {
      minimumDuration: number; // 秒
      maximumDuration: number; // 秒
      intervalBetweenGuidance: number; // 秒
    };
    errorBasedTriggers?: {
      errorCount: number;
      errorTypes: string[];
    };
    progressBasedTriggers?: {
      stuckDuration: number; // 秒
      noProgressDuration: number; // 秒
    };
  };
  guidanceContent: {
    type: GuidanceSuggestionType;
    contentTemplate: string;
    priorityLevel: number; // 1-5
    relatedConcepts?: string[];
  }[];
}
