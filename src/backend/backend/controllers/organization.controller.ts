/**
 * 组织相关API控制器
 */
import { Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import organizationService from '../services/organization.service';
import { validateRequest } from '../middleware/validation';
import { BadRequestError } from '../utils/errors';

class OrganizationController {
  /**
   * 验证创建组织的请求数据
   */
  validateCreateOrganization() {
    return [
      body('name').notEmpty().withMessage('组织名称是必填的'),
      body('type').notEmpty().withMessage('组织类型是必填的'),
      validateRequest
    ];
  }

  /**
   * 验证更新组织的请求数据
   */
  validateUpdateOrganization() {
    return [
      param('orgId').isMongoId().withMessage('无效的组织ID'),
      body('name').optional().notEmpty().withMessage('组织名称不能为空'),
      validateRequest
    ];
  }

  /**
   * 创建新组织
   */
  async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationData = {
        name: req.body.name,
        type: req.body.type,
        code: req.body.code,
        description: req.body.description,
        logo: req.body.logo,
        parent: req.body.parent,
        settings: req.body.settings
      };

      const createdBy = req.user?.id;
      if (!createdBy) {
        throw new BadRequestError('未找到用户信息');
      }

      const organization = await organizationService.createOrganization(organizationData, createdBy);

      res.status(201).json({
        success: true,
        data: organization
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取组织详情
   */
  async getOrganizationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('未找到用户信息');
      }

      const organization = await organizationService.getOrganizationById(orgId, userId);

      res.status(200).json({
        success: true,
        data: organization
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新组织信息
   */
  async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('未找到用户信息');
      }

      const organizationData = {
        name: req.body.name,
        description: req.body.description,
        logo: req.body.logo,
        code: req.body.code,
        settings: req.body.settings
      };

      const organization = await organizationService.updateOrganization(
        orgId,
        organizationData,
        userId
      );

      res.status(200).json({
        success: true,
        data: organization
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取组织层级结构
   */
  async getOrganizationHierarchy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('未找到用户信息');
      }

      const { rootId } = req.query;
      const hierarchy = await organizationService.getOrganizationHierarchy(
        rootId as string,
        userId
      );

      res.status(200).json({
        success: true,
        data: hierarchy
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户所属的组织
   */
  async getUserOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('未找到用户信息');
      }

      const organizations = await organizationService.getUserOrganizations(userId);

      res.status(200).json({
        success: true,
        data: organizations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加组织成员
   */
  validateAddMember() {
    return [
      param('orgId').isMongoId().withMessage('无效的组织ID'),
      body('userId').notEmpty().withMessage('用户ID是必填的'),
      validateRequest
    ];
  }

  /**
   * 添加组织成员
   */
  async addOrganizationMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = req.params;
      const { userId } = req.body;
      const requesterId = req.user?.id;

      if (!requesterId) {
        throw new BadRequestError('未找到用户信息');
      }

      const organization = await organizationService.addOrganizationMember(
        orgId,
        userId,
        requesterId
      );

      res.status(200).json({
        success: true,
        data: organization
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 移除组织成员
   */
  async removeOrganizationMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId, memberId } = req.params;
      const requesterId = req.user?.id;

      if (!requesterId) {
        throw new BadRequestError('未找到用户信息');
      }

      const organization = await organizationService.removeOrganizationMember(
        orgId,
        memberId,
        requesterId
      );

      res.status(200).json({
        success: true,
        data: organization
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 设置组织管理员
   */
  async setOrganizationManager(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId, userId } = req.params;
      const requesterId = req.user?.id;

      if (!requesterId) {
        throw new BadRequestError('未找到用户信息');
      }

      const organization = await organizationService.setOrganizationManager(
        orgId,
        userId,
        requesterId
      );

      res.status(200).json({
        success: true,
        data: organization
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 移除组织管理员
   */
  async removeOrganizationManager(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId, userId } = req.params;
      const requesterId = req.user?.id;

      if (!requesterId) {
        throw new BadRequestError('未找到用户信息');
      }

      const organization = await organizationService.removeOrganizationManager(
        orgId,
        userId,
        requesterId
      );

      res.status(200).json({
        success: true,
        data: organization
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 归档组织
   */
  async archiveOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new BadRequestError('未找到用户信息');
      }

      await organizationService.archiveOrganization(orgId, userId);

      res.status(200).json({
        success: true,
        message: '组织已归档'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrganizationController();
