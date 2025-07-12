// aiService.ts - AI����ģ��

import { BaseapiService, apiResponse } from './base/apiService';
import {
  MultivariateAnalysisParams,
  MultivariateAnalysisResponse,
  ExperimentDesignParams,
  ExperimentDesignResponse,
  BatchProcessParams,
  BatchProcessResponse
} from '../types/analyticsTypes';
import {
  ScientificChartResponse,
  FormulaRecognitionResponse
} from '../types/mediaTypes';
import {
  TextClassificationParams,
  TextClassificationResponse,
  TextSummaryParams,
  TextSummaryResponse,
  ExperimentReportParams,
  ExperimentReportResponse,
  SemanticSearchParams,
  SemanticSearchResponse
} from '../types/nlpTypes';

// ���Ͷ���
export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: string;
  capabilities: string[];
  version: string;
  isAvailable: boolean;
}

export interface TextCompletionRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface TextCompletionResponse {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface chatCompletionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface chatCompletionResponse {
  message: {
    role: 'assistant';
    content: string;
  };
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  n?: number;
  size?: string;
}

export interface ImageGenerationResponse {
  images: string[];
  model: string;
}

export interface ImageAnalysisRequest {
  image: File | string;
  analysisTypes?: string[];
}

export interface ImageAnalysisResponse {
  analysis: {
    labels: Array<{ name: string; confidence: number }>;
    objects?: Array<{ name: string; confidence: number; boundingBox: any }>;
    text?: string;
    faces?: any[];
    colors?: Array<{ name: string; hex: string; percentage: number }>;
    quality?: { score: number; issues: string[] };
  };
}

// AI��Դ�Ƽ�����ӿ�
export interface ResourceRecommendationRequest {
  experimentId?: string;
  templateId?: string;
  experimentType?: string;
  subject?: string;
  userInterests?: string[];
  limit?: number;
  excludeIds?: string[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  subject?: string;
  CategoryIcon?: string;
  tags?: string[];
  difficulty?: string;
  grade?: string;
  rating?: number;
  popularity?: number;
  relevanceScore?: number;
  reason?: string;
}

// AI����ʵ��
export class AIService extends BaseapiService {
  // ��ȡ���õ�AIģ���б�
  public async getModels(): Promise<apiResponse<AIModel[]>> {
    return this.get<AIModel[]>('/ai/models');
  }
  
  // �ı���ȫ
  public async completeText(data: TextCompletionRequest): Promise<apiResponse<TextCompletionResponse>> {
    return this.post<TextCompletionResponse>('/ai/complete', data);
  }
  
  // ���첹ȫ
  public async chatCompletion(data: chatCompletionRequest): Promise<apiResponse<chatCompletionResponse>> {
    return this.post<chatCompletionResponse>('/ai/chat', data);
  }
  
  // ͼ������
  public async generateImage(data: ImageGenerationRequest): Promise<apiResponse<ImageGenerationResponse>> {
    return this.post<ImageGenerationResponse>('/ai/generate-image', data);
  }
  
  // ͼ�����
  public async analyzeImage(data: ImageAnalysisRequest): Promise<apiResponse<ImageAnalysisResponse>> {
    // ����ͼ���ϴ�
    let formData: FormData | null = null;
    let postData: any = { ...data };
    
    if (data.image instanceof File) {
      formData = new FormData();
      formData.append('image', data.image);
      
      if (data.analysisTypes) {
        data.analysisTypes.forEach(type => {
          formData!.append('analysisTypes[]', type);
        });
      }
      
      postData = formData;
    }
    
    return this.post<ImageAnalysisResponse>('/ai/analyze-image', postData, {
      headers: formData ? {
        'Content-Type': 'multipart/form-data'
      } : undefined
    });
  }
  
  // ���AI���񽡿�״̬
  public async CheckIconHealth(): Promise<apiResponse<{ status: string; services: Record<string, boolean> }>> {
    return this.get<{ status: string; services: Record<string, boolean> }>('/ai/health');
  }
  
  // ��ȡAI�Ƽ���Դ
  public async getRecommendedResources(request: ResourceRecommendationRequest): Promise<apiResponse<{
    resources: Resource[];
    total: number;
  }>> {
    return this.post<{
      resources: Resource[];
      total: number;
    }>('/ai/recommend-resources', request);
  }

  // �����������ƶȻ�ȡ�����Դ
  public async getSimilarResources(resourceId: string, limit: number = 6): Promise<apiResponse<Resource[]>> {
    return this.get<Resource[]>(`/ai/similar-resources/${resourceId}`, {
      params: { limit }
    });
  }
  
  // ����ʵ�����������ݷ�������ӻ�����
  public async getDataVisualizationSuggestions(experimentId: string): Promise<apiResponse<{
    visualizations: Array<{
      type: string;
      title: string;
      description: string;
      config: any;
      insights: string[];
    }>;
  }>> {
    return this.get(`/ai/visualization-suggestions/${experimentId}`);
  }

  // �߼����ݿ��ӻ�api
  // ��ȡ3D���ӻ�����
  public async get3DVisualizationData(experimentId: string, params?: {
    dataType?: string;
    dimension?: string;
    algorithm?: string;
  }): Promise<apiResponse<{
    data: any;
    config: any;
    insights: string[];
  }>> {
    return this.get(`/ai/advanced-visualizations/3d/${experimentId}`, { params });
  }

  // ��ȡ��ͼ���ӻ�����
  public async getHeatmapData(experimentId: string, params?: {
    variables?: string[];
    correlation?: boolean;
    clusteringMethod?: string;
  }): Promise<apiResponse<{
    data: any;
    config: any;
    insights: string[];
  }>> {
    return this.get(`/ai/advanced-visualizations/heatmap/${experimentId}`, { params });
  }

  // ��ȡ�����ϵͼ���ӻ�����
  public async getNetworkGraphData(experimentId: string, params?: {
    nodeType?: string;
    edgeThreshold?: number;
    layout?: string;
  }): Promise<apiResponse<{
    nodes: Array<{ id: string; label: string; value: number; group?: string }>;
    edges: Array<{ from: string; to: string; value: number; LabelIcon?: string }>;
    config: any;
    insights: string[];
  }>> {
    return this.get(`/ai/advanced-visualizations/network/${experimentId}`, { params });
  }

  // �쳣������
  public async getAnomalyDetection(experimentId: string, params?: {
    algorithm?: string;
    sensitivity?: number;
    variables?: string[];
  }): Promise<apiResponse<{
    anomalies: Array<{
      index: number;
      score: number;
      variables: Record<string, number>;
      explanation: string;
    }>;
    visualizationConfig: any;
    insights: string[];
  }>> {
    return this.get(`/ai/advanced-analysis/anomaly-detection/${experimentId}`, { params });
  }

  // ʱ������Ԥ��
  public async getTimeSeriesForecast(experimentId: string, params?: {
    targetVariable: string;
    forecastHorizon: number;
    algorithm?: string;
  }): Promise<apiResponse<{
    originalData: Array<{ timestamp: string; value: number }>;
    forecastData: Array<{ timestamp: string; value: number; lowerBound?: number; upperBound?: number }>;
    visualizationConfig: any;
    metrics: Record<string, number>;
    insights: string[];
  }>> {
    return this.get(`/ai/advanced-analysis/time-series-forecast/${experimentId}`, { params });
  }

  // ͳ�Ʒ���
  public async getStatisticalAnalysis(experimentId: string, params?: {
    variables?: string[];
    tests?: string[];
    significance?: number;
  }): Promise<apiResponse<{
    summary: Record<string, any>;
    tests: Array<{
      name: string;
      variables: string[];
      result: any;
      pValue: number;
      isSignificant: boolean;
      interpretation: string;
    }>;
    visualizationConfig: any;
  }>> {
    return this.get(`/ai/advanced-analysis/statistical-analysis/${experimentId}`, { params });
  }

  // ʵ�����Ƚ�
  public async compareExperiments(experimentIds: string[], params?: {
    metrics?: string[];
    visualizationType?: string;
  }): Promise<apiResponse<{
    comparison: Record<string, any>;
    differences: Array<{
      metric: string;
      difference: number;
      percentChange: number;
      isSignificant: boolean;
    }>;
    visualizationConfig: any;
    insights: string[];
  }>> {
    return this.post(`/ai/advanced-analysis/compare-experiments`, {
      experimentIds,
      ...params
    });
  }

  // ģ������3D���ӻ�����
  public async generate3DVisualization(params: {
    experimentId: string;
    dataPoints: any[];
    dimensions: string[];
    visualizationType: string;
  }): Promise<apiResponse<any>> {
    // ��ʵ��Ӧ���У�����Ӧ�õ��ú��api
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { dataPoints, visualizationType } = params;
    
    // ���ݲ�ͬ��3D���ӻ����͹�����ͬ������
    let config: any = {};
    
    if (visualizationType === '3d-scatter') {
      config = {
        title: '3D����ɢ��ͼ',
        x: dataPoints.map(p => p.x),
        y: dataPoints.map(p => p.y),
        z: dataPoints.map(p => p.z),
        text: dataPoints.map(p => p.label),
        color: '#1f77b4',
        xaxis: 'X��',
        yaxis: 'Y��',
        zaxis: 'Z��'
      };
    } else if (visualizationType === '3d-surface') {
      // ���ɱ�������
      const size = 20;
      const z = Array(size).fill(0).map(() => Array(size).fill(0));
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const x = i / size * 10 - 5;
          const y = j / size * 10 - 5;
          z[i][j] = Math.sin(Math.sqrt(x*x + y*y)) * 5;
        }
      }
      
      config = {
        title: '3D����ͼ',
        z,
        colorscale: 'Viridis',
        xaxis: 'X��',
        yaxis: 'Y��',
        zaxis: 'Z��'
      };
    } else if (visualizationType === '3d-bar') {
      // ����3D��״ͼ����
      const x = Array.from({length: 10}, (_, i) => `X${i}`);
      const y = Array.from({length: 10}, (_, i) => `Y${i}`);
      const z = Array.from({length: 10}, () => 
        Array.from({length: 10}, () => Math.random() * 10)
      );
      
      config = {
        title: '3D��״ͼ',
        x,
        y,
        z,
        colorscale: 'Portland',
        xaxis: 'X���',
        yaxis: 'Y���',
        zaxis: 'ֵ'
      };
    }
    
    // ģ��һЩ���ݶ���
    const insights = [
      '���ݳ������ԵĿռ�������ƣ����ܱ��������д�����Ȼ���顣',
      `��${visualizationType === '3d-surface' ? '����' : 'ɢ��'}ͼ�У����Թ۲쵽���Եķ����Թ�ϵ��`,
      '������Z�᷽���ϵķֲ���Χ�Ϲ㣬������ά�ȵı����Խϴ�',
      '����������Ⱥ�㣬�����ڽ�һ�������н����ر��ע��'
    ];
    
    return {
      success: true,
      data: {
        config,
        insights
      }
    };
  }

  // ģ��������ͼ���ӻ�����
  public async generateHeatmapVisualization(params: {
    experimentId: string;
    matrix: number[][];
    xLabels: string[];
    yLabels: string[];
  }): Promise<apiResponse<any>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { matrix, xLabels, yLabels } = params;
    
    const config = {
      title: '������ͼ����',
      z: matrix,
      x: xLabels,
      y: yLabels,
      colorscale: 'Viridis',
      xaxis: '����',
      yaxis: '�۲�ֵ'
    };
    
    // ģ��һЩ���ݶ���
    const insights = [
      '��ͼ��ʾ����A�ͱ���C֮����ڽ�ǿ������ԡ�',
      '���ݼ������Ͻ�������ʾ�쳣��ֵ�������һ�����顣',
      '�������ݳ��ֶԽ��߷ֲ�ģʽ���������ܴ���������ԡ�',
      '����F������������������ձ�ϵͣ������Ƕ������ء�'
    ];
    
    return {
      success: true,
      data: {
        config,
        insights
      }
    };
  }

  // ģ������������ӻ�����
  public async generateNetworkVisualization(params: {
    experimentId: string;
    nodes: any[];
    edges: any[];
  }): Promise<apiResponse<any>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { nodes, edges } = params;
    
    // �����ڵ����
    const categories = [
      { name: '���A' },
      { name: '���B' },
      { name: '���C' }
    ];
    
    // Ϊ�ڵ�������ɫ
    const colorNodes = nodes.map(node => ({
      ...node,
      color: ['#c23531', '#2f4554', '#61a0a8'][node.category]
    }));
    
    // Ϊ��������ɫ
    const colorEdges = edges.map(edge => ({
      ...edge,
      color: edge.value > 50 ? 'rgba(255,0,0,0.5)' : 'rgba(0,0,255,0.3)'
    }));
    
    const config = {
      title: '�����ϵ����',
      nodes: colorNodes,
      edges: colorEdges,
      categories
    };
    
    // ģ��һЩ���ݶ���
    const insights = [
      '����ͼ��ʾ����3����Ҫ�����Ӵأ����������д�����Ȼ���顣',
      '�ڵ�6�ͽڵ�12�������еĹؼ����ӵ㣬������ߵ������ԡ�',
      '���A�Ľڵ�֮�������ܶȽϸߣ����������������ӽ��١�',
      '���������ܶ�Ϊ0.28����������һ�����ϡ�������ṹ��'
    ];
    
    return {
      success: true,
      data: {
        config,
        insights
      }
    };
  }

  // ģ���쳣�������
  public async detectDataAnomalies(params: {
    experimentId: string;
    timeseriesData: any[];
    sensitivityLevel: 'low' | 'medium' | 'high';
  }): Promise<apiResponse<any>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { timeseriesData, sensitivityLevel } = params;
    
    // �������ж������쳣��ֵ
    const thresholds = {
      low: 40,
      medium: 30,
      high: 20
    };
    
    const threshold = thresholds[sensitivityLevel];
    
    // Ѱ���쳣��
    const baseValue = 100;
    const anomalies = timeseriesData.filter(point => {
      return Math.abs(point.value - baseValue) > threshold;
    }).map(point => {
      const deviation = point.value - baseValue;
      return {
        timestamp: point.timestamp,
        score: Math.abs(deviation) / 10,
        type: deviation > 0 ? '�쳣��ֵ' : '�쳣��ֵ',
        description: `ֵƫ���׼${Math.abs(deviation).toFixed(2)}����λ��${
          Math.abs(deviation) > 45 ? '�����쳣' : '�е��쳣'
        }`
      };
    });
    
    // ģ��һЩ���ݶ���
    const insights = [
      `����⵽${anomalies.length}���쳣�㣬ռ�����ݵ��${(anomalies.length / timeseriesData.length * 100).toFixed(1)}%��`,
      '�󲿷��쳣������ʱ�����е��жΣ�������ʵ�������仯�йء�',
      `�����ص��쳣������${anomalies.length > 0 ? new Date(anomalies.sort((a, b) => b.score - a.score)[0].timestamp).toLocaleString() : 'δ֪ʱ��'}��`,
      '������ʵ������еĸ������أ��Լ���δ�������е��쳣��'
    ];
    
    return {
      success: true,
      data: {
        timeseriesData,
        anomalies,
        insights
      }
    };
  }

  // ģ��ͳ�Ʒ�������
  public async analyzeExperimentStatistics(experimentId: string): Promise<apiResponse<any>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ģ��ͳ�Ʒ������
    const stats = {
      summary: {
        sampleSize: 120,
        variables: 8,
        missingValues: 12,
        outliers: 5
      },
      correlationMatrix: Array(8).fill(0).map(() => 
        Array(8).fill(0).map(() => Math.random() * 2 - 1)
      ),
      descriptiveStats: {
        mean: [23.4, 56.7, 12.9, 45.6, 78.2, 34.5, 67.8, 90.1],
        median: [22.1, 57.3, 11.5, 46.2, 79.0, 33.8, 68.5, 89.7],
        stdDev: [4.5, 7.8, 2.3, 6.7, 9.1, 5.2, 8.4, 10.6],
        min: [12.3, 35.6, 7.8, 28.9, 52.4, 19.7, 45.6, 62.3],
        max: [35.6, 78.9, 21.4, 67.8, 98.5, 45.6, 89.7, 112.4]
      }
    };
    
    // ģ��һЩ���ݶ���
    const insights = [
      '����3�ͱ���7֮�����ǿ�ҵ������(r=0.82)���������ǿ�������ͬ����Ӱ�졣',
      '����2�ı�׼��ϴ����ݷֲ���Ϊ��ɢ�������ò����Ĳ�ȷ���Խϸߡ�',
      '���������������ã�����10%�����ݵ����ȱʧֵ����Ҫ�����ڱ���4�ͱ���8��',
      '���ݷֲ����������ƫ���ƣ�������Ҫ�����ڽ�һ�������н��ж���ת����'
    ];
    
    return {
      success: true,
      data: {
        stats,
        insights
      }
    };
  }
  
  // ���������
  public async performMultivariateAnalysis(experimentId: string, params?: MultivariateAnalysisParams): Promise<apiResponse<MultivariateAnalysisResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const method = params?.method || 'pca';
    const dimensions = params?.dimensions || 2;
    
    let results: any = {};
    let components: any[] = [];
    let clusters: any[] = [];
    let visualizationConfig: any = {};
    let insights: string[] = [];
    
    if (method === 'pca') {
      // ģ��PCA�������
      components = Array.from({length: dimensions}, (_, i) => ({
        id: `pc${i+1}`,
        name: `���ɷ�${i+1}`,
        variance: 0.8 * Math.pow(0.6, i),
        loadings: {
          '����1': Math.random() * 2 - 1,
          '����2': Math.random() * 2 - 1,
          '����3': Math.random() * 2 - 1,
          '����4': Math.random() * 2 - 1,
          '����5': Math.random() * 2 - 1
        }
      }));
      
      results = {
        totalVarianceExplained: components.reduce((sum, pc) => sum + pc.variance, 0),
        components
      };
      
      visualizationConfig = {
        type: 'biplot',
        xComponent: 'pc1',
        yComponent: 'pc2',
        points: Array.from({length: 50}, (_, i) => ({
          id: `sample${i+1}`,
          x: Math.random() * 6 - 3,
          y: Math.random() * 6 - 3
        })),
        vectors: Object.keys(components[0].loadings).map(varName => ({
          variable: varName,
          x: components[0].loadings[varName] * 3,
          y: components[1].loadings[varName] * 3
        }))
      };
      
      insights = [
        `���ɷַ�����ʾǰ${dimensions}�����ɷֽ�����${(results.totalVarianceExplained * 100).toFixed(1)}%���ܷ��`,
        '��һ���ɷ���Ҫ�ɱ���1�ͱ���3��ɣ���ӳ��ʵ���е���Ҫ�仯���ơ�',
        '�ڶ����ɷ������2�ͱ���5ǿ��أ����ܷ�ӳ�˴�Ҫ��ʵ��ЧӦ��',
        '���������ɷֿռ��г������Եķ������ƣ������һ�����о��������'
      ];
    } else if (method === 'cluster') {
      // ģ�����������
      const clusterCount = 3;
      clusters = Array.from({length: clusterCount}, (_, i) => {
        const size = 20 + Math.floor(Math.random() * 30);
        return {
          id: `cluster${i+1}`,
          size,
          centroid: {
            '����1': Math.random() * 10,
            '����2': Math.random() * 10,
            '����3': Math.random() * 10,
            '����4': Math.random() * 10,
            '����5': Math.random() * 10
          },
          members: Array.from({length: size}, (_, j) => `sample${i*30+j+1}`)
        };
      });
      
      results = {
        clusterCount,
        silhouetteScore: 0.65 + Math.random() * 0.2,
        clusters
      };
      
      visualizationConfig = {
        type: 'ScatterPlotIcon',
        dimensions: ['����1', '����2'],
        points: Array.from({length: 80}, (_, i) => {
          const clusterId = Math.floor(i / 30);
          const centroid = clusters[clusterId < clusters.length ? clusterId : 0].centroid;
          return {
            id: `sample${i+1}`,
            cluster: `cluster${clusterId+1}`,
            x: centroid['����1'] + (Math.random() * 2 - 1),
            y: centroid['����2'] + (Math.random() * 2 - 1)
          };
        })
      };
      
      insights = [
        `�������ʶ���${clusterCount}����ͬ�������أ�����ϵ��Ϊ${results.silhouetteScore.toFixed(2)}��`,
        `���Ĵ�Ϊ��${clusters.reduce((max, c, i) => c.size > clusters[max].size ? i : max, 0) + 1}������${Math.max(...clusters.map(c => c.size))}��������`,
        '�ؼ��ڱ���1�ͱ���3�ϲ�����������������������Ĺؼ�������',
        '�����ÿ���ص��������е���������̽����ͬ�����µ�ʵ�������졣'
      ];
    }
    
    return {
      success: true,
      data: {
        results,
        components: method === 'pca' ? components : undefined,
        clusters: method === 'cluster' ? clusters : undefined,
        visualizationConfig,
        insights
      }
    };
  }

  // ʵ����Ʒ������Ż�
  public async analyzeExperimentDesign(experimentId: string, params?: ExperimentDesignParams): Promise<apiResponse<ExperimentDesignResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const factors = params?.factors || ['�¶�', 'ѹ��', 'Ũ��', 'ʱ��'];
    
    // ģ��ʵ����Ʒ������
    const designSummary = {
      factors: factors.map(f => ({
        name: f,
        levels: 3,
        values: Array.from({length: 3}, (_, i) => {
          if (f === '�¶�') return 20 + i * 10;
          if (f === 'ѹ��') return 1 + i * 0.5;
          if (f === 'Ũ��') return 5 + i * 2;
          if (f === 'ʱ��') return 30 + i * 15;
          return i;
        })
      })),
      runs: 18,
      replicates: 2,
      design: '��Ӧ�����',
      power: 0.85
    };
    
    // ��ЧӦ����
    const effectsAnalysis = factors.map(f => ({
      factor: f,
      effect: Math.random() * 10 - 2,
      pValue: Math.random() * 0.2,
      isSignificant: Math.random() > 0.3
    }));
    
    // ����ЧӦ
    const interactions = [
      {
        factors: ['�¶�', 'ѹ��'],
        effect: Math.random() * 5 - 1,
        pValue: Math.random() * 0.15,
        isSignificant: Math.random() > 0.4
      },
      {
        factors: ['Ũ��', 'ʱ��'],
        effect: Math.random() * 5 - 1,
        pValue: Math.random() * 0.15,
        isSignificant: Math.random() > 0.4
      }
    ];
    
    // ��������
    const optimumConditions = {
      '�¶�': 35 + Math.random() * 10 - 5,
      'ѹ��': 1.75 + Math.random() * 0.5 - 0.25,
      'Ũ��': 8 + Math.random() * 2 - 1,
      'ʱ��': 52.5 + Math.random() * 10 - 5,
      'predictedResponse': {
        'yield': 85 + Math.random() * 10 - 5,
        'purity': 95 + Math.random() * 5 - 2.5
      }
    };
    
    // ��Ӧģ��
    const responseModel = {
      formula: 'Y = 75.3 + 8.2*X1 + 4.3*X2 - 2.1*X3 + 1.5*X4 - 3.2*X1^2 - 1.8*X1*X2',
      coefficients: {
        'Intercept': 75.3,
        'X1': 8.2,
        'X2': 4.3,
        'X3': -2.1,
        'X4': 1.5,
        'X1^2': -3.2,
        'X1*X2': -1.8
      },
      rSquared: 0.87
    };
    
    // ���ӻ�����
    const visualizationConfig = {
      type: 'contourPlot',
      xFactor: '�¶�',
      yFactor: 'Ũ��',
      responseSurface: Array.from({length: 20}, (_, i) => 
        Array.from({length: 20}, (_, j) => ({
          x: 20 + i * 1.5,
          y: 5 + j * 0.5,
          z: 75.3 + 8.2 * ((20 + i * 1.5) - 35) / 10 + 4.3 * ((1.5) - 1.75) / 0.5 - 
             2.1 * ((5 + j * 0.5) - 8) / 2 + 1.5 * ((45) - 52.5) / 15 - 
             3.2 * Math.pow(((20 + i * 1.5) - 35) / 10, 2) - 
             1.8 * ((20 + i * 1.5) - 35) / 10 * ((1.5) - 1.75) / 0.5
        }))
      ),
      optimumPoint: {
        x: optimumConditions['�¶�'],
        y: optimumConditions['Ũ��'],
        z: optimumConditions['predictedResponse']['yield']
      }
    };
    
    // ��������
    const insights = [
      `��${effectsAnalysis.filter(e => e.isSignificant).length}�����������У�${
        effectsAnalysis.reduce((max, e) => e.effect > effectsAnalysis[max].effect ? effectsAnalysis.indexOf(e) : max, 0)
      }��Ӱ����Ϊ������`,
      `${interactions.some(i => i.isSignificant) ? '���������Ľ���ЧӦ��' : 'û�з��������Ľ���ЧӦ��'}��������ؼ�${
        interactions.some(i => i.isSignificant) ? '�����ЧӦ��Ҫ�ر��ע' : '���Զ�������'
      }��`,
      `ģ������Ŷ�Ϊ${responseModel.rSquared.toFixed(2)}������ģ�ͽ�����${(responseModel.rSquared * 100).toFixed(0)}%����Ӧ���졣`,
      `�����Ż���������${
        Object.entries(optimumConditions)
          .filter(([k]) => factors.includes(k))
          .map(([k, v]) => `${k}=${typeof v === 'number' ? v.toFixed(1) : v}`)
          .join(', ')
      }ʱ��Ԥ�ƿɻ��������Ӧֵ��`
    ];
    
    return {
      success: true,
      data: {
        designSummary,
        effectsAnalysis,
        interactions,
        optimumConditions,
        responseModel,
        visualizationConfig,
        insights
      }
    };
  }

  // �������ݴ��������
  public async batchProcessExperimentData(experimentIds: string[], params?: BatchProcessParams): Promise<apiResponse<BatchProcessResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const operation = params?.operation || 'aggregate';
    const experimentCount = experimentIds.length;
    
    // ģ�������Ϣ
    const summary = {
      experimentCount,
      timeRange: [
        '2025-05-01T00:00:00Z',
        '2025-07-01T00:00:00Z'
      ] as [string, string],
      totalSamples: experimentCount * 20 + Math.floor(Math.random() * 50)
    };
    
    let results: any = {};
    let visualizationConfig: any = {};
    let insights: string[] = [];
    
    if (operation === 'aggregate') {
      // ģ��ۺϷ������
      results = {
        metrics: {
          'average': {
            '�¶�': 32.5 + Math.random() * 5 - 2.5,
            'pressure': 1.65 + Math.random() * 0.3 - 0.15,
            'concentration': 78.3 + Math.random() * 10 - 5,
            'yield': 92.8 + Math.random() * 4 - 2
          },
          'standardDeviation': {
            'temperature': 3.2 + Math.random() * 1 - 0.5,
            'pressure': 0.25 + Math.random() * 0.1 - 0.05,
            'concentration': 8.7 + Math.random() * 3 - 1.5,
            'purity': 2.3 + Math.random() * 1 - 0.5
          },
          'min': {
            'temperature': 25.1 + Math.random() * 3 - 1.5,
            'pressure': 1.2 + Math.random() * 0.2 - 0.1,
            'concentration': 58.6 + Math.random() * 5 - 2.5,
            'purity': 87.2 + Math.random() * 3 - 1.5
          },
          'max': {
            'temperature': 39.8 + Math.random() * 3 - 1.5,
            'pressure': 2.1 + Math.random() * 0.2 - 0.1,
            'concentration': 95.4 + Math.random() * 5 - 2.5,
            'yield': 98.7 + Math.random() * 1 - 0.5
          }
        },
        correlations: {
          'temp-conc': 0.67 + Math.random() * 0.2 - 0.1,
          'pressure-yield': 0.42 + Math.random() * 0.2 - 0.1,
          'temp-yield': -0.23 + Math.random() * 0.2 - 0.1,
          'pressure-purity': 0.58 + Math.random() * 0.2 - 0.1
        }
      };
      
      visualizationConfig = {
        type: 'boxPlot',
        categories: ['�¶�', 'ѹ��', '����', '����'],
        data: ['�¶�', 'ѹ��', '����', '����'].map(metric => ({
          category: metric,
          min: results.metrics.min[metric],
          q1: results.metrics.min[metric] + (results.metrics.average[metric] - results.metrics.min[metric]) * 0.33,
          median: results.metrics.average[metric] - results.metrics.standardDeviation[metric] * 0.1,
          q3: results.metrics.max[metric] - (results.metrics.max[metric] - results.metrics.average[metric]) * 0.33,
          max: results.metrics.max[metric],
          outliers: Array.from({length: Math.floor(Math.random() * 3)}, () => 
            results.metrics.min[metric] - Math.random() * results.metrics.standardDeviation[metric] * 2
          ).concat(
            Array.from({length: Math.floor(Math.random() * 3)}, () => 
              results.metrics.max[metric] + Math.random() * results.metrics.standardDeviation[metric] * 2
            )
          )
        }))
      };
      
      insights = [
        `��${experimentCount}��ʵ���У�ƽ������Ϊ${results.metrics.average['����'].toFixed(1)}����׼��Ϊ${results.metrics.standardDeviation['����'].toFixed(1)}��`,
        `�¶��������${results.correlations['�¶�-����'] > 0 ? '��' : '��'}���(r=${Math.abs(results.correlations['�¶�-����']).toFixed(2)})�������¶�${results.correlations['�¶�-����'] > 0 ? '����' : '����'}��������߲�����`,
        `ѹ���봿�ȳ�${results.correlations['ѹ��-����'] > 0 ? '��' : '��'}���(r=${Math.abs(results.correlations['ѹ��-����']).toFixed(2)})����Ӱ���Ʒ��������Ҫ���ء�`,
        `������ʵ���У���${Math.floor(experimentCount * 0.15)}��ʵ��Ĳ������Ե���ƽ��ˮƽ����������Щʵ��ľ���������`
      ];
    } else if (operation === 'trend') {
      // ģ�����Ʒ������
      const timePoints = 10;
      results = {
        timePoints: Array.from({length: timePoints}, (_, i) => {
          const date = new Date('2025-05-01T00:00:00Z');
          date.setDate(date.getDate() + Math.floor(i * 60 / timePoints));
          return date.toISOString();
        }),
        metrics: {
          'yield': Array.from({length: timePoints}, (_, i) => 70 + i * 2 + Math.random() * 5 - 2.5),
          'purity': Array.from({length: timePoints}, (_, i) => 90 + i * 0.5 + Math.random() * 2 - 1)
        },
        trendAnalysis: {
          'yield': {
            slope: 2.1 + Math.random() * 0.4 - 0.2,
            intercept: 68.5 + Math.random() * 3 - 1.5,
            rSquared: 0.78 + Math.random() * 0.1 - 0.05
          },
          'purity': {
            slope: 0.48 + Math.random() * 0.1 - 0.05,
            intercept: 89.7 + Math.random() * 1 - 0.5,
            rSquared: 0.65 + Math.random() * 0.1 - 0.05
          }
        }
      };
      
      visualizationConfig = {
        type: 'lineChart',
        xAxis: {
          type: 'time',
          data: results.timePoints
        },
        series: [
          {
            name: '����',
            data: results.metrics['����'],
            trendLine: {
              type: 'linear',
              equation: `y = ${results.trendAnalysis['����'].slope.toFixed(2)}x + ${results.trendAnalysis['����'].intercept.toFixed(1)}`,
              rSquared: results.trendAnalysis['����'].rSquared
            }
          },
          {
            name: '����',
            data: results.metrics['����'],
            trendLine: {
              type: 'linear',
              equation: `y = ${results.trendAnalysis['����'].slope.toFixed(2)}x + ${results.trendAnalysis['����'].intercept.toFixed(1)}`,
              rSquared: results.trendAnalysis['����'].rSquared
            }
          }
        ]
      };
      
      insights = [
        `从${new Date(summary.timeRange[0]).toLocaleDateString()}到${new Date(summary.timeRange[1]).toLocaleDateString()}期间，实验产量呈${results.trendAnalysis['yield'].slope > 0 ? '上升' : '下降'}趋势。`,
        `平均每月产量增长${(results.trendAnalysis['yield'].slope * 30).toFixed(1)}个单位，相关性R2为${results.trendAnalysis['yield'].rSquared.toFixed(2)}。`,
        `纯度也呈现${results.trendAnalysis['purity'].slope > 0 ? '上升' : '下降'}趋势，但变化幅度较产量${Math.abs(results.trendAnalysis['purity'].slope) < Math.abs(results.trendAnalysis['yield'].slope) ? '小' : '大'}。`,
        `基于当前趋势预测，到2025年底产量将达到${(results.trendAnalysis['yield'].intercept + results.trendAnalysis['yield'].slope * 150).toFixed(1)}，纯度将达到${(results.trendAnalysis['purity'].intercept + results.trendAnalysis['purity'].slope * 150).toFixed(1)}%。`
      ];
    }
    
    return {
      success: true,
      data: {
        summary,
        results,
        visualizationConfig,
        insights
      }
    };
  }

  // NLP��ع��� - �ı�����
  public async analyzeTextClassification(params: TextClassificationParams): Promise<apiResponse<TextClassificationResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { text, categories } = params;
    
    // ģ���ı�������
    const categoriesWithScores = categories ? 
      categories.map(category => ({
        category,
        score: Math.random(),
        confidence: Math.random() * 0.5 + 0.5
      })) : 
      [
        { category: 'ʵ���������', score: Math.random(), confidence: Math.random() * 0.5 + 0.5 },
        { category: 'ʵ��������', score: Math.random(), confidence: Math.random() * 0.5 + 0.5 },
        { category: '���ݷ���', score: Math.random(), confidence: Math.random() * 0.5 + 0.5 },
        { category: '�����Ų�', score: Math.random(), confidence: Math.random() * 0.5 + 0.5 },
        { category: '��ȫע������', score: Math.random(), confidence: Math.random() * 0.5 + 0.5 }
      ];
      
    // ����������
    categoriesWithScores.sort((a, b) => b.score - a.score);
    
    // ����������������
    const wordCount = text.split(/\s+/).length;
    const LanguageIcon = text.match(/[\u4e00-\u9fa5]/) ? 'zh-CN' : 'en-US';
    
    // ���ɹؼ���
    const keywords = Array.from(
      { length: Math.min(5, Math.ceil(wordCount / 20)) },
      () => {
        const words = text.split(/\s+/).filter(w => w.length > 2);
        return words[Math.floor(Math.random() * words.length)];
      }
    );
    
    return {
      success: true,
      data: {
        categories: categoriesWithScores,
        dominantCategory: categoriesWithScores[0].category,
        confidence: categoriesWithScores[0].confidence,
        metadata: {
          wordCount,
          LanguageIcon,
          keywords
        }
      }
    };
  }

  // �ı�ժҪ����
  public async generateTextSummary(params: TextSummaryParams): Promise<apiResponse<TextSummaryResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { text, maxLength, type } = params;
    
    // ����������
    const wordCount = text.split(/\s+/).length;
    
    // ����ժҪ����󳤶�
    const summaryLength = maxLength || Math.ceil(wordCount * 0.3);
    
    // ����ժҪ�������ɲ�ͬ��ժҪ
    let summary = '';
    let keyPoints: string[] = [];
    
    if (type === 'extractive' || !type) {
      // ��ȡʽժҪ����ԭ������ȡ�ؼ�����
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const selectedSentences = sentences
        .slice(0, Math.min(3, sentences.length))
        .concat(sentences.length > 5 ? [sentences[Math.floor(sentences.length / 2)]] : [])
        .concat(sentences.length > 3 ? [sentences[sentences.length - 1]] : []);
      
      summary = selectedSentences.join(' ').substring(0, summaryLength);
      
      // ���ɹؼ���
      keyPoints = sentences
        .filter((_, i) => i % Math.ceil(sentences.length / 3) === 0)
        .slice(0, 3)
        .map(s => s.trim());
        
    } else if (type === 'abstractive') {
      // ����ʽժҪ�������µ�ժҪ����
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const words = text.split(/\s+/).filter(w => w.length > 3);
      
      // ģ�����ʽժҪ
      summary = `����һƪ����${words[Math.floor(Math.random() * words.length)]}�����£���Ҫ̽����${
        words[Math.floor(Math.random() * words.length)]
      }����Ҫ�ԡ����·�����${
        words[Math.floor(Math.random() * words.length)]
      }�ļ����ؼ����棬�������${
        words[Math.floor(Math.random() * words.length)]
      }���¼��⡣`.substring(0, summaryLength);
      
      // ���ɹؼ���
      keyPoints = [
        `${words[Math.floor(Math.random() * words.length)]}����Ҫ��`,
        `${words[Math.floor(Math.random() * words.length)]}�Ĺؼ�����`,
        `${words[Math.floor(Math.random() * words.length)]}��Ӧ��ǰ��`
      ];
    }
    
    return {
      success: true,
      data: {
        summary,
        keyPoints,
        metadata: {
          originalLength: wordCount,
          summaryLength: summary.split(/\s+/).length,
          compressionRatio: summary.split(/\s+/).length / wordCount,
          type: type || 'extractive'
        }
      }
    };
  }

  // ʵ�鱨������
  public async generateExperimentReport(params: ExperimentReportParams): Promise<apiResponse<ExperimentReportResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const { experimentId, experimentData, format, sections } = params;
    
    // ģ�ⱨ�沿��
    const reportSections: Record<string, string> = {};
    
    // ��������Ĳ���������Ӧ������
    const availableSections = [
      'introduction', 'methodology', 'results', 
      'discussion', 'conclusion', 'references'
    ];
    
    const requestedSections = sections || availableSections;
    
    // ���ɸ���������
    requestedSections.forEach(section => {
      if (section === 'introduction') {
        reportSections[section] = `# ����\n\n��ʵ��ּ���о�${experimentData?.title || '�ض������µ�ʵ������'}��ͨ��ϵͳ��ʵ����ƺ����ݷ�����̽��${experimentData?.variables?.[0] || '�ؼ�����'}��${experimentData?.variables?.[1] || 'ʵ����'}֮��Ĺ�ϵ�����о�����${experimentData?.subject || '�������'}������Ҫ���塣\n\n## �о�����\n\n�ڹ�ȥ���о��У�${experimentData?.background || '����������ж���̽��'}�����Դ���һЩ�ؼ�����δ�ܽ������ʵ�齫�ص��ע��Щ���⡣`;
      } else if (section === 'methodology') {
        reportSections[section] = `# ʵ�鷽��\n\n## ʵ�����\n\n��ʵ�����${experimentData?.designType || '���������'}��ͨ������${experimentData?.variables?.[0] || '�ؼ�����'}��${experimentData?.conditions?.length || '���'}��ͬ�����µı��ֽ����о���\n\n## �������豸\n\nʵ��ʹ�õ���Ҫ�豸����${experimentData?.equipment?.join('��') || '����ʵ���豸'}��\n\n## ʵ�鲽��\n\n1. ׼��ʵ����Ϻ��豸\n2. ����ʵ�����\n3. ���ж������ʵ��\n4. ��¼ʵ������\n5. ����ʵ����`;
      } else if (section === 'results') {
        reportSections[section] = `# ʵ����\n\n## ���ݸ���\n\nʵ�鹲�ռ���${experimentData?.dataPoints || '����'}�����ݵ㣬������${experimentData?.variables?.length || '���'}�����ı仯�����\n\n## �ؼ�����\n\n* ����${experimentData?.variables?.[0] || '����A'}��${experimentData?.variables?.[1] || '����B'}֮�����${Math.random() > 0.5 ? '��' : '��'}��ع�ϵ\n* ��${experimentData?.conditions?.[0] || '�ض�����'}�£��۲쵽��${experimentData?.observations?.[0] || '������ʵ������'}\n* ���ݷ���������${experimentData?.insights?.[0] || 'ʵ��������ͳ��ѧ����'}\n\n## ���ݿ��ӻ�\n\n(�˴�Ӧ����ʵ�����ݵ�ͼ�����ӻ�)`;
      } else if (section === 'discussion') {
        reportSections[section] = `# ����\n\n## �������\n\n��ʵ��Ľ��������${experimentData?.variables?.[0] || '�о�����'}��${experimentData?.variables?.[1] || '�������'}������Ӱ�졣����${experimentData?.references?.[0] || '�����о�'}�ķ���${Math.random() > 0.5 ? 'һ��' : '����һ������'}��\n\n## ��������\n\n���о�����һЩ���ƣ�����${experimentData?.limitations?.join('��') || '���������ޡ�ʵ���������޵�'}��\n\n## δ���о�����\n\n���ڱ�ʵ��ķ��֣�δ���о����Խ�һ��̽��${experimentData?.futureDirections?.[0] || '������ر�����Ӱ��'}���Լ�${experimentData?.futureDirections?.[1] || '�ڲ�ͬ�����µ�Ӧ�ÿ���'}��`;
      } else if (section === 'conclusion') {
        reportSections[section] = `# ����\n\n��ʵ��ͨ��${experimentData?.methodology || 'ϵͳ��ʵ�鷽��'}���о���${experimentData?.variables?.[0] || '�ؼ�����'}��${experimentData?.variables?.[1] || 'ʵ����'}��Ӱ�졣�о����֣�${experimentData?.conclusions?.[0] || '���ض������´������������'}����һ���ֶ���${experimentData?.subject || '�������'}������Ҫ�����ۺ�ʵ�����塣\n\nδ���о�����һ��̽��${experimentData?.futureDirections?.[0] || '�����������'}���Լ���Ը���������⡣`;
      } else if (section === 'references') {
        reportSections[section] = `# �ο�����\n\n1. ${experimentData?.references?.[0] || 'Smith, J. (2024). ����о���Ŀ. �ڿ�����, 10(2), 100-110.'}\n2. ${experimentData?.references?.[1] || 'Wang, L. & Zhang, X. (2023). ��һ������о�. �ڿ�����, 8(4), 210-225.'}\n3. ${experimentData?.references?.[2] || 'Johnson, K., et al. (2022). ��������. �ڿ�����, 15(1), 50-75.'}`;
      }
    });
    
    // ������������
    const fullReport = Object.values(reportSections).join('\n\n');
    
    // ���ɱ���Ԫ����
    const metadata = {
      generatedAt: new Date().toISOString(),
      wordCount: fullReport.split(/\s+/).length,
      format: format || 'markdown',
      sections: Object.keys(reportSections),
      experimentId: experimentId || 'unknown'
    };
    
    return {
      success: true,
      data: {
        report: fullReport,
        sections: reportSections,
        metadata
      }
    };
  }

  // ʵ��������������
  public async semanticSearchExperiments(params: SemanticSearchParams): Promise<apiResponse<SemanticSearchResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const { query, filters, limit } = params;
    
    // ģ���������
    const resultCount = limit || 10;
    
    // ����ģ����
    const results = Array.from({ length: resultCount }, (_, i) => {
      // ���ݲ�ѯ�ʺ͹�������������ضȷ���
      const baseRelevance = 0.95 - (i * 0.05);
      
      // Ӧ�ù�������Ӱ����ض�
      let appliedFilters: string[] = [];
      let relevanceScore = baseRelevance;
      
      if (filters) {
        if (filters.subject && Math.random() > 0.3) {
          appliedFilters.push(`ѧ��: ${filters.subject}`);
          relevanceScore *= 1.05;
        }
        
        if (filters.dateRange && Math.random() > 0.3) {
          appliedFilters.push(`���ڷ�Χ: ${filters.dateRange[0]} �� ${filters.dateRange[1]}`);
          relevanceScore *= 1.03;
        }
        
        if (filters.experimentType && Math.random() > 0.3) {
          appliedFilters.push(`ʵ������: ${filters.experimentType}`);
          relevanceScore *= 1.04;
        }
        
        // ��֤����������1
        relevanceScore = Math.min(relevanceScore, 0.99);
      }
      
      // ����ģ��ʵ������
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-06-30');
      const experimentDate = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
      );
      
      // ����ƥ����ı�Ƭ��
      const queryTerms = query.split(/\s+/);
      const randomTerm = queryTerms[Math.floor(Math.random() * queryTerms.length)];
      
      const textFragments = [
        `...ʵ����ʹ�õ�${randomTerm}���ֳ�����������...`,
        `...ͨ����${randomTerm}�ķ��������Ƿ���...`,
        `...${randomTerm}�ڲ�ͬ�����µı仯���Ʊ���...`
      ];
      
      return {
        id: `exp-${Date.now()}-${i}`,
        title: `ʵ��${i+1}: ${
          queryTerms.length > 1 
          ? `${queryTerms[0]}��${queryTerms[1]}�Ĺ�ϵ�о�` 
          : `${query}��ʵ���о�`
        }`,
        date: experimentDate.toISOString(),
        author: `�о�Ա${String.fromCharCode(65 + i % 26)}`,
        relevanceScore,
        matchedFields: ['title', 'description', 'results', 'methodology'].slice(0, 2 + Math.floor(Math.random() * 3)),
        textFragments: textFragments.slice(0, 1 + Math.floor(Math.random() * 2)),
        appliedFilters
      };
    });
    
    // ����ض�����
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // ��������ͳ������
    const stats = {
      totalResults: resultCount + Math.floor(Math.random() * 50),
      searchTime: Math.random() * 0.5 + 0.2,
      filtersApplied: !!filters
    };
    
    return {
      success: true,
      data: {
        results,
        stats,
        query
      }
    };
  }

  // ����ʶ���봦�����api
  public async speechToText(audioFile: File, params?: {
    LanguageIcon?: string;
    model?: string;
    enableTimestamps?: boolean;
  }): Promise<apiResponse<{
    text: string;
    confidence: number;
    segments?: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
    }>;
    metadata: {
      duration: number;
      wordCount: number;
      LanguageIcon: string;
    };
  }>> {
    // ����FormData�����ϴ���Ƶ�ļ�
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    if (params) {
      if (params.LanguageIcon) formData.append('LanguageIcon', params.LanguageIcon);
      if (params.model) formData.append('model', params.model);
      if (params.enableTimestamps !== undefined) 
        formData.append('enableTimestamps', params.enableTimestamps.toString());
    }
    
    return this.post('/ai/speech-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  // ģ������ʶ����
  public async mockSpeechToText(audioFile: File, params?: {
    language?: string;
    enableTimestamps?: boolean;
  }): Promise<apiResponse<{
    text: string;
    confidence: number;
    segments?: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
    }>;
    metadata: {
      duration: number;
      wordCount: number;
      language: string;
    };
  }>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Ĭ������
    const language = params?.language || 'zh-CN';
    
    // �����ļ���Сģ����Ƶʱ��������ƽ��������Ϊ128kbps��
    const fileSizeMB = audioFile.size / (1024 * 1024);
    const estimatedDuration = fileSizeMB * 8 / 0.128; // ʱ�����ƣ��룩
    
    // ģ��ʶ���ı���ʵ����Ŀ���ⲿ�ֻ�����ʵ��AI�����ṩ��
    let recognizedText = '';
    let segments: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
    }> = [];
    
    if (language === 'zh-CN') {
      recognizedText = '这是一次参数调试，现在转换文本。实验数据表明，我们观测到了有趣的现象，结果显示温度变化时，反应会变得更加活跃。未来实验将进一步探索不同温度条件下的反应情况。';
      
      if (params?.enableTimestamps) {
        const sentences = [
          '����һ�β���������תд�ı���',
          'ʵ����������ǹ۲쵽����Ȥ������',
          '������ʾ�¶�����ʱ��Ӧ�������Լӿ졣',
          'δ��ʵ�齫����̽����ͬ�����µķ�Ӧ���ơ�'
        ];
        
        let currentTime = 0;
        segments = sentences.map(sentence => {
          const duration = sentence.length * 0.2; // ����ÿ���ַ���Ҫ0.2��
          const segment = {
            text: sentence,
            start: currentTime,
            end: currentTime + duration,
            confidence: 0.85 + Math.random() * 0.1
          };
          currentTime += duration;
          return segment;
        });
      }
    } else {
      recognizedText = 'This is a transcription of a test audio. During the experiment, we observed interesting phenomena. The data shows that reaction rates significantly increase with temperature. Future experiments will continue to explore reaction mechaniSmsIcon under different conditions.';
      
      if (params?.enableTimestamps) {
        const sentences = [
          'This is a transcription of a test audio.',
          'During the experiment, we observed interesting phenomena.',
          'The data shows that reaction rates significantly increase with temperature.',
          'Future experiments will continue to explore reaction mechaniSmsIcon under different conditions.'
        ];
        
        let currentTime = 0;
        segments = sentences.map(sentence => {
          const duration = sentence.length * 0.1; // ����ÿ���ַ���Ҫ0.1��
          const segment = {
            text: sentence,
            start: currentTime,
            end: currentTime + duration,
            confidence: 0.9 + Math.random() * 0.08
          };
          currentTime += duration;
          return segment;
        });
      }
    }
    
    // ����ͳ��
    const wordCount = language === 'zh-CN' ? 
      recognizedText.replace(/[��������������""''��������]/g, '').length :
      recognizedText.split(/\s+/).length;
    
    return {
      success: true,
      data: {
        text: recognizedText,
        confidence: 0.92,
        segments: params?.enableTimestamps ? segments : undefined,
        metadata: {
          duration: estimatedDuration,
          wordCount,
          language
        }
      }
    };
  }
  
  // 图像OCR (光学字符识别)
  public async imageOCR(image: File, params?: {
    language?: string;
    detectOrientation?: boolean;
    recognitionMode?: 'fast' | 'accurate';
  }): Promise<apiResponse<{
    text: string;
    confidence: number;
    blocks: Array<{
      text: string;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      confidence: number;
      type: 'line' | 'paragraph' | 'word';
    }>;
    metadata: {
      language: string;
      orientation: 0 | 90 | 180 | 270;
      dimensions: {
        width: number;
        height: number;
      };
    };
  }>> {
    // 创建FormData来上传图片
    const formData = new FormData();
    formData.append('image', image);
    
    if (params) {
      if (params.language) formData.append('language', params.language);
      if (params.detectOrientation !== undefined) 
        formData.append('detectOrientation', params.detectOrientation.toString());
      if (params.recognitionMode) 
        formData.append('recognitionMode', params.recognitionMode);
    }
    
    return this.post('/ai/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  // 模拟图像OCR服务
  public async mockImageOCR(image: File, params?: {
    language?: string;
    detectOrientation?: boolean;
    recognitionMode?: 'fast' | 'accurate';
  }): Promise<apiResponse<{
    text: string;
    confidence: number;
    blocks: Array<{
      text: string;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      confidence: number;
      type: 'line' | 'paragraph' | 'word';
    }>;
    metadata: {
      language: string;
      orientation: 0 | 90 | 180 | 270;
      dimensions: {
        width: number;
        height: number;
      };
    };
  }>> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 默认语言
    const language = params?.language || 'zh-CN';
    
    // ģ��ͼƬ�ߴ�
    let imageWidth = 800;
    let imageHeight = 600;
    
    // ��ʵ����Ŀ�У������ͨ��ͼ�������ȡ��ʵ�ߴ�
    const createImagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(image);
      img.onload = () => {
        imageWidth = img.width;
        imageHeight = img.height;
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
    
    try {
      await createImagePromise;
    } catch (error) {
      console.error('Error loading image:', error);
    }
    
    // ģ��ʶ���ı�
    let recognizedText = '';
    let blocks: Array<{
      text: string;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      confidence: number;
      type: 'line' | 'paragraph' | 'word';
    }> = [];
    
    if (language === 'zh-CN') {
      recognizedText = 'ʵ�����ݷ�������\n\n�¶�: 25��C\nѹ��: 1.5 atm\n��Ӧʱ��: 45����\n\n�����ʾ�������¶ȵ����ߣ�����A���������ӣ����������н��͡��������ʵ������¶���20-30��C֮�䣬��ƽ������ʹ��ȡ�';
      
      // ģ���ı���
      blocks = [
        {
          text: 'ʵ�����ݷ�������',
          boundingBox: {
            x: imageWidth * 0.3,
            y: imageHeight * 0.1,
            width: imageWidth * 0.4,
            height: imageHeight * 0.08
          },
          confidence: 0.98,
          type: 'line'
        },
        {
          text: '�¶�: 25��C\nѹ��: 1.5 atm\n��Ӧʱ��: 45����',
          boundingBox: {
            x: imageWidth * 0.2,
            y: imageHeight * 0.25,
            width: imageWidth * 0.3,
            height: imageHeight * 0.15
          },
          confidence: 0.95,
          type: 'paragraph'
        },
        {
          text: '�����ʾ�������¶ȵ����ߣ�����A���������ӣ����������н��͡��������ʵ������¶���20-30��C֮�䣬��ƽ������ʹ��ȡ�',
          boundingBox: {
            x: imageWidth * 0.15,
            y: imageHeight * 0.5,
            width: imageWidth * 0.7,
            height: imageHeight * 0.25
          },
          confidence: 0.9,
          type: 'paragraph'
        }
      ];
    } else {
      recognizedText = 'Experimental Data Analysis Report\n\nTemperature: 25��C\nPressure: 1.5 atm\nReaction time: 45 minutes\n\nResults show that as temperature increases, the yield of product A increases but purity slightly decreases. It is recommended to control the temperature between 20-30��C in subsequent experiments to balance yield and purity.';
      
      // ģ���ı���
      blocks = [
        {
          text: 'Experimental Data Analysis Report',
          boundingBox: {
            x: imageWidth * 0.25,
            y: imageHeight * 0.1,
            width: imageWidth * 0.5,
            height: imageHeight * 0.08
          },
          confidence: 0.97,
          type: 'line'
        },
        {
          text: 'Temperature: 25��C\nPressure: 1.5 atm\nReaction time: 45 minutes',
          boundingBox: {
            x: imageWidth * 0.2,
            y: imageHeight * 0.25,
            width: imageWidth * 0.4,
            height: imageHeight * 0.15
          },
          confidence: 0.94,
          type: 'paragraph'
        },
        {
          text: 'Results show that as temperature increases, the yield of product A increases but purity slightly decreases. It is recommended to control the temperature between 20-30��C in subsequent experiments to balance yield and purity.',
          boundingBox: {
            x: imageWidth * 0.15,
            y: imageHeight * 0.5,
            width: imageWidth * 0.7,
            height: imageHeight * 0.25
          },
          confidence: 0.92,
          type: 'paragraph'
        }
      ];
    }
    
    return {
      success: true,
      data: {
        text: recognizedText,
        confidence: 0.94,
        blocks,
        metadata: {
          language,
          orientation: 0,
          dimensions: {
            width: imageWidth,
            height: imageHeight
          }
        }
      }
    };
  }
  
  // ��ѧͼ������
  public async analyzeScientificChart(image: File, params?: {
    chartType?: 'auto' | 'line' | 'bar' | 'scatter' | 'pie';
    extractData?: boolean;
    includeAxisLabels?: boolean;
  }): Promise<apiResponse<ScientificChartResponse>> {
    // ������ģʽ���������ģ�����
    return this.mockAnalyzeScientificChart(image, params);
    
    // ʵ��api������ - ������ʹ��
    // const formData = new FormData();
    // formData.append('image', image);
    // 
    // if (params) {
    //   if (params.chartType) formData.append('chartType', params.chartType);
    //   if (params.extractData !== undefined) 
    //     formData.append('extractData', params.extractData.toString());
    //   if (params.includeAxisLabels !== undefined) 
    //     formData.append('includeAxisLabels', params.includeAxisLabels.toString());
    // }
    // 
    // return this.post('/ai/analyze-scientific-chart', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // });
  }
  
  // ģ���ѧͼ����������
  public async mockAnalyzeScientificChart(image: File, params?: {
    chartType?: 'auto' | 'line' | 'bar' | 'scatter' | 'pie';
    extractData?: boolean;
    includeAxisLabels?: boolean;
  }): Promise<apiResponse<ScientificChartResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // �Զ�����ʹ��ָ����ͼ������
    const detectedChartType = params?.chartType === 'auto' ? 
      ['line', 'bar', 'scatter', 'pie'][Math.floor(Math.random() * 4)] : 
      params?.chartType || 'line';
    
    // ģ����ȡ������
    const extractedData = params?.extractData ? {
      labels: ['1��', '2��', '3��', '4��', '5��', '6��'],
      series: [
        {
          name: '��A',
          data: [25, 38, 45, 35, 50, 62]
        },
        {
          name: '��B',
          data: [18, 32, 40, 30, 45, 55]
        }
      ]
    } : undefined;
    
    // ģ�����ǩ
    const axisLabels = params?.includeAxisLabels ? {
      x: 'ʱ�䣨�£�',
      y: '������kg��'
    } : undefined;
    
    // ����ͼ���������ɲ�ͬ�Ľ���
    let interpretation = '';
    
    if (detectedChartType === 'line') {
      interpretation = '����ͼ��ʾ������ʵ������6�����ڵĲ����仯���ơ���A�Ĳ���ʼ�ո�����B��������ڵ�3���´ﵽ�ֲ���ֵ�����ڵ�5-6���´ﵽ�������ֵ���������Ƴ�������̬�ƣ�����ʵ�������Ż����ܴ����˲���������';
    } else if (detectedChartType === 'bar') {
      interpretation = '����״ͼ�Ƚ�������ʵ������6�����ڵĲ������ݡ���A������ʱ���Ĳ�����������B��ƽ���߳�Լ18%���������ݾ�������������С���½������������ƣ���6���´ﵽ���ֵ��';
    } else if (detectedChartType === 'scatter') {
      interpretation = '��ɢ��ͼչʾ������ʵ�����ݵķֲ���������ݵ������������ƣ����ϵ��ԼΪ0.85����A�����ݵ�ֲ���Χ���㣬��׼����󣬶���B�����ݵ���Ӽ��У�������B��ʵ���������ܸ����ȶ���';
    } else if (detectedChartType === 'pie') {
      interpretation = '�ñ�ͼչʾ�˲�ͬʵ�������µĲ����ֲ����������У�����Aռ�ܲ�����35%������Bռ28%������Cռ22%������Dռ15%������A��B�ϼƹ�����63%�Ĳ���������������������Ϊ��Ч��';
    }
    
    return {
      success: true,
      data: {
        chartType: detectedChartType,
        title: '实验数据分析',
        axisLabels,
        extractedData,
        interpretation,
        confidence: 0.88,
        charts: [
          {
            type: detectedChartType,
            data: extractedData,
            title: '实验数据分析'
          }
        ],
        metadata: {
          processingTime: 1500,
          chartCount: 1,
          extractionMethod: 'computer_vision'
        }
      }
    };
  }
  
  // ��ʽʶ�������
  public async recognizeFormula(image: File, params?: {
    format?: 'latex' | 'mathml' | 'text';
    includeExplanation?: boolean;
  }): Promise<apiResponse<FormulaRecognitionResponse>> {
    // 暂时使用mock实现以保证类型安全
    return this.mockRecognizeFormula(image, params);
  }
  
  // ģ�⹫ʽʶ����
  public async mockRecognizeFormula(image: File, params?: {
    format?: 'latex' | 'mathml' | 'text';
    includeExplanation?: boolean;
  }): Promise<apiResponse<FormulaRecognitionResponse>> {
    // ģ��api�����ӳ�
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ĭ�ϸ�ʽ
    const format = params?.format || 'latex';
    
    // ģ��ʶ��Ĺ�ʽ (��ѧ����ѧ����)
    let formula = '';
    let convertedFormats: {
      latex?: string;
      mathml?: string;
      text?: string;
    } = {};
    
    // LaTeX��ʽ�Ĺ�ʽ
    const latexFormula = 'k = A e^{-E_a/RT}';
    
    // MathML��ʽ�Ĺ�ʽ
    const mathmlFormula = '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>k</mi><mo>=</mo><mi>A</mi><msup><mi>e</mi><mrow><mo>-</mo><msub><mi>E</mi><mi>a</mi></msub><mo>/</mo><mi>R</mi><mi>T</mi></mrow></msup></math>';
    
    // �ı���ʽ�Ĺ�ʽ
    const textFormula = 'k = A * exp(-Ea/RT)';
    
    // ��������ĸ�ʽ������Ӧ�Ĺ�ʽ
    if (format === 'latex') {
      formula = latexFormula;
      convertedFormats = {
        mathml: mathmlFormula,
        text: textFormula
      };
    } else if (format === 'mathml') {
      formula = mathmlFormula;
      convertedFormats = {
        latex: latexFormula,
        text: textFormula
      };
    } else if (format === 'text') {
      formula = textFormula;
      convertedFormats = {
        latex: latexFormula,
        mathml: mathmlFormula
      };
    }
    
    // ��ѡ�Ĺ�ʽ����
    const explanation = params?.includeExplanation ? 
      '���ǰ�������˹����(Arrhenius equation)�������˷�Ӧ���ʳ���k���¶�T�Ĺ�ϵ������A��ָǰ���ӣ�Ea�ǻ�ܣ�R�����峣�����÷��̱����������¶ȵ����ߣ���Ӧ���ʳ���k���󣬷�Ӧ���ʼӿ졣' : 
      undefined;
    
    return {
      success: true,
      data: {
        formula,
        formulas: [
          {
            formula: latexFormula,
            type: 'latex',
            confidence: 0.95
          },
          {
            formula: mathmlFormula,
            type: 'mathml', 
            confidence: 0.91
          },
          {
            formula: textFormula,
            type: 'text',
            confidence: 0.93
          }
        ],
        originalFormat: format,
        convertedFormats,
        explanation,
        confidence: 0.93
      }
    };
  }
}

// ����������AIServiceʵ��
const aiService = new AIService({
  baseURL: process.env.REACT_APP_api_URL || 'http://localhost:3002',
  timeout: 30000,
  withCredentials: true,
  autoErrorToast: true
});

export default aiService;
