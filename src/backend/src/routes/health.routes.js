/**
 * 健康检查路由
 * 用于监控和诊断API服务状态
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/health - 健康检查端点
router.get('/', async (req, res) => {
  try {
    // 检查数据库连接
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // 构造响应
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'unknown'
      },
      api: {
        version: process.env.API_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
    
    // 返回健康状态
    res.status(200).json(healthData);
  } catch (error) {
    // 返回错误状态
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : null
    });
  }
});

// GET /api/health/db - 数据库连接状态检查
router.get('/db', async (req, res) => {
  try {
    // 检查数据库连接
    const dbState = mongoose.connection.readyState;
    let dbStatus;
    
    switch (dbState) {
      case 0: dbStatus = 'disconnected'; break;
      case 1: dbStatus = 'connected'; break;
      case 2: dbStatus = 'connecting'; break;
      case 3: dbStatus = 'disconnecting'; break;
      default: dbStatus = 'unknown';
    }
    
    // 尝试执行一个简单的数据库操作
    let pingResult = null;
    if (dbState === 1) {
      try {
        // 尝试ping数据库
        pingResult = await mongoose.connection.db.admin().ping();
      } catch (dbError) {
        console.error('数据库Ping失败:', dbError);
      }
    }
    
    // 返回数据库状态
    res.status(dbState === 1 ? 200 : 503).json({
      status: dbState === 1 ? 'ok' : 'error',
      database: {
        state: dbState,
        status: dbStatus,
        url: process.env.NODE_ENV === 'development' ? 
            mongoose.connection.host : 'hidden in production',
        name: mongoose.connection.name || 'unknown',
        ping: pingResult ? 'success' : 'failed'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// GET /api/health/config - API配置检查
router.get('/config', (req, res) => {
  // 安全地返回配置信息，过滤敏感信息
  const safeConfig = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    // 不返回数据库URL和密钥等敏感信息
  };
  
  res.status(200).json(safeConfig);
});

module.exports = router;
