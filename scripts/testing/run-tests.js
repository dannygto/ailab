const { execSync } = require('child_process');

console.log('🧪 运行项目测试...');

try {
  // 运行前端测试
  console.log('运行前端测试...');
  execSync('cd 源代码/前端 && npm test -- --passWithNoTests', { stdio: 'inherit' });
  
  // 运行后端测试
  console.log('运行后端测试...');
  execSync('cd 源代码/后端 && npm test', { stdio: 'inherit' });
  
  console.log('✅ 所有测试通过！');
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}
