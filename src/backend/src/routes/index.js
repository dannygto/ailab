import express from 'express';
import systemRoutes from './system.routes.js';
import healthRoutes from './health.routes.js';
import schoolRoutes from './school.routes.js';

const router = express.Router();

// 注册路由
router.use('/system', systemRoutes);
router.use('/health', healthRoutes);
router.use('/schools', schoolRoutes);

export default router;
