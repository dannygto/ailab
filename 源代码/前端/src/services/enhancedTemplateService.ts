// enhancedTemplateService.ts - ��ǿ��ģ�����ģ�飬��չ��׼ģ��������ṩ�������Ĺ���

import { Box } from '@mui/material';
import { templateService as baseTemplateService } from './index';
import { BaseapiService, apiResponse } from './base/apiService';
import { 
  ExperimentTemplate, 
  TemplateVersion,
  TemplateVersionData,
  TemplateCategory,
  TemplateTag,
  TemplateAnalytics,
  AdvancedTemplateSearchParams,
  PaginatedResponse
} from '../types';
import { UpdateTemplateRequest, CreateTemplateRequest } from './templateService';

// ģ�����ѡ��
export interface TemplateShareOptions {
  isPublic: boolean;
  specificUsers?: string[];
  specificGroups?: string[];
  expiresAt?: string;
  permissions?: {
    canView: boolean;
    canEdit: boolean;
    canUse: boolean;
    canShare: boolean;
  };
  notifyUsers?: boolean;
}

// ��ǿ��ģ������� - �̳�BaseapiService�Է���protected����
export class EnhancedTemplateService extends BaseapiService {
  private baseService = baseTemplateService;

  constructor() {
    super({
      baseURL: process.env.REACT_APP_api_URL || 'http://localhost:3002',
      timeout: 30000,
      withCredentials: true,
      autoErrorToast: false
    });
  }

  // ����������װ
  public async getTemplates(params?: any): Promise<apiResponse<PaginatedResponse<ExperimentTemplate>>> {
    const response = await this.baseService.getTemplates(params);
    
    // ת��PaginatedResponse��ʽ�Լ���index.ts�еĶ���
    if (response.success && response.data) {
      const convertedData: PaginatedResponse<ExperimentTemplate> = {
        data: response.data.items || [],
        items: response.data.items || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        totalPages: response.data.totalPages || 0
      };
      
      return {
        ...response,
        data: convertedData
      };
    }
    
    return response as any;
  }

  public async getTemplate(id: string): Promise<apiResponse<ExperimentTemplate>> {
    return this.baseService.getTemplate(id);
  }

  public async createTemplate(data: CreateTemplateRequest): Promise<apiResponse<ExperimentTemplate>> {
    return this.baseService.createTemplate(data);
  }

  public async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<apiResponse<ExperimentTemplate>> {
    return this.baseService.updateTemplate(id, data);
  }

  public async deleteTemplate(id: string): Promise<apiResponse<void>> {
    return this.baseService.deleteTemplate(id);
  }

  // �߼�����: ģ��汾����
  public async getTemplateVersions(templateId: string): Promise<apiResponse<TemplateVersion[]>> {
    try {
      return this.get<TemplateVersion[]>(`/templates/${templateId}/versions`);
    } catch (error) {
      console.error('��ȡģ��汾ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '��ȡģ��汾ʧ��'
      };
    }
  }

  public async advancedSearch(params: AdvancedTemplateSearchParams): Promise<apiResponse<PaginatedResponse<ExperimentTemplate>>> {
    try {
      return this.post<PaginatedResponse<ExperimentTemplate>>('/templates/advanced-search', params);
    } catch (error) {
      console.error('�߼�����ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '�߼�����ʧ��'
      };
    }
  }

  public async getTemplateCategories(): Promise<apiResponse<TemplateCategory[]>> {
    try {
      return this.get<TemplateCategory[]>('/templates/categories');
    } catch (error) {
      console.error('��ȡģ�����ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '��ȡģ�����ʧ��'
      };
    }
  }

  public async getPopularTags(limit: number = 20): Promise<apiResponse<TemplateTag[]>> {
    try {
      return this.get<TemplateTag[]>('/templates/tags/popular', { limit });
    } catch (error) {
      console.error('��ȡ���ű�ǩʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '��ȡ���ű�ǩʧ��'
      };
    }
  }

  // �߼�����: ģ�����
  public async getTemplateAnalytics(templateId: string): Promise<apiResponse<TemplateAnalytics>> {
    try {
      return this.get<TemplateAnalytics>(`/templates/${templateId}/analytics`);
    } catch (error) {
      console.error('��ȡģ���������ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '��ȡģ���������ʧ��'
      };
    }
  }

  // �߼�����: ����ģ���Ƽ�
  public async getSimilarTemplates(templateId: string, limit: number = 5): Promise<apiResponse<ExperimentTemplate[]>> {
    try {
      return this.get<ExperimentTemplate[]>(`/templates/${templateId}/similar`, { limit });
    } catch (error) {
      console.error('��ȡ����ģ��ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '��ȡ����ģ��ʧ��'
      };
    }
  }

  // �߼�����: ģ�����
  public async shareTemplate(templateId: string, options: TemplateShareOptions): Promise<apiResponse<{ shareId: string; shareUrl: string }>> {
    try {
      return this.post<{ shareId: string; shareUrl: string }>(`/templates/${templateId}/share`, options);
    } catch (error) {
      console.error('����ģ��ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '����ģ��ʧ��'
      };
    }
  }

  // �߼�����: ģ������
  public async rateTemplate(templateId: string, rating: number, comment?: string): Promise<apiResponse<{ averageRating: number; ratingsCount: number }>> {
    try {
      return this.post<{
        averageRating: number;
        ratingsCount: number;
      }>(`/templates/${templateId}/rate`, { rating, comment });
    } catch (error) {
      console.error('ģ������ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'ģ������ʧ��'
      };
    }
  }

  // �߼�����: ģ�嵼��
  public async exportTemplate(templateId: string, format: 'json' | 'pdf' | 'docx' = 'json'): Promise<apiResponse<{ url: string }>> {
    try {
      return this.get<{ url: string }>(`/templates/${templateId}/export`, { format });
    } catch (error) {
      console.error('����ģ��ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '����ģ��ʧ��'
      };
    }
  }

  // �߼�����: �汾�ָ�
  public async restoreTemplateVersion(templateId: string, versionId: string): Promise<apiResponse<ExperimentTemplate>> {
    try {
      return this.post<ExperimentTemplate>(`/templates/${templateId}/versions/${versionId}/restore`, {});
    } catch (error) {
      console.error('�ָ�ģ��汾ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '�ָ�ģ��汾ʧ��'
      };
    }
  }

  // �߼�����: ����ɾ��
  public async bulkDeleteTemplates(templateIds: string[]): Promise<apiResponse<{ deleted: number; failed: string[] }>> {
    try {
      return this.post<{ deleted: number; failed: string[] }>('/templates/bulk-delete', { templateIds });
    } catch (error) {
      console.error('����ɾ��ģ��ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '����ɾ��ģ��ʧ��'
      };
    }
  }

  // �߼�����: ��������
  public async bulkUpdateTemplates(
    templateIds: string[], 
    updates: Partial<ExperimentTemplate>
  ): Promise<apiResponse<{ updated: number; failed: string[] }>> {
    try {
      return this.post<{ updated: number; failed: string[] }>('/templates/bulk-update', { templateIds, updates });
    } catch (error) {
      console.error('��������ģ��ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '��������ģ��ʧ��'
      };
    }
  }

  // �߼�����: ģ�嵼��
  public async importTemplate(
    file: File, 
    options: { overwrite?: boolean; categoryId?: string } = {}
  ): Promise<apiResponse<ExperimentTemplate>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      return this.post<ExperimentTemplate>('/templates/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('����ģ��ʧ��:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '����ģ��ʧ��'
      };
    }
  }
}

// ������������ǿģ�����ʵ��
export const enhancedTemplateService = new EnhancedTemplateService();
export default enhancedTemplateService;
