/**
 * 设备协议适配器基类
 * 提供所有设备协议适配器的基础功能和结构
 */

import { EventEmitter } from 'events';
import {
  DeviceProtocolAdapter,
  DeviceConnectionConfig,
  DeviceConnectionState,
  DeviceConnectionEventType,
  DeviceConnectionEvent
} from './types.js';
import { DeviceCommand } from '../../models/device.model.js';

// 协议适配器基类
export abstract class BaseProtocolAdapter implements DeviceProtocolAdapter {
  // 基本信息
  public readonly id: string;
  public readonly name: string;
  public readonly protocolName: string;
  public readonly supportedConnectionTypes: string[];

  // 事件发射器
  protected eventEmitter: EventEmitter;

  // 连接状态映射
  protected connectionStates: Map<string, DeviceConnectionState>;

  // 构造函数
  constructor(id: string, name: string, protocolName: string, supportedConnectionTypes: string[]) {
    this.id = id;
    this.name = name;
    this.protocolName = protocolName;
    this.supportedConnectionTypes = supportedConnectionTypes;

    this.eventEmitter = new EventEmitter();
    this.connectionStates = new Map();

    // 设置最大监听器数量，避免内存泄漏警告
    this.eventEmitter.setMaxListeners(100);
  }

  // 初始化适配器
  public async initialize(): Promise<void> {
    // 基类提供空实现，具体适配器需要覆盖此方法
    console.log(`Initializing ${this.name} adapter`);
  }

  // 连接管理 - 由子类实现具体逻辑
  public abstract connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean>;
  public abstract disconnect(deviceId: string): Promise<boolean>;
  public abstract sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
  public abstract readData(deviceId: string, parameters?: any): Promise<any>;

  // 获取连接状态
  public getConnectionState(deviceId: string): DeviceConnectionState {
    // 如果没有记录，返回默认状态
    if (!this.connectionStates.has(deviceId)) {
      return this.createDefaultConnectionState();
    }

    return this.connectionStates.get(deviceId);
  }

  // 事件处理
  public on(event: DeviceConnectionEventType, callback: (event: DeviceConnectionEvent) => void): void {
    this.eventEmitter.on(event, callback);
  }

  public off(event: DeviceConnectionEventType, callback: (event: DeviceConnectionEvent) => void): void {
    this.eventEmitter.off(event, callback);
  }

  // 功能支持检查
  public supportsFeature(featureName: string): boolean {
    // 基类提供默认实现，子类可以覆盖
    return false;
  }

  // 获取协议特定方法
  public getProtocolSpecificMethod(methodName: string): Function | null {
    // 基类提供默认实现，子类可以覆盖
    return null;
  }

  // 受保护的辅助方法

  // 创建默认连接状态
  protected createDefaultConnectionState(): DeviceConnectionState {
    return {
      isConnected: false,
      connectionAttempts: 0,
      errors: [],
      statistics: {
        dataSent: 0,
        dataReceived: 0,
        commandsSent: 0,
        responsesReceived: 0
      }
    };
  }

  // 初始化设备连接状态
  protected initializeConnectionState(deviceId: string): void {
    this.connectionStates.set(deviceId, this.createDefaultConnectionState());
  }

  // 更新设备连接状态
  protected updateConnectionState(deviceId: string, updates: Partial<DeviceConnectionState>): void {
    const currentState = this.getConnectionState(deviceId);
    const updatedState = { ...currentState, ...updates };
    this.connectionStates.set(deviceId, updatedState);
  }

  // 记录连接状态统计
  protected recordStatistics(deviceId: string, updates: Partial<DeviceConnectionState['statistics']>): void {
    const currentState = this.getConnectionState(deviceId);
    const updatedStatistics = {
      ...currentState.statistics,
      ...updates
    };

    this.updateConnectionState(deviceId, { statistics: updatedStatistics });
  }

  // 记录错误
  protected recordError(deviceId: string, errorMessage: string): void {
    const currentState = this.getConnectionState(deviceId);
    const errors = [
      ...currentState.errors,
      { message: errorMessage, timestamp: new Date().toISOString() }
    ];

    // 保持错误记录数量在合理范围内
    if (errors.length > 10) {
      errors.shift(); // 移除最旧的错误
    }

    this.updateConnectionState(deviceId, { errors });
  }

  // 发射连接事件
  protected emitConnectedEvent(deviceId: string): void {
    const event: DeviceConnectionEvent = {
      type: DeviceConnectionEventType.CONNECTED,
      deviceId,
      timestamp: new Date().toISOString()
    };

    this.eventEmitter.emit(DeviceConnectionEventType.CONNECTED, event);
  }

  // 发射断开连接事件
  protected emitDisconnectedEvent(deviceId: string): void {
    const event: DeviceConnectionEvent = {
      type: DeviceConnectionEventType.DISCONNECTED,
      deviceId,
      timestamp: new Date().toISOString()
    };

    this.eventEmitter.emit(DeviceConnectionEventType.DISCONNECTED, event);
  }

  // 发射错误事件
  protected emitErrorEvent(deviceId: string, error: Error): void {
    const event: DeviceConnectionEvent = {
      type: DeviceConnectionEventType.ERROR,
      deviceId,
      timestamp: new Date().toISOString(),
      error
    };

    this.eventEmitter.emit(DeviceConnectionEventType.ERROR, event);
  }

  // 发射数据接收事件
  protected emitDataReceivedEvent(deviceId: string, data: any): void {
    const event: DeviceConnectionEvent = {
      type: DeviceConnectionEventType.DATA_RECEIVED,
      deviceId,
      timestamp: new Date().toISOString(),
      data
    };

    this.eventEmitter.emit(DeviceConnectionEventType.DATA_RECEIVED, event);
  }

  // 发射状态变更事件
  protected emitStateChangedEvent(deviceId: string, state: any): void {
    const event: DeviceConnectionEvent = {
      type: DeviceConnectionEventType.STATE_CHANGED,
      deviceId,
      timestamp: new Date().toISOString(),
      data: state
    };

    this.eventEmitter.emit(DeviceConnectionEventType.STATE_CHANGED, event);
  }

  // 发射命令发送事件
  protected emitCommandSentEvent(deviceId: string, command: DeviceCommand): void {
    const event: DeviceConnectionEvent = {
      type: DeviceConnectionEventType.COMMAND_SENT,
      deviceId,
      timestamp: new Date().toISOString(),
      data: command
    };

    this.eventEmitter.emit(DeviceConnectionEventType.COMMAND_SENT, event);
  }

  // 发射命令结果事件
  protected emitCommandResultEvent(deviceId: string, command: DeviceCommand, result: any): void {
    const event: DeviceConnectionEvent = {
      type: DeviceConnectionEventType.COMMAND_RESULT,
      deviceId,
      timestamp: new Date().toISOString(),
      data: { command, result }
    };

    this.eventEmitter.emit(DeviceConnectionEventType.COMMAND_RESULT, event);
  }
}
