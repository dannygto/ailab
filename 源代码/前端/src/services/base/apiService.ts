import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface apiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export class BaseapiService {
  protected apiClient: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.apiClient = axios.create({
      baseURL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<apiResponse<T>> = await this.apiClient.request(config);
    return response.data.data;
  }

  async get<T = any>(url: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url });
  }
} 