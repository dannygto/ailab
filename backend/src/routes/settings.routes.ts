import express from 'express';
import settingsController from '../controllers/settings.controller';

const router = express.Router();

/**
 * 系统设置路由
 * 
 * 提供系统设置相关的API端点
 * 包括: 通用设置、主题设置、数据设置的获取和更新
 */

// 获取所有设置
router.get('/', settingsController.getAllSettings);

// 通用设置
router.get('/general', settingsController.getGeneralSettings);
router.put('/general', settingsController.updateGeneralSettings);

// 主题设置
router.get('/theme', settingsController.getThemeSettings);
router.put('/theme', settingsController.updateThemeSettings);

// 数据设置
router.get('/data', settingsController.getDataSettings);
router.put('/data', settingsController.updateDataSettings);

// 重置所有设置
router.post('/reset', settingsController.resetAllSettings);

export default router;
