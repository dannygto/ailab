import { Request, Response, NextFunction } from 'express';
import { DatabaseManager } from '@/config/database';
import { logger } from '@/utils/logger';

interface RateLimitOptions {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 最大请求次数
  message?: string; // 自定义错误消息
  keyGenerator?: (req: Request) => string; // 自定义键生成器
  skipSuccessfulRequests?: boolean; // 是否跳过成功请求
  skipFailedRequests?: boolean; // 是否跳过失败请求
}

// 默认键生成器
const defaultKeyGenerator = (req: Request): string => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// 速率限制中间件
export const rateLimit = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        windowMs,
        max,
        message = '请求过于频繁，请稍后再试',
        keyGenerator = defaultKeyGenerator,
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
      } = options;

      const key = keyGenerator(req);
      const redis = DatabaseManager.getInstance().getRedisClient();
      const rateLimitKey = `rate_limit:${key}`;

      // 获取当前时间窗口的开始时间
      const now = Date.now();
      const windowStart = now - windowMs;

      // 获取当前时间窗口内的请求记录
      const requests = await redis.zRangeByScore(rateLimitKey, windowStart, '+inf');
      
      // 清理过期的请求记录
      await redis.zRemRangeByScore(rateLimitKey, '-inf', windowStart - 1);

      // 检查是否超过限制
      if (requests.length >= max) {
        logger.warn(`Rate limit exceeded for ${key}: ${requests.length}/${max} requests in ${windowMs}ms`);
        
        // 计算剩余时间
        const oldestRequest = await redis.zRange(rateLimitKey, 0, 0, { WITHSCORES: true });
        const resetTime = oldestRequest.length > 0 ? 
          parseInt(oldestRequest[0].score) + windowMs - now : 
          windowMs;

        res.status(429).json({
          success: false,
          error: {
            code: 429,
            message,
            type: 'RATE_LIMIT_ERROR',
            details: {
              limit: max,
              windowMs,
              resetTime,
              retryAfter: Math.ceil(resetTime / 1000),
            },
          },
          timestamp: new Date().toISOString(),
        });

        // 设置重试时间头
        res.setHeader('Retry-After', Math.ceil(resetTime / 1000));
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(now + resetTime).toISOString());
        
        return;
      }

      // 记录当前请求
      await redis.zAdd(rateLimitKey, { score: now, value: now.toString() });
      
      // 设置过期时间
      await redis.expire(rateLimitKey, Math.ceil(windowMs / 1000));

      // 设置响应头
      const remaining = max - requests.length - 1;
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

      // 监听响应完成事件
      const originalSend = res.send;
      res.send = function(data: any) {
        const statusCode = res.statusCode;
        
        // 根据配置决定是否记录请求
        if (skipSuccessfulRequests && statusCode < 400) {
          // 成功请求不记录
        } else if (skipFailedRequests && statusCode >= 400) {
          // 失败请求不记录
        } else {
          // 记录请求
          redis.zAdd(rateLimitKey, { score: now, value: now.toString() }).catch((err: any) => {
            logger.error('Error recording rate limit request:', err);
          });
        }
        
        return originalSend.call(this, data);
      };

      logger.debug(`Rate limit check passed for ${key}: ${requests.length + 1}/${max} requests`);
      next();
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      // 如果速率限制服务出错，允许请求通过
      next();
    }
  };
};

// 预定义的速率限制配置
export const rateLimitConfigs = {
  // 严格限制：每分钟5次请求
  strict: {
    windowMs: 60 * 1000, // 1分钟
    max: 5,
    message: '请求过于频繁，请等待1分钟后重试',
  },
  
  // 中等限制：每分钟30次请求
  moderate: {
    windowMs: 60 * 1000, // 1分钟
    max: 30,
    message: '请求过于频繁，请稍后再试',
  },
  
  // 宽松限制：每分钟100次请求
  lenient: {
    windowMs: 60 * 1000, // 1分钟
    max: 100,
    message: '请求过于频繁，请稍后再试',
  },
  
  // 文件上传限制：每小时10次
  fileUpload: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 10,
    message: '文件上传过于频繁，请等待1小时后重试',
  },
  
  // 登录限制：每小时5次
  login: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 5,
    message: '登录尝试过于频繁，请等待1小时后重试',
  },
  
  // API密钥限制：每分钟1000次
  apiKey: {
    windowMs: 60 * 1000, // 1分钟
    max: 1000,
    message: 'API调用过于频繁，请稍后再试',
  },
};

// 基于用户ID的速率限制
export const userRateLimit = (options: RateLimitOptions) => {
  const userKeyGenerator = (req: Request): string => {
    const userId = req.user?.userId || req.headers['x-user-id'] as string;
    return userId || req.ip || 'anonymous';
  };
  
  return rateLimit({
    ...options,
    keyGenerator: userKeyGenerator,
  });
};

// 基于IP的速率限制
export const ipRateLimit = (options: RateLimitOptions) => {
  const ipKeyGenerator = (req: Request): string => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           'unknown';
  };
  
  return rateLimit({
    ...options,
    keyGenerator: ipKeyGenerator,
  });
};

// 动态速率限制（根据用户角色调整）
export const dynamicRateLimit = (baseOptions: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role || 'anonymous';
      
      // 根据用户角色调整限制
      let adjustedOptions = { ...baseOptions };
      
      switch (userRole) {
        case 'admin':
          adjustedOptions.max = Math.floor(baseOptions.max * 3); // 管理员3倍限制
          break;
        case 'teacher':
          adjustedOptions.max = Math.floor(baseOptions.max * 2); // 教师2倍限制
          break;
        case 'student':
          // 学生使用基础限制
          break;
        default:
          adjustedOptions.max = Math.floor(baseOptions.max * 0.5); // 匿名用户减半
          break;
      }
      
      const rateLimitMiddleware = rateLimit(adjustedOptions);
      await rateLimitMiddleware(req, res, next);
    } catch (error) {
      logger.error('Dynamic rate limit error:', error);
      next();
    }
  };
};

// 速率限制状态检查
export const getRateLimitStatus = async (key: string): Promise<{
  current: number;
  limit: number;
  remaining: number;
  resetTime: number;
}> => {
  try {
    const redis = DatabaseManager.getInstance().getRedisClient();
    const rateLimitKey = `rate_limit:${key}`;
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 假设1分钟窗口
    const windowStart = now - windowMs;
    
    const requests = await redis.zRangeByScore(rateLimitKey, windowStart, '+inf');
    const limit = 30; // 假设30次限制
    
    return {
      current: requests.length,
      limit,
      remaining: Math.max(0, limit - requests.length),
      resetTime: now + windowMs,
    };
  } catch (error) {
    logger.error('Error getting rate limit status:', error);
    return {
      current: 0,
      limit: 30,
      remaining: 30,
      resetTime: Date.now() + 60000,
    };
  }
}; 