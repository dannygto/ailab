import winston from 'winston';
import path from 'path';

// 日志级别定义
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根据环境选择日志级别
const level = () => {
  const env = process.env['NODE_ENV'] || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// 日志颜色配置
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 日志格式配置
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info['timestamp']} ${info.level}: ${info.message}`,
  ),
);

// 日志文件路径
const logDir = path.join(process.cwd(), 'logs');

// 日志传输器配置
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // 错误日志文件
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // 所有日志文件
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// 创建logger实例
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// 开发环境下的额外配置
if (process.env['NODE_ENV'] === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// 日志中间件
export const logMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.http(logMessage);
    }
  });
  
  next();
};

// 错误日志记录
export const logError = (error: Error, context?: string) => {
  logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};

// 性能日志记录
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info(`Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

// API请求日志记录
export const logApiRequest = (method: string, url: string, statusCode: number, duration: number, userId?: string) => {
  logger.info(`API Request: ${method} ${url} ${statusCode} ${duration}ms`, {
    method,
    url,
    statusCode,
    duration,
    userId,
    timestamp: new Date().toISOString(),
  });
};

// AI助手交互日志记录
export const logAssistantInteraction = (
  userId: string,
  messageType: string,
  content: string,
  responseTime: number,
  success: boolean
) => {
  logger.info(`Assistant Interaction: ${messageType}`, {
    userId,
    messageType,
    content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
    responseTime,
    success,
    timestamp: new Date().toISOString(),
  });
};

// 数据库操作日志记录
export const logDatabaseOperation = (operation: string, collection: string, duration: number, success: boolean) => {
  logger.debug(`Database Operation: ${operation} on ${collection}`, {
    operation,
    collection,
    duration,
    success,
    timestamp: new Date().toISOString(),
  });
};

// 系统事件日志记录
export const logSystemEvent = (event: string, details?: any) => {
  logger.info(`System Event: ${event}`, {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

export default logger; 