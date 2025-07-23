/**
 * api.ts的模拟实现
 * 用于解决Jest测试中axios ESM模块的导入问题
 */

const mockapiService: any = {
  get: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  post: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  put: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  delete: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  patch: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  create: jest.fn().mockImplementation(() => mockapiService),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  },
  defaults: {
    baseURL: '',
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {}
    },
    timeout: 0
  }
};

export default mockapiService;
