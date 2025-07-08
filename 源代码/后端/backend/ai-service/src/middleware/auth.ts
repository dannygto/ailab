import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

// 用户认证中间件
export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '缺少认证令牌',
          type: 'AUTHENTICATION_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    const secret = process.env['JWT_SECRET'] || 'your-secret-key';
    
    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (err) {
        logger.warn(`Invalid token: ${err.message}`);
        res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: '无效的认证令牌',
            type: 'AUTHENTICATION_ERROR',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 将用户信息添加到请求对象
      req.user = decoded;
      req.headers['x-user-id'] = decoded.userId;
      
      logger.debug(`User authenticated: ${decoded.userId}`);
      next();
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '认证服务错误',
        type: 'INTERNAL_ERROR',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// 角色验证中间件
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: '用户未认证',
            type: 'AUTHENTICATION_ERROR',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userRole = req.user.role;
      
      if (!roles.includes(userRole)) {
        logger.warn(`User ${req.user.userId} attempted to access restricted resource. Role: ${userRole}, Required: ${roles.join(', ')}`);
        res.status(403).json({
          success: false,
          error: {
            code: 403,
            message: '权限不足',
            type: 'AUTHORIZATION_ERROR',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.debug(`User ${req.user.userId} authorized with role: ${userRole}`);
      next();
    } catch (error) {
      logger.error('Role verification middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '权限验证服务错误',
          type: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// 可选认证中间件（不强制要求认证）
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret = process.env['JWT_SECRET'] || 'your-secret-key';
      
      jwt.verify(token, secret, (err: any, decoded: any) => {
        if (!err && decoded) {
          req.user = decoded;
          req.headers['x-user-id'] = decoded.userId;
          logger.debug(`Optional auth successful for user: ${decoded.userId}`);
        }
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next();
  }
};

// API密钥验证中间件
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const validApiKey = process.env['API_KEY'];
    
    if (!validApiKey) {
      logger.warn('API_KEY environment variable not set');
      next();
      return;
    }
    
    if (!apiKey || apiKey !== validApiKey) {
      logger.warn(`Invalid API key attempt from ${req.ip}`);
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '无效的API密钥',
          type: 'API_KEY_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    logger.debug('API key validation successful');
    next();
  } catch (error) {
    logger.error('API key validation middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'API密钥验证服务错误',
        type: 'INTERNAL_ERROR',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
} 