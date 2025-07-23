// 活动记录控制器
import { Request, Response, NextFunction } from 'express';
import activityService from '../services/activity.service';
import { ActivityType, ResourceType } from '../models/activity.model';
import { CustomError } from '../utils/errors';

class ActivityController {
  /**
   * 获取团队活动记录
   */
  async getTeamActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const {
        limit = 20,
        page = 1,
        activityType,
        resourceType,
        userId,
        resourceId,
        startDate,
        endDate
      } = req.query;

      const pageSize = parseInt(limit as string, 10);
      const skip = (parseInt(page as string, 10) - 1) * pageSize;

      // 处理过滤条件
      const filter: {
        activityType?: ActivityType[];
        resourceType?: ResourceType[];
        userId?: string;
        resourceId?: string;
        startDate?: Date;
        endDate?: Date;
      } = {};

      if (activityType) {
        filter.activityType = (activityType as string).split(',') as ActivityType[];
      }

      if (resourceType) {
        filter.resourceType = (resourceType as string).split(',') as ResourceType[];
      }

      if (userId) {
        filter.userId = userId as string;
      }

      if (resourceId) {
        filter.resourceId = resourceId as string;
      }

      if (startDate) {
        filter.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filter.endDate = new Date(endDate as string);
      }

      const result = await activityService.getTeamActivities(teamId, {
        limit: pageSize,
        skip,
        filter
      });

      return res.json({
        status: 'success',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取资源相关活动记录
   */
  async getResourceActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, resourceType, resourceId } = req.params;
      const { limit = 20, page = 1 } = req.query;

      const pageSize = parseInt(limit as string, 10);
      const skip = (parseInt(page as string, 10) - 1) * pageSize;

      const result = await activityService.getResourceActivities(
        teamId,
        resourceType as ResourceType,
        resourceId,
        {
          limit: pageSize,
          skip
        }
      );

      return res.json({
        status: 'success',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户在团队中的活动记录
   */
  async getUserActivitiesInTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, userId } = req.params;
      const { limit = 20, page = 1 } = req.query;

      const pageSize = parseInt(limit as string, 10);
      const skip = (parseInt(page as string, 10) - 1) * pageSize;

      const result = await activityService.getUserActivitiesInTeam(
        teamId,
        userId,
        {
          limit: pageSize,
          skip
        }
      );

      return res.json({
        status: 'success',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建活动记录（内部使用）
   */
  async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activityData = req.body;

      if (!activityData.team || !activityData.user || !activityData.activityType) {
        throw new CustomError('缺少必要的活动记录字段', 400);
      }

      const activity = await activityService.createActivity(activityData);

      return res.status(201).json({
        status: 'success',
        data: activity
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ActivityController();
