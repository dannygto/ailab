// enhancedAiService.ts - 增强的AI服务模块，扩展标准AI服务以提供更完整的功�?

import { Box } from '@mui/material';
import { AIService } from './aiService';
import { BaseapiService, apiResponse } from './base/apiService';

// 增强服务配置
interface AIServiceConfig {
  endpoint: string;
  timeout: number;
  retries: number;
}

// 服务状态接�?
interface AIServiceStatus {
  isHealthy: boolean;
  latency: number;
  lastCheckIconed: Date;
  availableModels: string[];
}

// 扩展现有的aiService对象，添加新的方�?
export class EnhancedAIService extends BaseapiService {
  private baseService: AIService;
  private aiConfig: AIServiceConfig = {
    endpoint: '/api/ai',
    timeout: 30000,
    retries: 2
  };
  private status: AIServiceStatus | null = null;

  constructor() {
    super({
      baseURL: process.env.REACT_APP_api_URL || 'http://localhost:3001/api',
      timeout: 60000,
      withCredentials: true,
      autoErrorToast: true
    });

    // 创建基础AI服务实例
    this.baseService = new AIService({
      baseURL: process.env.REACT_APP_api_URL || 'http://localhost:3001/api',
      timeout: 60000,
      withCredentials: true,
      autoErrorToast: true
    });
  }

  // 健康检�?
  async CheckIconHealth(): Promise<AIServiceStatus> {
    try {
      const start = Date.now();
      const response = await this.get<{models: string[]}>('/health');
      const latency = Date.now() - start;

      this.status = {
        isHealthy: true,
        latency,
        lastCheckIconed: new Date(),
        availableModels: response.data?.models || []
      };

      return this.status;
    } catch (error) {
      this.status = {
        isHealthy: false,
        latency: -1,
        lastCheckIconed: new Date(),
        availableModels: []
      };
      return this.status;
    }
  }

  // 转发基础AI服务的方�?
  async completeText(prompt: string, options?: any) {
    return this.baseService.completeText({ prompt, ...options });
  }

  async chatCompletion(messages: any[], options?: any) {
    return this.baseService.chatCompletion({ messages, ...options });
  }

  async analyzeImage(imageData: string) {
    return this.baseService.analyzeImage({ image: imageData });
  }

  // 简化的方法，避免复杂的依赖
  async generateExperimentReport(params: any): Promise<apiResponse<any>> {
    try {
      const response = await this.post<any>('/ai/report/generate', params);
      return response;
    } catch (error) {
      console.error('Error generating experiment report:', error);
      throw error;
    }
  }
}

// 创建并导出实�?
export const enhancedAiService = new EnhancedAIService();

// 默认导出
export default enhancedAiService;
