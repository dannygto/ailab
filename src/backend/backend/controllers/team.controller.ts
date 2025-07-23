// 团队API控制器
import { Request, Response, NextFunction } from 'express';
import TeamService from '../services/team.service';
import { TeamMemberRole } from '../models/team.model';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

/**
 * 团队控制器类，处理团队相关的API请求
 */
class TeamController {
  /**
   * 创建新团队
   */
  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const teamData = {
        name: req.body.name,
        description: req.body.description,
        avatar: req.body.avatar,
        settings: req.body.settings
      };

      const team = await TeamService.createTeam(teamData, userId);
      res.status(201).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取团队详情
   */
  async getTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;

      const team = await TeamService.getTeamById(teamId, userId);
      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户所属的所有团队
   */
  async getUserTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const teams = await TeamService.getUserTeams(userId);

      res.status(200).json({
        success: true,
        data: teams
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新团队信息
   */
  async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        avatar: req.body.avatar,
        settings: req.body.settings
      };

      const team = await TeamService.updateTeam(teamId, updateData, userId);
      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加团队成员
   */
  async addTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const { email, role } = req.body;
      const inviterId = req.user?.id;

      const team = await TeamService.addTeamMember(
        teamId,
        email,
        role as TeamMemberRole,
        inviterId
      );

      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新团队成员角色
   */
  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, memberId } = req.params;
      const { role } = req.body;
      const updaterId = req.user?.id;

      const team = await TeamService.updateMemberRole(
        teamId,
        memberId,
        role as TeamMemberRole,
        updaterId
      );

      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 移除团队成员
   */
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, memberId } = req.params;
      const removerId = req.user?.id;

      const team = await TeamService.removeMember(teamId, memberId, removerId);
      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 归档团队
   */
  async archiveTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;

      const team = await TeamService.archiveTeam(teamId, userId);
      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 验证创建团队请求
   */
  validateCreateTeam() {
    return [
      body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('团队名称必须在2-50个字符之间'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('团队描述不能超过500个字符'),
      body('settings')
        .optional()
        .isObject()
        .withMessage('设置必须是对象'),
      validateRequest
    ];
  }

  /**
   * 验证更新团队请求
   */
  validateUpdateTeam() {
    return [
      param('teamId')
        .isMongoId()
        .withMessage('无效的团队ID'),
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('团队名称必须在2-50个字符之间'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('团队描述不能超过500个字符'),
      validateRequest
    ];
  }

  /**
   * 验证添加团队成员请求
   */
  validateAddMember() {
    return [
      param('teamId')
        .isMongoId()
        .withMessage('无效的团队ID'),
      body('email')
        .isEmail()
        .withMessage('请提供有效的邮箱地址'),
      body('role')
        .isIn(Object.values(TeamMemberRole))
        .withMessage('无效的角色'),
      validateRequest
    ];
  }

  /**
   * 验证更新成员角色请求
   */
  validateUpdateRole() {
    return [
      param('teamId')
        .isMongoId()
        .withMessage('无效的团队ID'),
      param('memberId')
        .isMongoId()
        .withMessage('无效的成员ID'),
      body('role')
        .isIn(Object.values(TeamMemberRole))
        .withMessage('无效的角色'),
      validateRequest
    ];
  }
}

export default new TeamController();
