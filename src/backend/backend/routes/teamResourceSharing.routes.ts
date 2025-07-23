// 团队资源共享路由配置
import express from 'express';
import TeamResourceSharingController from '../controllers/teamResourceSharing.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 所有资源共享路由都需要认证
router.use(authenticate);

// 创建资源共享
router.post(
  '/',
  TeamResourceSharingController.validateCreateSharing(),
  TeamResourceSharingController.createResourceSharing
);

// 获取资源的共享配置列表
router.get(
  '/resource/:resourceId',
  TeamResourceSharingController.getResourceSharings
);

// 更新资源共享配置
router.put(
  '/:sharingId',
  TeamResourceSharingController.validateUpdateSharing(),
  TeamResourceSharingController.updateResourceSharing
);

// 删除资源共享
router.delete(
  '/:sharingId',
  TeamResourceSharingController.deleteResourceSharing
);

// 处理资源共享请求（接受/拒绝）
router.post(
  '/process-request/:requestId',
  TeamResourceSharingController.validateProcessShareRequest(),
  TeamResourceSharingController.processShareRequest
);

// 获取用户可访问的共享资源
router.get(
  '/shared-with-me',
  TeamResourceSharingController.getSharedResources
);

// 创建资源共享邀请
router.post(
  '/invitations',
  TeamResourceSharingController.validateCreateShareInvitation(),
  TeamResourceSharingController.createShareInvitation
);

// 处理资源共享邀请（接受/拒绝）
router.post(
  '/invitations/:invitationId/process',
  TeamResourceSharingController.validateProcessShareInvitation(),
  TeamResourceSharingController.processShareInvitation
);

// 获取用户的所有邀请
router.get(
  '/invitations',
  TeamResourceSharingController.getUserInvitations
);

// 检查资源访问权限
router.post(
  '/check-access',
  TeamResourceSharingController.checkResourceAccess
);

// 获取资源访问日志
router.get(
  '/access-logs/:resourceId',
  TeamResourceSharingController.getResourceAccessLogs
);

// 获取团队访问日志
router.get(
  '/team-access-logs/:teamId',
  TeamResourceSharingController.getTeamAccessLogs
);

export default router;
