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

// API基础URL配置
// 生产环境使用相对路径，开发环境使用localhost
const api_BASE_URL = process.env.REACT_APP_api_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

const WS_BASE_URL = process.env.REACT_APP_WS_URL ||
  (process.env.NODE_ENV === 'production' ?
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}` :
    'ws://localhost:3001');

class apiService {
  private apiClient: AxiosInstance;
  private ws: WebSocket | null = null;
  private deviceservice: deviceservice;
  private guidanceService: GuidanceService;

  constructor() {
    this.apiClient = axios.create({
      baseURL: api_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });    // ����������
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
    );    // ��Ӧ������
    this.apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        this.handleapiError(error);
        return Promise.reject(error);
      }
    );

    // ��ʼ������
    this.deviceservice = new deviceservice(this);
    this.guidanceService = new GuidanceService(this);
  }
  // ������
  private handleapiError(error: any) {
    // ���������������������ɴ��Ĭ����
    if (error.request && !error.response) {
      console.warn('?? ��������ʧ�ܣ���ʹ��ģ������');
      return;
    }

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // ���URL����auth/me��˵���Ǽ���û�״̬����Ĭ����
          if (error.config?.url?.includes('/auth/me')) {
            console.warn('?? �û���֤״̬���ʧ�ܣ�ʹ��Ĭ��״̬');
            return;
          }
          toast.error('��¼�ѹ��ڣ������µ�¼');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Ȩ�޲���');
          break;
        case 404:
          // api不存在时忽略404错误，使用默认数据
          if (error.config?.url?.includes('health') ||
              error.config?.url?.includes('chat') ||
              error.config?.url?.includes('auth/me')) {
            console.warn(`⚠️ api端点 ${error.config.url} 不存在，使用静态模式`);
            return;
          }
          toast.error('请求的资源不存在');
          break;
        case 500:
          toast.error('�������ڲ�����');
          break;
        default:
          // ����api�����صĴ��󣬽�����ʾ����
          if (error.config?.url?.includes('health') ||
              error.config?.url?.includes('chat')) {
            console.warn(`?? api��Ӧ�쳣: ${data?.message || '������ʱ������'}`);
            return;
          }
          toast.error(data?.message || '����ʧ��');
      }
    } else {
      console.error('�������ô���:', error.message);
    }
  }
  // ͨ�����󷽷�
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<apiResponse<T>> = await this.apiClient.request(config);
      return response.data.data as T;
    } catch (error) {
      throw error;
    }
  }

  // ͨ��HTTP����
  async get<T = any>(url: string, params?: any): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
    });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<AxiosRequestConfig>): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<AxiosRequestConfig>): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  async delete<T = any>(url: string, config?: Partial<AxiosRequestConfig>): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }
  // �û����api
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    });
  }

  async register(userData: { username: string; email: string; password: string; role?: string }): Promise<User> {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data: userData,
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request({
      method: 'GET',
      url: '/auth/me',
    });
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request({
      method: 'PUT',
      url: '/auth/profile',
      data: userData,
    });
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<void> {
    return this.request({
      method: 'POST',
      url: '/auth/change-password',
      data: passwords,
    });
  }  // AI�������api
  async sendMessage(message: string, sessionId?: string, context?: any): Promise<AIAssistantResponse> {
    try {
      // ��ȡ�����AI����
      const aiConfigStr = localStorage.getItem('ai-config');
      let aiConfig = null;

      if (aiConfigStr) {
        try {
          aiConfig = JSON.parse(aiConfigStr);
        } catch (error) {
          console.warn('AI���ý���ʧ��:', error);
        }
      }

      // Ĭ��AIģ������
      const defaultModel = 'deepseek-chat'; // Ĭ��ʹ��DeepSeek
      const modelId = aiConfig?.selectedModel || defaultModel;

      console.log('����AI����:', { message: message.substring(0, 50) + '...', modelId });

      // ��һ�γ���
      try {
        const response = await this.request({
          method: 'POST',
          url: '/ai-assistant/chat',
          data: {
            message,
            modelId,
            apiKey: aiConfig?.apiKey, // ����api��Կ
            context: {
              userId: this.getUserId(),
              sessionId: sessionId || 'default',
              role: this.getUserRole() || 'student',
              ...context
            },
            options: {
              includeSuggestions: true,
              includeActions: true,
              temperature: aiConfig?.temperature,
              maxTokens: aiConfig?.maxTokens
            }
          },
          timeout: 20000
        });

        // ��ȫ���ͼ��
        const typedResponse = response as {
          message?: string;
          suggestions?: string[];
        };

        console.log('AI��Ӧ�ɹ�:', {
          length: typedResponse?.message?.length || 0,
          suggestions: typedResponse?.suggestions?.length || 0
        });

        return typedResponse as AIAssistantResponse;
      } catch (error) {
        // ����Ǿ�api·����������api·��
        console.warn('���Ա���AI�˵�...');
        const response = await this.request({
          method: 'POST',
          url: '/ai/chat',
          data: {
            message,
            modelId,
            sessionId: sessionId || 'default'
          },
          timeout: 20000
        });

        // ��ȫ����ת���͸�ʽ����Ӧ
        const typedResponse = response as {
          content?: string;
          response?: string;
          suggestions?: string[];
        };

        // ��ʽ����Ӧ��ƥ��Ԥ�ڽṹ
        return {
          message: typedResponse.content || typedResponse.response || '��Ǹ���޷������������⡣',
          suggestions: Array.isArray(typedResponse.suggestions)
            ? typedResponse.suggestions.map(item => {
                if (typeof item === 'string') {
                  return { text: item };
                }
                return item;
              })
            : [
                { text: '���ʹ��AI���֣�', category: 'general' },
                { text: 'չʾһ��ʵ������', category: 'experiment' }
              ]
        };
      }
    } catch (error) {
      console.warn('AI����api����ʧ�ܣ�ʹ������ģʽ:', error);
      // �ṩ�Ѻõ�������Ӧ
      return {
        message: '��Ŀǰ��������ģʽ������������ʧ�ܣ������������ӻ�������ҳ������AIģ�ͺ�api��Կ��',
        suggestions: [
          { text: '��δ���һ����ʵ�飿', category: 'experiment' },
          { text: '�鿴�����ʵ����', category: 'analysis' },
          { text: 'ǰ������ҳ������AI', category: 'general' }
        ]
      };
    }
  }

  async getchatSessions(): Promise<chatSession[]> {
    try {
      return this.request({
        method: 'GET',
        url: '/ai-assistant/sessions',
      });
    } catch (error) {
      console.error('��ȡ����Ựʧ��:', error);
      toast.error('�޷���ȡ����Ự��ʹ�ñ��ش洢�ĻỰ');

      // ���ر��ش洢�ĻỰ�������
      const localSessions = localStorage.getItem('chat-sessions');
      return localSessions ? JSON.parse(localSessions) : [];
    }
  }

  async getchatHistory(sessionId: string): Promise<chatMessage[]> {
    try {
      return this.request({
        method: 'GET',
        url: `/ai-assistant/sessions/${sessionId}/messages`,
      });
    } catch (error) {
      console.error('��ȡ������ʷʧ��:', error);
      toast.error('�޷���ȡ������ʷ��ʹ�ñ��ش洢����Ϣ');

      // ���ر��ش洢��������ʷ�������
      const localHistory = localStorage.getItem(`chat-history-${sessionId}`);
      return localHistory ? JSON.parse(localHistory) : [];
    }
  }
  async createchatSession(title: string): Promise<chatSession> {
    try {
      const session = await this.request<chatSession>({
        method: 'POST',
        url: '/ai-assistant/sessions',
        data: { title },
      });

      // �ɹ������󱣴浽���ش洢
      const localSessions = localStorage.getItem('chat-sessions');
      const sessions = localSessions ? JSON.parse(localSessions) : [];
      sessions.push(session);
      localStorage.setItem('chat-sessions', JSON.stringify(sessions));

      return session;
    } catch (error) {
      console.error('��������Ựʧ��:', error);
      toast.error('�޷��ڷ������ϴ�������Ự��������������ʱ�Ự');      // ����������ʱ�Ự
      const tempSession = {
        id: `local-${Date.now()}`,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        messages: [] as chatMessage[],
        isLocal: true
      } as chatSession;

      // ���浽���ش洢
      const localSessions = localStorage.getItem('chat-sessions');
      const sessions = localSessions ? JSON.parse(localSessions) : [];
      sessions.push(tempSession);
      localStorage.setItem('chat-sessions', JSON.stringify(sessions));

      return tempSession;
    }
  }

  async deletechatSession(sessionId: string): Promise<void> {
    try {
      await this.request({
        method: 'DELETE',
        url: `/ai-assistant/sessions/${sessionId}`,
      });

      // �ӱ��ش洢��Ҳɾ��
      const localSessions = localStorage.getItem('chat-sessions');
      if (localSessions) {
        const sessions = JSON.parse(localSessions).filter((s: any) => s.id !== sessionId);
        localStorage.setItem('chat-sessions', JSON.stringify(sessions));
      }

      // ɾ����ص�������ʷ
      localStorage.removeItem(`chat-history-${sessionId}`);
    } catch (error) {
      console.error('ɾ������Ựʧ��:', error);
      toast.error('�޷��ӷ�����ɾ������Ự�������ӱ���ɾ��');

      // �ӱ��ش洢��ɾ��
      const localSessions = localStorage.getItem('chat-sessions');
      if (localSessions) {
        const sessions = JSON.parse(localSessions).filter((s: any) => s.id !== sessionId);
        localStorage.setItem('chat-sessions', JSON.stringify(sessions));
      }

      // ɾ����ص�������ʷ
      localStorage.removeItem(`chat-history-${sessionId}`);
    }
  }

  // ��������
  private getUserId(): string {
    const user = JSON.parse(localStorage.getItem('user-StorageIcon') || '{"state":{}}')?.state?.user;
    return user?.id || 'unknown';
  }

  private getUserRole(): string {
    const user = JSON.parse(localStorage.getItem('user-StorageIcon') || '{"state":{}}')?.state?.user;
    return user?.role || 'student';
  }

  // ʵ�����api
  async getExperiments(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Experiment>> {
    try {
      return this.request<PaginatedResponse<Experiment>>({
        method: 'GET',
        url: '/experiments',
        params,
      });
    } catch (error) {
      console.error('��ȡʵ���б�ʧ��:', error);
      toast.error('�޷��ӷ�������ȡʵ���б�');      // ���ؿշ�ҳ���
      return {
        data: [],
        items: [], // ����items����
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0
      } as PaginatedResponse<Experiment>;
    }
  }

  async getExperiment(id: string): Promise<Experiment> {
    try {
      return this.request<Experiment>({
        method: 'GET',
        url: `/experiments/${id}`,
      });
    } catch (error) {
      console.error(`��ȡʵ�� ${id} ʧ��:`, error);
      toast.error('�޷���ȡʵ�����飬���Ժ�����');
      throw error;
    }
  }

  async createExperiment(experimentData: Partial<Experiment> | any): Promise<Experiment> {
    try {
      // ת��ǰ�˸�ʽ��ʵ������Ϊapi��Ҫ�ĸ�ʽ
      const apiExperimentData = {
        name: experimentData.name,
        description: experimentData.description,
        type: experimentData.type,
        status: experimentData.status || 'pending',
        parameters: {
          experimentMethod: experimentData.method,
          duration: Number(experimentData.duration),
          experimentResource: experimentData.resources instanceof Array ? experimentData.resources[0] : experimentData.resources,
          aiAssistance: experimentData.aiAssistance
        },
        metadata: {
          createdAt: new Date().toISOString()
        }
      };

      return this.request<Experiment>({
        method: 'POST',
        url: '/experiments',
        data: apiExperimentData,
      });
    } catch (error) {
      console.error('����ʵ��ʧ��:', error);
      toast.error('����ʵ��ʧ�ܣ��������벢�Ժ�����');
      throw error;
    }
  }

  async updateExperiment(id: string, experimentData: Partial<Experiment>): Promise<Experiment> {
    try {
      return this.request<Experiment>({
        method: 'PUT',
        url: `/experiments/${id}`,
        data: experimentData,
      });
    } catch (error) {
      console.error(`����ʵ�� ${id} ʧ��:`, error);
      toast.error('����ʵ��ʧ�ܣ����Ժ�����');
      throw error;
    }
  }

  async deleteExperiment(id: string): Promise<void> {
    try {
      return this.request<void>({
        method: 'DELETE',
        url: `/experiments/${id}`,
      });
    } catch (error) {
      console.error(`ɾ��ʵ�� ${id} ʧ��:`, error);
      toast.error('ɾ��ʵ��ʧ�ܣ����Ժ�����');
      throw error;
    }
  }

  async startExperiment(id: string): Promise<ExperimentExecution> {
    try {
      return this.request<ExperimentExecution>({
        method: 'POST',
        url: `/experiments/${id}/start`,
      });
    } catch (error) {
      console.error(`����ʵ�� ${id} ʧ��:`, error);
      toast.error('����ʵ��ʧ�ܣ�����ʵ�����ò��Ժ�����');
      throw error;
    }
  }

  async stopExperiment(id: string): Promise<void> {
    try {
      return this.request<void>({
        method: 'POST',
        url: `/experiments/${id}/stop`,
      });
    } catch (error) {
      console.error(`ֹͣʵ�� ${id} ʧ��:`, error);
      toast.error('ֹͣʵ��ʧ�ܣ����Ժ�����');
      throw error;
    }
  }
  async getExperimentResults(id: string): Promise<any> {
    try {
      return this.request<any>({
        method: 'GET',
        url: `/experiments/${id}/results`,
      });
    } catch (error) {
      console.error(`��ȡʵ�� ${id} ���ʧ��:`, error);
      toast.error('��ȡʵ����ʧ�ܣ����Ժ�����');
      throw error;
    }
  }

  // ʵ��ģ����ؽӿ�
  async getTemplates(params?: { page?: number; limit?: number; search?: string }): Promise<apiResponse<PaginatedResponse<ExperimentTemplate>>> {
    try {
      const response = await this.apiClient.get('/templates', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || '��ȡʵ��ģ���б�ʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  async getTemplateById(id: string): Promise<apiResponse<ExperimentTemplate>> {
    try {
      const response = await this.apiClient.get(`/templates/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || '��ȡʵ��ģ������ʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  async createTemplate(template: Partial<ExperimentTemplate>): Promise<apiResponse<ExperimentTemplate>> {
    try {
      const response = await this.apiClient.post('/templates', template);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || '����ʵ��ģ��ʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  async updateTemplate(id: string, template: Partial<ExperimentTemplate>): Promise<apiResponse<ExperimentTemplate>> {
    try {
      const response = await this.apiClient.put(`/templates/${id}`, template);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || '����ʵ��ģ��ʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  async deleteTemplate(id: string): Promise<apiResponse<void>> {
    try {
      const response = await this.apiClient.delete(`/templates/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || 'ɾ��ʵ��ģ��ʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  // ͼ�������api
  async processImage(
    imageFile: File,
    options: ImageProcessingOptions
  ): Promise<{ processedImageUrl: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('options', JSON.stringify(options));

    return this.request({
      method: 'POST',
      url: '/image-processing/process',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request({
      method: 'POST',
      url: '/image-processing/analyze',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async detectObjects(imageFile: File): Promise<ObjectDetectionResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request({
      method: 'POST',
      url: '/image-processing/detect-objects',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async enhanceImage(
    imageFile: File,
    enhancementType: string
  ): Promise<{ enhancedImageUrl: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('enhancementType', enhancementType);

    return this.request({
      method: 'POST',
      url: '/image-processing/enhance',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // �ļ��ϴ����api
  async uploadFile(file: File, type: string): Promise<{ fileId: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request({
      method: 'POST',
      url: '/files/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async uploadDataset(files: File[]): Promise<{ datasetId: string; url: string }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.request({
      method: 'POST',
      url: '/files/upload-dataset',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // �Ǳ������api
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request({
      method: 'GET',
      url: '/dashboard/stats',
    });
  }

  async getRecentExperiments(limit: number = 10): Promise<Experiment[]> {
    return this.request({
      method: 'GET',
      url: '/dashboard/recent-experiments',
      params: { limit },
    });
  }

  // WebSocket����
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

  // ����WebSocket��Ϣ
  sendWebSocketMessage(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  // ����WebSocket��Ϣ
  onWebSocketMessage(callback: (message: any) => void): void {
    if (this.ws) {
      this.ws.onmessage = (Event) => {
        try {
          const message = JSON.parse(Event.data);
          callback(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    }  }

  // api״̬���
  async CheckIconapiStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${api_BASE_URL}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      // ��Ĭ����api״̬���ʧ��
      console.warn('api���񲻿��ã���ʹ�ý���ģʽ');
      return false;
    }
  }

  // api��������
  async retryConnection(maxRetries: number = 3, delayMs: number = 2000): Promise<boolean> {
    let retries = 0;
    while (retries < maxRetries) {
      const isConnected = await this.CheckIconapiStatus();
      if (isConnected) {
        return true;
      }

      retries++;
      // ֻ�����һ������ʧ��ʱ��ʾ����
      if (retries === maxRetries) {
        console.warn('�޷����ӵ���������ʹ������ģʽ');
      }

      // �ȴ�һ��ʱ�������
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    return false;
  }

  // ��ȡWebSocket URL
  getWebSocketUrl(): string {
    return WS_BASE_URL;
  }
  // ��¶axiosʵ��������api���Թ���
  get api(): AxiosInstance {
    return this.apiClient;
  }

  // ��ȡ��Դ�б�
  async getResources(experimentType?: string, CategoryIcon?: string, search?: string): Promise<apiResponse<any[]>> {
    try {
      let url = '/resources';
      const params: Record<string, string> = {};

      if (experimentType) params.type = experimentType;
      if (CategoryIcon) params.category = CategoryIcon;
      if (search) params.search = search;

      const response = await this.apiClient.get(url, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || '��ȡ��Դ�б�ʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  // ��ȡ������Դ����
  async getResource(id: string): Promise<apiResponse<any>> {
    try {
      const response = await this.apiClient.get(`/resources/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || '��ȡ��Դ����ʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  // ��������Դ
  async createResource(resourceData: any): Promise<apiResponse<any>> {
    try {
      const response = await this.apiClient.post('/resources', resourceData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || '������Դʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  // ������Դ
  async updateResource(id: string, resourceData: any): Promise<apiResponse<any>> {
    try {
      const response = await this.apiClient.put(`/resources/${id}`, resourceData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || '������Դʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }

  // ɾ����Դ
  async deleteResource(id: string): Promise<apiResponse<any>> {
    try {
      const response = await this.apiClient.delete(`/resources/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      this.handleapiError(error);
      return {
        success: false,
        error: {
          message: error.message || 'ɾ����Դʧ��',
          code: error.response?.status || 500,
        },
      };
    }
  }  // ����AIģ������
  async testModelConnection(modelName: string): Promise<{ success: boolean; message: string; latency?: number; tokenLimits?: any }> {
    try {
      const startTime = Date.now();

      // ��ȡ�����AI����
      const aiConfigStr = localStorage.getItem('ai-config');
      let aiConfig = null;

      if (aiConfigStr) {
        try {
          aiConfig = JSON.parse(aiConfigStr);
        } catch (error) {
          console.warn('Failed to parse AI config:', error);
          return {
            success: false,
            message: '�޷�����AI����'
          };
        }
      } else {
        return {
          success: false,
          message: 'δ�ҵ�AI����'
        };
      }

      // ��ȡģ��������Ϣ��ȷ����ȷ�Ĳ���
      const modelConfig = AI_MODELS.find(model => model.id === modelName);
      if (!modelConfig) {
        return {
          success: false,
          message: `�Ҳ���ģ�� ${modelName} ��������Ϣ`
        };
      }

      // ���ݲ�ͬģ�Ͷ����������
      const requestData: any = {
        model: modelName,
        config: aiConfig
      };

      // ���ݹ�Ӧ�̺�ģ��ID�����ض�����
      if (modelName === 'doubao-seed-1-6-thinking-250615') {
        // ��ɽ���۶���˼��ģ���ض�����
        requestData.specificParams = {
          model_id: 'doubao-seed-1-6-thinking-250615',
          max_context_length: 256000, // 256K������
          multimodal: true,
          endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
        };
      } else if (modelName === 'deepseek-reasoner') {
        // DeepSeek����ģ���ض�����
        requestData.specificParams = {
          model: 'deepseek-reasoner', // ָ��DeepSeek-R1-0528
          endpoint: 'https://api.deepseek.com/v1/chat/completions'
        };
      }

      // ���Ͳ������󵽺��
      const response = await this.apiClient.post('/ai-assistant/test-connection', requestData);

      const latency = Date.now() - startTime;

      // �����˷�����ģ����Ϣ��token���ƣ����䱣����µ����ش洢��
      if (response.data.success && response.data.tokenLimits) {
        const modelInfoStr = localStorage.getItem('ai-models-info') || '{}';
        try {
          const modelInfo = JSON.parse(modelInfoStr);
          modelInfo[modelName] = {
            ...modelInfo[modelName],
            lastTested: new Date().toISOString(),
            contextWindow: response.data.tokenLimits.contextWindow,
            outputTokenLimit: response.data.tokenLimits.outputTokenLimit,
            inputTokenLimit: response.data.tokenLimits.inputTokenLimit
          };
          localStorage.setItem('ai-models-info', JSON.stringify(modelInfo));
        } catch (e) {
          console.warn('�޷�����ģ����Ϣ����:', e);
        }
      }

      return {
        success: response.data.success,
        message: response.data.message || '���ӳɹ�',
        latency,
        tokenLimits: response.data.tokenLimits
      };
    } catch (error: any) {
      console.error('AIģ�����Ӳ���ʧ��:', error);

      // ��ȡ������Ϣ
      const errorMessage = error.response?.data?.message || error.message || '���Ӳ���ʧ��';

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // ����ָ��ϵͳapi
  async getGuidanceSuggestions(params?: {
    type?: string;
    importance?: number;
    page?: number;
    limit?: number
  }): Promise<PaginatedResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/guidance/suggestions',
      params
    });
  }

  async getGuidanceSuggestionById(id: string): Promise<any> {
    return this.request({
      method: 'GET',
      url: `/guidance/suggestions/${id}`
    });
  }

  async createGuidanceSuggestion(suggestionData: any): Promise<any> {
    return this.request({
      method: 'POST',
      url: '/guidance/suggestions',
      data: suggestionData
    });
  }

  async updateGuidanceSuggestion(id: string, suggestionData: any): Promise<any> {
    return this.request({
      method: 'PUT',
      url: `/guidance/suggestions/${id}`,
      data: suggestionData
    });
  }

  async deleteGuidanceSuggestion(id: string): Promise<any> {
    return this.request({
      method: 'DELETE',
      url: `/guidance/suggestions/${id}`
    });
  }

  async generateAIGuidance(requestData: any): Promise<any> {
    return this.request({
      method: 'POST',
      url: '/guidance/generate',
      data: requestData
    });
  }

  async getGuidanceSessionHistory(sessionId: string): Promise<any> {
    return this.request({
      method: 'GET',
      url: `/guidance/sessions/${sessionId}`
    });
  }

  async addStudentQuestion(sessionId: string, questionData: any): Promise<any> {
    return this.request({
      method: 'POST',
      url: `/guidance/sessions/${sessionId}/questions`,
      data: questionData
    });
  }

  // �豸�������api
  async getdevices(params?: GetdevicesParams): Promise<Device[]> {
    const devices = await this.deviceservice.getdevices(params);
    // ����Device���ͣ�����ȱʧ������
    return devices.map(device => ({
      ...device,
      status: (device as any).status || 'offline' as const,
      connectionStatus: DeviceConnectionStatus.CONNECTED // 使用枚举值
    }));
  }

  async getDeviceById(id: string): Promise<Device> {
    const device = await this.deviceservice.getDeviceById(id);
    // 补充Device类型，填充缺失的属性
    return {
      ...device,
      status: (device as any).status || 'offline' as const,
      connectionStatus: DeviceConnectionStatus.CONNECTED // 使用枚举值
    };
  }

  async updatedevicestatus(id: string, status: string, metadata?: any): Promise<Device> {
    const device = await this.deviceservice.updatedevicestatus(id, status, metadata);
    // 补充Device类型，填充缺失的属性
    return {
      ...device,
      status: (device as any).status || 'offline' as const,
      connectionStatus: DeviceConnectionStatus.CONNECTED // 使用枚举值
    };
  }

  async sendDeviceCommand(deviceId: string, params: SendDeviceCommandParams): Promise<DeviceCommand> {
    return this.deviceservice.sendCommand(deviceId, params);
  }

  async getDeviceData(deviceId: string, params?: GetDeviceDataParams): Promise<DeviceDataPoint[]> {
    const dataPoints = await this.deviceservice.getDeviceData(deviceId, params);
    // ����DeviceDataPoint���ͣ�����ȱʧ��metrics����
    return dataPoints.map(point => ({
      ...point,
      metrics: (point as any).metrics || {
        temperature: (point as any).temperature || 0,
        humidity: (point as any).humidity || 0,
        pressure: (point as any).pressure || 0,
        batteryLevel: (point as any).batteryLevel || 0,
        signalStrength: (point as any).signalStrength || 0
      }
    }));
  }

  async getDeviceReservations(params?: GetDeviceReservationsParams): Promise<DeviceReservation[]> {
    return this.deviceservice.getDeviceReservations(params);
  }

  async createDeviceReservation(deviceId: string, params: CreateDeviceReservationParams): Promise<DeviceReservation> {
    // 确保时间字段是字符串类型
    const processedParams = {
      ...params,
      startTime: typeof params.startTime === 'string' ? params.startTime : (params.startTime as Date).toISOString(),
      endTime: typeof params.endTime === 'string' ? params.endTime : (params.endTime as Date).toISOString()
    };
    return this.deviceservice.createReservation(deviceId, processedParams);
  }

  async getDeviceMonitoringData(deviceId: string): Promise<DeviceMonitoringData> {
    const data = await this.deviceservice.getDeviceMonitoringData(deviceId);
    // ����DeviceMonitoringData״̬��ʹ��string�Ƚ�
    const statusStr = String(data.status);
    return {
      ...data,
      timestamp: typeof data.timestamp === 'string' ? data.timestamp : data.timestamp.toISOString(),
      status: (statusStr.includes('online') || statusStr.includes('connected') ? 'online' :
               statusStr.includes('offline') || statusStr.includes('disconnected') ? 'offline' :
               'error') as 'online' | 'offline' | 'error'
    };
  }
}

// ��������ʵ��
const apiServiceInstance = new apiService();
export default apiServiceInstance;