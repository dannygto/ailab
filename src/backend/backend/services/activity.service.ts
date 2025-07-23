// 活动记录服务
import { FilterQuery } from 'mongoose';
import Activity, { ActivityType, ResourceType, ActivityDocument, IActivity } from '../models/activity.model';
import { CustomError } from '../utils/errors';

class ActivityService {
  /**
   * 创建活动记录
   */
  async createActivity(activityData: Omit<IActivity, 'createdAt'>) {
    try {
      const activity = new Activity({
        ...activityData,
        createdAt: new Date()
      });
      return await activity.save();
    } catch (error) {
      throw new CustomError('活动记录创建失败', 500, error);
    }
  }

  /**
   * 根据团队ID获取活动列表
   */
  async getTeamActivities(teamId: string, options: {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    filter?: {
      activityType?: ActivityType[];
      resourceType?: ResourceType[];
      userId?: string;
      resourceId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  } = {}) {
    try {
      const { limit = 20, skip = 0, sort = { createdAt: -1 }, filter = {} } = options;

      // 构建查询条件
      const query: FilterQuery<ActivityDocument> = { team: teamId };

      if (filter.activityType && filter.activityType.length) {
        query.activityType = { $in: filter.activityType };
      }

      if (filter.resourceType && filter.resourceType.length) {
        query.resourceType = { $in: filter.resourceType };
      }

      if (filter.userId) {
        query.user = filter.userId;
      }

      if (filter.resourceId) {
        query.resourceId = filter.resourceId;
      }

      // 日期范围过滤
      if (filter.startDate || filter.endDate) {
        query.createdAt = {};

        if (filter.startDate) {
          query.createdAt.$gte = filter.startDate;
        }

        if (filter.endDate) {
          query.createdAt.$lte = filter.endDate;
        }
      }

      // 查询总数
      const total = await Activity.countDocuments(query);

      // 查询活动记录
      const activities = await Activity.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email avatar')
        .exec();

      return {
        data: activities,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new CustomError('获取团队活动记录失败', 500, error);
    }
  }

  /**
   * 获取资源相关的活动记录
   */
  async getResourceActivities(teamId: string, resourceType: ResourceType, resourceId: string, options: {
    limit?: number;
    skip?: number;
  } = {}) {
    try {
      const { limit = 20, skip = 0 } = options;

      const query = {
        team: teamId,
        resourceType,
        resourceId
      };

      const total = await Activity.countDocuments(query);

      const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email avatar')
        .exec();

      return {
        data: activities,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new CustomError('获取资源活动记录失败', 500, error);
    }
  }

  /**
   * 获取用户在团队中的活动记录
   */
  async getUserActivitiesInTeam(teamId: string, userId: string, options: {
    limit?: number;
    skip?: number;
  } = {}) {
    try {
      const { limit = 20, skip = 0 } = options;

      const query = {
        team: teamId,
        user: userId
      };

      const total = await Activity.countDocuments(query);

      const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        data: activities,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new CustomError('获取用户活动记录失败', 500, error);
    }
  }

  /**
   * 批量创建活动记录
   */
  async createActivitiesBulk(activities: Omit<IActivity, 'createdAt'>[]) {
    try {
      const docs = activities.map(activity => ({
        ...activity,
        createdAt: new Date()
      }));

      return await Activity.insertMany(docs);
    } catch (error) {
      throw new CustomError('批量创建活动记录失败', 500, error);
    }
  }

  /**
   * 删除团队所有活动记录
   */
  async deleteTeamActivities(teamId: string) {
    try {
      return await Activity.deleteMany({ team: teamId });
    } catch (error) {
      throw new CustomError('删除团队活动记录失败', 500, error);
    }
  }
}

export default new ActivityService();
