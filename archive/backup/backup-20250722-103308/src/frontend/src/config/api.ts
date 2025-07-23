/**
 * API配置文件
 * 统一管理所有API相关配置
 */

// API基础URL配置
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
export const API_ENDPOINTS = {
  // 学校相关
  SCHOOLS: `${API_BASE_URL}/api/schools`,
  SCHOOL_DETAIL: (id: string) => `${API_BASE_URL}/api/schools/${id}`,

  // 设置相关
  SETTINGS_GENERAL: `${API_BASE_URL}/api/settings/general`,
  SETTINGS_THEME: `${API_BASE_URL}/api/settings/theme`,

  // 其他常用端点
  AUTH: `${API_BASE_URL}/api/auth`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

// WebSocket配置
export const WS_BASE_URL = process.env.REACT_APP_WS_URL ||
  (process.env.NODE_ENV === 'production'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    : 'ws://localhost:3001'
  );

// 默认请求配置
export const DEFAULT_REQUEST_CONFIG = {
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as RequestCredentials,
};

/**
 * 创建完整的API URL
 * @param endpoint 端点路径
 * @returns 完整的API URL
 */
export const createApiUrl = (endpoint: string): string => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

/**
 * 统一的fetch包装器
 * @param endpoint API端点
 * @param options fetch配置选项
 * @returns Promise<Response>
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = createApiUrl(endpoint);
  const config = {
    ...DEFAULT_REQUEST_CONFIG,
    ...options,
    headers: {
      ...DEFAULT_REQUEST_CONFIG.headers,
      ...options.headers,
    },
  };

  return fetch(url, config);
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  WS_BASE_URL,
  DEFAULT_REQUEST_CONFIG,
  createApiUrl,
  apiRequest,
};
