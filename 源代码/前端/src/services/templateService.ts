// templateService.ts - ʵ��ģ�����

import { Box } from '@mui/material';
import { BaseapiService, apiResponse } from './base/apiService';
import { ExperimentTemplate, TemplateSearchParams } from '../types';

// ���Ͷ���
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

// ģ�����ʵ��
export class TemplateService extends BaseapiService {
  // ��ȡģ���б�
  public async getTemplates(params?: TemplateListParams): Promise<apiResponse<PaginatedResponse<ExperimentTemplate>>> {
    return this.get<PaginatedResponse<ExperimentTemplate>>('/templates', params);
  }
  
  // ��ȡ����ģ��
  public async getPopularTemplates(limit: number = 5): Promise<apiResponse<ExperimentTemplate[]>> {
    return this.get<ExperimentTemplate[]>('/templates/popular', { limit });
  }
  
  // ����ģ��
  public async searchTemplates(params: TemplateSearchParams): Promise<apiResponse<PaginatedResponse<ExperimentTemplate>>> {
    return this.post<PaginatedResponse<ExperimentTemplate>>('/templates/search', params);
  }
  
  // ��ȡ����ģ��
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


export default templateData;
