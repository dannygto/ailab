/**
 * HTTP/REST设备协议适配器
 * 负责通过HTTP/REST API与设备通信和控制
 */

import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionConfig, DeviceConnectionState, DeviceConnectionEventType, DeviceConnectionEvent } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// HTTP/REST设备连接配置接口扩展
export interface HttpRestDeviceConnectionConfig extends DeviceConnectionConfig {
  // 基本配置
  baseUrl: string;                      // API基础URL
  timeout?: number;                     // 请求超时(毫秒)
  retryCount?: number;                  // 请求失败重试次数
  retryDelay?: number;                  // 重试间隔(毫秒)
  autoReconnect?: boolean;              // 是否自动重连
  reconnectInterval?: number;           // 重连间隔(毫秒)
  heartbeatPath?: string;               // 心跳检测路径
  heartbeatInterval?: number;           // 心跳间隔(毫秒)
  debug?: boolean;                      // 是否启用调试模式

  // 认证配置
  auth?: {
    type: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2';  // 认证类型
    username?: string;                  // Basic认证用户名
    password?: string;                  // Basic认证密码
    token?: string;                     // Bearer Token或API Key
    apiKeyName?: string;                // API Key名称
    apiKeyLocation?: 'header' | 'query' | 'cookie';  // API Key位置
    oauthConfig?: {                     // OAuth2配置
      tokenUrl?: string;                // Token URL
      clientId?: string;                // 客户端ID
      clientSecret?: string;            // 客户端密钥
      scope?: string;                   // 权限范围
    }
  };

  // 请求配置
  headers?: Record<string, string>;     // 自定义请求头
  defaultContentType?: string;          // 默认内容类型

  // API端点映射
  endpointMap?: {
    [endpointName: string]: {
      path: string;                     // API路径
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // HTTP方法
      contentType?: string;             // 内容类型
      requestTransform?: string;        // 请求数据转换函数名称
      responseTransform?: string;       // 响应数据转换函数名称
      queryParams?: string[];           // 查询参数列表
      pathParams?: string[];            // 路径参数列表
      bodyFields?: string[];            // 请求体字段列表
      expectedStatus?: number[];        // 预期响应状态码
      timeout?: number;                 // 端点特定超时
    }
  };

  // 数据转换器
  dataTransformers?: {
    [transformerName: string]: string;  // 转换器函数代码(将被eval执行)
  };
}

// HTTP/REST设备适配器
export class HttpRestDeviceAdapter extends BaseProtocolAdapter {
  // HTTP客户端映射: deviceId -> Axios实例
  private httpClients: Map<string, AxiosInstance> = new Map();
  // 设备配置映射: deviceId -> HTTP/REST设备配置
  private deviceConfigs: Map<string, HttpRestDeviceConnectionConfig> = new Map();
  // 心跳检测定时器
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map();
  // 重连定时器
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  // 转换器函数缓存
  private transformerFunctions: Map<string, Function> = new Map();
  // 模拟数据间隔
  private dataIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super(
      'http-rest-adapter',
      'HTTP/REST设备适配器',
      'HTTP/REST',
      ['http', 'https', 'rest-api']
    );
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    console.log('初始化HTTP/REST设备适配器');

    try {
      // 确保axios库可用
      console.log('验证HTTP客户端库...');

      // 在实际项目中会导入axios
      if (typeof axios !== 'function') {
        throw new Error('HTTP客户端库不可用');
      }

      console.log('HTTP/REST通信库初始化成功');
    } catch (error) {
      console.error('HTTP/REST通信库初始化失败:', error);
      throw new Error('HTTP/REST通信库初始化失败');
    }
  }

  /**
   * 连接到HTTP/REST设备
   * @param deviceId 设备ID
   * @param config 连接配置
   */
  public async connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean> {
    console.log(`正在连接HTTP/REST设备: ${deviceId}`, config);

    try {
      // 参数验证
      if (!config || !config.parameters) {
        throw new Error('连接配置无效');
      }

      // 类型转换并提取特定参数
      const httpConfig = config as HttpRestDeviceConnectionConfig;

      if (!httpConfig.parameters.baseUrl) {
        throw new Error('未指定API基础URL');
      }

      // 保存设备配置
      this.deviceConfigs.set(deviceId, httpConfig);

      // 创建HTTP客户端
      const axiosConfig: AxiosRequestConfig = {
        baseURL: httpConfig.parameters.baseUrl,
        timeout: httpConfig.parameters.timeout || 10000,
        headers: {
          'Content-Type': httpConfig.parameters.defaultContentType || 'application/json',
          ...httpConfig.parameters.headers
        }
      };

      // 添加认证配置
      if (httpConfig.parameters.auth) {
        this.configureAuthentication(axiosConfig, httpConfig.parameters.auth);
      }

      // 创建Axios实例
      const httpClient = axios.create(axiosConfig);

      // 配置请求拦截器
      httpClient.interceptors.request.use(
        (config) => {
          // 调试输出
          if (httpConfig.parameters.debug) {
            console.log(`[${deviceId}] 发送请求:`, config.method?.toUpperCase(), config.url);
          }
          return config;
        },
        (error) => {
          console.error(`[${deviceId}] 请求错误:`, error);
          return Promise.reject(error);
        }
      );

      // 配置响应拦截器
      httpClient.interceptors.response.use(
        (response) => {
          // 调试输出
          if (httpConfig.parameters.debug) {
            console.log(`[${deviceId}] 收到响应:`, response.status, response.config.url);
          }

          // 更新统计信息
          this.updateStatistics(deviceId, 0, JSON.stringify(response.data).length, 0, 1);

          return response;
        },
        async (error) => {
          console.error(`[${deviceId}] 响应错误:`, error.message);

          // 记录错误
          this.recordError(deviceId, `HTTP错误: ${error.message}`);

          // 如果启用了重试
          if (httpConfig.parameters.retryCount && error.config) {
            // 实现请求重试逻辑
            return this.retryRequest(error, deviceId, httpConfig.parameters);
          }

          return Promise.reject(error);
        }
      );

      // 存储HTTP客户端
      this.httpClients.set(deviceId, httpClient);

      // 初始化连接状态
      this.initializeConnectionState(deviceId);

      // 发送心跳检测请求以验证连接
      const isConnected = await this.checkConnection(deviceId, httpClient, httpConfig.parameters);

      if (!isConnected) {
        throw new Error('设备连接检测失败');
      }

      // 如果配置了心跳检测，启动心跳检测
      if (httpConfig.parameters.heartbeatPath && httpConfig.parameters.heartbeatInterval) {
        this.startHeartbeat(deviceId, httpClient, httpConfig.parameters);
      }

      // 如果配置了数据模拟，启动数据模拟
      if (httpConfig.parameters.endpointMap) {
        this.setupDataSimulation(deviceId);
      }

      return true;
    } catch (error) {
      console.error(`连接HTTP/REST设备失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `连接失败: ${(error as Error).message}`);

      // 发送错误事件
      this.emitErrorEvent(deviceId, error as Error);

      // 如果配置了自动重连，设置自动重连
      const httpConfig = this.deviceConfigs.get(deviceId);
      if (httpConfig?.parameters.autoReconnect) {
        this.setupReconnect(deviceId);
      }

      return false;
    }
  }

  /**
   * 断开与HTTP/REST设备的连接
   * @param deviceId 设备ID
   */
  public async disconnect(deviceId: string): Promise<boolean> {
    console.log(`断开HTTP/REST设备连接: ${deviceId}`);

    try {
      // 清理心跳定时器
      if (this.heartbeatTimers.has(deviceId)) {
        clearInterval(this.heartbeatTimers.get(deviceId));
        this.heartbeatTimers.delete(deviceId);
      }

      // 清理重连定时器
      if (this.reconnectTimers.has(deviceId)) {
        clearTimeout(this.reconnectTimers.get(deviceId));
        this.reconnectTimers.delete(deviceId);
      }

      // 清理数据模拟定时器
      if (this.dataIntervals.has(deviceId)) {
        clearInterval(this.dataIntervals.get(deviceId));
        this.dataIntervals.delete(deviceId);
      }

      // 移除HTTP客户端
      this.httpClients.delete(deviceId);

      // 更新连接状态
      this.updateConnectionState(deviceId, {
        isConnected: false,
        lastDisconnected: new Date().toISOString()
      });

      // 发送断开连接事件
      this.emitDisconnectedEvent(deviceId);

      return true;
    } catch (error) {
      console.error(`断开HTTP/REST设备连接失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `断开连接失败: ${(error as Error).message}`);

      return false;
    }
  }

  /**
   * 向HTTP/REST设备发送命令
   * @param deviceId 设备ID
   * @param command 设备命令
   */
  public async sendCommand(deviceId: string, command: DeviceCommand): Promise<any> {
    console.log(`向HTTP/REST设备发送命令: ${deviceId}`, command);

    try {
      // 验证设备连接
      if (!this.httpClients.has(deviceId)) {
        throw new Error('设备未连接');
      }

      const httpClient = this.httpClients.get(deviceId);
      const httpConfig = this.deviceConfigs.get(deviceId);

      if (!httpConfig?.parameters.endpointMap) {
        throw new Error('未配置API端点映射');
      }

      // 根据命令找到对应的端点配置
      const endpointName = command.command;
      const endpoint = httpConfig.parameters.endpointMap[endpointName];

      if (!endpoint) {
        throw new Error(`未找到命令对应的API端点: ${endpointName}`);
      }

      // 准备请求参数
      const requestConfig: AxiosRequestConfig = {
        method: endpoint.method,
        url: this.buildUrl(endpoint.path, command.parameters, endpoint),
        timeout: endpoint.timeout || httpConfig.parameters.timeout
      };

      // 设置内容类型
      if (endpoint.contentType) {
        requestConfig.headers = {
          'Content-Type': endpoint.contentType
        };
      }

      // 准备请求体
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.bodyFields) {
        // 使用请求转换器处理请求数据
        if (endpoint.requestTransform && httpConfig.parameters.dataTransformers) {
          const transformer = this.getTransformerFunction(
            deviceId,
            endpoint.requestTransform,
            httpConfig.parameters.dataTransformers
          );

          if (transformer) {
            requestConfig.data = transformer(command.parameters);
          } else {
            // 如果没有转换器，则从命令参数中提取body字段
            requestConfig.data = this.extractBodyData(command.parameters, endpoint.bodyFields);
          }
        } else {
          // 如果没有转换器，则从命令参数中提取body字段
          requestConfig.data = this.extractBodyData(command.parameters, endpoint.bodyFields);
        }
      }

      // 调试输出
      if (httpConfig.parameters.debug) {
        console.log(`[${deviceId}] 发送命令请求:`, requestConfig);
      }

      // 更新统计信息
      this.updateStatistics(deviceId,
        requestConfig.data ? JSON.stringify(requestConfig.data).length : 0,
        0,
        1,
        0
      );

      // 发送请求
      const response = await httpClient.request(requestConfig);

      // 检查状态码
      if (endpoint.expectedStatus && !endpoint.expectedStatus.includes(response.status)) {
        throw new Error(`意外的响应状态码: ${response.status}`);
      }

      // 处理响应
      let result = response.data;

      // 使用响应转换器处理响应数据
      if (endpoint.responseTransform && httpConfig.parameters.dataTransformers) {
        const transformer = this.getTransformerFunction(
          deviceId,
          endpoint.responseTransform,
          httpConfig.parameters.dataTransformers
        );

        if (transformer) {
          result = transformer(response.data);
        }
      }

      // 调试输出
      if (httpConfig.parameters.debug) {
        console.log(`[${deviceId}] 命令响应:`, result);
      }

      // 发送命令完成事件
      this.emitCommandCompletedEvent(deviceId, command, result);

      return result;
    } catch (error) {
      console.error(`发送命令失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `命令失败: ${(error as Error).message}`);

      // 发送错误事件
      this.emitErrorEvent(deviceId, error as Error, command);

      throw error;
    }
  }

  /**
   * 从HTTP/REST设备读取数据
   * @param deviceId 设备ID
   * @param parameters 读取参数
   */
  public async readData(deviceId: string, parameters?: any): Promise<any> {
    console.log(`从HTTP/REST设备读取数据: ${deviceId}`, parameters);

    try {
      // 验证设备连接
      if (!this.httpClients.has(deviceId)) {
        throw new Error('设备未连接');
      }

      const httpClient = this.httpClients.get(deviceId);
      const httpConfig = this.deviceConfigs.get(deviceId);

      if (!httpConfig?.parameters.endpointMap) {
        throw new Error('未配置API端点映射');
      }

      // 如果未指定端点，使用默认的数据读取端点
      const endpointName = parameters?.endpoint || 'readData';
      const endpoint = httpConfig.parameters.endpointMap[endpointName];

      if (!endpoint) {
        throw new Error(`未找到数据读取端点: ${endpointName}`);
      }

      // 准备请求
      const requestConfig: AxiosRequestConfig = {
        method: endpoint.method,
        url: this.buildUrl(endpoint.path, parameters, endpoint),
        timeout: endpoint.timeout || httpConfig.parameters.timeout
      };

      // 调试输出
      if (httpConfig.parameters.debug) {
        console.log(`[${deviceId}] 发送数据读取请求:`, requestConfig);
      }

      // 发送请求
      const response = await httpClient.request(requestConfig);

      // 检查状态码
      if (endpoint.expectedStatus && !endpoint.expectedStatus.includes(response.status)) {
        throw new Error(`意外的响应状态码: ${response.status}`);
      }

      // 处理响应
      let result = response.data;

      // 使用响应转换器处理响应数据
      if (endpoint.responseTransform && httpConfig.parameters.dataTransformers) {
        const transformer = this.getTransformerFunction(
          deviceId,
          endpoint.responseTransform,
          httpConfig.parameters.dataTransformers
        );

        if (transformer) {
          result = transformer(response.data);
        }
      }

      // 调试输出
      if (httpConfig.parameters.debug) {
        console.log(`[${deviceId}] 数据读取响应:`, result);
      }

      // 发送数据接收事件
      this.emitDataReceivedEvent(deviceId, result);

      return result;
    } catch (error) {
      console.error(`读取数据失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `数据读取失败: ${(error as Error).message}`);

      // 发送错误事件
      this.emitErrorEvent(deviceId, error as Error);

      throw error;
    }
  }

  /**
   * 配置认证
   * @param axiosConfig Axios配置
   * @param auth 认证配置
   */
  private configureAuthentication(axiosConfig: AxiosRequestConfig, auth: any): void {
    switch (auth.type) {
      case 'basic':
        if (auth.username && auth.password) {
          axiosConfig.auth = {
            username: auth.username,
            password: auth.password
          };
        }
        break;

      case 'bearer':
        if (auth.token) {
          if (!axiosConfig.headers) axiosConfig.headers = {};
          axiosConfig.headers['Authorization'] = `Bearer ${auth.token}`;
        }
        break;

      case 'api-key':
        if (auth.token) {
          const keyName = auth.apiKeyName || 'X-API-Key';

          switch (auth.apiKeyLocation) {
            case 'header':
              if (!axiosConfig.headers) axiosConfig.headers = {};
              axiosConfig.headers[keyName] = auth.token;
              break;

            case 'query':
              if (!axiosConfig.params) axiosConfig.params = {};
              axiosConfig.params[keyName] = auth.token;
              break;

            case 'cookie':
              if (!axiosConfig.headers) axiosConfig.headers = {};
              axiosConfig.headers['Cookie'] = `${keyName}=${auth.token}`;
              break;

            default:
              // 默认放在header中
              if (!axiosConfig.headers) axiosConfig.headers = {};
              axiosConfig.headers[keyName] = auth.token;
          }
        }
        break;

      // OAuth2认证需要更复杂的逻辑，这里仅简单示例
      case 'oauth2':
        // 实际项目中需要实现完整的OAuth2流程
        console.log('OAuth2认证需要在实际项目中实现');
        break;

      case 'none':
      default:
        // 不需要认证
        break;
    }
  }

  /**
   * 构建请求URL
   * @param path 基本路径
   * @param params 参数对象
   * @param endpoint 端点配置
   * @returns 构建好的URL
   */
  private buildUrl(path: string, params: any, endpoint: any): string {
    let url = path;

    // 替换路径参数
    if (endpoint.pathParams && params) {
      for (const param of endpoint.pathParams) {
        if (params[param] !== undefined) {
          url = url.replace(`{${param}}`, encodeURIComponent(params[param]));
        }
      }
    }

    // 添加查询参数
    if (endpoint.queryParams && params) {
      const queryParams: string[] = [];

      for (const param of endpoint.queryParams) {
        if (params[param] !== undefined) {
          queryParams.push(`${encodeURIComponent(param)}=${encodeURIComponent(params[param])}`);
        }
      }

      if (queryParams.length > 0) {
        url += url.includes('?') ? '&' : '?';
        url += queryParams.join('&');
      }
    }

    return url;
  }

  /**
   * 从参数中提取请求体数据
   * @param params 参数对象
   * @param bodyFields 请求体字段列表
   * @returns 请求体数据
   */
  private extractBodyData(params: any, bodyFields: string[]): any {
    if (!params) return {};

    const bodyData: any = {};

    for (const field of bodyFields) {
      if (params[field] !== undefined) {
        bodyData[field] = params[field];
      }
    }

    return bodyData;
  }

  /**
   * 获取转换器函数
   * @param deviceId 设备ID
   * @param transformerName 转换器名称
   * @param transformers 转换器定义对象
   * @returns 转换器函数
   */
  private getTransformerFunction(
    deviceId: string,
    transformerName: string,
    transformers: Record<string, string>
  ): Function | null {
    const cacheKey = `${deviceId}:${transformerName}`;

    // 检查缓存
    if (this.transformerFunctions.has(cacheKey)) {
      return this.transformerFunctions.get(cacheKey) as Function;
    }

    // 获取转换器代码
    const transformerCode = transformers[transformerName];
    if (!transformerCode) {
      console.error(`未找到转换器: ${transformerName}`);
      return null;
    }

    try {
      // 创建转换器函数
      // 注意: 在生产环境中应该避免使用eval，可以考虑其他更安全的方法
      const transformerFunction = new Function('data', transformerCode);

      // 缓存函数
      this.transformerFunctions.set(cacheKey, transformerFunction);

      return transformerFunction;
    } catch (error) {
      console.error(`创建转换器函数失败: ${transformerName}`, error);
      return null;
    }
  }

  /**
   * 检查设备连接
   * @param deviceId 设备ID
   * @param httpClient HTTP客户端
   * @param config 设备配置
   * @returns 是否连接成功
   */
  private async checkConnection(
    deviceId: string,
    httpClient: AxiosInstance,
    config: any
  ): Promise<boolean> {
    try {
      // 使用心跳路径或默认路径检查连接
      const path = config.heartbeatPath || '/';

      // 发送请求
      const response = await httpClient.get(path);

      // 检查响应状态
      const connected = response.status >= 200 && response.status < 300;

      if (connected) {
        // 更新连接状态
        this.updateConnectionState(deviceId, {
          isConnected: true,
          lastConnected: new Date().toISOString()
        });

        // 发送连接事件
        this.emitConnectedEvent(deviceId);
      }

      return connected;
    } catch (error) {
      console.error(`连接检测失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `连接检测失败: ${(error as Error).message}`);

      return false;
    }
  }

  /**
   * 启动心跳检测
   * @param deviceId 设备ID
   * @param httpClient HTTP客户端
   * @param config 设备配置
   */
  private startHeartbeat(
    deviceId: string,
    httpClient: AxiosInstance,
    config: any
  ): void {
    // 清理现有定时器
    if (this.heartbeatTimers.has(deviceId)) {
      clearInterval(this.heartbeatTimers.get(deviceId));
    }

    // 创建新定时器
    const timer = setInterval(async () => {
      try {
        // 检查连接
        const connected = await this.checkConnection(deviceId, httpClient, config);

        // 如果连接断开且配置了自动重连，尝试重连
        if (!connected && config.autoReconnect) {
          this.setupReconnect(deviceId);
        }
      } catch (error) {
        console.error(`心跳检测失败: ${deviceId}`, error);

        // 记录错误
        this.recordError(deviceId, `心跳检测失败: ${(error as Error).message}`);

        // 如果配置了自动重连，尝试重连
        if (config.autoReconnect) {
          this.setupReconnect(deviceId);
        }
      }
    }, config.heartbeatInterval || 30000);

    // 存储定时器
    this.heartbeatTimers.set(deviceId, timer);
  }

  /**
   * 设置自动重连
   * @param deviceId 设备ID
   */
  private setupReconnect(deviceId: string): void {
    // 清理现有定时器
    if (this.reconnectTimers.has(deviceId)) {
      clearTimeout(this.reconnectTimers.get(deviceId));
    }

    // 获取设备配置
    const config = this.deviceConfigs.get(deviceId);
    if (!config) return;

    // 创建重连定时器
    const timer = setTimeout(async () => {
      console.log(`尝试重新连接设备: ${deviceId}`);

      try {
        // 尝试重新连接
        await this.connect(deviceId, config);
      } catch (error) {
        console.error(`重新连接失败: ${deviceId}`, error);

        // 记录错误
        this.recordError(deviceId, `重新连接失败: ${(error as Error).message}`);

        // 再次设置重连
        this.setupReconnect(deviceId);
      }
    }, config.parameters.reconnectInterval || 5000);

    // 存储定时器
    this.reconnectTimers.set(deviceId, timer);
  }

  /**
   * 请求重试
   * @param error 错误对象
   * @param deviceId 设备ID
   * @param config 设备配置
   * @returns Promise
   */
  private async retryRequest(error: any, deviceId: string, config: any): Promise<AxiosResponse> {
    // 如果没有重试次数或配置，直接拒绝
    if (!config.retryCount || !error.config) {
      return Promise.reject(error);
    }

    // 获取已重试次数
    const retryCount = error.config.__retryCount || 0;

    // 如果已经达到最大重试次数，拒绝
    if (retryCount >= config.retryCount) {
      return Promise.reject(error);
    }

    // 增加重试计数
    error.config.__retryCount = retryCount + 1;

    // 延迟重试
    await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));

    console.log(`重试请求(${error.config.__retryCount}/${config.retryCount}): ${deviceId} ${error.config.url}`);

    // 重新发送请求
    const httpClient = this.httpClients.get(deviceId);
    if (!httpClient) {
      return Promise.reject(new Error('设备未连接'));
    }

    return httpClient.request(error.config);
  }

  /**
   * 设置数据模拟
   * @param deviceId 设备ID
   */
  private setupDataSimulation(deviceId: string): void {
    // 清理现有定时器
    if (this.dataIntervals.has(deviceId)) {
      clearInterval(this.dataIntervals.get(deviceId));
    }

    // 获取设备配置
    const config = this.deviceConfigs.get(deviceId);
    if (!config) return;

    // 设置数据模拟定时器
    const interval = setInterval(() => {
      // 生成模拟数据
      const data = this.generateSimulatedData(deviceId, config);

      // 发送数据接收事件
      this.emitDataReceivedEvent(deviceId, data);
    }, 5000); // 每5秒生成一次模拟数据

    // 存储定时器
    this.dataIntervals.set(deviceId, interval);
  }

  /**
   * 生成模拟数据
   * @param deviceId 设备ID
   * @param config 设备配置
   * @returns 模拟数据
   */
  private generateSimulatedData(deviceId: string, config: HttpRestDeviceConnectionConfig): any {
    // 如果没有端点映射，返回空对象
    if (!config.parameters.endpointMap) {
      return {};
    }

    // 生成模拟数据
    const simulatedData: any = {
      deviceId,
      timestamp: new Date().toISOString(),
      values: {}
    };

    // 为每个端点生成模拟数据
    for (const [endpointName, endpoint] of Object.entries(config.parameters.endpointMap)) {
      // 只为GET方法的端点生成数据
      if (endpoint.method === 'GET') {
        // 根据不同的端点生成不同类型的数据
        if (endpointName.includes('temperature')) {
          simulatedData.values[endpointName] = Math.round((20 + Math.random() * 15) * 10) / 10;
        } else if (endpointName.includes('humidity')) {
          simulatedData.values[endpointName] = Math.round((30 + Math.random() * 50) * 10) / 10;
        } else if (endpointName.includes('pressure')) {
          simulatedData.values[endpointName] = Math.round((980 + Math.random() * 40) * 10) / 10;
        } else if (endpointName.includes('status')) {
          simulatedData.values[endpointName] = Math.random() > 0.2 ? 'online' : 'busy';
        } else if (endpointName.includes('power')) {
          simulatedData.values[endpointName] = Math.round(Math.random() * 100);
        } else {
          // 默认生成随机数值
          simulatedData.values[endpointName] = Math.round(Math.random() * 100);
        }
      }
    }

    return simulatedData;
  }

  /**
   * 初始化连接状态
   * @param deviceId 设备ID
   */
  private initializeConnectionState(deviceId: string): void {
    // 设置初始连接状态
    this.connectionStates.set(deviceId, {
      deviceId,
      isConnected: false,
      connectionAttempts: 0,
      lastConnectionAttempt: new Date().toISOString(),
      errors: [],
      statistics: {
        dataSent: 0,
        dataReceived: 0,
        commandsSent: 0,
        responsesReceived: 0
      }
    });
  }

  /**
   * 更新连接状态
   * @param deviceId 设备ID
   * @param updates 状态更新对象
   */
  private updateConnectionState(deviceId: string, updates: Partial<DeviceConnectionState>): void {
    // 获取当前状态
    const currentState = this.getConnectionState(deviceId);

    // 合并更新
    const newState = {
      ...currentState,
      ...updates
    };

    // 存储新状态
    this.connectionStates.set(deviceId, newState);
  }

  /**
   * 更新统计信息
   * @param deviceId 设备ID
   * @param sentBytes 发送的字节数
   * @param receivedBytes 接收的字节数
   * @param commandsSent 发送的命令数
   * @param responsesReceived 接收的响应数
   */
  private updateStatistics(
    deviceId: string,
    sentBytes: number,
    receivedBytes: number,
    commandsSent: number,
    responsesReceived: number
  ): void {
    // 获取当前状态
    const currentState = this.getConnectionState(deviceId);

    // 更新统计信息
    const newStatistics = {
      dataSent: currentState.statistics.dataSent + sentBytes,
      dataReceived: currentState.statistics.dataReceived + receivedBytes,
      commandsSent: currentState.statistics.commandsSent + commandsSent,
      responsesReceived: currentState.statistics.responsesReceived + responsesReceived
    };

    // 更新状态
    this.updateConnectionState(deviceId, {
      statistics: newStatistics
    });
  }

  /**
   * 记录错误
   * @param deviceId 设备ID
   * @param errorMessage 错误消息
   */
  private recordError(deviceId: string, errorMessage: string): void {
    // 获取当前状态
    const currentState = this.getConnectionState(deviceId);

    // 添加错误记录
    const errors = [
      ...currentState.errors,
      {
        timestamp: new Date().toISOString(),
        message: errorMessage
      }
    ];

    // 最多保存10条错误记录
    if (errors.length > 10) {
      errors.shift();
    }

    // 更新状态
    this.updateConnectionState(deviceId, { errors });
  }

  /**
   * 发送连接事件
   * @param deviceId 设备ID
   */
  private emitConnectedEvent(deviceId: string): void {
    const event: DeviceConnectionEvent = {
      deviceId,
      connectionType: 'http-rest',
      eventType: DeviceConnectionEventType.CONNECTED,
      timestamp: new Date().toISOString()
    };

    this.eventEmitter.emit(DeviceConnectionEventType.CONNECTED, event);
  }

  /**
   * 发送断开连接事件
   * @param deviceId 设备ID
   */
  private emitDisconnectedEvent(deviceId: string): void {
    const event: DeviceConnectionEvent = {
      deviceId,
      connectionType: 'http-rest',
      eventType: DeviceConnectionEventType.DISCONNECTED,
      timestamp: new Date().toISOString()
    };

    this.eventEmitter.emit(DeviceConnectionEventType.DISCONNECTED, event);
  }

  /**
   * 发送错误事件
   * @param deviceId 设备ID
   * @param error 错误对象
   * @param command 相关命令(可选)
   */
  private emitErrorEvent(deviceId: string, error: Error, command?: DeviceCommand): void {
    const event: DeviceConnectionEvent = {
      deviceId,
      connectionType: 'http-rest',
      eventType: DeviceConnectionEventType.ERROR,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack
      },
      command
    };

    this.eventEmitter.emit(DeviceConnectionEventType.ERROR, event);
  }

  /**
   * 发送数据接收事件
   * @param deviceId 设备ID
   * @param data 接收的数据
   */
  private emitDataReceivedEvent(deviceId: string, data: any): void {
    const event: DeviceConnectionEvent = {
      deviceId,
      connectionType: 'http-rest',
      eventType: DeviceConnectionEventType.DATA_RECEIVED,
      timestamp: new Date().toISOString(),
      data
    };

    this.eventEmitter.emit(DeviceConnectionEventType.DATA_RECEIVED, event);
  }

  /**
   * 发送命令完成事件
   * @param deviceId 设备ID
   * @param command 执行的命令
   * @param result 命令结果
   */
  private emitCommandCompletedEvent(deviceId: string, command: DeviceCommand, result: any): void {
    const event: DeviceConnectionEvent = {
      deviceId,
      connectionType: 'http-rest',
      eventType: DeviceConnectionEventType.COMMAND_COMPLETED,
      timestamp: new Date().toISOString(),
      command,
      data: result
    };

    this.eventEmitter.emit(DeviceConnectionEventType.COMMAND_COMPLETED, event);
  }
}
