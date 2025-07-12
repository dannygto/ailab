// 后端测试环境设置
import 'jest';

// 设置测试超时时间
jest.setTimeout(10000);

// 模拟环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'ai_experiment_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';

// 全局测试钩子
beforeEach(() => {
  // 清理模拟数据
  jest.clearAllMocks();
});

afterEach(() => {
  // 测试后清理
  jest.restoreAllMocks();
});
