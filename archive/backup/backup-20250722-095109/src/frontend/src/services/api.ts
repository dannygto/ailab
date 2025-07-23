/**
 * API服务类
 * 提供与后端API的通信功能
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import {
  ApiResponse,
  PaginatedResponse,
  User,
  Experiment,
  ChatMessage,
  ChatSession,
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
  GetDevicesParams,
  GetDeviceDataParams,
  SendDeviceCommandParams,
  CreateDeviceReservationParams,
  GetDeviceReservationsParams,
  DeviceMonitoringData
} from '../types';
import { AI_MODELS } from '../config/ai-models';
import { DeviceService } from './device.service';
import { GuidanceService } from './guidance.service';
import { handleApiError, tryCatch } from '../utils/errorHandler';

// API基础URL配置
// 生产环境使用相对路径，开发环境使用localhost
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

const WS_BASE_URL = process.env.REACT_APP_WS_URL ||
  (process.env.NODE_ENV === 'production' ?
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}` :
    'ws://localhost:3001');

class ApiService {
  private apiClient: AxiosInstance;
  private ws: WebSocket | null = null;
  private deviceService: DeviceService;
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

    // 初始化服务
    this.deviceService = new DeviceService(this);
    this.guidanceService = new GuidanceService(this);
  }

  // 错误处理
  private handleApiError(error: any) {
    handleApiError(error, {
      context: 'API服务',
      showNotification: true,
      logToConsole: true
    });
  }

  // 获取设备服务
  public get devices() {
    return this.deviceService;
  }

  // 获取指导服务
  public get guidance() {
    return this.guidanceService;
  }

  // 连接WebSocket
  public connectWebSocket(userId: string, onMessage: (data: any) => void, onClose?: () => void): void {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(`${WS_BASE_URL}?userId=${userId}`);

    this.ws.onopen = () => {
      console.log('WebSocket连接已建立');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket消息解析失败', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket连接已关闭');
      if (onClose) {
        onClose();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket错误', error);
    };
  }

  // 关闭WebSocket连接
  public disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 发送WebSocket消息
  public sendWebSocketMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket未连接，无法发送消息');
    }
  }

  // API请求方法
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.apiClient.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // 用户认证和会话管理
  // ===================

  // 用户登录
  public async login(username: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<{ token: string; user: User }>>({
        method: 'POST',
        url: '/auth/login',
        data: { username, password },
      });
      return response;
    }, { context: '用户登录' }) as ApiResponse<{ token: string; user: User }>;
  }

  // 用户注册
  public async register(userData: Partial<User>): Promise<ApiResponse<User>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<User>>({
        method: 'POST',
        url: '/auth/register',
        data: userData,
      });
      return response;
    }, { context: '用户注册' }) as ApiResponse<User>;
  }

  // 获取当前用户信息
  public async getCurrentUser(): Promise<ApiResponse<User>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<User>>({
        method: 'GET',
        url: '/auth/me',
      });
      return response;
    }, {
      context: '获取用户信息',
      showNotification: false // 不显示通知，因为这是常规检查
    }) as ApiResponse<User>;
  }

  // 更新用户资料
  public async updateUserProfile(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<User>>({
        method: 'PUT',
        url: `/users/${userId}`,
        data: userData,
      });
      return response;
    }, { context: '更新用户资料' }) as ApiResponse<User>;
  }

  // 更新用户密码
  public async updatePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<null>>({
        method: 'POST',
        url: '/auth/update-password',
        data: { oldPassword, newPassword },
      });
      return response;
    }, { context: '更新密码' }) as ApiResponse<null>;
  }

  // 获取所有用户（管理员专用）
  public async getUsers(): Promise<ApiResponse<User[]>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<User[]>>({
        method: 'GET',
        url: '/users',
      });
      return response;
    }, { context: '获取用户列表' }) as ApiResponse<User[]>;
  }

  // 获取用户通知
  public async getUserNotifications(userId: string): Promise<ApiResponse<any[]>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<any[]>>({
        method: 'GET',
        url: `/users/${userId}/notifications`,
      });
      return response;
    }, { context: '获取通知' }) as ApiResponse<any[]>;
  }

  // 获取用户活动日志
  public async getUserActivityLogs(userId: string): Promise<ApiResponse<any[]>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<any[]>>({
        method: 'GET',
        url: `/users/${userId}/activity-logs`,
      });
      return response;
    }, { context: '获取活动日志' }) as ApiResponse<any[]>;
  }

  // 仪表盘和统计
  // ============

  // 获取仪表板统计数据
  public async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<DashboardStats>>({
        method: 'GET',
        url: '/dashboard/stats',
      });
      return response;
    }, { context: '获取仪表盘统计' }) as ApiResponse<DashboardStats>;
  }

  // 获取最近活动
  public async getRecentActivity(): Promise<ApiResponse<any[]>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<any[]>>({
        method: 'GET',
        url: '/dashboard/recent-activity',
      });
      return response;
    }, { context: '获取最近活动' }) as ApiResponse<any[]>;
  }

  // 获取系统健康状态
  public async getSystemHealth(): Promise<ApiResponse<any>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<any>>({
        method: 'GET',
        url: '/system/health',
      });
      return response;
    }, { context: '获取系统健康状态' }) as ApiResponse<any>;
  }

  // 设备管理API
  // ==========

  // 获取设备列表
  public async getDevices(params?: GetDevicesParams): Promise<ApiResponse<Device[]>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<Device[]>>({
        method: 'GET',
        url: '/devices',
        params,
      });
      return response;
    }, { context: '获取设备列表' }) as ApiResponse<Device[]>;
  }

  // 获取单个设备详情
  public async getDevice(deviceId: string): Promise<ApiResponse<Device>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<Device>>({
        method: 'GET',
        url: `/devices/${deviceId}`,
      });
      return response;
    }, { context: '获取设备详情' }) as ApiResponse<Device>;
  }

  // 创建新设备
  public async createDevice(deviceData: Partial<Device>): Promise<ApiResponse<Device>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<Device>>({
        method: 'POST',
        url: '/devices',
        data: deviceData,
      });
      return response;
    }, { context: '创建设备' }) as ApiResponse<Device>;
  }

  // 更新设备信息
  public async updateDevice(deviceId: string, deviceData: Partial<Device>): Promise<ApiResponse<Device>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<Device>>({
        method: 'PUT',
        url: `/devices/${deviceId}`,
        data: deviceData,
      });
      return response;
    }, { context: '更新设备' }) as ApiResponse<Device>;
  }

  // 删除设备
  public async deleteDevice(deviceId: string): Promise<ApiResponse<null>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<null>>({
        method: 'DELETE',
        url: `/devices/${deviceId}`,
      });
      return response;
    }, { context: '删除设备' }) as ApiResponse<null>;
  }

  // 批量删除设备
  public async deleteDevices(deviceIds: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<{ deletedCount: number }>>({
        method: 'DELETE',
        url: '/devices/batch',
        data: { deviceIds },
      });
      return response;
    }, { context: '批量删除设备' }) as ApiResponse<{ deletedCount: number }>;
  }

  // 批量更新设备标签
  public async updateDevicesTags(deviceIds: string[], tags: string[]): Promise<ApiResponse<{ updatedCount: number }>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<{ updatedCount: number }>>({
        method: 'PUT',
        url: '/devices/batch/tags',
        data: { deviceIds, tags },
      });
      return response;
    }, { context: '批量更新设备标签' }) as ApiResponse<{ updatedCount: number }>;
  }

  // 批量归档设备
  public async archiveDevices(deviceIds: string[]): Promise<ApiResponse<{ archivedCount: number }>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<{ archivedCount: number }>>({
        method: 'PUT',
        url: '/devices/batch/archive',
        data: { deviceIds },
      });
      return response;
    }, { context: '批量归档设备' }) as ApiResponse<{ archivedCount: number }>;
  }

  // 获取设备数据
  public async getDeviceData(deviceId: string, params: GetDeviceDataParams): Promise<ApiResponse<DeviceDataPoint[]>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<DeviceDataPoint[]>>({
        method: 'GET',
        url: `/devices/${deviceId}/data`,
        params,
      });
      return response;
    }, { context: '获取设备数据' }) as ApiResponse<DeviceDataPoint[]>;
  }

  // 发送设备命令
  public async sendDeviceCommand(deviceId: string, params: SendDeviceCommandParams): Promise<ApiResponse<DeviceCommand>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<DeviceCommand>>({
        method: 'POST',
        url: `/devices/${deviceId}/commands`,
        data: params,
      });
      return response;
    }, { context: '发送设备命令' }) as ApiResponse<DeviceCommand>;
  }

  // 获取设备命令历史
  public async getDeviceCommands(deviceId: string): Promise<ApiResponse<DeviceCommand[]>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<DeviceCommand[]>>({
        method: 'GET',
        url: `/devices/${deviceId}/commands`,
      });
      return response;
    }, { context: '获取设备命令历史' }) as ApiResponse<DeviceCommand[]>;
  }

  // 检查设备连接状态
  public async checkDeviceConnection(deviceId: string): Promise<ApiResponse<DeviceConnectionStatus>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<DeviceConnectionStatus>>({
        method: 'GET',
        url: `/devices/${deviceId}/connection`,
      });
      return response;
    }, { context: '检查设备连接' }) as ApiResponse<DeviceConnectionStatus>;
  }

  // 创建设备预约
  public async createDeviceReservation(params: CreateDeviceReservationParams): Promise<ApiResponse<DeviceReservation>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<DeviceReservation>>({
        method: 'POST',
        url: '/device-reservations',
        data: params,
      });
      return response;
    }, { context: '创建设备预约' }) as ApiResponse<DeviceReservation>;
  }

  // 获取设备预约列表
  public async getDeviceReservations(params: GetDeviceReservationsParams): Promise<ApiResponse<DeviceReservation[]>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<DeviceReservation[]>>({
        method: 'GET',
        url: '/device-reservations',
        params,
      });
      return response;
    }, { context: '获取设备预约' }) as ApiResponse<DeviceReservation[]>;
  }

  // 取消设备预约
  public async cancelDeviceReservation(reservationId: string): Promise<ApiResponse<null>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<null>>({
        method: 'DELETE',
        url: `/device-reservations/${reservationId}`,
      });
      return response;
    }, { context: '取消设备预约' }) as ApiResponse<null>;
  }

  // 获取设备监控数据
  public async getDeviceMonitoringData(deviceId: string): Promise<ApiResponse<DeviceMonitoringData>> {
    return await tryCatch(async () => {
      const response = await this.request<ApiResponse<DeviceMonitoringData>>({
        method: 'GET',
        url: `/devices/${deviceId}/monitoring`,
      });
      return response;
    }, { context: '获取设备监控数据' }) as ApiResponse<DeviceMonitoringData>;
  }

  // 工具方法
  // =======

  // 转换设备数据
  public transformDeviceData(devices: any[]): Device[] {
    return devices.map(device => ({
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      location: device.location,
      connectionStatus: device.connectionStatus || 'offline',
      lastActive: new Date(device.lastActive || Date.now()),
      tags: device.tags || [],
      description: device.description || '',
      manufacturer: device.manufacturer || '',
      model: device.model || '',
      serialNumber: device.serialNumber || '',
      firmwareVersion: device.firmwareVersion || '',
      ipAddress: device.ipAddress || '',
      macAddress: device.macAddress || '',
      createdAt: new Date(device.createdAt || Date.now()),
      updatedAt: new Date(device.updatedAt || Date.now()),
    }));
  }

  // 转换设备数据点
  public transformDeviceDataPoints(dataPoints: any[]): DeviceDataPoint[] {
    return dataPoints.map(point => ({
      id: point.id,
      deviceId: point.deviceId,
      timestamp: new Date(point.timestamp || Date.now()),
      type: point.type,
      value: point.value,
      unit: point.unit || '',
      quality: point.quality || 'good',
    }));
  }
}

// 导出单例实例
export const apiService = new ApiService();
export type { ApiService };
