import { Request, Response, NextFunction } from 'express';
import { Team } from '../models/team.model';
import { Permission } from '../models/permission.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { ResourceType, PermissionAction } from '../types/permission';

/**
 * 验证用户是否有团队访问权限
 * @param requiredRole 需要的最低角色级别（可选）
 */
export const checkTeamAccess = (requiredRole?: string) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 获取团队ID
    const teamId = req.params.teamId || req.body.teamId || req.query.teamId;

    if (!teamId) {
      return next(new AppError('团队ID不存在', 400));
    }

    // 获取当前用户ID
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('未授权访问', 401));
    }

    // 查找团队
    const team = await Team.findById(teamId);

    if (!team) {
      return next(new AppError('团队不存在', 404));
    }

    // 检查用户是否是团队成员
    const memberInfo = team.members.find(member =>
      member.user._id.toString() === userId || member.user.toString() === userId
    );

    if (!memberInfo) {
      // 用户不是团队成员，检查是否有全局权限
      const hasPermission = await Permission.exists({
        resourceType: ResourceType.TEAM,
        resourceId: teamId,
        targetType: 'user',
        targetId: userId,
        action: PermissionAction.VIEW
      });

      if (!hasPermission) {
        return next(new AppError('您没有访问此团队的权限', 403));
      }
    } else if (requiredRole) {
      // 检查用户角色是否满足要求
      const roleHierarchy = {
        'owner': 50,
        'admin': 40,
        'editor': 30,
        'member': 20,
        'guest': 10
      };

      const userRoleLevel = roleHierarchy[memberInfo.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        return next(new AppError(`您需要至少 ${requiredRole} 角色才能执行此操作`, 403));
      }
    }

    // 将团队和成员信息添加到请求对象中
    req.team = team;
    req.teamMember = memberInfo;

    next();
  });
};

/**
 * 验证用户是否是团队所有者
 */
export const checkTeamOwner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 获取团队ID
    const teamId = req.params.teamId || req.body.teamId || req.query.teamId;

    if (!teamId) {
      return next(new AppError('团队ID不存在', 400));
    }

    // 获取当前用户ID
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('未授权访问', 401));
    }

    // 查找团队
    const team = await Team.findById(teamId);

    if (!team) {
      return next(new AppError('团队不存在', 404));
    }

    // 检查用户是否是团队创建者或所有者
    const isCreator = team.createdBy._id.toString() === userId || team.createdBy.toString() === userId;
    const isOwner = team.members.some(member =>
      (member.user._id.toString() === userId || member.user.toString() === userId) &&
      member.role === 'owner'
    );

    if (!isCreator && !isOwner) {
      return next(new AppError('只有团队所有者才能执行此操作', 403));
    }

    // 将团队信息添加到请求对象中
    req.team = team;

    next();
  }
);

/**
 * 验证用户是否有团队管理权限
 */
export const checkTeamAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 获取团队ID
    const teamId = req.params.teamId || req.body.teamId || req.query.teamId;

    if (!teamId) {
      return next(new AppError('团队ID不存在', 400));
    }

    // 获取当前用户ID
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('未授权访问', 401));
    }

    // 查找团队
    const team = await Team.findById(teamId);

    if (!team) {
      return next(new AppError('团队不存在', 404));
    }

    // 检查用户是否是团队管理员或所有者
    const hasAdminRole = team.members.some(member =>
      (member.user._id.toString() === userId || member.user.toString() === userId) &&
      (member.role === 'admin' || member.role === 'owner')
    );

    if (!hasAdminRole) {
      return next(new AppError('您需要管理员权限才能执行此操作', 403));
    }

    // 将团队信息添加到请求对象中
    req.team = team;

    next();
  }
);

/**
 * 验证用户是否可以编辑团队资源
 */
export const checkTeamResourceEdit = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 获取团队ID和资源ID
    const teamId = req.params.teamId || req.body.teamId || req.query.teamId;
    const resourceId = req.params.resourceId || req.body.resourceId || req.query.resourceId;
    const resourceType = req.params.resourceType || req.body.resourceType || req.query.resourceType;

    if (!teamId || !resourceId || !resourceType) {
      return next(new AppError('缺少必要参数', 400));
    }

    // 获取当前用户ID
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('未授权访问', 401));
    }

    // 查找团队
    const team = await Team.findById(teamId);

    if (!team) {
      return next(new AppError('团队不存在', 404));
    }

    // 检查用户是否是团队成员且有编辑权限
    const memberInfo = team.members.find(member =>
      member.user._id.toString() === userId || member.user.toString() === userId
    );

    if (!memberInfo) {
      return next(new AppError('您不是团队成员', 403));
    }

    const editRoles = ['owner', 'admin', 'editor'];
    if (!editRoles.includes(memberInfo.role)) {
      // 检查是否有特定资源的权限
      const hasPermission = await Permission.exists({
        resourceType,
        resourceId,
        targetType: 'user',
        targetId: userId,
        action: PermissionAction.UPDATE
      });

      if (!hasPermission) {
        return next(new AppError('您没有编辑此资源的权限', 403));
      }
    }

    // 将团队和成员信息添加到请求对象中
    req.team = team;
    req.teamMember = memberInfo;

    next();
  }
);

/**
 * 类型扩展，添加团队相关信息到Express请求对象
 */
declare global {
  namespace Express {
    interface Request {
      team?: any;
      teamMember?: any;
    }
  }
}
