// 服务注册模块 - 用于统一管理和导出所有API服务

import { BaseapiService } from './base/apiService';
import { AuthService } from './authService';
import { ExperimentService } from './experimentService';
import { AIService } from './aiService';
import { TemplateService } from './templateService';
import { ResourceService } from './resourceService';
import { enhancedAiService } from './enhancedAiService';
import { enhancedTemplateService } from './enhancedTemplateService';
import systemSettingsService from './systemSettingsService';

// api基础配置
const api_BASE_URL = process.env.REACT_APP_api_URL || 'http://localhost:3002/api';

// 创建各服务实�?
const authService = new AuthService({
  baseURL: api_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  autoErrorToast: true
});

const experimentService = new ExperimentService({
  baseURL: api_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  autoErrorToast: true
});

const aiService = new AIService({
  baseURL: api_BASE_URL,
  timeout: 60000, // AI操作可能需要更长时�?
  withCredentials: true,
  autoErrorToast: true
});

const templateService = new TemplateService({
  baseURL: api_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  autoErrorToast: true
});

const resourceService = new ResourceService({
  baseURL: api_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  autoErrorToast: true
});

// 服务注册
const services = {
  auth: authService,
  experiment: experimentService,
  ai: aiService,
  template: templateService,
  resource: resourceService,
  enhancedAi: enhancedAiService,
  enhancedTemplate: enhancedTemplateService
};

export default services;

// 导出服务类型
export type Services = typeof services;

// 导出各服务类
export {
  BaseapiService,
  AuthService,
  ExperimentService,
  AIService,
  TemplateService,
  ResourceService
};

// 导出服务实例
export {
  authService,
  experimentService,
  aiService,
  templateService,
  resourceService,
  enhancedAiService,
  enhancedTemplateService,
  systemSettingsService
};
