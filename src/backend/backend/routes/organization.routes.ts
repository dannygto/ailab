/**
 * 组织相关API路由
 */
import express from 'express';
import organizationController from '../controllers/organization.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { ResourceType, PermissionAction } from '../models/permission.model';

const router = express.Router();

// 所有组织路由都需要认证
router.use(authenticate);

// 创建组织
router.post(
  '/',
  requirePermission(ResourceType.ORGANIZATION, PermissionAction.CREATE),
  organizationController.validateCreateOrganization(),
  organizationController.createOrganization
);

// 获取组织详情
router.get(
  '/:orgId',
  organizationController.getOrganizationById
);

// 更新组织
router.put(
  '/:orgId',
  organizationController.validateUpdateOrganization(),
  organizationController.updateOrganization
);

// 获取组织层级结构
router.get(
  '/hierarchy',
  organizationController.getOrganizationHierarchy
);

// 获取用户所属的组织
router.get(
  '/user/organizations',
  organizationController.getUserOrganizations
);

// 添加组织成员
router.post(
  '/:orgId/members',
  organizationController.validateAddMember(),
  organizationController.addOrganizationMember
);

// 移除组织成员
router.delete(
  '/:orgId/members/:memberId',
  organizationController.removeOrganizationMember
);

// 设置组织管理员
router.post(
  '/:orgId/managers/:userId',
  organizationController.setOrganizationManager
);

// 移除组织管理员
router.delete(
  '/:orgId/managers/:userId',
  organizationController.removeOrganizationManager
);

// 归档组织
router.delete(
  '/:orgId',
  organizationController.archiveOrganization
);

export default router;
