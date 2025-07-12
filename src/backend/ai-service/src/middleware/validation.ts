import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '@/utils/logger';

// 验证规则类型定义
interface ValidationRule {
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  enum?: string[];
  default?: any;
  properties?: Record<string, ValidationRule>;
}

interface ValidationSchema {
  body?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
}

// 将自定义验证规则转换为Joi schema
function convertToJoiSchema(rules: Record<string, ValidationRule>): Joi.ObjectSchema {
  const joiSchema: Record<string, any> = {};

  for (const [field, rule] of Object.entries(rules)) {
    let joiField: any;

    switch (rule.type) {
      case 'string':
        joiField = Joi.string();
        if (rule.maxLength) joiField = joiField.max(rule.maxLength);
        break;
      case 'number':
        joiField = Joi.number();
        if (rule.min !== undefined) joiField = joiField.min(rule.min);
        if (rule.max !== undefined) joiField = joiField.max(rule.max);
        break;
      case 'boolean':
        joiField = Joi.boolean();
        break;
      case 'object':
        if (rule.properties) {
          joiField = convertToJoiSchema(rule.properties);
        } else {
          joiField = Joi.object();
        }
        break;
      case 'array':
        joiField = Joi.array();
        break;
      default:
        joiField = Joi.any();
    }

    if (rule.enum) {
      joiField = joiField.valid(...rule.enum);
    }

    if (rule.required) {
      joiField = joiField.required();
    } else if (rule.default !== undefined) {
      joiField = joiField.default(rule.default);
    } else {
      joiField = joiField.optional();
    }

    joiSchema[field] = joiField;
  }

  return Joi.object(joiSchema);
}

// 请求验证中间件
export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ field: string; message: string }> = [];

      // 验证请求体
      if (schema.body) {
        const bodySchema = convertToJoiSchema(schema.body);
        const { error } = bodySchema.validate(req.body, { abortEarly: false });
        
        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: detail.path.join('.'),
              message: detail.message,
            });
          });
        }
      }

      // 验证查询参数
      if (schema.query) {
        const querySchema = convertToJoiSchema(schema.query);
        const { error } = querySchema.validate(req.query, { abortEarly: false });
        
        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: `query.${detail.path.join('.')}`,
              message: detail.message,
            });
          });
        }
      }

      // 验证路径参数
      if (schema.params) {
        const paramsSchema = convertToJoiSchema(schema.params);
        const { error } = paramsSchema.validate(req.params, { abortEarly: false });
        
        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: `params.${detail.path.join('.')}`,
              message: detail.message,
            });
          });
        }
      }

      // 如果有验证错误，返回错误响应
      if (errors.length > 0) {
        logger.warn(`Validation failed for ${req.method} ${req.originalUrl}:`, errors);
        
        res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '请求参数验证失败',
            type: 'VALIDATION_ERROR',
            details: errors,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.debug(`Request validation passed for ${req.method} ${req.originalUrl}`);
      next();
    } catch (error) {
      logger.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '请求验证服务错误',
          type: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// 通用验证规则
export const commonValidationRules = {
  // 用户ID验证
  userId: {
    type: 'string',
    required: true,
    maxLength: 50,
  },
  
  // 实验ID验证
  experimentId: {
    type: 'string',
    required: true,
    maxLength: 100,
  },
  
  // 消息内容验证
  message: {
    type: 'string',
    required: true,
    maxLength: 1000,
  },
  
  // 分页参数验证
  pagination: {
    limit: {
      type: 'number',
      min: 1,
      max: 100,
      default: 20,
    },
    offset: {
      type: 'number',
      min: 0,
      default: 0,
    },
  },
  
  // 时间范围验证
  timeRange: {
    start: {
      type: 'string',
      required: true,
    },
    end: {
      type: 'string',
      required: true,
    },
  },
  
  // 文件上传验证
  fileUpload: {
    file: {
      type: 'object',
      required: true,
    },
    maxSize: {
      type: 'number',
      default: 10 * 1024 * 1024, // 10MB
    },
    allowedTypes: {
      type: 'array',
      default: ['image/jpeg', 'image/png', 'image/gif'],
    },
  },
};

// 自定义验证函数
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): boolean => {
  // 密码至少8位，包含大小写字母和数字
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// 文件类型验证
export const validateFileType = (file: Express.Multer.File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.mimetype);
};

// 文件大小验证
export const validateFileSize = (file: Express.Multer.File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// 自定义验证中间件
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  fieldName?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const file = req.file || (req.files as any)?.[options.fieldName || 'file'];
      
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '缺少上传文件',
            type: 'FILE_UPLOAD_ERROR',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const maxSize = options.maxSize || 10 * 1024 * 1024; // 默认10MB
      const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];

      if (!validateFileSize(file as Express.Multer.File, maxSize)) {
        res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: `文件大小超过限制 (${maxSize / 1024 / 1024}MB)`,
            type: 'FILE_SIZE_ERROR',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!validateFileType(file as Express.Multer.File, allowedTypes)) {
        res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: `不支持的文件类型，支持的类型: ${allowedTypes.join(', ')}`,
            type: 'FILE_TYPE_ERROR',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('File upload validation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '文件上传验证服务错误',
          type: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
}; 