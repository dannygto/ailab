/**
 * TCP/Socket设备自动发现模块
 *
 * 实现了基于网络广播和设备特征匹配的自动发现功能
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import { EventEmitter } from 'events';
import * as dgram from 'dgram';
import * as os from 'os';
import * as net from 'net';
import { TCPSocketConnectionOptions } from './tcp-socket-adapter';

/**
 * 设备发现事件
 */
export enum DeviceDiscoveryEvents {
  /** 发现新设备 */
  DEVICE_FOUND = 'deviceFound',

  /** 设备丢失 */
  DEVICE_LOST = 'deviceLost',

  /** 发现过程开始 */
  DISCOVERY_STARTED = 'discoveryStarted',

  /** 发现过程停止 */
  DISCOVERY_STOPPED = 'discoveryStopped',

  /** 发现过程出错 */
  DISCOVERY_ERROR = 'discoveryError'
}

/**
 * 设备类型
 */
export enum DeviceType {
  /** 电子测量设备 */
  ELECTRONIC_MEASUREMENT = 'electronic_measurement',

  /** 光学设备 */
  OPTICAL = 'optical',

  /** 机械设备 */
  MECHANICAL = 'mechanical',

  /** 化学分析设备 */
  CHEMICAL_ANALYSIS = 'chemical_analysis',

  /** 热力学设备 */
  THERMODYNAMIC = 'thermodynamic',

  /** 未知类型 */
  UNKNOWN = 'unknown'
}

/**
 * 设备特征描述
 */
export interface DeviceSignature {
  /** 匹配模式 (字符串或正则表达式) */
  pattern: string | RegExp;

  /** 设备类型 */
  type: DeviceType;

  /** 制造商 */
  manufacturer?: string;

  /** 模型 */
  model?: string;

  /** 描述 */
  description?: string;
}

/**
 * 发现的设备信息
 */
export interface DiscoveredDevice {
  /** 设备唯一标识符 */
  id: string;

  /** 主机地址 */
  host: string;

  /** 端口号 */
  port: number;

  /** 设备类型 */
  type: DeviceType;

  /** 制造商 */
  manufacturer?: string;

  /** 模型 */
  model?: string;

  /** 描述 */
  description?: string;

  /** 首次发现时间 */
  firstSeen: Date;

  /** 最后一次发现时间 */
  lastSeen: Date;

  /** 是否已认证 */
  authenticated: boolean;

  /** 设备附加信息 */
  metadata?: Record<string, any>;
}

/**
 * 发现配置
 */
export interface DiscoveryConfig {
  /** 广播地址 */
  broadcastAddress?: string;

  /** 广播端口 */
  broadcastPort?: number;

  /** 广播间隔(毫秒) */
  broadcastInterval?: number;

  /** 扫描超时(毫秒) */
  scanTimeout?: number;

  /** 扫描端口范围 */
  portRange?: { start: number; end: number };

  /** 设备特征列表 */
  deviceSignatures?: DeviceSignature[];

  /** 是否启用多播发现 */
  enableMulticast?: boolean;

  /** 多播地址 */
  multicastAddress?: string;

  /** 自动重试次数 */
  retryCount?: number;
}

/**
 * 设备发现服务接口
 */
export interface IDeviceDiscoveryService {
  /** 开始设备发现 */
  startDiscovery(config?: DiscoveryConfig): Promise<void>;

  /** 停止设备发现 */
  stopDiscovery(): Promise<void>;

  /** 获取发现的设备列表 */
  getDiscoveredDevices(): DiscoveredDevice[];

  /** 根据类型获取设备列表 */
  getDevicesByType(type: DeviceType): DiscoveredDevice[];

  /** 根据ID获取设备 */
  getDeviceById(id: string): DiscoveredDevice | null;

  /** 添加设备特征 */
  addDeviceSignature(signature: DeviceSignature): void;

  /** 移除设备特征 */
  removeDeviceSignature(pattern: string | RegExp): boolean;

  /** 事件监听器 */
  on(event: DeviceDiscoveryEvents.DEVICE_FOUND, listener: (device: DiscoveredDevice) => void): this;
  on(event: DeviceDiscoveryEvents.DEVICE_LOST, listener: (deviceId: string) => void): this;
  on(event: DeviceDiscoveryEvents.DISCOVERY_STARTED, listener: () => void): this;
  on(event: DeviceDiscoveryEvents.DISCOVERY_STOPPED, listener: () => void): this;
  on(event: DeviceDiscoveryEvents.DISCOVERY_ERROR, listener: (error: Error) => void): this;

  /** 移除事件监听器 */
  off(event: DeviceDiscoveryEvents, listener: Function): this;

  /** 手动添加设备 */
  addManualDevice(host: string, port: number, type?: DeviceType): Promise<DiscoveredDevice>;
}

/**
 * 设备发现服务实现
 */
export class DeviceDiscoveryService extends EventEmitter implements IDeviceDiscoveryService {
  private devices: Map<string, DiscoveredDevice> = new Map();
  private deviceSignatures: DeviceSignature[] = [];
  private broadcastSocket: dgram.Socket | null = null;
  private scanTimer: NodeJS.Timeout | null = null;
  private isDiscovering: boolean = false;
  private config: DiscoveryConfig = {
    broadcastAddress: '255.255.255.255',
    broadcastPort: 8900,
    broadcastInterval: 10000,
    scanTimeout: 5000,
    portRange: { start: 8000, end: 9000 },
    enableMulticast: false,
    multicastAddress: '224.0.0.1',
    retryCount: 3
  };

  /**
   * 构造函数
   * @param initialSignatures 初始设备特征
   */
  constructor(initialSignatures?: DeviceSignature[]) {
    super();
    if (initialSignatures) {
      this.deviceSignatures = [...initialSignatures];
    }
  }

  /**
   * 开始设备发现
   * @param config 发现配置
   */
  async startDiscovery(config?: DiscoveryConfig): Promise<void> {
    if (this.isDiscovering) {
      return;
    }

    // 合并配置
    this.config = { ...this.config, ...config };

    try {
      this.isDiscovering = true;

      // 初始化广播套接字
      this.broadcastSocket = dgram.createSocket('udp4');

      // 处理接收到的消息
      this.broadcastSocket.on('message', (msg, rinfo) => {
        this.handleDiscoveryResponse(msg, rinfo);
      });

      // 处理错误
      this.broadcastSocket.on('error', (err) => {
        this.emit(DeviceDiscoveryEvents.DISCOVERY_ERROR, err);
      });

      // 绑定端口
      await new Promise<void>((resolve, reject) => {
        if (!this.broadcastSocket) {
          reject(new Error('Broadcast socket not initialized'));
          return;
        }

        this.broadcastSocket.bind(this.config.broadcastPort, () => {
          if (!this.broadcastSocket) {
            reject(new Error('Broadcast socket not initialized'));
            return;
          }

          // 启用广播
          this.broadcastSocket.setBroadcast(true);

          // 如果启用多播，则加入多播组
          if (this.config.enableMulticast && this.config.multicastAddress) {
            try {
              const interfaces = os.networkInterfaces();
              for (const [name, infos] of Object.entries(interfaces)) {
                if (infos) {
                  for (const info of infos) {
                    if (info.family === 'IPv4' && !info.internal) {
                      this.broadcastSocket.addMembership(
                        this.config.multicastAddress,
                        info.address
                      );
                    }
                  }
                }
              }
            } catch (err) {
              console.warn('Failed to join multicast group:', err);
            }
          }

          resolve();
        });
      });

      // 发送第一次广播
      this.sendDiscoveryBroadcast();

      // 设置定时发送广播
      this.scanTimer = setInterval(() => {
        this.sendDiscoveryBroadcast();
        this.checkDeviceTimeouts();
      }, this.config.broadcastInterval);

      this.emit(DeviceDiscoveryEvents.DISCOVERY_STARTED);
    } catch (err) {
      this.isDiscovering = false;
      this.emit(DeviceDiscoveryEvents.DISCOVERY_ERROR, err);
      throw err;
    }
  }

  /**
   * 停止设备发现
   */
  async stopDiscovery(): Promise<void> {
    if (!this.isDiscovering) {
      return;
    }

    // 清除定时器
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }

    // 关闭广播套接字
    if (this.broadcastSocket) {
      await new Promise<void>((resolve) => {
        if (this.broadcastSocket) {
          this.broadcastSocket.close(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
      this.broadcastSocket = null;
    }

    this.isDiscovering = false;
    this.emit(DeviceDiscoveryEvents.DISCOVERY_STOPPED);
  }

  /**
   * 获取发现的设备列表
   */
  getDiscoveredDevices(): DiscoveredDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * 根据类型获取设备列表
   * @param type 设备类型
   */
  getDevicesByType(type: DeviceType): DiscoveredDevice[] {
    return this.getDiscoveredDevices().filter(device => device.type === type);
  }

  /**
   * 根据ID获取设备
   * @param id 设备ID
   */
  getDeviceById(id: string): DiscoveredDevice | null {
    return this.devices.get(id) || null;
  }

  /**
   * 添加设备特征
   * @param signature 设备特征
   */
  addDeviceSignature(signature: DeviceSignature): void {
    this.deviceSignatures.push(signature);
  }

  /**
   * 移除设备特征
   * @param pattern 特征模式
   */
  removeDeviceSignature(pattern: string | RegExp): boolean {
    const initialLength = this.deviceSignatures.length;
    this.deviceSignatures = this.deviceSignatures.filter(sig => {
      if (typeof sig.pattern === 'string' && typeof pattern === 'string') {
        return sig.pattern !== pattern;
      }
      if (sig.pattern instanceof RegExp && pattern instanceof RegExp) {
        return sig.pattern.toString() !== pattern.toString();
      }
      return true;
    });
    return this.deviceSignatures.length < initialLength;
  }

  /**
   * 手动添加设备
   * @param host 主机地址
   * @param port 端口号
   * @param type 设备类型
   */
  async addManualDevice(
    host: string,
    port: number,
    type: DeviceType = DeviceType.UNKNOWN
  ): Promise<DiscoveredDevice> {
    // 尝试连接到设备以验证其可用性
    await this.testConnection(host, port);

    // 生成设备ID
    const id = this.generateDeviceId(host, port);

    // 创建设备信息
    const now = new Date();
    const device: DiscoveredDevice = {
      id,
      host,
      port,
      type,
      firstSeen: now,
      lastSeen: now,
      authenticated: false
    };

    // 添加或更新设备
    this.devices.set(id, device);

    // 发出设备发现事件
    this.emit(DeviceDiscoveryEvents.DEVICE_FOUND, device);

    return device;
  }

  /**
   * 发送发现广播
   * @private
   */
  private sendDiscoveryBroadcast(): void {
    if (!this.broadcastSocket || !this.isDiscovering) {
      return;
    }

    // 创建发现消息
    const discoveryMessage = Buffer.from(JSON.stringify({
      type: 'discovery',
      timestamp: Date.now(),
      service: 'tcp-socket-device-discovery'
    }));

    // 发送广播
    this.broadcastSocket.send(
      discoveryMessage,
      0,
      discoveryMessage.length,
      this.config.broadcastPort,
      this.config.broadcastAddress
    );

    // 如果启用多播，也发送多播
    if (this.config.enableMulticast && this.config.multicastAddress) {
      this.broadcastSocket.send(
        discoveryMessage,
        0,
        discoveryMessage.length,
        this.config.broadcastPort,
        this.config.multicastAddress
      );
    }

    // 主动扫描指定端口范围
    if (this.config.portRange) {
      this.scanPortRange();
    }
  }

  /**
   * 扫描端口范围
   * @private
   */
  private async scanPortRange(): Promise<void> {
    if (!this.config.portRange) {
      return;
    }

    const { start, end } = this.config.portRange;
    const interfaces = os.networkInterfaces();

    // 获取本机所有非内部IPv4地址
    const localAddresses: string[] = [];
    for (const [name, infos] of Object.entries(interfaces)) {
      if (infos) {
        for (const info of infos) {
          if (info.family === 'IPv4' && !info.internal) {
            localAddresses.push(info.address);
          }
        }
      }
    }

    // 获取本地网络的所有可能IP地址
    const networkAddresses: string[] = [];
    for (const addr of localAddresses) {
      const parts = addr.split('.');
      if (parts.length === 4) {
        const prefix = parts.slice(0, 3).join('.');
        for (let i = 1; i < 255; i++) {
          networkAddresses.push(`${prefix}.${i}`);
        }
      }
    }

    // 为每个地址的每个端口创建连接测试任务
    const tasks: Promise<void>[] = [];
    for (const addr of networkAddresses) {
      // 跳过本机地址
      if (localAddresses.includes(addr)) {
        continue;
      }

      // 选择一些代表性端口进行测试，而不是扫描整个范围
      const portsToScan = [
        start,
        Math.floor(start + (end - start) * 0.25),
        Math.floor(start + (end - start) * 0.5),
        Math.floor(start + (end - start) * 0.75),
        end
      ];

      for (const port of portsToScan) {
        tasks.push(this.testDeviceConnection(addr, port));
      }
    }


    // 并发执行连接测试，但限制并发数
    const concurrencyLimit = 20;
    const chunks: Promise<void>[][] = [];
    for (let i = 0; i < tasks.length; i += concurrencyLimit) {
      chunks.push(tasks.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(task => task.catch(() => {})));
    }
  }

  /**
   * 测试设备连接
   * @param host 主机地址
   * @param port 端口号
   * @private
   */
  private async testDeviceConnection(host: string, port: number): Promise<void> {
    try {
      await this.testConnection(host, port);

      // 生成设备ID
      const id = this.generateDeviceId(host, port);

      // 检查设备是否已存在
      const existingDevice = this.devices.get(id);
      if (existingDevice) {
        // 更新最后发现时间
        existingDevice.lastSeen = new Date();
        return;
      }

      // 创建新设备
      const device: DiscoveredDevice = {
        id,
        host,
        port,
        type: DeviceType.UNKNOWN, // 初始类型为未知
        firstSeen: new Date(),
        lastSeen: new Date(),
        authenticated: false
      };

      // 尝试进一步识别设备类型
      await this.identifyDevice(device);

      // 添加设备并发出事件
      this.devices.set(id, device);
      this.emit(DeviceDiscoveryEvents.DEVICE_FOUND, device);
    } catch (err) {
      // 连接失败，忽略
    }
  }

  /**
   * 测试TCP连接
   * @param host 主机地址
   * @param port 端口号
   * @private
   */
  private testConnection(host: string, port: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      }, this.config.scanTimeout || 5000);

      socket.once('connect', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve();
      });

      socket.once('error', (err) => {
        clearTimeout(timeout);
        socket.destroy();
        reject(err);
      });

      socket.connect(port, host);
    });
  }

  /**
   * 处理发现响应
   * @param msg 响应消息
   * @param rinfo 远程信息
   * @private
   */
  private async handleDiscoveryResponse(msg: Buffer, rinfo: dgram.RemoteInfo): Promise<void> {
    try {
      // 尝试解析JSON响应
      const response = JSON.parse(msg.toString());

      // 检查是否是设备响应
      if (response.type === 'device-response' || response.type === 'discovery-response') {
        // 生成设备ID
        const id = this.generateDeviceId(rinfo.address, rinfo.port);

        // 创建或更新设备信息
        const now = new Date();
        const existingDevice = this.devices.get(id);

        const device: DiscoveredDevice = existingDevice ? {
          ...existingDevice,
          lastSeen: now
        } : {
          id,
          host: rinfo.address,
          port: rinfo.port,
          type: DeviceType.UNKNOWN,
          firstSeen: now,
          lastSeen: now,
          authenticated: false
        };

        // 从响应中提取设备信息
        if (response.deviceInfo) {
          const { manufacturer, model, description, type } = response.deviceInfo;

          if (manufacturer) device.manufacturer = manufacturer;
          if (model) device.model = model;
          if (description) device.description = description;
          if (type) device.type = type;

          // 存储其他元数据
          if (!device.metadata) device.metadata = {};
          device.metadata = { ...device.metadata, ...response.deviceInfo };
        }

        // 如果是新设备，尝试进一步识别
        if (!existingDevice) {
          await this.identifyDevice(device);
        }

        // 保存设备并发出事件
        this.devices.set(id, device);

        if (!existingDevice) {
          this.emit(DeviceDiscoveryEvents.DEVICE_FOUND, device);
        }
      }
    } catch (err) {
      console.debug('Failed to process discovery response:', err);
    }
  }

  /**
   * 识别设备类型
   * @param device 设备信息
   * @private
   */
  private async identifyDevice(device: DiscoveredDevice): Promise<void> {
    if (device.type !== DeviceType.UNKNOWN) {
      return;
    }

    try {
      // 尝试连接并获取设备标识信息
      const socket = new net.Socket();

      const deviceInfo = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          socket.destroy();
          reject(new Error('Identification timeout'));
        }, this.config.scanTimeout || 5000);

        let data = '';

        socket.on('data', (chunk) => {
          data += chunk.toString();

          // 一些设备可能在连接后立即发送标识信息
          // 如果接收到足够的数据或超过一定长度，则认为完成
          if (data.includes('\n') || data.length > 100) {
            clearTimeout(timeout);
            socket.destroy();
            resolve(data);
          }
        });

        socket.once('connect', () => {
          // 连接后发送一些通用的识别命令
          // 这些命令在不同的设备上可能有不同的效果
          const identCommands = [
            '*IDN?\n',      // 常见的SCPI识别命令
            'ID\n',         // 一些简单设备的识别命令
            'VERSION\n',    // 版本信息
            'HELLO\n',      // 自定义问候
            '\n'            // 空行可能触发一些设备的响应
          ];

          // 依次发送每个命令
          let cmdIndex = 0;
          const sendNextCommand = () => {
            if (cmdIndex < identCommands.length) {
              socket.write(identCommands[cmdIndex]);
              cmdIndex++;
              setTimeout(sendNextCommand, 500); // 每隔0.5秒发送一个命令
            }
          };

          sendNextCommand();
        });

        socket.once('error', (err) => {
          clearTimeout(timeout);
          socket.destroy();
          reject(err);
        });

        socket.connect(device.port, device.host);
      });

      // 匹配设备特征
      for (const signature of this.deviceSignatures) {
        const { pattern, type, manufacturer, model, description } = signature;

        const isMatch = typeof pattern === 'string'
          ? deviceInfo.includes(pattern)
          : pattern.test(deviceInfo);

        if (isMatch) {
          device.type = type;
          if (manufacturer) device.manufacturer = manufacturer;
          if (model) device.model = model;
          if (description) device.description = description;

          // 添加原始响应到元数据
          if (!device.metadata) device.metadata = {};
          device.metadata.identificationResponse = deviceInfo;

          break;
        }
      }
    } catch (err) {
      console.debug(`Failed to identify device ${device.host}:${device.port}:`, err);
    }
  }

  /**
   * 检查设备超时
   * @private
   */
  private checkDeviceTimeouts(): void {
    const now = new Date();
    const timeout = this.config.broadcastInterval ? this.config.broadcastInterval * 3 : 30000; // 默认30秒超时

    for (const [id, device] of this.devices.entries()) {
      const lastSeen = device.lastSeen.getTime();
      if (now.getTime() - lastSeen > timeout) {
        // 设备超时，移除并发出事件
        this.devices.delete(id);
        this.emit(DeviceDiscoveryEvents.DEVICE_LOST, id);
      }
    }
  }

  /**
   * 生成设备ID
   * @param host 主机地址
   * @param port 端口号
   * @private
   */
  private generateDeviceId(host: string, port: number): string {
    return `${host}:${port}`;
  }
}

// 导出默认设备特征库
export const DEFAULT_DEVICE_SIGNATURES: DeviceSignature[] = [
  {
    pattern: /Tektronix/i,
    type: DeviceType.ELECTRONIC_MEASUREMENT,
    manufacturer: 'Tektronix'
  },
  {
    pattern: /Agilent|Keysight/i,
    type: DeviceType.ELECTRONIC_MEASUREMENT,
    manufacturer: 'Keysight Technologies'
  },
  {
    pattern: /Rigol/i,
    type: DeviceType.ELECTRONIC_MEASUREMENT,
    manufacturer: 'Rigol'
  },
  {
    pattern: /Fluke/i,
    type: DeviceType.ELECTRONIC_MEASUREMENT,
    manufacturer: 'Fluke'
  },
  {
    pattern: /Olympus/i,
    type: DeviceType.OPTICAL,
    manufacturer: 'Olympus'
  },
  {
    pattern: /Nikon/i,
    type: DeviceType.OPTICAL,
    manufacturer: 'Nikon'
  },
  {
    pattern: /Zeiss/i,
    type: DeviceType.OPTICAL,
    manufacturer: 'Carl Zeiss'
  },
  {
    pattern: /Leica/i,
    type: DeviceType.OPTICAL,
    manufacturer: 'Leica'
  },
  {
    pattern: /Mettler|Toledo/i,
    type: DeviceType.CHEMICAL_ANALYSIS,
    manufacturer: 'Mettler Toledo'
  },
  {
    pattern: /Shimadzu/i,
    type: DeviceType.CHEMICAL_ANALYSIS,
    manufacturer: 'Shimadzu'
  },
  {
    pattern: /Siemens/i,
    type: DeviceType.MECHANICAL,
    manufacturer: 'Siemens'
  },
  {
    pattern: /Thermo/i,
    type: DeviceType.THERMODYNAMIC,
    manufacturer: 'Thermo Fisher Scientific'
  }
];
