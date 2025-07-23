/**
 * 异步错误处理包装器
 * 将异步函数包装，自动捕获异常并传递给错误处理中间件
 */
import { Request, Response, NextFunction } from 'express';

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
