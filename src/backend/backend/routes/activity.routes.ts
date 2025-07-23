// 活动记录路由
import express from 'express';
import activityController from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';
import { checkTeamAccess } from '../middleware/teamAccess';

const router = express.Router();

// 所有活动记录路由都需要认证
router.use(authenticate);

// 获取团队活动记录
router.get(
  '/teams/:teamId/activities',
  checkTeamAccess(),
  activityController.getTeamActivities
);

// 获取资源相关活动记录
router.get(
  '/teams/:teamId/resources/:resourceType/:resourceId/activities',
  checkTeamAccess(),
  activityController.getResourceActivities
);

// 获取用户在团队中的活动记录
router.get(
  '/teams/:teamId/users/:userId/activities',
  checkTeamAccess(),
  activityController.getUserActivitiesInTeam
);

// 创建活动记录（内部API，仅供系统使用）
router.post(
  '/activities',
  activityController.createActivity
);

export default router;
