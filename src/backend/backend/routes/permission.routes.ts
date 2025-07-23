import express from 'express';
import { requirePermission } from '../middleware/permission';
import permissionController from '../controllers/permission.controller';
import { ResourceType, PermissionAction } from '../models/permission.model';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 所有权限路由都需要认证
router.use(authenticate);

/**
 * @route GET /api/permissions/check
 * @desc 检查用户是否拥有特定权限
 * @access 私有
 */
router.get('/check', permissionController.checkPermission);

/**
 * @route GET /api/permissions/user
 * @desc 获取当前用户所有权限
 * @access 私有
 */
router.get('/user', permissionController.getUserPermissions);

/**
 * @route GET /api/permissions/resources/:resourceType/:resourceId
 * @desc 获取资源的权限配置
 * @access 私有 (需要资源管理权限)
 */
router.get(
  '/resources/:resourceType/:resourceId',
  permissionController.getResourcePermissions
);

/**
 * @route PUT /api/permissions/resources/:resourceType/:resourceId
 * @desc 更新资源的权限配置
 * @access 私有 (需要资源管理权限)
 */
router.put(
  '/resources/:resourceType/:resourceId',
  permissionController.updateResourcePermissions
);

/**
 * @route POST /api/permissions
 * @desc 创建新权限
 * @access 私有 (需要权限管理权限)
 */
router.post(
  '/',
  requirePermission(ResourceType.SETTING, PermissionAction.MANAGE),
  permissionController.createPermission
);

/**
 * @route DELETE /api/permissions/:id
 * @desc 删除权限
 * @access 私有 (需要权限管理权限)
 */
router.delete(
  '/:id',
  requirePermission(ResourceType.SETTING, PermissionAction.MANAGE),
  permissionController.deletePermission
);

/**
 * @route POST /api/permissions/rules
 * @desc 创建权限规则
 * @access 私有 (需要权限管理权限)
 */
router.post(
  '/rules',
  requirePermission(ResourceType.SETTING, PermissionAction.MANAGE),
  permissionController.createPermissionRule
);

/**
 * @route GET /api/permissions/rules
 * @desc 获取所有权限规则
 * @access 私有 (需要权限管理权限)
 */
router.get(
  '/rules',
  requirePermission(ResourceType.SETTING, PermissionAction.MANAGE),
  permissionController.getPermissionRules
);

/**
 * @route GET /api/permissions/rules/:id
 * @desc 获取特定权限规则
 * @access 私有 (需要权限管理权限)
 */
router.get(
  '/rules/:id',
  requirePermission(ResourceType.SETTING, PermissionAction.MANAGE),
  permissionController.getPermissionRule
);

/**
 * @route DELETE /api/permissions/rules/:id
 * @desc 删除权限规则
 * @access 私有 (需要权限管理权限)
 */
router.delete(
  '/rules/:id',
  requirePermission(ResourceType.SETTING, PermissionAction.MANAGE),
  permissionController.deletePermissionRule
);

/**
 * @route POST /api/permissions/rules/:id/apply
 * @desc 应用权限规则到资源
 * @access 私有 (需要权限管理权限)
 */
router.post(
  '/rules/:id/apply',
  permissionController.applyRuleToResource
);

export default router;
