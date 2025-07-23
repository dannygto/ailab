// 团队路由配置
import express from 'express';
import TeamController from '../controllers/team.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 所有团队路由都需要认证
router.use(authenticate);

// 创建团队
router.post(
  '/',
  TeamController.validateCreateTeam(),
  TeamController.createTeam
);

// 获取用户所属的所有团队
router.get('/my-teams', TeamController.getUserTeams);

// 获取团队详情
router.get(
  '/:teamId',
  TeamController.getTeamById
);

// 更新团队信息
router.put(
  '/:teamId',
  TeamController.validateUpdateTeam(),
  TeamController.updateTeam
);

// 添加团队成员
router.post(
  '/:teamId/members',
  TeamController.validateAddMember(),
  TeamController.addTeamMember
);

// 更新成员角色
router.put(
  '/:teamId/members/:memberId/role',
  TeamController.validateUpdateRole(),
  TeamController.updateMemberRole
);

// 移除团队成员
router.delete(
  '/:teamId/members/:memberId',
  TeamController.removeMember
);

// 归档团队
router.delete(
  '/:teamId',
  TeamController.archiveTeam
);

export default router;
