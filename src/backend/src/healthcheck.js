/**
 * 注册健康检查路由
 * 
 * 将此文件导入到主应用中以启用健康检查API
 */

module.exports = function(app) {
  // 导入健康检查路由
  const healthRoutes = require('./routes/health.routes');
  
  // 注册健康检查路由
  app.use('/api/health', healthRoutes);
  
  console.log('健康检查API已注册 - 访问 /api/health 检查服务状态');
};
