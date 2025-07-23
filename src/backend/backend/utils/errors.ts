// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 通用自定义错误类
export class CustomError extends Error {
  statusCode: number;
  originalError?: any;

  constructor(message: string, statusCode: number = 500, originalError?: any) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - 错误请求
export class BadRequestError extends AppError {
  constructor(message: string = '请求参数无效') {
    super(message, 400);
  }
}

// 401 - 未授权
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401);
  }
}

// 403 - 禁止访问
export class ForbiddenError extends AppError {
  constructor(message: string = '禁止访问此资源') {
    super(message, 403);
  }
}

// 404 - 资源未找到
export class NotFoundError extends AppError {
  constructor(message: string = '请求的资源不存在') {
    super(message, 404);
  }
}

// 409 - 冲突
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409);
  }
}

// 500 - 服务器内部错误
export class InternalServerError extends AppError {
  constructor(message: string = '服务器内部错误') {
    super(message, 500);
  }
}
