/**
 * 系统全局常量配置
 */

// API基础URL，根据环境自动选择
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// 默认分页配置
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// 文件上传限制
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  data: ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
};

// 本地存储键
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  SYSTEM_CONFIG: 'system_config',
  THEME_PREFERENCE: 'theme_preference',
  LAST_VISITED: 'last_visited'
};

// 系统路径
export const SYSTEM_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  SETUP: '/setup',
  DASHBOARD: '/dashboard',
  EXPERIMENTS: '/experiments',
  DEVICES: '/devices',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  USER_PROFILE: '/profile',
  ADMIN: '/admin'
};

// 安全配置
export const SECURITY_CONFIG = {
  TOKEN_EXPIRY: 8 * 60 * 60 * 1000, // 8小时
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7天
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_REQUIRES_SPECIAL_CHAR: true,
  MAX_LOGIN_ATTEMPTS: 5
};

// 模拟数据配置
export const DEMO_DATA_CONFIG = {
  USER_COUNT: {
    minimal: 3,
    standard: 10,
    comprehensive: 50
  },
  EXPERIMENT_COUNT: {
    minimal: 5,
    standard: 20,
    comprehensive: 100
  }
};

// AI服务提供商配置
export const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', defaultEndpoint: 'https://api.openai.com/v1' },
  { id: 'azure', name: 'Azure OpenAI', defaultEndpoint: 'https://your-resource-name.openai.azure.com/' },
  { id: 'baidu', name: '百度文心一言', defaultEndpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop' },
  { id: 'aliyun', name: '阿里通义千问', defaultEndpoint: 'https://dashscope.aliyuncs.com/api/v1' }
];

// 数据库配置
export const DATABASE_TYPES = [
  { id: 'mongodb', name: 'MongoDB', defaultPort: '27017' },
  { id: 'mysql', name: 'MySQL', defaultPort: '3306' },
  { id: 'postgres', name: 'PostgreSQL', defaultPort: '5432' }
];
