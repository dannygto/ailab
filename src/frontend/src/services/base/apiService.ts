import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface apiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ServiceConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  autoErrorToast?: boolean;
}

export class BaseapiService {
  protected apiClient: AxiosInstance;

  constructor(config: string | ServiceConfig) {
    // Support both string and config object for backward compatibility
    const baseConfig = typeof config === 'string' 
      ? { baseURL: config }
      : config;
      
    this.apiClient = axios.create({
      baseURL: baseConfig.baseURL,
      timeout: baseConfig.timeout || 60000,
      withCredentials: baseConfig.withCredentials || false,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  protected async request<T>(config: AxiosRequestConfig): Promise<apiResponse<T>> {
    const response: AxiosResponse<any> = await this.apiClient.request(config);
    // Check if response has the apiResponse structure
    const hasApiResponseStructure = response.data && typeof response.data === 'object' && 'data' in response.data;
    
    return {
      data: hasApiResponseStructure ? response.data.data : response.data,
      message: hasApiResponseStructure ? response.data.message : undefined,
      success: hasApiResponseStructure ? response.data.success !== false : true
    };
  }

  async get<T = any>(url: string, params?: any): Promise<apiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<apiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  async put<T = any>(url: string, data?: any): Promise<apiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  async delete<T = any>(url: string): Promise<apiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url });
  }
} 