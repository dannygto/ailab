/**
 * TCP/Socket协议适配器 - 动态协议检测与适配模块
 *
 * 本模块实现了自动检测数据流的协议类型，并自动选择合适的协议解析器
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import { EventEmitter } from 'events';
import * as net from 'net';
import { TCPSocketConnectionOptions } from './tcp-socket-adapter';

/**
 * 协议特征描述
 */
export interface ProtocolSignature {
  /** 协议名称 */
  name: string;

  /** 协议版本 */
  version?: string;

  /** 协议特征 - 字符串匹配模式 */
  stringPatterns?: string[];

  /** 协议特征 - 二进制模式（十六进制字符串表示） */
  hexPatterns?: string[];

  /** 协议特征 - 正则表达式 */
  regexPatterns?: RegExp[];

  /** 协议特征 - 帧结构验证函数 */
  frameValidator?: (data: Buffer) => boolean;

  /** 协议描述 */
  description?: string;

  /** 协议处理器工厂函数 */
  createProcessor?: () => ProtocolProcessor;
}

/**
 * 协议处理器接口
 */
export interface ProtocolProcessor {
  /** 处理输入数据 */
  processInput(data: Buffer): Buffer | null;

  /** 处理输出数据 */
  processOutput(data: Buffer): Buffer;

  /** 获取处理器名称 */
  getName(): string;

  /** 获取处理器版本 */
  getVersion(): string;

  /** 初始化处理器 */
  initialize(): Promise<void>;

  /** 重置处理器状态 */
  reset(): void;

  /** 销毁处理器 */
  destroy(): void;
}

/**
 * 协议检测器事件
 */
export enum ProtocolDetectorEvents {
  /** 检测到协议 */
  PROTOCOL_DETECTED = 'protocolDetected',

  /** 协议切换 */
  PROTOCOL_SWITCHED = 'protocolSwitched',

  /** 协议检测开始 */
  DETECTION_STARTED = 'detectionStarted',

  /** 协议检测结束 */
  DETECTION_FINISHED = 'detectionFinished',

  /** 协议检测失败 */
  DETECTION_FAILED = 'detectionFailed'
}

/**
 * 检测结果
 */
export interface DetectionResult {
  /** 检测到的协议 */
  protocol: ProtocolSignature;

  /** 置信度 (0-1) */
  confidence: number;

  /** 匹配的模式 */
  matchedPatterns: string[];

  /** 检测时间 (ms) */
  detectionTime: number;

  /** 协议处理器 */
  processor?: ProtocolProcessor;
}

/**
 * 协议检测器配置
 */
export interface ProtocolDetectorConfig {
  /** 是否启用自动协议切换 */
  autoSwitch?: boolean;

  /** 协议检测超时 (ms) */
  detectionTimeout?: number;

  /** 最小检测数据量 (bytes) */
  minDetectionBytes?: number;

  /** 最大检测数据量 (bytes) */
  maxDetectionBytes?: number;

  /** 协议检测阈值 (0-1) */
  detectionThreshold?: number;

  /** 已知协议列表 */
  knownProtocols?: ProtocolSignature[];
}

/**
 * 默认协议特征列表
 */
export const DEFAULT_PROTOCOL_SIGNATURES: ProtocolSignature[] = [
  {
    name: 'HTTP',
    version: '1.x',
    stringPatterns: ['GET ', 'POST ', 'HTTP/1.', 'Host: '],
    regexPatterns: [/^(GET|POST|PUT|DELETE|HEAD|OPTIONS)\s+.+\s+HTTP\/\d\.\d/],
    description: 'HTTP协议',
  },
  {
    name: 'MQTT',
    version: '3.x',
    hexPatterns: ['10', '20', '30', '40'],
    description: 'MQTT协议',
  },
  {
    name: 'Modbus-TCP',
    hexPatterns: ['0000', '0001', '0003', '0010'],
    frameValidator: (data: Buffer): boolean => {
      // Modbus TCP帧结构验证
      if (data.length < 8) return false;

      // 检查事务标识符和协议标识符
      const protocolId = data.readUInt16BE(2);
      return protocolId === 0;
    },
    description: 'Modbus TCP协议',
  },
  {
    name: 'SOAP',
    stringPatterns: ['<soap:', '<SOAP:', '<env:Envelope', '<Envelope'],
    description: 'SOAP Web服务协议',
  },
  {
    name: 'REST-JSON',
    stringPatterns: ['{', '['],
    regexPatterns: [/^\s*[\{\[].*[\}\]]\s*$/],
    description: 'RESTful JSON协议',
  }
];

/**
 * 协议检测器
 *
 * 自动检测和适配不同的协议类型
 */
export class ProtocolDetector extends EventEmitter {
  private config: ProtocolDetectorConfig;
  private detectionBuffer: Buffer;
  private detectionActive: boolean;
  private currentProtocol: ProtocolSignature | null;
  private currentProcessor: ProtocolProcessor | null;
  private detectionStartTime: number;

  /**
   * 创建协议检测器
   *
   * @param config 检测器配置
   */
  constructor(config?: ProtocolDetectorConfig) {
    super();

    this.config = {
      autoSwitch: true,
      detectionTimeout: 5000,
      minDetectionBytes: 16,
      maxDetectionBytes: 1024,
      detectionThreshold: 0.7,
      knownProtocols: [...DEFAULT_PROTOCOL_SIGNATURES],
      ...config
    };

    this.detectionBuffer = Buffer.alloc(0);
    this.detectionActive = false;
    this.currentProtocol = null;
    this.currentProcessor = null;
    this.detectionStartTime = 0;
  }

  /**
   * 开始协议检测
   */
  public startDetection(): void {
    if (this.detectionActive) return;

    this.detectionActive = true;
    this.detectionStartTime = Date.now();
    this.emit(ProtocolDetectorEvents.DETECTION_STARTED);
  }

  /**
   * 停止协议检测
   */
  public stopDetection(): void {
    if (!this.detectionActive) return;

    this.detectionActive = false;
    this.emit(ProtocolDetectorEvents.DETECTION_FINISHED);
  }

  /**
   * 处理输入数据
   *
   * @param data 输入数据
   * @returns 处理后的数据，如果检测中则返回null
   */
  public processInput(data: Buffer): Buffer | null {
    // 如果已经有确定的协议并且不在检测状态，直接使用当前处理器
    if (this.currentProcessor && !this.detectionActive) {
      return this.currentProcessor.processInput(data);
    }

    // 追加数据到检测缓冲区
    this.appendToDetectionBuffer(data);

    // 检查是否有足够的数据进行检测
    if (this.detectionBuffer.length >= this.config.minDetectionBytes!) {
      const result = this.detectProtocol(this.detectionBuffer);

      if (result) {
        this.handleDetectionSuccess(result);
        // 如果检测成功，停止检测并使用检测到的处理器处理数据
        return result.processor ? result.processor.processInput(this.detectionBuffer) : this.detectionBuffer;
      }

      // 检查是否超时
      if (Date.now() - this.detectionStartTime > this.config.detectionTimeout!) {
        this.handleDetectionTimeout();
        return this.detectionBuffer;
      }
    }

    // 如果仍在检测中，返回null表示数据被缓存
    return null;
  }

  /**
   * 处理输出数据
   *
   * @param data 输出数据
   * @returns 处理后的数据
   */
  public processOutput(data: Buffer): Buffer {
    return this.currentProcessor ? this.currentProcessor.processOutput(data) : data;
  }

  /**
   * 检测协议类型
   *
   * @param data 要检测的数据
   * @returns 检测结果，如果无法确定则返回null
   */
  private detectProtocol(data: Buffer): DetectionResult | null {
    const startTime = Date.now();
    const candidates: { protocol: ProtocolSignature; confidence: number; matches: string[] }[] = [];

    // 对每个已知协议进行评分
    for (const protocol of this.config.knownProtocols!) {
      const result = this.scoreProtocol(protocol, data);
      if (result.confidence > 0) {
        candidates.push(result);
      }
    }

    // 按置信度排序
    candidates.sort((a, b) => b.confidence - a.confidence);

    // 如果最高分超过阈值，则确认为该协议
    if (candidates.length > 0 && candidates[0].confidence >= this.config.detectionThreshold!) {
      const topCandidate = candidates[0];

      const result: DetectionResult = {
        protocol: topCandidate.protocol,
        confidence: topCandidate.confidence,
        matchedPatterns: topCandidate.matches,
        detectionTime: Date.now() - startTime
      };

      // 如果协议有处理器工厂，创建处理器
      if (topCandidate.protocol.createProcessor) {
        result.processor = topCandidate.protocol.createProcessor!();
      }

      return result;
    }

    return null;
  }

  /**
   * 对协议进行评分
   *
   * @param protocol 要评分的协议
   * @param data 数据缓冲区
   * @returns 评分结果
   */
  private scoreProtocol(protocol: ProtocolSignature, data: Buffer): { protocol: ProtocolSignature; confidence: number; matches: string[] } {
    let matches = 0;
    let totalPatterns = 0;
    const matchedPatterns: string[] = [];
    const dataStr = data.toString('utf8');

    // 检查字符串模式
    if (protocol.stringPatterns && protocol.stringPatterns.length > 0) {
      totalPatterns += protocol.stringPatterns.length;

      for (const pattern of protocol.stringPatterns) {
        if (dataStr.includes(pattern)) {
          matches++;
          matchedPatterns.push(`string:${pattern}`);
        }
      }
    }

    // 检查十六进制模式
    if (protocol.hexPatterns && protocol.hexPatterns.length > 0) {
      totalPatterns += protocol.hexPatterns.length;
      const hexData = data.toString('hex').toUpperCase();

      for (const pattern of protocol.hexPatterns) {
        if (hexData.includes(pattern.toUpperCase())) {
          matches++;
          matchedPatterns.push(`hex:${pattern}`);
        }
      }
    }

    // 检查正则表达式模式
    if (protocol.regexPatterns && protocol.regexPatterns.length > 0) {
      totalPatterns += protocol.regexPatterns.length;

      for (const pattern of protocol.regexPatterns) {
        if (pattern.test(dataStr)) {
          matches++;
          matchedPatterns.push(`regex:${pattern}`);
        }
      }
    }

    // 检查帧验证函数
    if (protocol.frameValidator) {
      totalPatterns++;

      if (protocol.frameValidator(data)) {
        matches++;
        matchedPatterns.push('frameValidator');
      }
    }

    // 如果没有任何模式，无法评分
    if (totalPatterns === 0) {
      return { protocol, confidence: 0, matches: [] };
    }

    // 计算置信度
    const confidence = matches / totalPatterns;

    return {
      protocol,
      confidence,
      matches: matchedPatterns
    };
  }

  /**
   * 添加数据到检测缓冲区
   *
   * @param data 新数据
   */
  private appendToDetectionBuffer(data: Buffer): void {
    this.detectionBuffer = Buffer.concat([this.detectionBuffer, data]);

    // 如果超过最大检测数据量，截断
    if (this.detectionBuffer.length > this.config.maxDetectionBytes!) {
      this.detectionBuffer = this.detectionBuffer.slice(0, this.config.maxDetectionBytes!);
    }
  }

  /**
   * 处理检测成功
   *
   * @param result 检测结果
   */
  private handleDetectionSuccess(result: DetectionResult): void {
    const isProtocolChanged = !this.currentProtocol ||
                            this.currentProtocol.name !== result.protocol.name ||
                            this.currentProtocol.version !== result.protocol.version;

    this.currentProtocol = result.protocol;

    if (result.processor) {
      // 如果有旧处理器，销毁它
      if (this.currentProcessor) {
        this.currentProcessor.destroy();
      }

      this.currentProcessor = result.processor;
      this.currentProcessor.initialize();
    }

    this.stopDetection();

    // 发出协议检测事件
    this.emit(ProtocolDetectorEvents.PROTOCOL_DETECTED, result);

    // 如果协议发生变化，发出协议切换事件
    if (isProtocolChanged) {
      this.emit(ProtocolDetectorEvents.PROTOCOL_SWITCHED, result);
    }

    // 清空检测缓冲区
    this.detectionBuffer = Buffer.alloc(0);
  }

  /**
   * 处理检测超时
   */
  private handleDetectionTimeout(): void {
    this.stopDetection();

    // 发出检测失败事件
    this.emit(ProtocolDetectorEvents.DETECTION_FAILED, {
      reason: 'timeout',
      message: '协议检测超时',
      buffer: this.detectionBuffer
    });

    // 清空检测缓冲区
    this.detectionBuffer = Buffer.alloc(0);
  }

  /**
   * 获取当前协议
   *
   * @returns 当前协议，如果未检测到则返回null
   */
  public getCurrentProtocol(): ProtocolSignature | null {
    return this.currentProtocol;
  }

  /**
   * 获取当前处理器
   *
   * @returns 当前处理器，如果未创建则返回null
   */
  public getCurrentProcessor(): ProtocolProcessor | null {
    return this.currentProcessor;
  }

  /**
   * 重置检测器
   */
  public reset(): void {
    if (this.currentProcessor) {
      this.currentProcessor.destroy();
      this.currentProcessor = null;
    }

    this.currentProtocol = null;
    this.detectionBuffer = Buffer.alloc(0);
    this.detectionActive = false;
  }

  /**
   * 添加自定义协议特征
   *
   * @param signature 协议特征
   */
  public addProtocolSignature(signature: ProtocolSignature): void {
    this.config.knownProtocols!.push(signature);
  }

  /**
   * 移除协议特征
   *
   * @param name 协议名称
   */
  public removeProtocolSignature(name: string): void {
    this.config.knownProtocols = this.config.knownProtocols!.filter(p => p.name !== name);
  }
}

/**
 * 创建协议检测器的工厂函数
 *
 * @param config 检测器配置
 * @returns 协议检测器实例
 */
export function createProtocolDetector(config?: ProtocolDetectorConfig): ProtocolDetector {
  return new ProtocolDetector(config);
}
