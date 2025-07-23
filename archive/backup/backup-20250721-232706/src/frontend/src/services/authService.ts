// authService.ts - 认证服务模块

import { BaseapiService, apiResponse } from './base/apiService';

// 类型定义
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
  requireTwoFactor?: boolean;  // 是否需要两因素认证
  tempToken?: string;          // 临时token，用于两因素认证
  loginAnomaly?: boolean;      // 是否存在异常登录
  anomalyType?: 'location' | 'device' | 'time' | 'other'; // 异常登录类型
  anomalyDetails?: {
    currentLocation?: string;  // 当前登录位置
    usualLocation?: string;    // 通常登录位置
    currentDevice?: string;    // 当前设备信息
    currentTime?: string;      // 当前登录时间
    additionalInfo?: string;   // 额外信息
  };
}

// 认证服务实现
export class AuthService extends BaseapiService {
  // 登录
  public async login(data: LoginRequest): Promise<apiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/login', data);

    // 如果登录成功，存储token
    if (response.success && response.data?.token) {
      // 如果勾选了"记住我"，使用localStorage存储，否则使用sessionStorage
      if (data.remember) {
        localStorage.setItem('token', response.data.token);
      } else {
        sessionStorage.setItem('token', response.data.token);
      }
    }

    return response;
  }

  // 注册
  public async register(data: RegisterRequest): Promise<apiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/auth/register', data);

    // 如果注册成功，存储token
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response;
  }

  // 登出
  public async logout(): Promise<apiResponse<void>> {
    // 清除本地存储的token
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // 调用登出api
    return this.post<void>('/auth/logout');
  }

  // 获取当前用户信息
  public async getCurrentUser(): Promise<apiResponse<User>> {
    return this.get<User>('/auth/me');
  }

  // 刷新token
  public async refreshToken(): Promise<apiResponse<{ token: string }>> {
    const response = await this.post<{ token: string }>('/auth/refresh-token');

    // 如果刷新成功，重新存储新token
    if (response.success && response.data?.token) {
      // 检查token是否存储在localStorage或sessionStorage中
      if (localStorage.getItem('token')) {
        localStorage.setItem('token', response.data.token);
      } else {
        sessionStorage.setItem('token', response.data.token);
      }
    }

    return response;
  }

  // 检查是否已登录
  public isLoggedIn(): boolean {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  // 获取token
  public getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // 忘记密码 - 发送验证码
  public async sendPasswordResetCode(identifier: string, method: 'email' | 'phone'): Promise<apiResponse<void>> {
    return this.post<void>('/auth/send-reset-code', { identifier, method });
  }

  // 验证重置密码令牌
  public async verifyResetToken(token: string): Promise<apiResponse<{ valid: boolean }>> {
    return this.post<{ valid: boolean }>('/auth/verify-reset-token', { token });
  }

  // 重置密码
  public async resetPassword(token: string, newPassword: string): Promise<apiResponse<void>> {
    return this.post<void>('/auth/reset-password', { token, newPassword });
  }
}


// 创建并导出AuthService实例
const authService = new AuthService('/api');
export default authService;
