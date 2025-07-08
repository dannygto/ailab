// ǰ�����Ͷ���

// �û��������
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  educationLevel?: 'primary_SchoolIcon' | 'middle_SchoolIcon' | 'high_SchoolIcon' | 'undergraduate' | 'graduate' | 'other';
  preferences?: {
    subjectAreas?: string[];
    experimentTypes?: string[];
    aiAssistance?: boolean;
  };
}

export type UserRole = 'student' | 'teacher' | 'admin';

// AI�����������
export interface chatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    experimentId?: string;
    imageUrl?: string;
    code?: string;
    suggestions?: string[];
    experimentRecommendations?: any[];
    codeExamples?: any[];
  };
}

export interface chatSession {
  id: string;
  title: string;
  messages: chatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AIAssistantResponse {
  message: string;
  suggestions?: Array<{
    text: string;
    CategoryIcon?: string;
  }>;
  experimentRecommendations?: ExperimentRecommendation[];
  codeExamples?: CodeExample[];
  attachments?: Array<{
    type: 'image' | 'file' | 'experiment_result' | 'code';
    url?: string;
    data?: any;
    title?: string;
  }>;
}

export interface ExperimentRecommendation {
  type: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  parameters: any;
}

export interface CodeExample {
  LanguageIcon: string;
  code: string;
  description: string;
}

// ʵ��������� - ���ݴ�ͳʵ���K12ʵ��
export interface Experiment {
  id: string;
  name: string;
  title?: string; // K12ʵ�����
  description: string;
  type: ExperimentType;
  status: ExperimentStatus;
  userId: string;
  templateId?: string;
  parameters: any; // ʹ�þ������� ExperimentParameters
  data: any; // ʹ�þ������� ExperimentData
  results: any; // ʹ�þ������� ./ExperimentResults
  metadata: any; // ʹ�þ������� ExperimentMetadata
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // K12ʵ��ר���ֶΣ���ѡ��
  grade?: K12Grade;
  subject?: K12Subject;
  safetyLevel?: SafetyLevel;
  duration?: number;
  materials?: string[];
  objectives?: string[];
  procedures?: string[];
  safetyNotes?: string[];
  curriculumStandard?: string;
  tags?: string[];
  difficulty?: 1 | 2 | 3 | 4 | 5;
  isGroupWork?: boolean;
  requiresSupervision?: boolean;
}

// K12ʵ�����Ͷ��� - �ϸ���Ϲ��ҿγ̱�׼
export type ExperimentType = 
  // === K12ʵ�����ͣ���ʵ�����ʷ��ࣩ ===
  | 'observation'    // �۲�ʵ��
  | 'measurement'    // ����ʵ��
  | 'comparison'     // �Ա�ʵ��
  | 'exploration'    // ̽��ʵ��
  | 'design'         // �������
  | 'analysis'       // ����ʵ��
  | 'synthesis'      // �ۺ�ʵ��
  | 'custom';        // �Զ���ʵ��

// K12ѧ��ö��
export type K12Grade = 'primary' | 'junior' | 'senior';

// K12ѧ��ö��  
export type K12Subject = 
  | 'ScienceIcon'        // ��ѧ��Сѧ�ۺϿ�ѧ��
  | 'physics'        // ����
  | 'chemistry'      // ��ѧ
  | 'biology'        // ����
  | 'mathematics'    // ��ѧ
  | 'chinese'        // ����
  | 'english'        // Ӣ��
  | 'geography'      // ����
  | 'labor'          // �Ͷ�����
  | 'technology'     // ��Ϣ�Ƽ�
  | 'general_tech';  // ͨ�ü���

// ʵ�鰲ȫ�ȼ�
export type SafetyLevel = 'low' | 'medium' | 'high';

// K12ʵ��ӿڣ���ʵ����Դ����һ�£�
export interface K12Experiment {
  id: string;
  title: string;
  description: string;
  grade: K12Grade;
  subject: K12Subject;
  type: ExperimentType;
  safetyLevel: SafetyLevel;
  duration: number;
  materials: string[];
  objectives: string[];
  procedures: string[];
  safetyNotes: string[];
  curriculumStandard: string;
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  isGroupWork: boolean;
  requiresSupervision: boolean;
}

// �ս̰�֧�ֵ�ʵ������
export const K12_EXPERIMENT_TYPES: ExperimentType[] = [
  'observation',
  'measurement', 
  'comparison',
  'exploration',
  'design',
  'analysis',
  'synthesis',
  'custom'
];

// K12ѧ�ζ�Ӧ��ѧ��
export const GRADE_SUBJECTS = {
  primary: ['ScienceIcon', 'mathematics', 'chinese', 'english', 'labor', 'technology'],
  junior: ['physics', 'chemistry', 'biology', 'mathematics', 'chinese', 'english', 'geography', 'labor', 'technology'],
  senior: ['physics', 'chemistry', 'biology', 'mathematics', 'chinese', 'english', 'geography', 'general_tech', 'technology']
} as const;

// ������ʾ����
export const GRADE_LABELS = {
  primary: 'Сѧ',
  junior: '����', 
  senior: '����'
} as const;

export const SUBJECT_LABELS = {
  ScienceIcon: '��ѧ',
  physics: '����',
  chemistry: '��ѧ',
  biology: '����',
  mathematics: '��ѧ',
  chinese: '����',
  english: 'Ӣ��',
  geography: '����',
  labor: '�Ͷ�����',
  technology: '��Ϣ�Ƽ�',
  general_tech: 'ͨ�ü���'
} as const;

export const TYPE_LABELS = {
  observation: '�۲�ʵ��',
  measurement: '����ʵ��',
  comparison: '�Ա�ʵ��',
  exploration: '̽��ʵ��',
  design: '�������',
  analysis: '����ʵ��',
  synthesis: '�ۺ�ʵ��',
  custom: '�Զ���ʵ��'
} as const;

export type ExperimentStatus = 
  | 'draft'
  | 'ready'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'stopped'
  | 'CancelIconled'
  | 'pending'; // ���� stopped �� pending ״̬

// ʵ��������� - ��չΪ֧�ֶ�ѧ��ʵ��
export interface ExperimentParameters {
  // ʵ�鷽�����
  experimentMethod?: string;           // ʵ�鷽��/ģ������
  experimentResource?: string;         // ʵ����Դ/���ݼ�
  
  // AI�������
  aiAssistance?: string[];            // ѡ���AI��������
  aiAssistanceLevel?: 'basic' | 'standard' | 'advanced'; // AI��������
  
  // ʵ������
  duration?: number;                  // ʵ��Ԥ��ʱ��(����)
  groupSize?: number;                 // ʵ��С������
  safetyLevel?: 'low' | 'medium' | 'high'; // ��ȫ�ȼ�
  
  // AIģ�Ͳ���(����ԭ�в���)
  modelType?: string;
  dataset?: string;
  batchSize?: number;
  learningRate?: number;
  epochs?: number;
  validationSplit?: number;
  optimizer?: string;
  lossFunction?: string;
  metrics?: string[];
  model?: string;
  dataAugmentation?: boolean | object;
  
  // ʵ���ض�����
  subjectSpecificParams?: {           // ѧ���ض�����
    physics?: PhysicsExperimentParams;
    chemistry?: ChemistryExperimentParams;
    biology?: BiologyExperimentParams;
    EngineeringIcon?: EngineeringIconExperimentParams;
    [key: string]: any;
  };
  
  [key: string]: any; // ����������������
}

// ����ʵ���ض�����
export interface PhysicsExperimentParams {
  measurementInterval?: number;       // �������(��)
  sampleCount?: number;               // ��������
  equipmentPrecision?: string;        // �豸���ȼ���
  environmentalControl?: boolean;     // ��������
}

// ��ѧʵ���ض�����
export interface ChemistryExperimentParams {
  reagents?: string[];                // �Լ��б�
  concentration?: number[];           // Ũ���б�
  temperature?: number;               // �¶�(��)
  pressureControl?: boolean;          // ѹǿ����
}

// ����ʵ���ض�����
export interface BiologyExperimentParams {
  specimenType?: string;              // ��������
  observationMethod?: string;         // �۲췽��
  staining?: boolean;                 // Ⱦɫ����
  incubationTime?: number;            // ����ʱ��(Сʱ)
}

// ����ʵ���ض�����
export interface EngineeringIconExperimentParams {
  testConditions?: string[];          // ��������
  loadingProfile?: string;            // ��������
  samplingRate?: number;              // ������
  calibration?: boolean;              // У׼����
}

export interface ExperimentData {
  // ʵ����Դ���
  resourceType?: 'physical' | 'virtual' | 'hybrid'; // ��Դ����
  equipment?: string[];              // �豸�嵥
  software?: string[];               // ��������
  materials?: string[];              // �Ĳ��嵥
  
  // ������Դ
  dataSource?: 'realtime' | 'prerecorded' | 'simulation'; // ������Դ����
  dataFormat?: string;               // ���ݸ�ʽ
  
  // AIģ���������(����ԭ���ֶ�)
  datasetPath?: string;
  datasetSize?: number;
  inputShape?: number[];
  outputShape?: number[];
  preprocessing?: DataPreprocessing;
  augmentation?: DataAugmentation;
  datasetId?: string;
  trainSplit?: number;
  valSplit?: number;
  testSplit?: number;
  numClasses?: number;
  
  // ʵ�����ݲɼ�����
  acquisitionConfig?: {
    sampleRate?: number;             // ������
    duration?: number;               // �ɼ�ʱ��
    channels?: string[];             // �ɼ�ͨ��
    triggerCondition?: string;       // ��������
  };
  
  // ѧ���ض�����
  subjectData?: {
    [key: string]: any;              // ��ͬѧ���ض�����
  };
  
  [key: string]: any; // ����������������
}

export interface DataPreprocessing {
  normalization: boolean;
  resize?: number[];
  grayscale?: boolean;
  mean?: number[];
  std?: number[];
}

export interface DataAugmentation {
  rotation?: number;
  zoom?: number;
  flip?: boolean;
  brightness?: number;
  contrast?: number;
}

export interface ExperimentResults {
  // ͨ�ý��
  status: 'success' | 'partial' | 'failed'; // ʵ����״̬
  completionRate: number;            // ��ɶ�(0-1)
  duration: number;                  // ʵ�ʻ���ʱ��(����)
  
  // ʵ������
  measurements?: {                    // ��������
    [key: string]: number[] | string[] | boolean[];  // ���ֲ������
  };
  observations?: string[];            // ʵ�������¼
  
  // ʵ��������
  analysis?: {
    statistics?: Record<string, number>; // ͳ�ƽ��
    correlations?: Record<string, number>; // ����Է���
    trends?: any[];                    // ���Ʒ���
    anomalies?: any[];                 // �쳣�����
  };
  
  // AI�����������
  aiAnalysis?: {
    insights?: string[];               // AI����
    recommendations?: string[];       // �Ľ�����
    automatedFindings?: any[];         // �Զ�����
  };
  
  // ʵ���������
  processData?: {
    timeline?: any[];                  // ʵ�����ʱ����
    environmentalFactors?: Record<string, any>; // �������ؼ�¼
    interventions?: any[];             // ʵ���Ԥ��¼
  };
  
  // AIģ��ѵ�����(����ԭ���ֶ�)
  trainingHistory?: TrainingHistory;
  modelPath?: string;
  modelSize?: number;
  accuracy?: number;
  loss?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  confusionMatrix?: number[][];
  classificationReport?: any;
  predictions?: any[];
  groundTruth?: any[];
  
  // ѧ���ض����
  subjectResults?: {
    physics?: PhysicsExperimentResults;
    chemistry?: ChemistryExperimentResults;
    biology?: BiologyExperimentResults;
    [key: string]: any;                // ����ѧ�ƽ��
  };
  
  report?: ExperimentReport;
  [key: string]: any; // ����������������
}

// ����ʵ����
export interface PhysicsExperimentResults {
  measurements: Record<string, number[]>;  // �������������
  calculatedValues: Record<string, number>; // ����ֵ
  errorAnalysis: {
    systematicErrors: string[];
    randomErrors: number;
    uncertainties: Record<string, number>;
  };
}

// ��ѧʵ����
export interface ChemistryExperimentResults {
  reactions: {
    observed: string[];
    expected: string[];
    yield?: number;
  };
  compounds: {
    identified: string[];
    concentrations: Record<string, number>;
  };
  analysis: {
    pH?: number[];
    spectrumData?: any;
    chromatographyResults?: any;
  };
}

// ����ʵ����
export interface BiologyExperimentResults {
  specimens: {
    count: number;
    classification: Record<string, number>;
  };
  observations: {
    macro: string[];
    micro: string[];
    timeSequence: any[];
  };
  measurements: {
    growth?: number[];
    vitals?: Record<string, number[]>;
    environmental?: Record<string, number[]>;
  };
}

export interface TrainingHistory {
  loss: number[];
  accuracy: number[];
  valLoss: number[];
  valAccuracy: number[];
  epochs: number[];
}

export interface ExperimentReport {
  // ������Ϣ
  title: string;
  authors?: string[];
  date: Date;
  summary: string;
  
  // �ṹ������
  sections: {
    introduction?: {
      purpose: string;
      background?: string;
      hypotheses?: string[];
    };
    methodology: {
      equipment: string[];
      procedures: string[];
      experimentalSetup?: string;
      variables?: {
        independent?: string[];
        dependent?: string[];
        controlled?: string[];
      };
    };
    results: {
      dataCollected: string;
      keyFindings: string[];
      dataAnalysis: string;
    };
    discussion: {
      interpretation: string;
      comparisonToTheory?: string;
      limitationsAndErrors?: string[];
      recommendations: string[];
    };
    conclusion: string;
    references?: string[];
  };
  
  // ���ӻ�����
  charts: ChartData[];
  metrics: Record<string, number>;
  
  // AI����
  aiContributions?: {
    dataAnalysisInsights?: string[];
    interpretationAssistance?: string[];
    literatureConnections?: string[];
    improvementSuggestions?: string[];
  };
}

export interface ChartData {
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'radar' | 'heatmap' | 'confusion_matrix' | 'histogram';
  title: string;
  description?: string;
  data: any;
  options?: any;
  labels?: {
    xAxis?: string;
    yAxis?: string;
    series?: string[];
  };
}

export interface ExperimentMetadata {
  // ����Ԫ����
  version?: string;
  CategoryIcon?: 'elementary' | 'middle' | 'high' | 'undergraduate' | 'graduate'; // �����׶�
  subjectArea?: string;              // ѧ������
  educationalStandards?: string[];   // ������׼
  
  // ʵ�����
  experimentCategory?: string;       // ʵ�����
  difficultyLevel?: 'basic' | 'intermediate' | 'advanced'; // �Ѷȼ���
  estimatedDuration?: number;        // Ԥ��ʱ��(����)
  prerequisiteKnowledge?: string[];  // ����֪ʶ
  
  // ��ѧ��Ϣ
  learningObjectives?: string[];     // ѧϰĿ��
  keyConceptsCovered?: string[];     // �ؼ�����
  analyticsCriteria?: string[];     // ���۱�׼
  
  // AI������Ϣ
  aiAssistanceUsed?: string[];       // ʹ�õ�AI��������
  aiContributions?: string[];        // AI���׵�
  
  // ϵͳ������Ϣ
  framework?: string;
  hardware?: HardwareInfo;
  environment?: EnvironmentInfo;
  tags?: string[];
  notes?: string;
  progress?: number;                 // ʵ����ȣ�0-1֮�����ֵ
  device?: string;                   // �����豸 (cpu, gpu, tpu��)
  runTime?: number; // ����ʱ��(��)
  startTime?: Date; // ��ʼʱ��
  logs?: ExperimentLog[]; // ��־��¼
  [key: string]: any; // ����������������
}

export interface ExperimentLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  data?: any;
}

// ʵ��ģ��
export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  type: ExperimentType;
  subject: K12Subject | string;
  CategoryIcon?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  grade: 'elementary' | 'middle' | 'high' | 'university';
  duration: number;
  steps: TemplateStep[];
  materials: TemplateMaterial[];
  tags: string[];
  thumbnailUrl: string;
  isPublic: boolean;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
  popularity?: number;
  rating?: number;
  ratingsCount?: number;
  timesUsed?: number;
  objectives?: string[];
  prerequisites?: string[];
  safetyNotes?: string[];
  expectedResults?: string;
  relatedResources?: string[];
}

export interface TemplateStep {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  materials?: string[];
  images?: string[];
  videoUrl?: string;
  note?: string;
  isOptional?: boolean;
  requiresVerification?: boolean;
  safetyWarning?: string;
  expectedResults?: string;
  alternativeApproaches?: string[];
  tips?: string[];
}

export interface TemplateMaterial {
  id: string;
  name: string;
  description: string;
  quantity: string;
  type: 'required' | 'optional' | 'alternative';
  imageUrl?: string;
  CategoryIcon?: string;
  safetyNotes?: string;
  substitutes?: string[];
}

// ģ��汾����
export interface TemplateVersion {
  id: string;
  templateId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  changeLog: string;
  isCurrentVersion: boolean;
}

// ģ��汾����
export interface TemplateVersionData {
  version: TemplateVersion;
  template: ExperimentTemplate;
  differences?: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

// ģ�����
export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  templateCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ģ���ǩ
export interface TemplateTag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  usageCount: number;
  isPopular: boolean;
  createdAt: string;
  CategoryIcon?: string;
}

// ģ���������
export interface TemplateAnalytics {
  id: string;
  templateId: string;
  views: number;
  downloads: number;
  completions: number;
  rating: number;
  averageRating: number; // ��������
  ratingsCount: number;
  usageCount: number; // ��������
  favoriteCount: number; // ��������
  successRate: number; // ��������
  averageCompletionTime: number;
  popularityScore: number;
  usageByDay: Array<{
    date: string;
    views: number;
    downloads: number;
    completions: number;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  demographicStats: {
    gradeDistribution: Record<string, number>;
    subjectDistribution: Record<string, number>;
    difficultyPreference: Record<string, number>;
  };
  lastUpdated: string;
}

// �߼���������
export interface AdvancedTemplateSearchParams {
  query: string;
  type?: string;
  difficulty?: string;
  grade?: string;
  categories: string[];
  tags: string[];
  authorIds: string[];
  minRating?: number;
  createdAfter?: string;
  createdBefore?: string;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// api��Ӧ����
export interface apiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | { message: any; code: any; };
  code?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  items: T[]; // ����������
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ģ�������������
export type TemplateDifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type TemplateGradeLevel = 'elementary' | 'middle' | 'high' | 'university';

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
  page?: number;
  limit?: number;
}

// �Ǳ���ͳ������
export interface DashboardStats {
  totalExperiments: number;
  runningExperiments: number;
  completedExperiments: number;
  failedExperiments?: number; // ��������
  totalUsers?: number; // ��������
  activeUsers?: number; // ��������
  totaldevices: number;
  activedevices: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastCheckIcon: string;
    services: Record<string, boolean>;
    cpu: number;
    MemoryIcon: number;
    disk: number;
  };
}

// �豸�������
export interface DeviceDataPoint {
  id?: string;
  deviceId?: string;
  timestamp: string | Date;
  metrics: Record<string, number>;
  metadata?: Record<string, any>;
  // ����������
  sensortype?: string;
  value?: number | string | boolean;
  unit?: string;
  quality?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  batteryLevel?: number;
  signalStrength?: number;
}

export interface DeviceCommand {
  id: string;
  deviceId: string;
  command: string;
  parameters?: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'sent' | 'executed';
  result?: any;
  error?: string;
  errorMessage?: string; // ����������
  executedAt?: string; // ����������
}

export interface DeviceReservation {
  id: string;
  deviceId: string;
  userId: string;
  title: string; // ��������
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'active' | 'completed' | 'CancelIconled' | 'approved' | 'rejected';
  approvedBy?: string; // ����������
  rejectionReason?: string; // ����������
  createdAt: string;
  updatedAt: string; // ��������
}

// �豸������������
export interface GetdevicesParams {
  type?: string;
  status?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface GetDeviceDataParams {
  deviceId: string;
  startTime?: string;
  endTime?: string;
  metrics?: string[];
  interval?: string;
}

export interface SendDeviceCommandParams {
  deviceId: string;
  command: string;
  parameters?: Record<string, any>;
}

export interface CreateDeviceReservationParams {
  deviceId: string;
  userId: string; // ��������
  title: string; // ��������
  startTime: string;
  endTime: string;
  purpose: string;
  participantIds?: string[]; // ����������
  notes?: string; // ����������
}

export interface GetDeviceReservationsParams {
  deviceId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface DeviceMonitoringData {
  deviceId: string;
  timestamp: string;
  metrics: Record<string, number>;
  alerts?: string[];
  status: 'online' | 'offline' | 'error';
}

// ͼ�����������
export interface ImageProcessingOptions {
  quality?: number;
  resize?: {
    width?: number;
    height?: number;
    maintain_aspect_ratio?: boolean;
  };
  filters?: string[];
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ImageAnalysisResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  results?: {
    objects?: any[];
    text?: string;
    classifications?: any[];
    metadata?: any;
  };
  error?: string;
  processingTime?: number;
  confidence?: number;
}

export interface ObjectDetectionResult {
  id: string;
  class: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  LabelIcon?: string;
}

// �û���������
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto' | Theme;
  LanguageIcon: string;
  timezone: string;
  NotificationsIcon: {
    email: boolean;
    push: boolean;
    SmsIcon: boolean;
    experimentUpdates: boolean;
    systemAlerts: boolean;
  };
  privacy: {
    shareData: boolean;
    allowAnalytics: boolean;
    showProfile: boolean;
  };
  experiments: {
    autoSave: boolean;
    saveInterval: number;
    showTips: boolean;
    defaultDuration: number;
  };
  preferences?: {
    autoSave?: boolean;
    autoBackupIcon?: boolean;
    defaultExperimentType?: string;
    defaultBatchSize?: number;
    defaultEpochs?: number;
  };
  branding?: {
    siteName?: string;
    companyName?: string;
    contactemail?: string;
    contactPhone?: string;
    logoUrl?: string;
  };
}

// ��������
export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

// ����״̬����
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: string;
}

export interface HardwareInfo {
  cpu?: {
    name?: string;
    cores?: number;
    threads?: number;
    frequency?: number;
  };
  gpu?: {
    name?: string;
    MemoryIcon?: number;
    computeCapability?: string;
  };
  MemoryIcon?: {
    total?: number;
    available?: number;
    type?: string;
  };
  StorageIcon?: {
    total?: number;
    available?: number;
    type?: string;
  };
}

export interface EnvironmentInfo {
  os?: string;
  platform?: string;
  architecture?: string;
  nodeVersion?: string;
  pythonVersion?: string;
  dependencies?: Record<string, string>;
  environmentVariables?: Record<string, string>;
}

// ֪ͨ�������
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  read: boolean; // ����������
  userId?: string;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

// �豸�澯�������
export interface DeviceAlert {
  id: string;
  deviceId: string;
  deviceName?: string;
  type: 'hardware' | 'connection' | 'performance' | 'security' | 'maintenance' | 'custom';
  alertType: string; // ����������
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledged: boolean; // ����������
  resolved: boolean; // ����������
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
  // ��չ����
  metric?: string;
  currentValue?: number;
  thresholdValue?: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  deviceId?: string; // ��������
  deviceType?: string;
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne' | 'range' | 'greater_than' | 'less_than';
    value: number;
    duration?: number;
  };
  // ��ƽ�������Լ������д���
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne' | 'range' | 'greater_than' | 'less_than';
  threshold: number;
  maxThreshold?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isEnabled: boolean;
  enabled: boolean; // ����������
  cooldownMinutes?: number;
  notificationChannels: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertStats {
  total: number;
  active: number;
  resolved: number;
  unacknowledged: number; // ��������
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: Record<string, number>;
  recentTrend: {
    period: string;
    count: number;
  }[];
}

// ʵ��ִ���������
export interface ExperimentExecution {
  id: string;
  experimentId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'CancelIconled';
  startTime?: string;
  endTime?: string;
  duration?: number;
  results?: any;
  logs?: string[];
  error?: string;
  metadata?: Record<string, any>;
  progress?: number;
  steps?: {
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: string;
    endTime?: string;
    error?: string;
  }[];
}

// �豸��������
// �豸������͵��루�����ظ����壩
export type { Device, DeviceType, DeviceConnectionStatus, ExtendedDevice } from './devices';

export default K12_EXPERIMENT_TYPES;
