// 高级数据分析接口定义

// 多变量分析相关接口
export interface MultivariateAnalysisParams {
  variables?: string[];
  method?: 'pca' | 'factor' | 'cluster';
  dimensions?: number;
}

export interface PCAComponent {
  id: string;
  name: string;
  variance: number;
  loadings: Record<string, number>;
}

export interface Cluster {
  id: string;
  size: number;
  centroid: Record<string, number>;
  members: string[];
}

export interface MultivariateAnalysisResponse {
  results: any;
  components?: PCAComponent[];
  clusters?: Cluster[];
  visualizationConfig: any;
  insights: string[];
}

// 实验设计分析相关接口
export interface ExperimentDesignParams {
  factors?: string[];
  responseVariables?: string[];
  optimizationGoal?: 'maximize' | 'minimize' | 'target';
  targetValue?: number;
}

export interface FactorEffect {
  factor: string;
  effect: number;
  pValue: number;
  isSignificant: boolean;
}

export interface InteractionEffect {
  factors: string[];
  effect: number;
  pValue: number;
  isSignificant: boolean;
}

export interface ResponseModel {
  formula: string;
  coefficients: Record<string, number>;
  rSquared: number;
}

export interface ExperimentDesignResponse {
  designSummary: {
    factors: Array<{
      name: string;
      levels: number;
      values: any[];
    }>;
    runs: number;
    replicates: number;
    design: string;
    power: number;
  };
  effectsAnalysis: FactorEffect[];
  interactions: InteractionEffect[];
  optimumConditions?: Record<string, any>;
  responseModel?: ResponseModel;
  visualizationConfig: any;
  insights: string[];
}

// 批量数据处理相关接口
export interface BatchProcessParams {
  operation: 'aggregate' | 'compare' | 'trend';
  timeRange?: [string, string];
  groupBy?: string;
}

export interface MetricStatistics {
  average: Record<string, number>;
  standardDeviation: Record<string, number>;
  min: Record<string, number>;
  max: Record<string, number>;
}

export interface TrendAnalysis {
  slope: number;
  intercept: number;
  rSquared: number;
}

export interface BatchProcessResponse {
  summary: {
    experimentCount: number;
    timeRange: [string, string];
    totalSamples: number;
  };
  results: any;
  visualizationConfig: any;
  insights: string[];
}
