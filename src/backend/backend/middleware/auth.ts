// 认证中间件
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { UnauthorizedError } from '../utils/errors';

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * 验证用户认证状态的中间件
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头中获取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('需要提供认证令牌');
    }

    const token = authHeader.split(' ')[1];

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;

    // 检查用户是否存在
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('无效的令牌'));
    } else {
      next(error);
    }
  }
};

/**
 * 验证用户是否有特定角色的中间件
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('需要先登录'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError('无权限执行此操作'));
    }

    next();
  };
};
