// 全局测试设置 - 在所有测试开始前运行
export default async function globalSetup() {
  console.log('🧪 启动后端测试环境...');
  
  // 设置测试数据库连接
  process.env.NODE_ENV = 'test';
  
  // 这里可以添加测试数据库初始化逻辑
  // 例如：创建测试数据库、运行迁移等
  
  console.log('✅ 后端测试环境准备完成');
}
