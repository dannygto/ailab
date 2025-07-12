const express = require('express');
const router = express.Router();

// 导入路由模块
const systemRoutes = require('./system.routes');
const healthRoutes = require('./health.routes');

// 注册路由
router.use('/system', systemRoutes);
router.use('/health', healthRoutes);

module.exports = router;
