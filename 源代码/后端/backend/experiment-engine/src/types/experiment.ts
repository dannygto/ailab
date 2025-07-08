// 实验相关类型定义

export interface Experiment {
  id: string;
  name: string;
  description: string;
  type: ExperimentType;
  status: ExperimentStatus;
  userId: string;
  templateId?: string;
  parameters: ExperimentParameters;
  data: ExperimentData;
  results: ExperimentResults;
  metadata: ExperimentMetadata;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type ExperimentType = 
  | 'image_classification'
  | 'object_detection'
  | 'text_classification'
  | 'sentiment_analysis'
  | 'speech_recognition'
  | 'robot_control'
  | 'custom';

export type ExperimentStatus = 
  | 'draft'
  | 'ready'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ExperimentParameters {
  // 通用参数
  modelType: string;
  dataset: string;
  batchSize: number;
  learningRate: number;
  epochs: number;
  validationSplit: number;
  
  // 高级参数
  optimizer: string;
  lossFunction: string;
  metrics: string[];
  
  // 特定实验类型参数
  [key: string]: any;
}

export interface ExperimentData {
  // 数据集信息
  datasetPath: string;
  datasetSize: number;
  inputShape: number[];
  outputShape: number[];
  
  // 数据预处理
  preprocessing: DataPreprocessing;
  
  // 数据增强
  augmentation?: DataAugmentation;
}

export interface DataPreprocessing {
  normalization: boolean;
  resize?: number[];
  grayscale?: boolean;
  mean?: number[];
  std?: number[];
}

export interface DataAugmentation {
  rotation: number;
  zoom: number;
  flip: boolean;
  brightness: number;
  contrast: number;
}

export interface ExperimentResults {
  // 训练结果
  trainingHistory: TrainingHistory;
  modelPath: string;
  modelSize: number;
  
  // 评估结果
  accuracy: number;
  loss: number;
  precision: number;
  recall: number;
  f1Score: number;
  
  // 可视化数据
  confusionMatrix: number[][];
  classificationReport: any;
  
  // 预测结果
  predictions?: any[];
  groundTruth?: any[];
  
  // 实验报告
  report: ExperimentReport;
}

export interface TrainingHistory {
  loss: number[];
  accuracy: number[];
  valLoss: number[];
  valAccuracy: number[];
  epochs: number[];
}

export interface ExperimentReport {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  charts: ChartData[];
  metrics: Record<string, number>;
}

export interface ChartData {
  type: 'line' | 'bar' | 'scatter' | 'confusion_matrix';
  title: string;
  data: any;
  options?: any;
}

export interface ExperimentMetadata {
  version: string;
  framework: string;
  hardware: HardwareInfo;
  environment: EnvironmentInfo;
  tags: string[];
  notes: string;
}

export interface HardwareInfo {
  cpu: string;
  gpu?: string;
  memory: number;
  storage: number;
}

export interface EnvironmentInfo {
  python: string;
  framework: string;
  dependencies: Record<string, string>;
}

// 实验模板
export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  type: ExperimentType;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  parameters: ExperimentParameters;
  data: ExperimentData;
  instructions: string[];
  expectedResults: any;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 实验执行
export interface ExperimentExecution {
  id: string;
  experimentId: string;
  status: ExecutionStatus;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type ExecutionStatus = 
  | 'queued'
  | 'preparing'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  data?: any;
}

export interface ExecutionMetrics {
  currentLoss: number;
  currentAccuracy: number;
  currentValLoss: number;
  currentValAccuracy: number;
  learningRate: number;
  timeElapsed: number;
  eta: number;
}

// 实验队列
export interface ExperimentQueue {
  id: string;
  userId: string;
  experimentId: string;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// 实验资源
export interface ExperimentResource {
  id: string;
  experimentId: string;
  type: 'dataset' | 'model' | 'checkpoint' | 'result';
  name: string;
  path: string;
  size: number;
  format: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

// 实验配置
export interface ExperimentConfig {
  maxConcurrentExperiments: number;
  defaultTimeout: number;
  supportedFrameworks: string[];
  gpuEnabled: boolean;
  maxGpuMemory: number;
  dataDir: string;
  modelDir: string;
  logDir: string;
}

// 实验事件
export interface ExperimentEvent {
  id: string;
  experimentId: string;
  type: 'started' | 'progress' | 'completed' | 'failed' | 'cancelled';
  data: any;
  timestamp: Date;
}

// 实验比较
export interface ExperimentComparison {
  id: string;
  name: string;
  experimentIds: string[];
  metrics: ComparisonMetrics;
  charts: ChartData[];
  summary: string;
  createdAt: Date;
}

export interface ComparisonMetrics {
  accuracy: Record<string, number>;
  loss: Record<string, number>;
  trainingTime: Record<string, number>;
  modelSize: Record<string, number>;
}

// API请求/响应类型
export interface CreateExperimentRequest {
  name: string;
  description: string;
  type: ExperimentType;
  templateId?: string;
  parameters: ExperimentParameters;
  data: ExperimentData;
}

export interface UpdateExperimentRequest {
  name?: string;
  description?: string;
  parameters?: Partial<ExperimentParameters>;
  data?: Partial<ExperimentData>;
}

export interface StartExperimentRequest {
  experimentId: string;
  parameters?: Partial<ExperimentParameters>;
}

export interface ExperimentListResponse {
  experiments: Experiment[];
  total: number;
  page: number;
  limit: number;
}

export interface ExperimentDetailResponse {
  experiment: Experiment;
  execution?: ExperimentExecution;
  resources: ExperimentResource[];
  events: ExperimentEvent[];
} 