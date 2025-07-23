// setupJest.js - Jest全局设置
// 用于解决axios和其他ESM模块的Jest测试问题

// 确保全局对象可用
global.window = global.window || {};

// 模拟window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn().mockImplementation((key) => {
      if (key === 'theme-mode') return 'light';
      if (key === 'theme') return JSON.stringify({ mode: 'light' });
      return null;
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true,
  configurable: true
});

// 模拟 ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver;

// 处理axios和其他ESM模块问题
// 如果后续有其他ESM模块引起的问题，可以在这里添加更多全局mock

// console.log removed

