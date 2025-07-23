/**
 * 权限验证中间件
 * 提供基于资源和操作的权限验证
 */
import { Request, Response, NextFunction } from 'express';
import { ResourceType, PermissionAction } from '../models/permission.model';
import permissionService from '../services/permission.service';
import { ForbiddenError } from '../utils/errors';

/**
 * 验证用户对特定资源类型的操作权限
 * @param resourceType 资源类型
 * @param action 操作类型
 */
export const requirePermission = (resourceType: ResourceType, action: PermissionAction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('需要先登录'));
      }

      const hasPermission = await permissionService.checkPermission(
        req.user.id,
        resourceType,
        action
      );

      if (!hasPermission) {
        return next(new ForbiddenError(`您没有${action}${resourceType}的权限`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 验证用户对特定资源实例的操作权限
 * @param resourceType 资源类型
 * @param action 操作类型
 * @param resourceIdParam 资源ID参数名称，默认为'id'
 */
export const requireResourcePermission = (
  resourceType: ResourceType,
  action: PermissionAction,
  resourceIdParam: string = 'id'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('需要先登录'));
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        return next(new ForbiddenError('缺少资源ID'));
      }

      const hasPermission = await permissionService.checkPermission(
        req.user.id,
        resourceType,
        action,
        resourceId
      );

      if (!hasPermission) {
        return next(new ForbiddenError(`您没有${action}此${resourceType}的权限`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 验证用户对请求体中资源的操作权限
 * @param resourceType 资源类型
 * @param action 操作类型
 * @param resourceIdField 资源ID字段名称
 */
export const requireBodyResourcePermission = (
  resourceType: ResourceType,
  action: PermissionAction,
  resourceIdField: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('需要先登录'));
      }

      const resourceId = req.body[resourceIdField];
      if (!resourceId) {
        return next(new ForbiddenError('缺少资源ID'));
      }

      const hasPermission = await permissionService.checkPermission(
        req.user.id,
        resourceType,
        action,
        resourceId
      );

      if (!hasPermission) {
        return next(new ForbiddenError(`您没有${action}此${resourceType}的权限`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 验证用户对查询参数中资源的操作权限
 * @param resourceType 资源类型
 * @param action 操作类型
 * @param resourceIdParam 资源ID参数名称
 */
export const requireQueryResourcePermission = (
  resourceType: ResourceType,
  action: PermissionAction,
  resourceIdParam: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('需要先登录'));
      }

      const resourceId = req.query[resourceIdParam] as string;
      if (!resourceId) {
        return next(new ForbiddenError('缺少资源ID'));
      }

      const hasPermission = await permissionService.checkPermission(
        req.user.id,
        resourceType,
        action,
        resourceId
      );

      if (!hasPermission) {
        return next(new ForbiddenError(`您没有${action}此${resourceType}的权限`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
