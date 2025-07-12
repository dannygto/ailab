// 全局测试清理 - 在所有测试结束后运行
export default async function globalTeardown() {
  console.log('🧹 清理后端测试环境...');
  
  // 这里可以添加测试环境清理逻辑
  // 例如：断开数据库连接、清理测试数据等
  
  console.log('✅ 后端测试环境清理完成');
}
