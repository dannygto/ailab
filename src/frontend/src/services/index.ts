// 服务注册模块 - 用于统一管理和导出所有API服务

import { BaseapiService } from './base/apiService';
import { AuthService } from './authService';
import { ExperimentService } from './experimentService';
import { AIService } from './aiService';
import { TemplateService } from './templateService';
import { ResourceService } from './resourceService';
import { enhancedAiService } from './enhancedAiService';
import { EnhancedTemplateService } from './enhancedTemplateService'; // 只导入类，不导入实例
import systemSettingsService from './systemSettingsService';
import teamService from './team.service';
import organizationService from './organization.service';
import permissionService from './permission.service';

// api基础配置
const api_BASE_URL = process.env.REACT_APP_api_URL || 'http://localhost:3001/api';

// 创建各服务实例
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
  timeout: 60000, // AI操作可能需要更长时间
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

// 创建enhancedTemplateService实例（避免循环依赖）
const enhancedTemplateService = new EnhancedTemplateService();

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

// 导出服务类
export {
  BaseapiService,
  AuthService,
  ExperimentService,
  AIService,
  TemplateService,
  ResourceService,
  EnhancedTemplateService
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
  systemSettingsService,
  teamService,
  organizationService,
  permissionService
};
