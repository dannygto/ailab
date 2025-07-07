import { Router } from 'express';
import resourceController from '../controllers/resource.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * 实验资源路由
 */

// 获取资源列表
// GET /api/resources?type=physics_experiment&category=basic_equipment&search=光学
router.get('/resources', authenticateUser, resourceController.getResources);

// 获取单个资源
// GET /api/resources/:id
router.get('/resources/:id', authenticateUser, resourceController.getResource);

// 创建新资源
// POST /api/resources
router.post('/resources', authenticateUser, resourceController.createResource);

// 更新资源
// PUT /api/resources/:id
router.put('/resources/:id', authenticateUser, resourceController.updateResource);

// 删除资源
// DELETE /api/resources/:id
router.delete('/resources/:id', authenticateUser, resourceController.deleteResource);

export default router;
