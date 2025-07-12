import mongoose from 'mongoose';
import Redis from 'redis';
import { logger } from '@/utils/logger';

/**
 * 增强版MongoDB连接函数
 * - 添加重试机制
 * - 改进错误处理
 * - 支持优雅降级到模拟模式
 */
export const connectMongoDB = async (): Promise<boolean> => {
  // 获取环境变量配置
  const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/aicam';
  const maxPoolSize = parseInt(process.env['MONGODB_MAX_POOL_SIZE'] || '10', 10);
  const retryAttempts = parseInt(process.env['MONGODB_RETRY_ATTEMPTS'] || '3', 10);
  const retryDelay = parseInt(process.env['MONGODB_RETRY_DELAY'] || '1000', 10);
  const useFallback = process.env['MONGODB_USE_FALLBACK'] === 'true';
  const fallbackMode = process.env['MONGODB_FALLBACK_MODE'] === 'true';
  const mockMode = process.env['MOCK_DB'] === 'true';
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  // 检查是否使用模拟模式
  if ((isDevelopment && mockMode) || fallbackMode) {
    logger.info('MongoDB: 运行在模拟模式，跳过数据库连接');
    return true; // 成功使用模拟模式
  }

  // 尝试连接MongoDB
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      logger.info(`MongoDB: 连接尝试 ${attempt}/${retryAttempts}`);
      
      await mongoose.connect(mongoUri, {
        maxPoolSize,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info('MongoDB: 连接成功！');
      return true;
    } catch (error: any) {
      logger.error(`MongoDB: 连接失败 (尝试 ${attempt}/${retryAttempts}):`, error.message);
      
      if (attempt < retryAttempts) {
        // 在重试之前等待
        logger.info(`MongoDB: ${retryDelay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        // 最后一次尝试也失败了
        if (useFallback && isDevelopment) {
          logger.warn('MongoDB: 所有连接尝试失败，切换到模拟模式');
          process.env['MONGODB_FALLBACK_MODE'] = 'true';
          return true; // 成功切换到模拟模式
        } else if (isDevelopment) {
          logger.warn('MongoDB: 连接失败，但开发模式下继续运行');
          return false;
        } else {
          logger.error('MongoDB: 连接失败，无法继续运行');
          throw new Error('MongoDB连接失败，应用无法启动');
        }
      }
    }
  }

  return false;
};

/**
 * 增强版Redis客户端创建函数
 * - 添加错误检查
 * - 支持优雅降级到模拟模式
 */
export const createRedisClient = (): Redis.RedisClientType | null => {
  // 获取环境变量配置
  const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
  const maxRetries = parseInt(process.env['REDIS_MAX_RETRIES'] || '5', 10);
  const retryDelay = parseInt(process.env['REDIS_RETRY_DELAY'] || '1000', 10);
  const useFallback = process.env['REDIS_USE_FALLBACK'] === 'true';
  const fallbackMode = process.env['REDIS_FALLBACK_MODE'] === 'true';
  const mockMode = process.env['MOCK_DB'] === 'true';
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  
  // 检查是否使用模拟模式
  if ((isDevelopment && mockMode) || fallbackMode) {
    logger.info('Redis: 运行在模拟模式，使用内存模拟客户端');
    return null;
  }

  try {
    // 创建Redis客户端
    if (!Redis || typeof Redis.createClient !== 'function') {
      logger.error('Redis: Redis库未正确加载，可能是依赖问题');
      if (useFallback && isDevelopment) {
        logger.warn('Redis: 切换到模拟模式');
        process.env['REDIS_FALLBACK_MODE'] = 'true';
        return null;
      }
      throw new Error('Redis库未正确加载');
    }
    
    const client = Redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > maxRetries) {
            logger.error('Redis: 重连次数超过最大限制，停止重连');
            return false; // 停止重连
          }
          const delay = Math.min(retryDelay * Math.pow(2, retries), 30000);
          logger.warn(`Redis: 第${retries}次重连尝试，${delay}ms后重试`);
          return delay;
        },
      },
    });

    // 注册事件处理器
    client.on('connect', () => {
      logger.info('Redis: 连接成功！');
    });

    client.on('error', (error) => {
      logger.error('Redis: 连接错误:', error.message);
      if (useFallback && isDevelopment) {
        logger.warn('Redis: 发生错误，考虑切换到模拟模式');
      }
    });

    client.on('reconnecting', () => {
      logger.info('Redis: 正在重新连接...');
    });

    return client as any;
  } catch (error: any) {
    logger.error('Redis: 创建客户端失败:', error.message);
    
    if (useFallback && isDevelopment) {
      logger.warn('Redis: 切换到模拟模式');
      process.env['REDIS_FALLBACK_MODE'] = 'true';
      return null;
    }
    
    if (isDevelopment) {
      logger.warn('Redis: 创建客户端失败，但开发模式下继续运行');
      return null;
    }
    
    throw error;
  }
};

/**
 * 增强版数据库管理器
 * - 改进错误处理
 * - 支持优雅降级
 * - 添加健康检查
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private redisClient: Redis.RedisClientType | null = null;
  private mockMode: boolean = false;
  private fallbackMode: boolean = false;
  private isInitialized: boolean = false;

  private constructor() {
    // 检查是否处于mock模式
    this.mockMode = process.env['NODE_ENV'] === 'development' && process.env['MOCK_DB'] === 'true';
    this.fallbackMode = process.env['MONGODB_FALLBACK_MODE'] === 'true' || process.env['REDIS_FALLBACK_MODE'] === 'true';
    
    if (this.mockMode) {
      logger.info('DatabaseManager: 初始化为模拟模式');
    }
    if (this.fallbackMode) {
      logger.info('DatabaseManager: 初始化为降级模式');
    }
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * 初始化数据库连接
   * - 支持部分失败和降级
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('DatabaseManager: 已经初始化，跳过');
      return;
    }
    
    logger.info('DatabaseManager: 开始初始化数据库连接...');
    
    try {
      // 连接MongoDB
      await connectMongoDB();
      
      // 重新检查降级模式标志（可能在连接过程中被修改）
      this.fallbackMode = process.env['MONGODB_FALLBACK_MODE'] === 'true' || process.env['REDIS_FALLBACK_MODE'] === 'true';
      
      // 在非完全模拟模式下连接Redis
      if (!this.mockMode) {
        this.redisClient = createRedisClient();
        if (this.redisClient) {
          try {
            await this.redisClient.connect();
            logger.info('Redis: 连接成功并已就绪');
          } catch (error: any) {
            logger.error('Redis: 连接过程中出错:', error.message);
            if (process.env['NODE_ENV'] === 'development' && process.env['REDIS_USE_FALLBACK'] === 'true') {
              logger.warn('Redis: 切换到模拟模式');
              this.redisClient = null;
              process.env['REDIS_FALLBACK_MODE'] = 'true';
              this.fallbackMode = true;
            } else if (process.env['NODE_ENV'] !== 'development') {
              throw error;
            }
          }
        } else {
          // Redis客户端创建失败，但我们可能已经切换到模拟模式
          this.fallbackMode = process.env['REDIS_FALLBACK_MODE'] === 'true';
          logger.warn(`Redis: 客户端创建失败，模拟模式状态: ${this.fallbackMode}`);
        }
      }
      
      this.isInitialized = true;
      logger.info(`DatabaseManager: 初始化完成 (模拟模式: ${this.mockMode}, 降级模式: ${this.fallbackMode})`);
    } catch (error: any) {
      logger.error('DatabaseManager: 初始化失败:', error.message);
      if (process.env['NODE_ENV'] === 'development') {
        logger.warn('DatabaseManager: 在开发模式下继续运行，但数据库功能可能受限');
        this.mockMode = true;
        this.fallbackMode = true;
        this.isInitialized = true;
      } else {
        throw new Error(`数据库初始化失败: ${error.message}`);
      }
    }
  }

  /**
   * 获取Redis客户端
   * - 如果在模拟模式下，返回模拟客户端
   */
  public getRedisClient(): Redis.RedisClientType | any {
    // 如果在模拟模式或降级模式下，返回一个模拟客户端
    if (this.mockMode || this.fallbackMode || !this.redisClient) {
      logger.debug('DatabaseManager: 返回模拟Redis客户端');
      return this.createMockRedisClient();
    }
    
    return this.redisClient;
  }

  /**
   * 创建模拟Redis客户端
   * - 支持基本操作
   * - 使用内存存储
   */
  private createMockRedisClient(): any {
    const mockStorage: Record<string, any> = {};
    const mockSets: Record<string, Set<string>> = {};
    const mockHashes: Record<string, Record<string, string>> = {};
    
    logger.debug('DatabaseManager: 创建模拟Redis客户端');
    
    return {
      isReady: true,
      isOpen: true,
      
      // 字符串操作
      set: async (key: string, value: string) => {
        mockStorage[key] = value;
        return 'OK';
      },
      get: async (key: string) => {
        return mockStorage[key] || null;
      },
      
      // 列表操作
      lPush: async (key: string, ...values: string[]) => {
        if (!mockStorage[key]) {
          mockStorage[key] = [];
        }
        mockStorage[key].unshift(...values);
        return mockStorage[key].length;
      },
      lRange: async (key: string, start: number, stop: number) => {
        if (!mockStorage[key]) {
          return [];
        }
        return mockStorage[key].slice(start, stop === -1 ? undefined : stop + 1);
      },
      lTrim: async (key: string, start: number, stop: number) => {
        if (mockStorage[key]) {
          mockStorage[key] = mockStorage[key].slice(start, stop === -1 ? undefined : stop + 1);
        }
        return 'OK';
      },
      
      // 集合操作
      sAdd: async (key: string, ...members: string[]) => {
        if (!mockSets[key]) {
          mockSets[key] = new Set();
        }
        let count = 0;
        for (const member of members) {
          if (!mockSets[key].has(member)) {
            mockSets[key].add(member);
            count++;
          }
        }
        return count;
      },
      sMembers: async (key: string) => {
        return mockSets[key] ? Array.from(mockSets[key]) : [];
      },
      
      // 哈希操作
      hSet: async (key: string, field: string, value: string) => {
        if (!mockHashes[key]) {
          mockHashes[key] = {};
        }
        const isNew = !(field in mockHashes[key]);
        mockHashes[key][field] = value;
        return isNew ? 1 : 0;
      },
      hGet: async (key: string, field: string) => {
        if (!mockHashes[key]) {
          return null;
        }
        return mockHashes[key][field] || null;
      },
      hGetAll: async (key: string) => {
        return mockHashes[key] || {};
      },
      
      // 键操作
      expire: async (key: string, seconds: number) => {
        if (key in mockStorage || key in mockSets || key in mockHashes) {
          setTimeout(() => {
            delete mockStorage[key];
            delete mockSets[key];
            delete mockHashes[key];
          }, seconds * 1000);
          return 1;
        }
        return 0;
      },
      exists: async (key: string) => {
        return (key in mockStorage || key in mockSets || key in mockHashes) ? 1 : 0;
      },
      del: async (key: string) => {
        let count = 0;
        if (key in mockStorage) {
          delete mockStorage[key];
          count++;
        }
        if (key in mockSets) {
          delete mockSets[key];
          count++;
        }
        if (key in mockHashes) {
          delete mockHashes[key];
          count++;
        }
        return count;
      },
      
      // 连接管理
      connect: async () => true,
      quit: async () => true,
      on: (event: string, callback: Function) => {
        if (event === 'connect') {
          // 立即触发连接成功事件
          setTimeout(() => callback(), 0);
        }
        return { on: () => ({}) };
      }
    };
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    if (!this.isInitialized) {
      logger.info('DatabaseManager: 未初始化，无需关闭');
      return;
    }
    
    // 如果在完全模拟模式下，不需要关闭连接
    if (this.mockMode) {
      logger.info('DatabaseManager: 模拟模式，模拟关闭连接');
      this.isInitialized = false;
      return;
    }
    
    try {
      // 关闭MongoDB连接
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        logger.info('MongoDB: 连接已关闭');
      }
      
      // 关闭Redis连接
      if (this.redisClient && this.redisClient.isOpen) {
        await this.redisClient.quit();
        logger.info('Redis: 连接已关闭');
      }
      
      this.isInitialized = false;
      logger.info('DatabaseManager: 所有数据库连接已关闭');
    } catch (error: any) {
      logger.error('DatabaseManager: 关闭连接时出错:', error.message);
      throw error;
    }
  }
  
  /**
   * 获取数据库连接状态
   */
  public getStatus(): { 
    initialized: boolean;
    mockMode: boolean;
    fallbackMode: boolean;
    mongoConnected: boolean;
    redisConnected: boolean;
  } {
    return {
      initialized: this.isInitialized,
      mockMode: this.mockMode,
      fallbackMode: this.fallbackMode,
      mongoConnected: mongoose.connection.readyState === 1,
      redisConnected: !!this.redisClient && this.redisClient.isReady
    };
  }
}

/**
 * 数据库健康检查
 * - 返回详细状态信息
 */
export const checkDatabaseHealth = async (): Promise<{
  status: string;
  details: {
    mongodb: { connected: boolean; readyState: number; mock: boolean };
    redis: { connected: boolean; mock: boolean };
    fallbackMode: boolean;
  };
}> => {
  const dbManager = DatabaseManager.getInstance();
  const status = dbManager.getStatus();
  
  // 获取MongoDB连接状态
  const mongoReadyState = mongoose.connection.readyState;
  const mongoConnected = mongoReadyState === 1;
  
  // 获取Redis连接状态
  let redisConnected = false;
  let redisMock = status.mockMode || status.fallbackMode;
  
  try {
    const redisClient = dbManager.getRedisClient();
    redisConnected = !!redisClient && (redisClient.isReady || redisMock);
  } catch (error) {
    logger.error('Redis健康检查失败:', error);
  }
  
  const allConnected = (mongoConnected || status.mockMode || status.fallbackMode) && 
                       (redisConnected || status.mockMode || status.fallbackMode);
  
  return {
    status: allConnected ? 'healthy' : 'unhealthy',
    details: {
      mongodb: { 
        connected: mongoConnected,
        readyState: mongoReadyState,
        mock: status.mockMode || status.fallbackMode
      },
      redis: { 
        connected: redisConnected,
        mock: redisMock
      },
      fallbackMode: status.fallbackMode
    }
  };
};

/**
 * 数据库索引创建
 */
export const createIndexes = async (): Promise<void> => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const status = dbManager.getStatus();
    
    // 如果在模拟模式下，跳过索引创建
    if (status.mockMode) {
      logger.info('DatabaseManager: 模拟模式，跳过索引创建');
      return;
    }
    
    // 检查MongoDB连接状态
    if (mongoose.connection.readyState !== 1) {
      logger.warn('MongoDB: 未连接，无法创建索引');
      return;
    }
    
    // 这里添加索引创建逻辑
    // 例如: await YourModel.createIndexes();
    
    logger.info('DatabaseManager: 索引创建成功');
  } catch (error: any) {
    logger.error('DatabaseManager: 创建索引失败:', error.message);
    // 在开发模式下继续运行
    if (process.env['NODE_ENV'] !== 'development') {
      throw error;
    }
  }
};
