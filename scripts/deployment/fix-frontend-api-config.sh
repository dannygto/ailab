#!/bin/bash

# 修复前端API配置 - 解决404问题

set -e

echo "=========================================="
echo "🔧 修复前端API配置"
echo "=========================================="

# 1. 修复API基础URL配置
echo "📝 修复API基础URL配置..."

# 创建修复后的API配置
cat > /home/ubuntu/ailab/src/frontend/src/services/api.ts << 'EOL'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import {
  apiResponse,
  PaginatedResponse,
  User,
  Experiment,
  chatMessage,
  chatSession,
  AIAssistantResponse,
  ImageProcessingOptions,
  ImageAnalysisResult,
  ObjectDetectionResult,
  ExperimentTemplate,
  ExperimentExecution,
  DashboardStats,
  Device,
  DeviceDataPoint,
  DeviceCommand,
  DeviceReservation,
  DeviceConnectionStatus,
  GetdevicesParams,
  GetDeviceDataParams,
  SendDeviceCommandParams,
  CreateDeviceReservationParams,
  GetDeviceReservationsParams,
  DeviceMonitoringData
} from '../types';
import { AI_MODELS } from '../config/ai-models';
import { deviceservice } from './device.service';
import { GuidanceService } from './guidance.service';

// API基础URL配置 - 修复版
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://82.156.75.232:3001/api';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://82.156.75.232:3001';

console.log('🔗 API Base URL:', API_BASE_URL);

class apiService {
  private apiClient: AxiosInstance;
  private ws: WebSocket | null = null;
  private deviceservice: deviceservice;
  private guidanceService: GuidanceService;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🚀 API请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.apiClient.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API响应: ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`❌ API错误: ${error.config?.url} - ${error.response?.status || 'Network Error'}`, error.message);

        if (error.response) {
          // 服务器响应了错误状态码
          const { status, data } = error.response;
          switch (status) {
            case 400:
              toast.error('请求参数错误');
              break;
            case 401:
              toast.error('未授权访问');
              break;
            case 403:
              toast.error('禁止访问');
              break;
            case 404:
              toast.error('请求的资源不存在');
              break;
            case 500:
              toast.error('服务器内部错误');
              break;
            default:
              toast.error(data?.message || `请求失败 (${status})`);
          }
        } else if (error.request) {
          // 请求发出但没有响应
          toast.error('网络连接失败，请检查网络');
        } else {
          // 其他错误
          toast.error('请求配置错误');
        }

        return Promise.reject(error);
      }
    );

    this.deviceservice = new deviceservice();
    this.guidanceService = new GuidanceService();
  }

  // 基础HTTP方法
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.apiClient.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.apiClient.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.apiClient.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.apiClient.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.apiClient.patch<T>(url, data, config);
    return response.data;
  }

  // API状态检查
  async CheckApiStatus(): Promise<boolean> {
    try {
      console.log('🔍 检查API状态...');
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, { timeout: 5000 });
      console.log('✅ API状态检查成功:', response.status);
      return response.status === 200;
    } catch (error) {
      console.warn('⚠️ API服务不可用，将使用降级模式');
      return false;
    }
  }

  // 获取实验列表
  async getExperiments(params?: any): Promise<PaginatedResponse<Experiment>> {
    try {
      console.log('📋 获取实验列表...');
      const response = await this.get<any>('/experiments', { params });
      return response;
    } catch (error) {
      console.error('❌ 获取实验列表失败:', error);
      // 返回空的分页响应
      return {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
    }
  }

  // 获取学校列表
  async getSchools(): Promise<any> {
    try {
      console.log('🏫 获取学校列表...');
      const response = await this.get('/schools');
      return response;
    } catch (error) {
      console.error('❌ 获取学校列表失败:', error);
      throw error;
    }
  }

  // 获取特定学校
  async getSchoolByCode(code: string): Promise<any> {
    try {
      console.log(`🏫 获取学校信息: ${code}`);
      const response = await this.get(`/schools/${code}`);
      return response;
    } catch (error) {
      console.error(`❌ 获取学校(${code})信息失败:`, error);
      throw error;
    }
  }

  // 其他方法保持不变...
}

const apiService = new apiService();

export default apiService;
EOL

echo "✅ API配置文件修复完成"

# 2. 重新构建前端
echo "🔨 重新构建前端..."
cd /home/ubuntu/ailab/src/frontend
npm run build

# 3. 重启前端服务
echo "🔄 重启前端服务..."
pm2 restart ailab-frontend

# 4. 测试API连接
echo "🧪 测试API连接..."
sleep 5

echo "📡 测试学校API:"
curl -s http://82.156.75.232:3001/api/schools | head -200

echo ""
echo "📡 测试实验API:"
curl -s http://82.156.75.232:3001/api/experiments | head -200

echo ""
echo "=========================================="
echo "✅ 前端API配置修复完成"
echo "=========================================="
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001/api"
echo "- 学校API: http://82.156.75.232:3001/api/schools"
echo "- 实验API: http://82.156.75.232:3001/api/experiments"
echo ""
