// ����ָ��ϵͳ���Ͷ���

// ѧϰ����״̬
export enum LearningProgressStatus {
  BEGINNING = 'beginning',
  PROGRESSING = 'progressing',
  ADVANCED = 'advanced',
  MASTERED = 'mastered'
}

// ָ����������
export enum GuidanceSuggestionType {
  CONCEPT = 'concept',
  PRACTICAL = 'practical',
  SAFETY = 'safety',
  NEXT_STEP = 'next_step',
  CORRECTION = 'correction',
  REINFORCEMENT = 'reinforcement'
}

// �����Դ
export interface GuidanceResource {
  id: string;
  type: 'video' | 'document' | 'template' | 'external';
  title: string;
  url: string;
}

// ָ������
export interface GuidanceSuggestion {
  id: string;
  type: GuidanceSuggestionType;
  title: string;
  content: string;
  importance: number; // 1-5
  triggerConditions?: {
    progressStatus?: LearningProgressStatus[];
    errorPatterns?: string[];
    timeTrigger?: boolean;
    manualTrigger?: boolean;
  };
  relatedResources?: GuidanceResource[];
  createdAt: string;
}

// ѧϰ����
export interface LearningProgress {
  studentId: string;
  subjectId: string;
  topicId: string;
  status: LearningProgressStatus;
  completedExperiments: string[];
  analyticsScores: {
    [analyticsId: string]: number;
  };
  lastUpdated: string;
}

// ʵ���ؼ�¼
export interface ExperimentMonitoringRecord {
  id: string;
  experimentId: string;
  studentId: string;
  timestamp: string;
  stage: string;
  metrics: {
    timeSpent: number; // ��
    completionPercentage: number;
    errorCount: number;
    attentionLevel?: number; // ��ѡ��ע����ˮƽ 1-5
  };
  observations: {
    type: 'system' | 'ai' | 'teacher';
    content: string;
    timestamp: string;
  }[];
}

// ָ���Ự����
export interface GuidanceInteraction {
  timestamp: string;
  source: 'student' | 'system' | 'teacher';
  type: 'question' | 'guidance' | 'feedback' | 'action';
  content: string;
  relatedStage?: string;
}

// ѧϰĿ��
export interface LearningObjective {
  id: string;
  description: string;
  achieved: boolean;
  evidence?: string;
}

// ָ���Ự
export interface GuidanceSession {
  id: string;
  studentId: string;
  experimentId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed';
  interactions: GuidanceInteraction[];
  learningObjectives: LearningObjective[];
}

// ����ָ������
export interface GuidanceSystemConfig {
  adaptiveAssistance: boolean;
  adaptationLevel: 'low' | 'medium' | 'high';
  autoSuggestions: boolean;
  safetyPrompts: boolean;
  showLearningPath: boolean;
  detailedFeedback: boolean;
}

// AIָ����������
export interface GenerateGuidanceRequest {
  experimentType: string;
  currentStage: string;
  context?: string;
  learningStatus?: string;
  studentId?: string;
  options?: {
    preferredType?: GuidanceSuggestionType;
    maxLength?: number;
    includeResources?: boolean;
  };
}

// AIָ����Ӧ
export interface AIGuidanceResponse {
  id: string;
  type: GuidanceSuggestionType;
  title: string;
  guidance: string;
  timestamp: string;
  sessionId: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  relatedResources?: GuidanceResource[];
}
