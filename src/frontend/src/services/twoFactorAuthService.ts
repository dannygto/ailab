// twoFactorAuthService.ts - 两因素认证服务模块

import { BaseapiService, apiResponse } from './base/apiService';

// 类型定义
export interface TwoFactorSetupResponse {
  otpAuthUrl: string;  // OTP认证URL，用于生成二维码
  secret: string;      // 密钥
}

export interface TwoFactorVerifyRequest {
  code: string;        // 用户输入的验证码
  method?: 'app' | 'sms' | 'email'; // 验证方式
}

export interface TwoFactorSendCodeRequest {
  username: string;    // 用户名
  method: 'sms' | 'email'; // 发送验证码的方式
}

export interface TwoFactorStatusResponse {
  enabled: boolean;    // 是否启用了两因素认证
  methods?: string[];   // 支持的验证方式
  email?: string;       // 绑定的邮箱
  phoneNumber?: string; // 绑定的手机号
}

export interface TwoFactorMethodRequest {
  type: 'app' | 'email' | 'sms';
  value?: string; // 邮箱或手机号
}

export interface TwoFactorEnableRequest {
  code: string;
}

export interface TwoFactorDisableRequest {
  code: string;
}

// 两因素认证服务实现
export class TwoFactorAuthService extends BaseapiService {
  // 获取两因素认证设置
  public async setup(): Promise<apiResponse<TwoFactorSetupResponse>> {
    return this.get<TwoFactorSetupResponse>('/auth/2fa/setup');
  }

  // 验证并启用两因素认证
  public async enable(data: TwoFactorEnableRequest): Promise<apiResponse<boolean>> {
    return this.post<boolean>('/auth/2fa/enable', data);
  }

  // 禁用两因素认证
  public async disable(data: TwoFactorDisableRequest): Promise<apiResponse<boolean>> {
    return this.post<boolean>('/auth/2fa/disable', data);
  }

  // 验证两因素认证码
  public async verify(data: TwoFactorVerifyRequest): Promise<apiResponse<{ token: string }>> {
    const response = await this.post<{ token: string }>('/auth/2fa/verify', data);

    // 如果验证成功，更新存储的token
    if (response.success && response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response;
  }

  // 获取两因素认证状态
  public async getStatus(): Promise<apiResponse<TwoFactorStatusResponse>> {
    return this.get<TwoFactorStatusResponse>('/auth/2fa/status');
  }

  // 发送验证码到邮箱或手机
  public async sendCode(data: TwoFactorSendCodeRequest): Promise<apiResponse<void>> {
    return this.post<void>('/auth/2fa/send-code', data);
  }

  // 添加两因素认证方法
  public async addMethod(data: TwoFactorMethodRequest): Promise<apiResponse<boolean>> {
    return this.post<boolean>('/auth/2fa/method', data);
  }

  // 获取恢复代码
  public async getRecoveryCodes(): Promise<apiResponse<string[]>> {
    return this.get<string[]>('/auth/2fa/recovery-codes');
  }

  // 重新生成恢复代码
  public async regenerateRecoveryCodes(): Promise<apiResponse<string[]>> {
    return this.post<string[]>('/auth/2fa/regenerate-recovery-codes', {});
  }
}

// 创建并导出TwoFactorAuthService实例
const twoFactorAuthService = new TwoFactorAuthService('/api');
export default twoFactorAuthService;
