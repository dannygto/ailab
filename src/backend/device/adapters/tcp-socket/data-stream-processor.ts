/**
 * TCP/Socket协议适配器 - 数据流处理优化模块
 *
 * 本模块提供数据流压缩、分片传输和重组功能，优化大数据量传输
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import { EventEmitter } from 'events';
import * as zlib from 'zlib';
import * as crypto from 'crypto';

/**
 * 数据流处理器事件
 */
export enum DataStreamEvents {
  /** 数据块接收 */
  CHUNK_RECEIVED = 'chunkReceived',

  /** 完整数据接收 */
  DATA_COMPLETE = 'dataComplete',

  /** 数据发送 */
  DATA_SENT = 'dataSent',

  /** 错误 */
  ERROR = 'error',

  /** 重组开始 */
  REASSEMBLY_STARTED = 'reassemblyStarted',

  /** 重组完成 */
  REASSEMBLY_COMPLETED = 'reassemblyCompleted',

  /** 压缩开始 */
  COMPRESSION_STARTED = 'compressionStarted',

  /** 压缩完成 */
  COMPRESSION_COMPLETED = 'compressionCompleted',

  /** 解压开始 */
  DECOMPRESSION_STARTED = 'decompressionStarted',

  /** 解压完成 */
  DECOMPRESSION_COMPLETED = 'decompressionCompleted'
}

/**
 * 压缩方法
 */
export enum CompressionMethod {
  /** 不压缩 */
  NONE = 'none',

  /** GZIP压缩 */
  GZIP = 'gzip',

  /** Deflate压缩 */
  DEFLATE = 'deflate',

  /** Brotli压缩 */
  BROTLI = 'brotli'
}

/**
 * 数据块类型
 */
export enum ChunkType {
  /** 数据块 */
  DATA = 0,

  /** 开始标记 */
  START = 1,

  /** 结束标记 */
  END = 2,

  /** 控制消息 */
  CONTROL = 3,

  /** 心跳 */
  HEARTBEAT = 4,

  /** 错误 */
  ERROR = 5
}

/**
 * 数据块头部
 */
export interface ChunkHeader {
  /** 序列号 */
  sequenceNumber: number;

  /** 总块数 */
  totalChunks: number;

  /** 数据块类型 */
  chunkType: ChunkType;

  /** 原始数据大小 */
  originalSize: number;

  /** 压缩后大小 */
  compressedSize: number;

  /** 压缩方法 */
  compressionMethod: CompressionMethod;

  /** 数据校验和 */
  checksum: string;

  /** 时间戳 */
  timestamp: number;

  /** 消息ID */
  messageId: string;
}

/**
 * 数据块
 */
export interface DataChunk {
  /** 头部 */
  header: ChunkHeader;

  /** 数据负载 */
  payload: Buffer;
}

/**
 * 数据流处理器配置
 */
export interface DataStreamProcessorConfig {
  /** 是否启用压缩 */
  enableCompression?: boolean;

  /** 压缩方法 */
  compressionMethod?: CompressionMethod;

  /** 压缩级别 (1-9, 1为最快，9为最高压缩率) */
  compressionLevel?: number;

  /** 分片大小 (字节) */
  chunkSize?: number;

  /** 是否启用校验和 */
  enableChecksum?: boolean;

  /** 是否自动重组 */
  autoReassemble?: boolean;

  /** 是否丢弃过期的数据块 */
  discardExpiredChunks?: boolean;

  /** 数据块过期时间 (ms) */
  chunkExpiryTime?: number;

  /** 最大重传次数 */
  maxRetransmissions?: number;

  /** 重传超时时间 (ms) */
  retransmissionTimeout?: number;
}

/**
 * 数据流重组状态
 */
interface ReassemblyState {
  /** 消息ID */
  messageId: string;

  /** 接收到的块 */
  receivedChunks: Map<number, DataChunk>;

  /** 总块数 */
  totalChunks: number;

  /** 原始数据大小 */
  originalSize: number;

  /** 压缩方法 */
  compressionMethod: CompressionMethod;

  /** 第一个块接收时间 */
  firstChunkTime: number;

  /** 最后一个块接收时间 */
  lastChunkTime: number;

  /** 是否完成 */
  isComplete: boolean;
}

/**
 * 数据流处理器
 *
 * 提供数据压缩、分片和重组功能
 */
export class DataStreamProcessor extends EventEmitter {
  private config: DataStreamProcessorConfig;
  private reassemblyStates: Map<string, ReassemblyState>;
  private currentSequence: number;

  /**
   * 创建数据流处理器
   *
   * @param config 处理器配置
   */
  constructor(config?: DataStreamProcessorConfig) {
    super();

    this.config = {
      enableCompression: true,
      compressionMethod: CompressionMethod.GZIP,
      compressionLevel: 6,
      chunkSize: 64 * 1024, // 64KB
      enableChecksum: true,
      autoReassemble: true,
      discardExpiredChunks: true,
      chunkExpiryTime: 30000, // 30秒
      maxRetransmissions: 3,
      retransmissionTimeout: 2000, // 2秒
      ...config
    };

    this.reassemblyStates = new Map<string, ReassemblyState>();
    this.currentSequence = 0;
  }

  /**
   * 处理输入数据流
   *
   * @param data 输入数据
   * @returns 解压缩和重组后的数据，如果还未完成则返回null
   */
  public processInput(data: Buffer): Buffer | null {
    try {
      // 从数据中解析数据块
      const chunk = this.parseChunk(data);

      if (!chunk) {
        this.emit(DataStreamEvents.ERROR, new Error('无效的数据块格式'));
        return null;
      }

      // 发出块接收事件
      this.emit(DataStreamEvents.CHUNK_RECEIVED, chunk);

      // 如果不自动重组，直接返回数据块
      if (!this.config.autoReassemble) {
        return chunk.payload;
      }

      // 添加到重组状态
      const completeData = this.addChunkToReassembly(chunk);

      // 如果重组完成，返回完整数据
      if (completeData) {
        return completeData;
      }

      // 如果重组未完成，返回null表示需要等待更多数据
      return null;
    } catch (error) {
      this.emit(DataStreamEvents.ERROR, error);
      return null;
    }
  }

  /**
   * 处理输出数据流
   *
   * @param data 输出数据
   * @returns 分片和压缩后的数据块数组
   */
  public processOutput(data: Buffer): Buffer[] {
    try {
      // 生成消息ID
      const messageId = this.generateMessageId();

      // 压缩数据
      const compressedData = this.compressData(data);

      // 分片
      const chunks = this.splitIntoChunks(compressedData, data.length, messageId);

      // 序列化数据块
      const serializedChunks = chunks.map(chunk => this.serializeChunk(chunk));

      // 发出数据发送事件
      this.emit(DataStreamEvents.DATA_SENT, {
        messageId,
        originalSize: data.length,
        compressedSize: compressedData.length,
        chunkCount: chunks.length
      });

      return serializedChunks;
    } catch (error) {
      this.emit(DataStreamEvents.ERROR, error);
      return [];
    }
  }

  /**
   * 压缩数据
   *
   * @param data 原始数据
   * @returns 压缩后的数据
   */
  private compressData(data: Buffer): Buffer {
    // 如果未启用压缩，直接返回原数据
    if (!this.config.enableCompression) {
      return data;
    }

    this.emit(DataStreamEvents.COMPRESSION_STARTED, {
      originalSize: data.length,
      method: this.config.compressionMethod
    });

    let compressedData: Buffer;

    switch (this.config.compressionMethod) {
      case CompressionMethod.GZIP:
        compressedData = zlib.gzipSync(data, {
          level: this.config.compressionLevel
        });
        break;

      case CompressionMethod.DEFLATE:
        compressedData = zlib.deflateSync(data, {
          level: this.config.compressionLevel
        });
        break;

      case CompressionMethod.BROTLI:
        compressedData = zlib.brotliCompressSync(data, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: this.config.compressionLevel
          }
        });
        break;

      case CompressionMethod.NONE:
      default:
        compressedData = data;
        break;
    }

    this.emit(DataStreamEvents.COMPRESSION_COMPLETED, {
      originalSize: data.length,
      compressedSize: compressedData.length,
      compressionRatio: data.length / compressedData.length
    });

    return compressedData;
  }

  /**
   * 解压缩数据
   *
   * @param data 压缩数据
   * @param method 压缩方法
   * @returns 解压缩后的数据
   */
  private decompressData(data: Buffer, method: CompressionMethod): Buffer {
    // 如果未压缩，直接返回
    if (method === CompressionMethod.NONE) {
      return data;
    }

    this.emit(DataStreamEvents.DECOMPRESSION_STARTED, {
      compressedSize: data.length,
      method
    });

    let decompressedData: Buffer;

    switch (method) {
      case CompressionMethod.GZIP:
        decompressedData = zlib.gunzipSync(data);
        break;

      case CompressionMethod.DEFLATE:
        decompressedData = zlib.inflateSync(data);
        break;

      case CompressionMethod.BROTLI:
        decompressedData = zlib.brotliDecompressSync(data);
        break;

      default:
        decompressedData = data;
        break;
    }

    this.emit(DataStreamEvents.DECOMPRESSION_COMPLETED, {
      compressedSize: data.length,
      decompressedSize: decompressedData.length,
      compressionRatio: decompressedData.length / data.length
    });

    return decompressedData;
  }

  /**
   * 将数据分割成块
   *
   * @param data 要分片的数据
   * @param originalSize 原始数据大小
   * @param messageId 消息ID
   * @returns 数据块数组
   */
  private splitIntoChunks(data: Buffer, originalSize: number, messageId: string): DataChunk[] {
    const chunks: DataChunk[] = [];
    const chunkSize = this.config.chunkSize!;
    const totalChunks = Math.ceil(data.length / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      const payload = data.slice(start, end);

      // 计算校验和
      const checksum = this.config.enableChecksum
        ? crypto.createHash('md5').update(payload).digest('hex')
        : '';

      const header: ChunkHeader = {
        sequenceNumber: i,
        totalChunks,
        chunkType: i === 0 ? ChunkType.START : (i === totalChunks - 1 ? ChunkType.END : ChunkType.DATA),
        originalSize,
        compressedSize: data.length,
        compressionMethod: this.config.compressionMethod!,
        checksum,
        timestamp: Date.now(),
        messageId
      };

      chunks.push({ header, payload });
    }

    return chunks;
  }

  /**
   * 序列化数据块
   *
   * @param chunk 数据块
   * @returns 序列化后的缓冲区
   */
  private serializeChunk(chunk: DataChunk): Buffer {
    // 将头部转换为JSON
    const headerJson = JSON.stringify(chunk.header);

    // 创建头部长度的缓冲区 (4字节)
    const headerLengthBuffer = Buffer.alloc(4);
    headerLengthBuffer.writeUInt32BE(headerJson.length, 0);

    // 创建魔数缓冲区，用于标识数据块格式 (4字节，固定为 0xABCD1234)
    const magicBuffer = Buffer.alloc(4);
    magicBuffer.writeUInt32BE(0xABCD1234, 0);

    // 将头部转换为缓冲区
    const headerBuffer = Buffer.from(headerJson, 'utf8');

    // 合并所有部分
    return Buffer.concat([magicBuffer, headerLengthBuffer, headerBuffer, chunk.payload]);
  }

  /**
   * 解析数据块
   *
   * @param data 序列化的数据块
   * @returns 解析后的数据块
   */
  private parseChunk(data: Buffer): DataChunk | null {
    // 检查数据长度
    if (data.length < 12) { // 魔数(4) + 头部长度(4) + 最小头部(4)
      return null;
    }

    // 检查魔数
    const magic = data.readUInt32BE(0);
    if (magic !== 0xABCD1234) {
      return null;
    }

    // 读取头部长度
    const headerLength = data.readUInt32BE(4);

    // 检查数据长度是否足够
    if (data.length < 8 + headerLength) {
      return null;
    }

    // 提取头部JSON
    const headerJson = data.slice(8, 8 + headerLength).toString('utf8');

    // 解析头部
    let header: ChunkHeader;
    try {
      header = JSON.parse(headerJson);
    } catch (error) {
      return null;
    }

    // 提取有效载荷
    const payload = data.slice(8 + headerLength);

    // 验证校验和
    if (this.config.enableChecksum && header.checksum) {
      const calculatedChecksum = crypto.createHash('md5').update(payload).digest('hex');
      if (calculatedChecksum !== header.checksum) {
        this.emit(DataStreamEvents.ERROR, new Error('校验和不匹配'));
        return null;
      }
    }

    return { header, payload };
  }

  /**
   * 添加数据块到重组状态
   *
   * @param chunk 数据块
   * @returns 如果重组完成，返回完整数据，否则返回null
   */
  private addChunkToReassembly(chunk: DataChunk): Buffer | null {
    const { header } = chunk;
    const { messageId } = header;

    // 获取或创建重组状态
    let state = this.reassemblyStates.get(messageId);

    if (!state) {
      // 如果是新消息，创建新状态
      state = {
        messageId,
        receivedChunks: new Map<number, DataChunk>(),
        totalChunks: header.totalChunks,
        originalSize: header.originalSize,
        compressionMethod: header.compressionMethod,
        firstChunkTime: Date.now(),
        lastChunkTime: Date.now(),
        isComplete: false
      };

      this.reassemblyStates.set(messageId, state);
      this.emit(DataStreamEvents.REASSEMBLY_STARTED, {
        messageId,
        totalChunks: header.totalChunks,
        originalSize: header.originalSize
      });
    } else {
      // 更新最后接收时间
      state.lastChunkTime = Date.now();
    }

    // 添加数据块
    state.receivedChunks.set(header.sequenceNumber, chunk);

    // 检查是否收到所有块
    if (state.receivedChunks.size === state.totalChunks) {
      // 重组数据
      const reassembledData = this.reassembleChunks(state);

      // 标记为完成
      state.isComplete = true;

      // 从状态映射中移除
      this.reassemblyStates.delete(messageId);

      // 发出重组完成事件
      this.emit(DataStreamEvents.REASSEMBLY_COMPLETED, {
        messageId,
        chunkCount: state.totalChunks,
        compressedSize: reassembledData.length,
        originalSize: state.originalSize,
        reassemblyTime: state.lastChunkTime - state.firstChunkTime
      });

      // 发出数据完成事件
      this.emit(DataStreamEvents.DATA_COMPLETE, {
        messageId,
        data: reassembledData
      });

      return reassembledData;
    }

    // 如果重组未完成，返回null
    return null;
  }

  /**
   * 重组数据块
   *
   * @param state 重组状态
   * @returns 重组后的数据
   */
  private reassembleChunks(state: ReassemblyState): Buffer {
    // 按序列号排序
    const sortedChunks: DataChunk[] = [];
    for (let i = 0; i < state.totalChunks; i++) {
      const chunk = state.receivedChunks.get(i);
      if (chunk) {
        sortedChunks.push(chunk);
      } else {
        throw new Error(`缺少数据块：${i}`);
      }
    }

    // 连接所有数据块
    const combinedData = Buffer.concat(sortedChunks.map(chunk => chunk.payload));

    // 解压缩数据
    return this.decompressData(combinedData, state.compressionMethod);
  }

  /**
   * 生成消息ID
   *
   * @returns 唯一消息ID
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${this.currentSequence++}`;
  }

  /**
   * 清理过期的重组状态
   */
  public cleanupExpiredStates(): void {
    if (!this.config.discardExpiredChunks) {
      return;
    }

    const now = Date.now();
    const expiryTime = this.config.chunkExpiryTime!;

    const stateEntries = Array.from(this.reassemblyStates.entries());
    for (const [messageId, state] of stateEntries) {
      // 如果最后接收时间超过过期时间，删除状态
      if (now - state.lastChunkTime > expiryTime) {
        this.emit(DataStreamEvents.ERROR, {
          type: 'expiry',
          messageId,
          message: `消息${messageId}的重组状态已过期，已接收${state.receivedChunks.size}/${state.totalChunks}个数据块`
        });

        this.reassemblyStates.delete(messageId);
      }
    }
  }

  /**
   * 获取当前的重组状态
   *
   * @returns 重组状态的映射
   */
  public getReassemblyStates(): Map<string, ReassemblyState> {
    return this.reassemblyStates;
  }

  /**
   * 重置处理器
   */
  public reset(): void {
    this.reassemblyStates.clear();
    this.currentSequence = 0;
  }
}

/**
 * 创建数据流处理器的工厂函数
 *
 * @param config 处理器配置
 * @returns 数据流处理器实例
 */
export function createDataStreamProcessor(config?: DataStreamProcessorConfig): DataStreamProcessor {
  return new DataStreamProcessor(config);
}
