/**
 * MQTT设备协议适配器
 * 负责MQTT设备的通信和控制
 */

import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionConfig, DeviceConnectionState } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';

// MQTT设备连接配置接口扩展
export interface MQTTDeviceConnectionConfig extends DeviceConnectionConfig {
  brokerUrl: string;            // MQTT代理服务器URL (如 mqtt://broker.example.com:1883)
  clientId: string;             // MQTT客户端ID
  username?: string;            // 认证用户名
  password?: string;            // 认证密码
  baseTopic: string;            // 基础主题，例如 "devices/lab1/"
  commandTopic?: string;        // 命令主题格式，如 "{deviceId}/commands"
  dataTopic?: string;           // 数据主题格式，如 "{deviceId}/data"
  statusTopic?: string;         // 状态主题格式，如 "{deviceId}/status"
  qos?: 0 | 1 | 2;              // 服务质量级别 (0, 1, 或 2)
  connectTimeout?: number;      // 连接超时 (毫秒)
  reconnectPeriod?: number;     // 重连周期 (毫秒)
  keepalive?: number;           // 保活周期 (秒)
  clean?: boolean;              // 清除会话
  will?: {                      // 遗嘱消息
    topic: string;
    payload: string;
    qos?: 0 | 1 | 2;
    retain?: boolean;
  };
}

// MQTT客户端接口 (简化版，实际实现会使用mqtt.js等库)
interface MQTTClient {
  deviceId: string;
  brokerUrl: string;
  clientId: string;
  isConnected: boolean;
  subscribedTopics: Record<string, boolean>;

  publish(topic: string, message: Buffer | string, options?: any): Promise<void>;
  subscribe(topic: string, options?: any): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
  end(force?: boolean): Promise<void>;
}

// MQTT设备适配器
export class MQTTDeviceAdapter extends BaseProtocolAdapter {
  // MQTT客户端映射: deviceId -> MQTT客户端实例
  private mqttClients: Map<string, MQTTClient> = new Map();
  // 设备配置映射: deviceId -> MQTT设备配置
  private deviceConfigs: Map<string, MQTTDeviceConnectionConfig> = new Map();
  // 模拟数据间隔
  private dataIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super(
      'mqtt-adapter',
      'MQTT设备适配器',
      'MQTT',
      ['mqtt', 'network']
    );
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    console.log('初始化MQTT设备适配器');

    // 在这里我们可以进行任何必要的MQTT子系统初始化
    // 例如，加载必要的库、设置全局选项等

    // 实际项目中，这里可能会使用像mqtt.js这样的库
    // 由于这里是一个模拟实现，我们只是简单地记录日志
  }

  // 连接到MQTT设备
  public async connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean> {
    try {
      // 类型安全检查
      if (config.connectionType !== 'mqtt' && config.connectionType !== 'network') {
        throw new Error(`不支持的连接类型: ${config.connectionType}`);
      }

      // 确保参数存在并获取参数
      if (!config.parameters) {
        throw new Error('MQTT连接配置缺少parameters对象');
      }

      // 从parameters对象中获取参数
      const params = config.parameters;
      const mqttConfig = {
        ...config,
        brokerUrl: params.brokerUrl,
        clientId: params.clientId,
        username: params.username,
        password: params.password,
        baseTopic: params.baseTopic,
        commandTopic: params.commandTopic,
        dataTopic: params.dataTopic,
        statusTopic: params.statusTopic,
        qos: params.qos,
        connectTimeout: params.connectTimeout,
        reconnectPeriod: params.reconnectPeriod,
        keepalive: params.keepalive,
        clean: params.clean,
        will: params.will
      } as MQTTDeviceConnectionConfig;

      // 检查必要的参数
      if (!mqttConfig.brokerUrl || !mqttConfig.clientId || !mqttConfig.baseTopic) {
        throw new Error('MQTT连接配置缺少必要参数');
      }

      // 初始化连接状态
      this.initializeConnectionState(deviceId);

      // 存储设备配置
      this.deviceConfigs.set(deviceId, mqttConfig);

      // 模拟连接过程
      console.log(`正在连接MQTT设备: ${deviceId}，代理服务器: ${mqttConfig.brokerUrl}`);

      // 在实际实现中，我们会使用适当的MQTT库进行连接
      // 这里我们模拟连接过程
      const client = {
        deviceId,
        brokerUrl: mqttConfig.brokerUrl,
        clientId: mqttConfig.clientId,
        isConnected: true,
        subscribedTopics: {},

        // 模拟方法
        publish: (topic: string, message: Buffer | string, options?: any) => {
          console.log(`MQTT设备 ${deviceId} 发布消息到主题 ${topic}: ${message}`);
          return Promise.resolve();
        },

        subscribe: (topic: string, options?: any) => {
          console.log(`MQTT设备 ${deviceId} 订阅主题: ${topic}`);
          client.subscribedTopics[topic] = true;
          return Promise.resolve();
        },

        unsubscribe: (topic: string) => {
          console.log(`MQTT设备 ${deviceId} 取消订阅主题: ${topic}`);
          delete client.subscribedTopics[topic];
          return Promise.resolve();
        },

        end: (force?: boolean) => {
          console.log(`关闭MQTT连接: ${deviceId}`);
          return Promise.resolve();
        }
      };

      // 存储客户端
      this.mqttClients.set(deviceId, client);

      // 更新连接状态
      this.updateConnectionState(deviceId, {
        isConnected: true,
        lastConnected: new Date().toISOString(),
        connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
      });

      // 订阅必要的主题
      await this.subscribeToDeviceTopics(deviceId);

      // 发射连接事件
      this.emitConnectedEvent(deviceId);

      // 模拟设备发送数据
      this.startDeviceDataSimulation(deviceId);

      return true;
    } catch (error) {
      // 记录错误
      console.error(`MQTT设备连接错误: ${error.message}`);
      this.recordError(deviceId, error.message);

      // 更新连接状态
      this.updateConnectionState(deviceId, {
        isConnected: false,
        connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
      });

      // 发射错误事件
      this.emitErrorEvent(deviceId, error);

      return false;
    }
  }

  // 断开MQTT设备连接
  public async disconnect(deviceId: string): Promise<boolean> {
    try {
      // 检查设备是否已连接
      const client = this.mqttClients.get(deviceId);
      if (!client) {
        // 设备未连接，直接返回成功
        return true;
      }

      // 停止数据模拟
      this.stopDeviceDataSimulation(deviceId);

      // 发送离线状态
      const config = this.deviceConfigs.get(deviceId);
      if (config && config.statusTopic) {
        const statusTopic = config.statusTopic.replace('{deviceId}', deviceId);
        await client.publish(statusTopic, JSON.stringify({ status: 'offline', timestamp: new Date().toISOString() }));
      }

      // 关闭连接
      await client.end();

      // 删除客户端
      this.mqttClients.delete(deviceId);

      // 更新连接状态
      this.updateConnectionState(deviceId, {
        isConnected: false,
        lastDisconnected: new Date().toISOString()
      });

      // 发射断开连接事件
      this.emitDisconnectedEvent(deviceId);

      return true;
    } catch (error) {
      // 记录错误
      console.error(`MQTT设备断开连接错误: ${error.message}`);
      this.recordError(deviceId, error.message);

      // 强制更新连接状态为断开
      this.updateConnectionState(deviceId, { isConnected: false });

      // 清理连接资源
      this.mqttClients.delete(deviceId);

      // 发射错误事件
      this.emitErrorEvent(deviceId, error);

      // 尽管有错误，我们仍然返回true，因为设备已经被标记为断开连接
      return true;
    }
  }

  // 向MQTT设备发送命令
  public async sendCommand(deviceId: string, command: DeviceCommand): Promise<any> {
    try {
      // 检查设备是否已连接
      const client = this.mqttClients.get(deviceId);
      if (!client || !client.isConnected) {
        throw new Error(`设备 ${deviceId} 未连接`);
      }

      // 获取设备配置
      const config = this.deviceConfigs.get(deviceId);
      if (!config) {
        throw new Error(`未找到设备 ${deviceId} 的配置`);
      }

      // 确定命令主题
      const commandTopic = config.commandTopic
        ? config.commandTopic.replace('{deviceId}', deviceId)
        : `${config.baseTopic}${deviceId}/commands`;

      // 准备命令消息
      const commandMessage = JSON.stringify({
        id: command.id,
        command: command.command,
        parameters: command.parameters,
        timestamp: new Date().toISOString()
      });

      // 发布命令
      await client.publish(commandTopic, commandMessage);

      // 记录统计信息
      this.recordStatistics(deviceId, {
        dataSent: this.getConnectionState(deviceId).statistics.dataSent + commandMessage.length,
        commandsSent: this.getConnectionState(deviceId).statistics.commandsSent + 1
      });

      // 发射命令发送事件
      this.emitCommandSentEvent(deviceId, command);

      // 模拟设备响应
      setTimeout(() => {
        // 确定响应主题
        const responseTopic = `${config.baseTopic}${deviceId}/responses`;

        // 准备响应消息
        const result = {
          commandId: command.id,
          status: 'success',
          timestamp: new Date().toISOString(),
          data: `命令 ${command.command} 已成功执行`
        };

        const responseMessage = JSON.stringify(result);

        // 模拟设备发布响应
        console.log(`MQTT设备 ${deviceId} 发布响应到主题 ${responseTopic}: ${responseMessage}`);

        // 更新统计信息
        this.recordStatistics(deviceId, {
          dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + responseMessage.length,
          responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
        });

        // 发射命令结果事件
        this.emitCommandResultEvent(deviceId, command, result);
      }, 500); // 500毫秒后响应

      // 返回初步结果
      return {
        status: 'sent',
        commandId: command.id,
        timestamp: new Date().toISOString(),
        message: '命令已发送，等待设备响应'
      };
    } catch (error) {
      // 记录错误
      console.error(`MQTT设备命令错误: ${error.message}`);
      this.recordError(deviceId, error.message);

      // 发射错误事件
      this.emitErrorEvent(deviceId, error);

      throw error;
    }
  }

  // 从MQTT设备读取数据
  public async readData(deviceId: string, parameters?: any): Promise<any> {
    try {
      // 检查设备是否已连接
      const client = this.mqttClients.get(deviceId);
      if (!client || !client.isConnected) {
        throw new Error(`设备 ${deviceId} 未连接`);
      }

      // 获取设备配置
      const config = this.deviceConfigs.get(deviceId);
      if (!config) {
        throw new Error(`未找到设备 ${deviceId} 的配置`);
      }

      // 确定请求主题
      const requestTopic = `${config.baseTopic}${deviceId}/data/request`;

      // 准备请求消息
      const requestMessage = JSON.stringify({
        requestId: `req-${Date.now()}`,
        timestamp: new Date().toISOString(),
        parameters: parameters || {}
      });

      // 发布请求
      await client.publish(requestTopic, requestMessage);

      // 记录统计信息
      this.recordStatistics(deviceId, {
        dataSent: this.getConnectionState(deviceId).statistics.dataSent + requestMessage.length
      });

      // 模拟设备响应
      // 在实际实现中，我们会等待设备在数据主题上发布数据
      // 这里我们直接生成模拟数据

      // 生成模拟数据点
      const timestamp = new Date().toISOString();
      const dataPoints = [
        {
          id: `dp-${Date.now()}`,
          deviceId,
          timestamp,
          sensorType: 'temperature',
          value: 22 + Math.random() * 8,
          unit: '°C',
          quality: 95 + Math.floor(Math.random() * 6)
        },
        {
          id: `dp-${Date.now() + 1}`,
          deviceId,
          timestamp,
          sensorType: 'humidity',
          value: 45 + Math.random() * 15,
          unit: '%',
          quality: 90 + Math.floor(Math.random() * 11)
        },
        {
          id: `dp-${Date.now() + 2}`,
          deviceId,
          timestamp,
          sensorType: 'co2',
          value: 400 + Math.random() * 200,
          unit: 'ppm',
          quality: 92 + Math.floor(Math.random() * 9)
        }
      ];

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 200));

      // 更新统计信息
      const responseSize = JSON.stringify(dataPoints).length;
      this.recordStatistics(deviceId, {
        dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + responseSize,
        responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
      });

      return dataPoints;
    } catch (error) {
      // 记录错误
      console.error(`MQTT设备读取错误: ${error.message}`);
      this.recordError(deviceId, error.message);

      // 发射错误事件
      this.emitErrorEvent(deviceId, error);

      throw error;
    }
  }

  // 检查特性支持
  public supportsFeature(featureName: string): boolean {
    // MQTT设备适配器支持的特定功能
    const supportedFeatures = [
      'pub-sub',           // 发布-订阅模式
      'qos',               // 服务质量级别
      'retained-messages', // 保留消息
      'last-will',         // 遗嘱消息
      'persistent-session', // 持久会话
      'message-filtering'  // 消息过滤
    ];

    return supportedFeatures.includes(featureName);
  }

  // 获取协议特定方法
  public getProtocolSpecificMethod(methodName: string): Function | null {
    // 提供MQTT特定的方法
    const methods: Record<string, Function> = {
      // 发布消息到任意主题
      publishMessage: (deviceId: string, topic: string, message: string | Buffer, options?: any) => {
        const client = this.mqttClients.get(deviceId);
        if (!client || !client.isConnected) {
          throw new Error(`设备 ${deviceId} 未连接`);
        }

        return client.publish(topic, message, options);
      },

      // 订阅任意主题
      subscribeTopic: (deviceId: string, topic: string, options?: any) => {
        const client = this.mqttClients.get(deviceId);
        if (!client || !client.isConnected) {
          throw new Error(`设备 ${deviceId} 未连接`);
        }

        return client.subscribe(topic, options);
      },

      // 取消订阅任意主题
      unsubscribeTopic: (deviceId: string, topic: string) => {
        const client = this.mqttClients.get(deviceId);
        if (!client || !client.isConnected) {
          throw new Error(`设备 ${deviceId} 未连接`);
        }

        return client.unsubscribe(topic);
      },

      // 更新遗嘱消息
      updateWill: (deviceId: string, topic: string, message: string | Buffer, options?: any) => {
        console.log(`更新MQTT设备 ${deviceId} 的遗嘱消息`);
        return Promise.resolve(true);
      }
    };

    return methods[methodName] || null;
  }

  // 私有辅助方法

  // 订阅设备相关主题
  private async subscribeToDeviceTopics(deviceId: string): Promise<void> {
    const client = this.mqttClients.get(deviceId);
    const config = this.deviceConfigs.get(deviceId);

    if (!client || !config) {
      return;
    }

    // 数据主题
    const dataTopic = config.dataTopic
      ? config.dataTopic.replace('{deviceId}', deviceId)
      : `${config.baseTopic}${deviceId}/data`;

    // 状态主题
    const statusTopic = config.statusTopic
      ? config.statusTopic.replace('{deviceId}', deviceId)
      : `${config.baseTopic}${deviceId}/status`;

    // 响应主题
    const responseTopic = `${config.baseTopic}${deviceId}/responses`;

    // 错误主题
    const errorTopic = `${config.baseTopic}${deviceId}/errors`;

    // 订阅主题
    await client.subscribe(dataTopic);
    await client.subscribe(statusTopic);
    await client.subscribe(responseTopic);
    await client.subscribe(errorTopic);

    console.log(`MQTT设备 ${deviceId} 已订阅必要主题`);

    // 发布上线状态
    await client.publish(statusTopic, JSON.stringify({
      status: 'online',
      timestamp: new Date().toISOString(),
      deviceId
    }));
  }

  // 模拟设备数据发送
  private startDeviceDataSimulation(deviceId: string): void {
    // 停止任何现有的模拟
    this.stopDeviceDataSimulation(deviceId);

    // 获取设备配置
    const config = this.deviceConfigs.get(deviceId);
    if (!config) {
      return;
    }

    // 获取客户端
    const client = this.mqttClients.get(deviceId);
    if (!client) {
      return;
    }

    // 确定数据主题
    const dataTopic = config.dataTopic
      ? config.dataTopic.replace('{deviceId}', deviceId)
      : `${config.baseTopic}${deviceId}/data`;

    // 创建新的数据模拟间隔
    const interval = setInterval(async () => {
      // 生成随机数据
      const data = {
        deviceId,
        timestamp: new Date().toISOString(),
        measurements: {
          temperature: 22 + Math.random() * 8,
          humidity: 45 + Math.random() * 15,
          pressure: 1010 + Math.random() * 20,
          light: 300 + Math.random() * 700,
          noise: 40 + Math.random() * 30
        },
        status: {
          battery: 80 + Math.random() * 20,
          signal: 70 + Math.random() * 30,
          errors: []
        }
      };

      // 发布数据
      const message = JSON.stringify(data);
      await client.publish(dataTopic, message);

      // 发射数据接收事件
      this.emitDataReceivedEvent(deviceId, data);

      // 更新统计信息
      const dataSize = message.length;
      this.recordStatistics(deviceId, {
        dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + dataSize,
        responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
      });

    }, 10000); // 每10秒发送一次数据

    // 存储间隔引用
    this.dataIntervals.set(deviceId, interval);
  }

  // 停止设备数据模拟
  private stopDeviceDataSimulation(deviceId: string): void {
    if (this.dataIntervals.has(deviceId)) {
      clearInterval(this.dataIntervals.get(deviceId));
      this.dataIntervals.delete(deviceId);
    }
  }
}
