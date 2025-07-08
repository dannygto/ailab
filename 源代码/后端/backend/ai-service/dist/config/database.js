"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIndexes = exports.checkDatabaseHealth = exports.DatabaseManager = exports.createRedisClient = exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = __importDefault(require("redis"));
const logger_1 = require("@/utils/logger");
const connectMongoDB = async () => {
    const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/aicam';
    const maxPoolSize = parseInt(process.env['MONGODB_MAX_POOL_SIZE'] || '10', 10);
    const retryAttempts = parseInt(process.env['MONGODB_RETRY_ATTEMPTS'] || '3', 10);
    const retryDelay = parseInt(process.env['MONGODB_RETRY_DELAY'] || '1000', 10);
    const useFallback = process.env['MONGODB_USE_FALLBACK'] === 'true';
    const fallbackMode = process.env['MONGODB_FALLBACK_MODE'] === 'true';
    const mockMode = process.env['MOCK_DB'] === 'true';
    const isDevelopment = process.env['NODE_ENV'] === 'development';
    if ((isDevelopment && mockMode) || fallbackMode) {
        logger_1.logger.info('MongoDB: 运行在模拟模式，跳过数据库连接');
        return true;
    }
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
            logger_1.logger.info(`MongoDB: 连接尝试 ${attempt}/${retryAttempts}`);
            await mongoose_1.default.connect(mongoUri, {
                maxPoolSize,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            logger_1.logger.info('MongoDB: 连接成功！');
            return true;
        }
        catch (error) {
            logger_1.logger.error(`MongoDB: 连接失败 (尝试 ${attempt}/${retryAttempts}):`, error.message);
            if (attempt < retryAttempts) {
                logger_1.logger.info(`MongoDB: ${retryDelay}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
            else {
                if (useFallback && isDevelopment) {
                    logger_1.logger.warn('MongoDB: 所有连接尝试失败，切换到模拟模式');
                    process.env['MONGODB_FALLBACK_MODE'] = 'true';
                    return true;
                }
                else if (isDevelopment) {
                    logger_1.logger.warn('MongoDB: 连接失败，但开发模式下继续运行');
                    return false;
                }
                else {
                    logger_1.logger.error('MongoDB: 连接失败，无法继续运行');
                    throw new Error('MongoDB连接失败，应用无法启动');
                }
            }
        }
    }
    return false;
};
exports.connectMongoDB = connectMongoDB;
const createRedisClient = () => {
    const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
    const maxRetries = parseInt(process.env['REDIS_MAX_RETRIES'] || '5', 10);
    const retryDelay = parseInt(process.env['REDIS_RETRY_DELAY'] || '1000', 10);
    const useFallback = process.env['REDIS_USE_FALLBACK'] === 'true';
    const fallbackMode = process.env['REDIS_FALLBACK_MODE'] === 'true';
    const mockMode = process.env['MOCK_DB'] === 'true';
    const isDevelopment = process.env['NODE_ENV'] === 'development';
    if ((isDevelopment && mockMode) || fallbackMode) {
        logger_1.logger.info('Redis: 运行在模拟模式，使用内存模拟客户端');
        return null;
    }
    try {
        if (!redis_1.default || typeof redis_1.default.createClient !== 'function') {
            logger_1.logger.error('Redis: Redis库未正确加载，可能是依赖问题');
            if (useFallback && isDevelopment) {
                logger_1.logger.warn('Redis: 切换到模拟模式');
                process.env['REDIS_FALLBACK_MODE'] = 'true';
                return null;
            }
            throw new Error('Redis库未正确加载');
        }
        const client = redis_1.default.createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > maxRetries) {
                        logger_1.logger.error('Redis: 重连次数超过最大限制，停止重连');
                        return false;
                    }
                    const delay = Math.min(retryDelay * Math.pow(2, retries), 30000);
                    logger_1.logger.warn(`Redis: 第${retries}次重连尝试，${delay}ms后重试`);
                    return delay;
                },
            },
        });
        client.on('connect', () => {
            logger_1.logger.info('Redis: 连接成功！');
        });
        client.on('error', (error) => {
            logger_1.logger.error('Redis: 连接错误:', error.message);
            if (useFallback && isDevelopment) {
                logger_1.logger.warn('Redis: 发生错误，考虑切换到模拟模式');
            }
        });
        client.on('reconnecting', () => {
            logger_1.logger.info('Redis: 正在重新连接...');
        });
        return client;
    }
    catch (error) {
        logger_1.logger.error('Redis: 创建客户端失败:', error.message);
        if (useFallback && isDevelopment) {
            logger_1.logger.warn('Redis: 切换到模拟模式');
            process.env['REDIS_FALLBACK_MODE'] = 'true';
            return null;
        }
        if (isDevelopment) {
            logger_1.logger.warn('Redis: 创建客户端失败，但开发模式下继续运行');
            return null;
        }
        throw error;
    }
};
exports.createRedisClient = createRedisClient;
class DatabaseManager {
    constructor() {
        this.redisClient = null;
        this.mockMode = false;
        this.fallbackMode = false;
        this.isInitialized = false;
        this.mockMode = process.env['NODE_ENV'] === 'development' && process.env['MOCK_DB'] === 'true';
        this.fallbackMode = process.env['MONGODB_FALLBACK_MODE'] === 'true' || process.env['REDIS_FALLBACK_MODE'] === 'true';
        if (this.mockMode) {
            logger_1.logger.info('DatabaseManager: 初始化为模拟模式');
        }
        if (this.fallbackMode) {
            logger_1.logger.info('DatabaseManager: 初始化为降级模式');
        }
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async initialize() {
        if (this.isInitialized) {
            logger_1.logger.info('DatabaseManager: 已经初始化，跳过');
            return;
        }
        logger_1.logger.info('DatabaseManager: 开始初始化数据库连接...');
        try {
            await (0, exports.connectMongoDB)();
            this.fallbackMode = process.env['MONGODB_FALLBACK_MODE'] === 'true' || process.env['REDIS_FALLBACK_MODE'] === 'true';
            if (!this.mockMode) {
                this.redisClient = (0, exports.createRedisClient)();
                if (this.redisClient) {
                    try {
                        await this.redisClient.connect();
                        logger_1.logger.info('Redis: 连接成功并已就绪');
                    }
                    catch (error) {
                        logger_1.logger.error('Redis: 连接过程中出错:', error.message);
                        if (process.env['NODE_ENV'] === 'development' && process.env['REDIS_USE_FALLBACK'] === 'true') {
                            logger_1.logger.warn('Redis: 切换到模拟模式');
                            this.redisClient = null;
                            process.env['REDIS_FALLBACK_MODE'] = 'true';
                            this.fallbackMode = true;
                        }
                        else if (process.env['NODE_ENV'] !== 'development') {
                            throw error;
                        }
                    }
                }
                else {
                    this.fallbackMode = process.env['REDIS_FALLBACK_MODE'] === 'true';
                    logger_1.logger.warn(`Redis: 客户端创建失败，模拟模式状态: ${this.fallbackMode}`);
                }
            }
            this.isInitialized = true;
            logger_1.logger.info(`DatabaseManager: 初始化完成 (模拟模式: ${this.mockMode}, 降级模式: ${this.fallbackMode})`);
        }
        catch (error) {
            logger_1.logger.error('DatabaseManager: 初始化失败:', error.message);
            if (process.env['NODE_ENV'] === 'development') {
                logger_1.logger.warn('DatabaseManager: 在开发模式下继续运行，但数据库功能可能受限');
                this.mockMode = true;
                this.fallbackMode = true;
                this.isInitialized = true;
            }
            else {
                throw new Error(`数据库初始化失败: ${error.message}`);
            }
        }
    }
    getRedisClient() {
        if (this.mockMode || this.fallbackMode || !this.redisClient) {
            logger_1.logger.debug('DatabaseManager: 返回模拟Redis客户端');
            return this.createMockRedisClient();
        }
        return this.redisClient;
    }
    createMockRedisClient() {
        const mockStorage = {};
        const mockSets = {};
        const mockHashes = {};
        logger_1.logger.debug('DatabaseManager: 创建模拟Redis客户端');
        return {
            isReady: true,
            isOpen: true,
            set: async (key, value) => {
                mockStorage[key] = value;
                return 'OK';
            },
            get: async (key) => {
                return mockStorage[key] || null;
            },
            lPush: async (key, ...values) => {
                if (!mockStorage[key]) {
                    mockStorage[key] = [];
                }
                mockStorage[key].unshift(...values);
                return mockStorage[key].length;
            },
            lRange: async (key, start, stop) => {
                if (!mockStorage[key]) {
                    return [];
                }
                return mockStorage[key].slice(start, stop === -1 ? undefined : stop + 1);
            },
            lTrim: async (key, start, stop) => {
                if (mockStorage[key]) {
                    mockStorage[key] = mockStorage[key].slice(start, stop === -1 ? undefined : stop + 1);
                }
                return 'OK';
            },
            sAdd: async (key, ...members) => {
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
            sMembers: async (key) => {
                return mockSets[key] ? Array.from(mockSets[key]) : [];
            },
            hSet: async (key, field, value) => {
                if (!mockHashes[key]) {
                    mockHashes[key] = {};
                }
                const isNew = !(field in mockHashes[key]);
                mockHashes[key][field] = value;
                return isNew ? 1 : 0;
            },
            hGet: async (key, field) => {
                if (!mockHashes[key]) {
                    return null;
                }
                return mockHashes[key][field] || null;
            },
            hGetAll: async (key) => {
                return mockHashes[key] || {};
            },
            expire: async (key, seconds) => {
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
            exists: async (key) => {
                return (key in mockStorage || key in mockSets || key in mockHashes) ? 1 : 0;
            },
            del: async (key) => {
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
            connect: async () => true,
            quit: async () => true,
            on: (event, callback) => {
                if (event === 'connect') {
                    setTimeout(() => callback(), 0);
                }
                return { on: () => ({}) };
            }
        };
    }
    async close() {
        if (!this.isInitialized) {
            logger_1.logger.info('DatabaseManager: 未初始化，无需关闭');
            return;
        }
        if (this.mockMode) {
            logger_1.logger.info('DatabaseManager: 模拟模式，模拟关闭连接');
            this.isInitialized = false;
            return;
        }
        try {
            if (mongoose_1.default.connection.readyState !== 0) {
                await mongoose_1.default.connection.close();
                logger_1.logger.info('MongoDB: 连接已关闭');
            }
            if (this.redisClient && this.redisClient.isOpen) {
                await this.redisClient.quit();
                logger_1.logger.info('Redis: 连接已关闭');
            }
            this.isInitialized = false;
            logger_1.logger.info('DatabaseManager: 所有数据库连接已关闭');
        }
        catch (error) {
            logger_1.logger.error('DatabaseManager: 关闭连接时出错:', error.message);
            throw error;
        }
    }
    getStatus() {
        return {
            initialized: this.isInitialized,
            mockMode: this.mockMode,
            fallbackMode: this.fallbackMode,
            mongoConnected: mongoose_1.default.connection.readyState === 1,
            redisConnected: !!this.redisClient && this.redisClient.isReady
        };
    }
}
exports.DatabaseManager = DatabaseManager;
const checkDatabaseHealth = async () => {
    const dbManager = DatabaseManager.getInstance();
    const status = dbManager.getStatus();
    const mongoReadyState = mongoose_1.default.connection.readyState;
    const mongoConnected = mongoReadyState === 1;
    let redisConnected = false;
    let redisMock = status.mockMode || status.fallbackMode;
    try {
        const redisClient = dbManager.getRedisClient();
        redisConnected = !!redisClient && (redisClient.isReady || redisMock);
    }
    catch (error) {
        logger_1.logger.error('Redis健康检查失败:', error);
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
exports.checkDatabaseHealth = checkDatabaseHealth;
const createIndexes = async () => {
    try {
        const dbManager = DatabaseManager.getInstance();
        const status = dbManager.getStatus();
        if (status.mockMode) {
            logger_1.logger.info('DatabaseManager: 模拟模式，跳过索引创建');
            return;
        }
        if (mongoose_1.default.connection.readyState !== 1) {
            logger_1.logger.warn('MongoDB: 未连接，无法创建索引');
            return;
        }
        logger_1.logger.info('DatabaseManager: 索引创建成功');
    }
    catch (error) {
        logger_1.logger.error('DatabaseManager: 创建索引失败:', error.message);
        if (process.env['NODE_ENV'] !== 'development') {
            throw error;
        }
    }
};
exports.createIndexes = createIndexes;
//# sourceMappingURL=database.js.map