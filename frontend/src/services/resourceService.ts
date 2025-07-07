// resourceService.ts - ��Դ����ģ��

import { BaseapiService, apiResponse } from './base/apiService';

// ��Դ���Ͷ���
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'simulation' | 'dataset' | 'template' | 'external';
  url: string;
  thumbnailUrl?: string;
  author?: string;
  subject?: string;
  CategoryIcon?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  grade?: 'elementary' | 'middle' | 'high' | 'university';
  rating?: number;
  ratingsCount?: number;
  createdAt: string;
  updatedAt: string;
  popularity?: number;
  relatedExperiments?: string[];
  relatedTemplates?: string[];
  isPublic?: boolean;
  licenseType?: string;
  contentSize?: number;
  contentSizeUnit?: 'KB' | 'MB' | 'GB';
  duration?: number; // ��Ƶ��ģ����Դ�ĳ���ʱ�䣨���ӣ�
  sourceType?: 'internal' | 'external';
  ownerUserId?: string;
}

// ��Դ�������ӿ�
export interface ResourceFilters {
  search?: string;
  type?: string | string[];
  subject?: string | string[];
  CategoryIcon?: string | string[];
  difficulty?: string | string[];
  grade?: string | string[];
  tags?: string[];
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

// ��Դ�ղ�/��������
export interface ResourceRatingRequest {
  resourceId: string;
  rating: number;
  comment?: string;
}

// ��Դ����ʵ��
export class ResourceService extends BaseapiService {
  // ��ȡ��Դ�б�
  public async getResources(filters?: ResourceFilters): Promise<apiResponse<{
    resources: Resource[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return this.get('/resources', { params: filters });
  }
  
  // ��ȡ������Դ����
  public async getResource(id: string): Promise<apiResponse<Resource>> {
    return this.get(`/resources/${id}`);
  }
  
  // ������Դ
  public async createResource(resource: Partial<Resource>): Promise<apiResponse<Resource>> {
    return this.post('/resources', resource);
  }
  
  // ������Դ
  public async updateResource(id: string, resource: Partial<Resource>): Promise<apiResponse<Resource>> {
    return this.put(`/resources/${id}`, resource);
  }
  
  // ɾ����Դ
  public async deleteResource(id: string): Promise<apiResponse<void>> {
    return this.delete(`/resources/${id}`);
  }
  
  // ��ȡ�Ƽ���Դ������ʵ���ģ�壩
  public async getRecommendedResources(params: {
    experimentId?: string;
    templateId?: string;
    experimentType?: string;
    subject?: string;
    limit?: number;
    page?: number;
  }): Promise<apiResponse<{
    resources: Resource[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return this.get('/resources/recommended', { params });
  }
  
  // ��ȡ�����Դ
  public async getRelatedResources(resourceId: string, limit = 6): Promise<apiResponse<Resource[]>> {
    return this.get(`/resources/${resourceId}/related`, { params: { limit } });
  }
  
  // �ղ���Դ
  public async saveResource(resourceId: string): Promise<apiResponse<{ saved: boolean }>> {
    return this.post(`/resources/${resourceId}/save`);
  }
  
  // ȡ���ղ���Դ
  public async unsaveResource(resourceId: string): Promise<apiResponse<{ saved: boolean }>> {
    return this.post(`/resources/${resourceId}/unsave`);
  }
  
  // ��ȡ�û��ղص���Դ
  public async getSavedResources(userId?: string): Promise<apiResponse<Resource[]>> {
    const params = userId ? { userId } : {};
    return this.get('/resources/saved', { params });
  }
  
  // ����Դ��������
  public async rateResource(request: ResourceRatingRequest): Promise<apiResponse<{ 
    success: boolean;
    newRating: number;
    ratingsCount: number;
  }>> {
    return this.post(`/resources/${request.resourceId}/rate`, request);
  }
  
  // �ϴ���Դ�ļ�
  public async uploadResourceFile(
    file: File, 
    metadata: {
      title: string;
      description: string;
      type: string;
      subject?: string;
      tags?: string[];
    }
  ): Promise<apiResponse<Resource>> {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value);
        }
      }
    });
    
    return this.post('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  // �����ԴURL�Ƿ���Ч
  public async validateResourceUrl(url: string): Promise<apiResponse<{ 
    valid: boolean;
    metadata?: {
      title?: string;
      description?: string;
      type?: string;
      thumbnailUrl?: string;
    }
  }>> {
    return this.post('/resources/validate-url', { url });
  }
}

// ��Դ����ʵ������services/index.ts�д���
