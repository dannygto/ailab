// experimentService.ts - 实验管理服务模块

import { BaseapiService, apiResponse } from './base/apiService';

// ���Ͷ���
export interface Experiment {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  config?: any;
  results?: any;
  templateId?: string;
  [key: string]: any;
}

export interface CreateExperimentRequest {
  title: string;
  description: string;
  type: string;
  config?: any;
  templateId?: string;
}

export interface UpdateExperimentRequest {
  title?: string;
  description?: string;
  status?: string;
  config?: any;
  results?: any;
}

export interface ExperimentListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  type?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ʵ�����ʵ��
export class ExperimentService extends BaseapiService {
  // ��ȡʵ���б�
  public async getExperiments(params?: ExperimentListParams): Promise<apiResponse<PaginatedResponse<Experiment>>> {
    return this.get<PaginatedResponse<Experiment>>('/experiments', params);
  }
  
  // ��ȡ����ʵ��
  public async getExperiment(id: string): Promise<apiResponse<Experiment>> {
    return this.get<Experiment>(`/experiments/${id}`);
  }
  
  // ����ʵ��
  public async createExperiment(data: CreateExperimentRequest): Promise<apiResponse<Experiment>> {
    // ����ת����ȷ��ǰ��˽ṹһ��
    const experimentData = {
      ...data,
      // ����Ĭ��ֵ������ת��
      config: data.config || {},
      status: 'draft'
    };
    
    return this.post<Experiment>('/experiments', experimentData);
  }
  
  // ����ʵ��
  public async updateExperiment(id: string, data: UpdateExperimentRequest): Promise<apiResponse<Experiment>> {
    return this.put<Experiment>(`/experiments/${id}`, data);
  }
  
  // ɾ��ʵ��
  public async deleteExperiment(id: string): Promise<apiResponse<void>> {
    return this.delete<void>(`/experiments/${id}`);
  }
  
  // ����ʵ��
  public async startExperiment(id: string): Promise<apiResponse<Experiment>> {
    return this.post<Experiment>(`/experiments/${id}/start`);
  }
  
  // ֹͣʵ��
  public async stopExperiment(id: string): Promise<apiResponse<Experiment>> {
    return this.post<Experiment>(`/experiments/${id}/stop`);
  }
  
  // ����ʵ��
  public async cloneExperiment(id: string, newTitle?: string): Promise<apiResponse<Experiment>> {
    return this.post<Experiment>(`/experiments/${id}/clone`, { title: newTitle });
  }
  
  // ��ȡʵ����
  public async getExperimentResults(id: string): Promise<apiResponse<any>> {
    return this.get<any>(`/experiments/${id}/results`);
  }
  
  // �ϴ�ʵ������
  public async uploadExperimentData(id: string, file: File): Promise<apiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.post<any>(`/experiments/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  // ��ȡʵ��ִ��״̬
  public async getExperimentExecution(id: string): Promise<apiResponse<any>> {
    return this.get<any>(`/experiments/${id}/execution`);
  }
  
  // ��ȡʵ��ִ����־
  public async getExperimentLogs(id: string, limit: number = 100): Promise<apiResponse<any>> {
    return this.get<any>(`/experiments/${id}/logs`, { limit });
  }
  
  // ��ȡʵ��ִ��ָ��
  public async getExperimentMetrics(id: string): Promise<apiResponse<any>> {
    return this.get<any>(`/experiments/${id}/metrics`);
  }
}


const experimentService = new ExperimentService('/api');
export default experimentService;
