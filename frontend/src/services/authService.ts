// authService.ts - ��֤����ģ��

import { BaseapiService, apiResponse } from './base/apiService';

// ���Ͷ���
export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ��֤����ʵ��
export class AuthService extends BaseapiService {
  // ��¼
  public async login(data: LoginRequest): Promise<apiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/login', data);
    
    // �����¼�ɹ����洢token
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  }
  
  // ע��
  public async register(data: RegisterRequest): Promise<apiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/register', data);
    
    // ���ע��ɹ����洢token
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  }
  
  // �ǳ�
  public async logout(): Promise<apiResponse<void>> {
    // ������ش洢��token
    localStorage.removeItem('token');
    
    // ���õǳ�api
    return this.post<void>('/auth/logout');
  }
  
  // ��ȡ��ǰ�û���Ϣ
  public async getCurrentUser(): Promise<apiResponse<User>> {
    return this.get<User>('/auth/me');
  }
  
  // ˢ��token
  public async refreshToken(): Promise<apiResponse<{ token: string }>> {
    const response = await this.post<{ token: string }>('/auth/refresh-token');
    
    // ���ˢ�³ɹ������´洢��token
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  }
  
  // ����Ƿ��ѵ�¼
  public isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  // ��ȡtoken
  public getToken(): string | null {
    return localStorage.getItem('token');
  }
}
