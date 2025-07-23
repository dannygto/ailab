// 验证中间件
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { BadRequestError } from '../utils/errors';

/**
 * 请求验证中间件
 * 配合express-validator使用，检查验证结果并提供错误响应
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 执行所有的验证器
    await Promise.all(validations.map(validation => validation.run(req)));

    // 获取验证结果
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // 格式化错误信息
      const formattedErrors = errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }));

      return next(new BadRequestError(JSON.stringify(formattedErrors)));
    }

    next();
  };
};
