// templateService.ts - 实验模板服务

import { BaseapiService, apiResponse } from './base/apiService';
import { ExperimentTemplate, TemplateSearchParams } from '../types';

// 类型定义
export interface CreateTemplateRequest {
  name: string;
  description: string;
  type: string;
  subject?: string;
  CategoryIcon?: string;
  difficulty?: string;
  grade?: string;
  duration?: number;
  instructions?: string[];
  parameters?: any;
  tags?: string[];
  thumbnailUrl?: string;
  isPublic?: boolean;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  detailedDescription?: string;
  type?: string;
  subject?: string;
  CategoryIcon?: string;
  difficulty?: string;
  grade?: string;
  duration?: number;
  instructions?: string[];
  parameters?: any;
  steps?: any[];
  materials?: any[];
  tags?: string[];
  thumbnailUrl?: string;
  isPublic?: boolean;
}

export interface TemplateListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  type?: string;
  subject?: string;
  CategoryIcon?: string;
  difficulty?: string;
  grade?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 模板服务实现
export class TemplateService extends BaseapiService {
  // 获取模板列表
  public async getTemplates(params?: TemplateListParams): Promise<apiResponse<PaginatedResponse<ExperimentTemplate>>> {
    return this.get<PaginatedResponse<ExperimentTemplate>>('/templates', params);
  }
  
  // 获取热门模板
  public async getPopularTemplates(limit: number = 5): Promise<apiResponse<ExperimentTemplate[]>> {
    return this.get<ExperimentTemplate[]>('/templates/popular', { limit });
  }
  
  // 搜索模板
  public async searchTemplates(params: TemplateSearchParams): Promise<apiResponse<PaginatedResponse<ExperimentTemplate>>> {
    return this.post<PaginatedResponse<ExperimentTemplate>>('/templates/search', params);
  }
  
  // 获取单个模板
  public async getTemplate(id: string): Promise<apiResponse<ExperimentTemplate>> {
    return this.get<ExperimentTemplate>(`/templates/${id}`);
  }
  
  // ����ģ��
  public async createTemplate(data: CreateTemplateRequest): Promise<apiResponse<ExperimentTemplate>> {
    // ����ת����ȷ��ǰ��˽ṹһ��
    const templateData = {
      ...data,
      // ����Ĭ��ֵ
      parameters: data.parameters || {},
      tags: data.tags || [],
      isPublic: data.isPublic !== undefined ? data.isPublic : true
    };
    
    return this.post<ExperimentTemplate>('/templates', templateData);
  }
  
  // ����ģ��
  public async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<apiResponse<ExperimentTemplate>> {
    return this.put<ExperimentTemplate>(`/templates/${id}`, data);
  }
  
  // ɾ��ģ��
  public async deleteTemplate(id: string): Promise<apiResponse<void>> {
    return this.delete<void>(`/templates/${id}`);
  }
  
  // ��ģ�崴��ʵ��
  public async createExperimentFromTemplate(templateId: string, customData?: any): Promise<apiResponse<any>> {
    return this.post<any>(`/templates/${templateId}/create-experiment`, customData || {});
  }
}


const templateService = new TemplateService('/api');
export default templateService;
