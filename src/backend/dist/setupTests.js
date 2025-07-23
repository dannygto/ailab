import 'jest';
jest.setTimeout(10000);
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'ai_experiment_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
beforeEach(() => {
    jest.clearAllMocks();
});
afterEach(() => {
    jest.restoreAllMocks();
});
//# sourceMappingURL=setupTests.js.map