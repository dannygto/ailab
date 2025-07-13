import express from 'express';
import schoolController from '../controllers/school.controller.js';

const router = express.Router();

/**
 * 校区路由
 *
 * 提供校区管理相关的API端点
 */

// 获取所有校区
router.get('/', schoolController.getAllSchools);

// 获取特定校区
router.get('/:code', schoolController.getSchoolByCode);

// 创建校区
router.post('/', schoolController.createSchool);

// 更新校区
router.put('/:id', schoolController.updateSchool);

// 删除校区
router.delete('/:id', schoolController.deleteSchool);

export default router;
