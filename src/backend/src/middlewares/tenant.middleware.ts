import { Request, Response, NextFunction } from 'express';

/**
 * 多租户中间件
 * 负责从请求中提取校区信息，并添加到请求对象中
 */
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 方法1：从子域名中提取校区代码 (例如: bjsyzx.example.com)
    const hostname = req.hostname;
    const parts = hostname.split('.');
    
    // 如果有子域名，将其作为校区代码
    if (parts.length > 2) {
      (req as any).schoolCode = parts[0];
    }
    
    // 方法2：从请求头中提取校区代码
    const schoolCodeHeader = req.headers['x-school-code'];
    if (schoolCodeHeader) {
      (req as any).schoolCode = schoolCodeHeader;
    }
    
    // 方法3：从查询参数中提取校区代码
    const schoolCodeQuery = req.query.schoolCode;
    if (schoolCodeQuery) {
      (req as any).schoolCode = schoolCodeQuery;
    }
    
    // 如果仍未获取到校区代码，使用默认值
    if (!(req as any).schoolCode) {
      (req as any).schoolCode = 'default';
    }
    
    next();
  } catch (error) {
    console.error('租户中间件错误:', error);
    next();
  }
};
