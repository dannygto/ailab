#!/bin/bash

# 修复前端API响应处理和端口配置问题

set -e

echo "=========================================="
echo "🚀 开始修复前端API响应处理问题"
echo "=========================================="

# 1. 修复API响应处理逻辑
echo "📝 修复前端API服务响应处理..."

# 创建新的API服务文件，修复响应处理逻辑
cat > /home/ubuntu/ailab/src/frontend/src/services/api-new.ts << 'EOL'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

// API基础URL配置
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

const WS_BASE_URL = process.env.REACT_APP_WS_URL ||
  (process.env.NODE_ENV === 'production' ?
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}` :
    'ws://localhost:3001');

// API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private apiClient: AxiosInstance;
  private ws: WebSocket | null = null;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // 错误处理
  private handleApiError(error: any) {
    if (error.request && !error.response) {
      console.warn('⚠️ 网络连接失败，请检查网络连接');
      return;
    }

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          if (!error.config?.url?.includes('/auth/me')) {
            toast.error('登录已过期，请重新登录');
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error('权限不足');
          break;
        case 404:
          if (!error.config?.url?.includes('health') &&
              !error.config?.url?.includes('chat')) {
            toast.error('请求的资源不存在');
          }
          break;
        case 500:
          toast.error('服务器内部错误');
          break;
        default:
          if (!error.config?.url?.includes('health') &&
              !error.config?.url?.includes('chat')) {
            toast.error(data?.message || '请求失败');
          }
      }
    } else {
      console.error('网络请求错误:', error.message);
    }
  }

  // 通用请求方法 - 修复响应处理逻辑
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<any> = await this.apiClient.request(config);

      // 检查响应格式
      if (response.data && typeof response.data === 'object') {
        // 如果响应已经是标准格式
        if ('success' in response.data) {
          return response.data as ApiResponse<T>;
        }

        // 如果响应是直接的数据，包装成标准格式
        return {
          success: true,
          data: response.data as T
        };
      }

      // 如果响应不是对象，包装成标准格式
      return {
        success: true,
        data: response.data as T
      };
    } catch (error: any) {
      console.error('API请求失败:', error);

      // 返回错误响应格式
      return {
        success: false,
        error: error.response?.data?.error || error.message || '请求失败'
      };
    }
  }

  // HTTP方法 - 修复返回值处理
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
    });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<AxiosRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<AxiosRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  async delete<T = any>(url: string, config?: Partial<AxiosRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  // 获取API状态
  async checkApiStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.warn('API服务不可用，使用离线模式');
      return false;
    }
  }

  // WebSocket连接
  connectWebSocket(token: string): WebSocket {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(`${WS_BASE_URL}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return this.ws;
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 暴露axios实例
  get client(): AxiosInstance {
    return this.apiClient;
  }
}

// 创建全局实例
const apiService = new ApiService();
export default apiService;
export { ApiService, ApiResponse };
EOL

# 2. 修复schoolService使用新的API响应格式
echo "📝 修复schoolService..."

cat > /home/ubuntu/ailab/src/frontend/src/services/schoolService-new.ts << 'EOL'
import apiService, { ApiResponse } from './api-new';

// 校区接口
interface School {
  id: number;
  name: string;
  code: string;
  logoUrl?: string;
  themeSettings?: {
    primaryColor: string;
    secondaryColor: string;
  };
  active: boolean;
}

/**
 * 校区管理服务
 * 提供校区相关的API调用方法
 */
export class SchoolService {
  /**
   * 获取所有校区
   */
  async getAllSchools(): Promise<School[]> {
    try {
      console.log('开始获取校区列表...');
      const response: ApiResponse<School[]> = await apiService.get('/schools');

      if (response.success && response.data) {
        console.log('获取校区列表成功:', response.data);
        return response.data;
      } else {
        console.error('获取校区列表失败:', response.error);
        return [];
      }
    } catch (error) {
      console.error('获取校区列表异常:', error);
      return [];
    }
  }

  /**
   * 获取特定校区信息
   */
  async getSchoolByCode(code: string): Promise<School | null> {
    try {
      console.log(`开始获取校区(${code})信息...`);
      const response: ApiResponse<School> = await apiService.get(`/schools/${code}`);

      if (response.success && response.data) {
        console.log('获取校区信息成功:', response.data);
        return response.data;
      } else {
        console.error(`获取校区(${code})信息失败:`, response.error);
        return null;
      }
    } catch (error) {
      console.error(`获取校区(${code})信息异常:`, error);
      return null;
    }
  }

  /**
   * 创建新校区
   */
  async createSchool(schoolData: Partial<School>): Promise<School | null> {
    try {
      const response: ApiResponse<School> = await apiService.post('/schools', schoolData);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || '创建校区失败');
      }
    } catch (error) {
      console.error('创建校区失败:', error);
      throw error;
    }
  }

  /**
   * 更新校区信息
   */
  async updateSchool(id: number, schoolData: Partial<School>): Promise<School | null> {
    try {
      const response: ApiResponse<School> = await apiService.put(`/schools/${id}`, schoolData);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || '更新校区失败');
      }
    } catch (error) {
      console.error('更新校区信息失败:', error);
      throw error;
    }
  }

  /**
   * 删除校区
   */
  async deleteSchool(id: number): Promise<void> {
    try {
      const response: ApiResponse<void> = await apiService.delete(`/schools/${id}`);

      if (!response.success) {
        throw new Error(response.error || '删除校区失败');
      }
    } catch (error) {
      console.error('删除校区失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前校区信息
   */
  async getCurrentSchool(): Promise<School | null> {
    try {
      // 从本地存储获取当前校区代码
      const currentSchoolCode = localStorage.getItem('currentSchoolCode') || this.getSchoolCodeFromUrl();

      if (!currentSchoolCode) {
        console.warn('未找到当前校区代码');
        return null;
      }

      return await this.getSchoolByCode(currentSchoolCode);
    } catch (error) {
      console.error('获取当前校区信息失败:', error);
      return null;
    }
  }

  /**
   * 从URL中提取校区代码
   */
  private getSchoolCodeFromUrl(): string | null {
    // 尝试从子域名获取校区代码
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (parts.length > 2) {
      return parts[0];
    }

    // 尝试从URL参数获取校区代码
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('schoolCode');
  }

  /**
   * 设置当前校区
   */
  setCurrentSchool(schoolCode: string): void {
    localStorage.setItem('currentSchoolCode', schoolCode);
    // 重新加载页面以应用新校区设置
    window.location.reload();
  }
}

const schoolService = new SchoolService();
export default schoolService;
export { School };
EOL

# 3. 备份原文件并替换
echo "📝 备份原文件并替换..."

# 备份原文件
cp /home/ubuntu/ailab/src/frontend/src/services/api.ts /home/ubuntu/ailab/src/frontend/src/services/api.ts.backup
cp /home/ubuntu/ailab/src/frontend/src/services/schoolService.ts /home/ubuntu/ailab/src/frontend/src/services/schoolService.ts.backup

# 替换为新文件
mv /home/ubuntu/ailab/src/frontend/src/services/api-new.ts /home/ubuntu/ailab/src/frontend/src/services/api.ts
mv /home/ubuntu/ailab/src/frontend/src/services/schoolService-new.ts /home/ubuntu/ailab/src/frontend/src/services/schoolService.ts

# 4. 检查并修复.env文件
echo "📝 检查前端环境配置..."

if [ ! -f "/home/ubuntu/ailab/src/frontend/.env" ]; then
    echo "创建前端.env文件..."
    cat > /home/ubuntu/ailab/src/frontend/.env << 'EOL'
# API配置
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001

# 应用配置
REACT_APP_APP_NAME=AILAB智能实验教学平台
REACT_APP_VERSION=1.0.0

# 构建配置
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
EOL
else
    # 更新现有.env文件中的端口配置
    sed -i 's/REACT_APP_API_URL=.*/REACT_APP_API_URL=http:\/\/localhost:3001/' /home/ubuntu/ailab/src/frontend/.env
    sed -i 's/REACT_APP_WS_URL=.*/REACT_APP_WS_URL=ws:\/\/localhost:3001/' /home/ubuntu/ailab/src/frontend/.env
fi

# 5. 重新构建前端
echo "🔨 重新构建前端..."
cd /home/ubuntu/ailab/src/frontend

# 清理缓存和依赖
rm -rf node_modules/.cache
rm -rf build

# 安装依赖（如果需要）
npm install --silent

# 构建项目
echo "正在构建前端项目..."
npm run build

# 6. 重启前端服务
echo "🔄 重启前端服务..."
pkill -f "npm.*start" || true
sleep 2

# 启动前端服务
cd /home/ubuntu/ailab/src/frontend
npm start > /tmp/frontend.log 2>&1 &

# 等待服务启动
sleep 10

# 7. 测试API连接
echo "🧪 测试API连接..."

# 测试后端API
API_TEST=$(curl -s -w "%{http_code}" -o /tmp/api_test.json http://localhost:3001/api/schools)
echo "后端API测试 (GET /api/schools): $API_TEST"

if [ "$API_TEST" = "200" ]; then
    echo "✅ 后端API正常响应"
    cat /tmp/api_test.json | jq . || echo "响应内容:" && cat /tmp/api_test.json
else
    echo "❌ 后端API异常，状态码: $API_TEST"
fi

# 测试前端服务
FRONTEND_TEST=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000)
echo "前端服务测试: $FRONTEND_TEST"

if [ "$FRONTEND_TEST" = "200" ]; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
fi

# 8. 生成测试脚本
echo "📝 生成前端测试脚本..."

cat > /home/ubuntu/ailab/test-frontend-api.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
    <title>前端API测试</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-result { margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; }
        .success { border-color: #4CAF50; background: #f0f8f0; }
        .error { border-color: #f44336; background: #fdf0f0; }
        .info { border-color: #2196F3; background: #f0f4f8; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
        button { padding: 10px 20px; margin: 5px; background: #2196F3; color: white; border: none; cursor: pointer; }
        button:hover { background: #1976D2; }
    </style>
</head>
<body>
    <h1>前端API测试页面</h1>

    <div>
        <button onclick="testGetSchools()">测试获取校区列表</button>
        <button onclick="testGetSchoolByCode()">测试获取特定校区</button>
        <button onclick="testCreateSchool()">测试创建校区</button>
        <button onclick="clearResults()">清空结果</button>
    </div>

    <div id="results"></div>

    <script>
        const API_BASE_URL = 'http://localhost:3001/api';

        function addResult(type, title, content) {
            const results = document.getElementById('results');
            const div = document.createElement('div');
            div.className = `test-result ${type}`;
            div.innerHTML = `<h3>${title}</h3><pre>${content}</pre>`;
            results.appendChild(div);
        }

        function clearResults() {
            document.getElementById('results').innerHTML = '';
        }

        async function testGetSchools() {
            try {
                const response = await fetch(`${API_BASE_URL}/schools`);
                const data = await response.json();

                if (response.ok) {
                    addResult('success', '✅ 获取校区列表成功', JSON.stringify(data, null, 2));
                } else {
                    addResult('error', '❌ 获取校区列表失败', `状态码: ${response.status}\n${JSON.stringify(data, null, 2)}`);
                }
            } catch (error) {
                addResult('error', '❌ 获取校区列表异常', error.message);
            }
        }

        async function testGetSchoolByCode() {
            try {
                const response = await fetch(`${API_BASE_URL}/schools/bjsyzx`);
                const data = await response.json();

                if (response.ok) {
                    addResult('success', '✅ 获取特定校区成功', JSON.stringify(data, null, 2));
                } else {
                    addResult('error', '❌ 获取特定校区失败', `状态码: ${response.status}\n${JSON.stringify(data, null, 2)}`);
                }
            } catch (error) {
                addResult('error', '❌ 获取特定校区异常', error.message);
            }
        }

        async function testCreateSchool() {
            try {
                const schoolData = {
                    name: '测试校区',
                    code: 'test-school',
                    active: true
                };

                const response = await fetch(`${API_BASE_URL}/schools`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(schoolData)
                });

                const data = await response.json();

                if (response.ok) {
                    addResult('success', '✅ 创建校区成功', JSON.stringify(data, null, 2));
                } else {
                    addResult('error', '❌ 创建校区失败', `状态码: ${response.status}\n${JSON.stringify(data, null, 2)}`);
                }
            } catch (error) {
                addResult('error', '❌ 创建校区异常', error.message);
            }
        }

        // 页面加载时自动测试
        window.onload = function() {
            addResult('info', '📋 测试页面已加载', '可以点击按钮进行API测试');
        };
    </script>
</body>
</html>
EOL

echo "=========================================="
echo "✅ 前端API响应处理修复完成"
echo "=========================================="
echo ""
echo "📋 修复内容:"
echo "1. ✅ 修复API服务响应处理逻辑"
echo "2. ✅ 统一API端口配置为3001"
echo "3. ✅ 修复schoolService数据访问方式"
echo "4. ✅ 更新前端环境配置"
echo "5. ✅ 重新构建并重启前端服务"
echo ""
echo "🌐 测试地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001/api/schools"
echo "- 测试页面: http://82.156.75.232:3000/../test-frontend-api.html"
echo ""
echo "📊 测试结果:"
echo "- 后端API状态: $API_TEST"
echo "- 前端服务状态: $FRONTEND_TEST"
EOL

chmod +x d:/ailab/ailab/scripts/deployment/fix-frontend-api-response.sh
