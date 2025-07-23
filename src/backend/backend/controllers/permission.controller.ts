/**
 * 权限控制器
 * 处理权限相关的API请求
 */
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Permission, { ResourceType, PermissionAction, PermissionTargetType } from '../models/permission.model';
import PermissionRule from '../models/permissionRule.model';
import permissionService from '../services/permission.service';
import teamService from '../services/team.service';
import organizationService from '../services/organization.service';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { catchAsync } from '../utils/catchAsync';

/**
 * 检查用户是否拥有特定权限
 */
export const checkPermission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resourceType, action, resourceId } = req.query;

    if (!resourceType || !action) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const hasPermission = await permissionService.checkPermission(
      req.user!.id,
      resourceType as ResourceType,
      action as PermissionAction,
      resourceId as string
    );

    res.status(200).json({
      success: true,
      data: {
        hasPermission,
        resourceType,
        action,
        resourceId: resourceId || '全局'
      }
    });
  }
);

/**
 * 获取当前用户的所有权限
 */
export const getUserPermissions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 获取用户ID
    const userId = req.user!.id;

    // 查询直接授予该用户的权限
    const userPermissions = await Permission.find({
      targetType: PermissionTargetType.USER,
      targetId: userId,
      isActive: true
    });

    // 查询授予用户角色的权限
    const rolePermissions = await Permission.find({
      targetType: PermissionTargetType.ROLE,
      targetId: req.user!.role,
      isActive: true
    });

    // 获取用户所属的团队
    // 注意：这里假设有一个teamService可以获取用户的团队，如果没有，需要直接查询团队集合
    const userTeams = await teamService.getUserTeams(userId);
    const teamIds = userTeams.map(team => team._id);

    // 查询授予用户所属团队的权限
    const teamPermissions = await Permission.find({
      targetType: PermissionTargetType.TEAM,
      targetId: { $in: teamIds },
      isActive: true
    });

    // 获取用户所属的组织
    // 注意：这里假设有一个organizationService可以获取用户的组织，如果没有，需要直接查询组织集合
    const userOrgs = await organizationService.getUserOrganizations(userId);
    const orgIds = userOrgs.map(org => org._id);

    // 查询授予用户所属组织的权限
    const orgPermissions = await Permission.find({
      targetType: PermissionTargetType.ORGANIZATION,
      targetId: { $in: orgIds },
      isActive: true
    });

    // 查询公开权限
    const publicPermissions = await Permission.find({
      targetType: PermissionTargetType.PUBLIC,
      isActive: true
    });

    // 合并所有权限
    const allPermissions = [
      ...userPermissions,
      ...rolePermissions,
      ...teamPermissions,
      ...orgPermissions,
      ...publicPermissions
    ];

    res.status(200).json({
      success: true,
      data: allPermissions
    });
  }
);

/**
 * 获取资源的权限配置
 */
export const getResourcePermissions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resourceType, resourceId } = req.params;

    if (!resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    try {
      const permissions = await permissionService.getResourcePermissions(
        resourceType as ResourceType,
        resourceId,
        req.user!.id
      );

      res.status(200).json({
        success: true,
        data: permissions
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }
  }
);

/**
 * 更新资源的权限配置
 */
export const updateResourcePermissions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resourceType, resourceId } = req.params;
    const { permissions } = req.body;

    if (!resourceType || !resourceId || !permissions) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    try {
      await permissionService.updateResourcePermissions(
        resourceType as ResourceType,
        resourceId,
        permissions,
        req.user!.id
      );

      res.status(200).json({
        success: true,
        message: '权限更新成功'
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }
  }
);

/**
 * 创建新权限
 */
export const createPermission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permission = await permissionService.grantPermission(
        req.body,
        req.user!.id
      );

      res.status(201).json({
        success: true,
        data: permission
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }
  }
);

/**
 * 删除权限
 */
export const deletePermission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      await permissionService.revokePermission(id, req.user!.id);

      res.status(200).json({
        success: true,
        message: '权限已撤销'
      });
    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof NotFoundError) {
        return res.status(error instanceof ForbiddenError ? 403 : 404).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }
  }
);

/**
 * 创建权限规则
 */
export const createPermissionRule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, permissions } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const rule = new PermissionRule({
      name,
      description,
      permissions,
      createdBy: req.user!.id
    });

    await rule.save();

    res.status(201).json({
      success: true,
      data: rule
    });
  }
);

/**
 * 获取所有权限规则
 */
export const getPermissionRules = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rules = await PermissionRule.find()
      .sort('-createdAt')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: rules
    });
  }
);

/**
 * 获取特定权限规则
 */
export const getPermissionRule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const rule = await PermissionRule.findById(id)
      .populate('createdBy', 'name email');

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: '权限规则不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: rule
    });
  }
);

/**
 * 删除权限规则
 */
export const deletePermissionRule = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // 检查规则是否为内置规则
    const rule = await PermissionRule.findById(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: '权限规则不存在'
      });
    }

    if (rule.isBuiltIn) {
      return res.status(403).json({
        success: false,
        message: '内置规则不能删除'
      });
    }

    await PermissionRule.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '权限规则已删除'
    });
  }
);

/**
 * 应用权限规则到资源
 */
export const applyRuleToResource = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { resourceType, resourceId } = req.body;

    if (!resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 检查用户是否有资源的管理权限
    const hasPermission = await permissionService.checkPermission(
      req.user!.id,
      resourceType as ResourceType,
      PermissionAction.MANAGE,
      resourceId
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '您没有管理此资源权限的权限'
      });
    }

    // 获取规则
    const rule = await PermissionRule.findById(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: '权限规则不存在'
      });
    }

    // 开始事务
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 为每个规则中的权限创建相应的资源权限
      const permissions = rule.permissions.map(p => ({
        ...p,
        resourceType: resourceType as ResourceType,
        resourceId,
        createdBy: req.user!.id
      }));

      // 批量创建权限
      await Permission.insertMany(permissions, { session });

      // 提交事务
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: '权限规则已应用到资源'
      });
    } catch (error) {
      // 回滚事务
      await session.abortTransaction();
      throw error;
    } finally {
      // 结束会话
      session.endSession();
    }
  }
);

// 导出控制器
export default {
  checkPermission,
  getUserPermissions,
  getResourcePermissions,
  updateResourcePermissions,
  createPermission,
  deletePermission,
  createPermissionRule,
  getPermissionRules,
  getPermissionRule,
  deletePermissionRule,
  applyRuleToResource
};
