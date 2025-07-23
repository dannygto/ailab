// 团队权限验证中间件
import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service';
import { ErrorResponse } from '../utils/errors';
import { TeamMemberRole } from '../models/team.model';

const teamService = new TeamService();

/**
 * 验证用户是否为团队成员
 */
export const isTeamMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const teamId = req.params.teamId || req.body.teamId;

    if (!userId) {
      return res.status(401).json(new ErrorResponse('未授权访问', 401));
    }

    if (!teamId) {
      return res.status(400).json(new ErrorResponse('缺少团队ID', 400));
    }

    const isMember = await teamService.isUserTeamMember(teamId, userId);

    if (!isMember) {
      return res.status(403).json(new ErrorResponse('您不是该团队的成员', 403));
    }

    next();
  } catch (error) {
    console.error('团队成员验证失败:', error);
    return res.status(500).json(new ErrorResponse('服务器内部错误', 500));
  }
};

/**
 * 验证用户是否为团队管理员或拥有者
 */
export const isTeamAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const teamId = req.params.teamId || req.body.teamId;

    if (!userId) {
      return res.status(401).json(new ErrorResponse('未授权访问', 401));
    }

    if (!teamId) {
      return res.status(400).json(new ErrorResponse('缺少团队ID', 400));
    }

    const memberRole = await teamService.getUserRoleInTeam(teamId, userId);

    if (!memberRole || (memberRole !== TeamMemberRole.ADMIN && memberRole !== TeamMemberRole.OWNER)) {
      return res.status(403).json(new ErrorResponse('需要管理员权限', 403));
    }

    next();
  } catch (error) {
    console.error('团队管理员验证失败:', error);
    return res.status(500).json(new ErrorResponse('服务器内部错误', 500));
  }
};

/**
 * 验证用户是否为团队拥有者
 */
export const isTeamOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const teamId = req.params.teamId || req.body.teamId;

    if (!userId) {
      return res.status(401).json(new ErrorResponse('未授权访问', 401));
    }

    if (!teamId) {
      return res.status(400).json(new ErrorResponse('缺少团队ID', 400));
    }

    const memberRole = await teamService.getUserRoleInTeam(teamId, userId);

    if (!memberRole || memberRole !== TeamMemberRole.OWNER) {
      return res.status(403).json(new ErrorResponse('需要团队拥有者权限', 403));
    }

    next();
  } catch (error) {
    console.error('团队拥有者验证失败:', error);
    return res.status(500).json(new ErrorResponse('服务器内部错误', 500));
  }
};

/**
 * 验证用户是否有权限执行特定操作
 * @param requiredPermission 需要的权限
 */
export const hasTeamPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const teamId = req.params.teamId || req.body.teamId;

      if (!userId) {
        return res.status(401).json(new ErrorResponse('未授权访问', 401));
      }

      if (!teamId) {
        return res.status(400).json(new ErrorResponse('缺少团队ID', 400));
      }

      const hasPermission = await teamService.userHasTeamPermission(teamId, userId, requiredPermission);

      if (!hasPermission) {
        return res.status(403).json(new ErrorResponse(`缺少必要权限: ${requiredPermission}`, 403));
      }

      next();
    } catch (error) {
      console.error('团队权限验证失败:', error);
      return res.status(500).json(new ErrorResponse('服务器内部错误', 500));
    }
  };
};

/**
 * 在请求中添加团队信息
 * 用于在后续处理中访问团队数据
 */
export const attachTeamInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = req.params.teamId || req.body.teamId;

    if (!teamId) {
      return next();
    }

    const team = await teamService.getTeamById(teamId);

    if (team) {
      req.team = team;
    }

    next();
  } catch (error) {
    console.error('加载团队信息失败:', error);
    // 继续处理，不中断请求
    next();
  }
};
