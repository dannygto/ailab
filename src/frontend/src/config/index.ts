// 系统配置文件

// API基础URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// WebSocket URL
export const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';

// 静态资源URL
export const STATIC_URL = process.env.REACT_APP_STATIC_URL || 'http://localhost:3001/static';

// 分页默认设置
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// 图表默认主题色
export const CHART_COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

// 默认语言
export const DEFAULT_LANGUAGE = 'zh-CN';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ko-KR', name: '한국어' },
  { code: 'ru-RU', name: 'Русский' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'es-ES', name: 'Español' },
  { code: 'pt-BR', name: 'Português' },
  { code: 'it-IT', name: 'Italiano' },
  { code: 'ar-SA', name: 'العربية' },
  { code: 'th-TH', name: 'ไทย' },
  { code: 'vi-VN', name: 'Tiếng Việt' },
  { code: 'tr-TR', name: 'Türkçe' }
];

// 通知设置
export const NOTIFICATION_TIMEOUT = 5000; // 毫秒

// 文件上传限制
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  data: ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
};

// 密码策略
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
};

// 团队默认权限
export const DEFAULT_TEAM_PERMISSIONS = {
  owner: ['manage_team', 'manage_members', 'manage_resources', 'create_experiment', 'edit_experiment', 'delete_experiment', 'run_experiment', 'view_results'],
  admin: ['manage_members', 'manage_resources', 'create_experiment', 'edit_experiment', 'delete_experiment', 'run_experiment', 'view_results'],
  member: ['create_experiment', 'edit_experiment', 'run_experiment', 'view_results'],
  viewer: ['view_results']
};

// AI助手设置
export const AI_ASSISTANT_SETTINGS = {
  defaultModel: 'gpt-3.5-turbo',
  maxHistoryItems: 50,
  maxInputLength: 4000,
  defaultPromptTemplates: {
    experimentSuggestion: '基于以下实验类型和数据集特征，建议合适的参数设置：\n实验类型：{{experimentType}}\n数据集：{{datasetInfo}}',
    codeGeneration: '为以下实验需求生成代码：\n{{requirement}}\n使用编程语言：{{language}}',
    errorAnalysis: '分析以下错误并提供解决方案：\n{{errorMessage}}'
  }
};
