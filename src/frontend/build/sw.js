/**
 * AICAM平台增强版Service Worker
 * 版本: 2.0.0
 * 日期: 2025-06-25
 * 
 * 功能特性:
 * - 高级缓存策略(静态资源、API请求、动态内容)
 * - 请求失败智能处理和降级
 * - 精确的缓存版本控制和更新机制
 * - 网络状态感知和离线模式支持
 * - 后台同步和推送通知支持
 * - 性能优化和错误监控
 */

// 缓存名称和版本管理
const CACHE_VERSION = '2.0.0';
const STATIC_CACHE_NAME = `aicam-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `aicam-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `aicam-api-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `aicam-images-${CACHE_VERSION}`;

// 需要预缓存的静态资源列表
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html', // 离线页面
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/media/logo.png'
];

// 调试模式标志
const DEBUG = false;

// 日志函数
const log = (message, ...args) => {
  if (DEBUG) {
    console.log(`[ServiceWorker] ${message}`, ...args);
  }
};

// 错误日志函数
const logError = (message, ...args) => {
  console.error(`[ServiceWorker Error] ${message}`, ...args);
};

// 定义缓存配置 - 不同路径采用不同缓存策略
const CACHE_STRATEGIES = [
  { 
    urlPattern: /\/static\//, 
    strategy: 'cache-first',  // 静态资源采用缓存优先策略
    cacheName: STATIC_CACHE_NAME,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
  },
  { 
    urlPattern: /\/api\//, 
    strategy: 'network-first', // API请求采用网络优先策略
    cacheName: API_CACHE_NAME,
    maxAgeSeconds: 10 * 60, // 10分钟
  },
  { 
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/, 
    strategy: 'cache-first',  // 图片采用缓存优先策略
    cacheName: IMAGE_CACHE_NAME,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
  },
  { 
    urlPattern: /https:\/\/fonts\.googleapis\.com\//, 
    strategy: 'cache-first',
    cacheName: STATIC_CACHE_NAME,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
  }
];

// 获取指定URL应该使用的缓存策略
const getStrategyForUrl = (url) => {
  const urlString = url.toString();
  
  for (const strategy of CACHE_STRATEGIES) {
    if (strategy.urlPattern.test(urlString)) {
      return strategy;
    }
  }
  
  // 默认策略
  return {
    strategy: 'network-first',
    cacheName: DYNAMIC_CACHE_NAME,
    maxAgeSeconds: 60 * 60 // 1小时
  };
};

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
  log('Installing Service Worker...');
  
  // 跳过等待，立即激活
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS)
          .then(() => log('Static assets cached successfully'))
          .catch((error) => {
            logError('Failed to cache static assets', error);
            // 继续安装过程，即使某些资源缓存失败
            return Promise.resolve();
          });
      })
      .catch((error) => {
        logError('Service Worker installation failed', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  log('Activating Service Worker...');
  
  // 清理旧版本缓存
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 检查是否是当前版本的缓存
            if (
              cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME
            ) {
              log('Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        log('Service Worker activated, claiming clients...');
        return self.clients.claim();
      })
      .catch((error) => {
        logError('Service Worker activation failed', error);
      })
  );
});

// 应用缓存策略处理请求
const applyStrategy = async (request, strategy) => {
  const { strategy: strategyName, cacheName } = strategy;
  
  // 缓存优先策略
  if (strategyName === 'cache-first') {
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        log('Cache hit for:', request.url);
        return cachedResponse;
      }
      
      log('Cache miss for:', request.url);
      return fetchAndCache(request, cacheName);
    } catch (error) {
      logError('Cache-first strategy failed:', error);
      return fetchWithFallback(request);
    }
  }
  
  // 网络优先策略
  if (strategyName === 'network-first') {
    try {
      return await fetchAndCache(request, cacheName);
    } catch (error) {
      log('Network request failed, falling back to cache for:', request.url);
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 如果是HTML请求，返回离线页面
      if (request.headers.get('Accept').includes('text/html')) {
        return caches.match('/offline.html');
      }
      
      throw error;
    }
  }
  
  // 仅网络策略
  if (strategyName === 'network-only') {
    return fetch(request);
  }
  
  // 仅缓存策略
  if (strategyName === 'cache-only') {
    return caches.match(request);
  }
  
  // 默认为网络优先
  return fetchWithFallback(request);
};

// 获取并缓存资源
const fetchAndCache = async (request, cacheName) => {
  try {
    const response = await fetch(request);
    
    // 只缓存成功的响应
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }
    
    const responseToCache = response.clone();
    
    // 异步缓存响应
    caches.open(cacheName)
      .then((cache) => {
        cache.put(request, responseToCache);
        log('Cached new response for:', request.url);
      })
      .catch((error) => {
        logError('Failed to cache response for:', request.url, error);
      });
    
    return response;
  } catch (error) {
    throw error;
  }
};

// 带有降级处理的获取
const fetchWithFallback = async (request) => {
  try {
    return await fetch(request);
  } catch (error) {
    // 静默处理网络错误，避免控制台刷屏
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      // 检查是否是HTML请求
      if (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
        return caches.match('/offline.html');
      }
      
      // 对于API请求，返回一个友好的错误响应
      if (request.url.includes('/api/')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Service unavailable',
            message: 'Backend service is not available. Please start the backend server.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // 对于图片请求，可以返回一个占位图
      if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return caches.match('/static/media/placeholder.png');
      }
    }
    
    // 其他类型的错误仍然记录
    log('Network request failed for:', request.url, error.message);
    throw error;
  }
};

// 拦截请求事件
self.addEventListener('fetch', (event) => {
  // 跳过不支持的请求方法
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 根据URL获取合适的缓存策略
  const strategy = getStrategyForUrl(event.request.url);
  
  event.respondWith(
    applyStrategy(event.request, strategy)
      .catch((error) => {
        // 静默处理常见的网络错误
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          // 最终降级 - 返回通用离线响应
          if (event.request.headers.get('Accept') && event.request.headers.get('Accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
          
          return new Response('Service temporarily unavailable. Please try again later.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        // 其他错误仍然记录
        logError('Error in fetch handler:', error);
        throw error;
      })
  );
});

// 处理推送通知
self.addEventListener('push', (event) => {
  log('Push notification received:', event);
  
  if (!event.data) {
    log('Push event has no data');
    return;
  }
  
  try {
    const data = event.data.json();
    
    const title = data.title || 'AICAM平台';
    const options = {
      body: data.body || '有新消息',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    logError('Failed to process push notification:', error);
  }
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
  log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientsList) => {
        // 如果已经有打开的窗口，则切换到该窗口
        for (const client of clientsList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 否则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// 后台同步事件
self.addEventListener('sync', (event) => {
  log('Sync event received:', event.tag);
  
  if (event.tag === 'sync-experiments') {
    event.waitUntil(syncExperiments());
  }
});

// 实验数据同步函数
const syncExperiments = async () => {
  try {
    const db = await openIndexedDB();
    const pendingExperiments = await db.getAll('pendingExperiments');
    
    for (const experiment of pendingExperiments) {
      try {
        const response = await fetch('/api/experiments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(experiment.data)
        });
        
        if (response.ok) {
          await db.delete('pendingExperiments', experiment.id);
          log('Successfully synced experiment:', experiment.id);
        } else {
          logError('Failed to sync experiment:', experiment.id);
        }
      } catch (error) {
        logError('Error syncing experiment:', experiment.id, error);
      }
    }
  } catch (error) {
    logError('Failed to sync experiments:', error);
  }
};

// 打开IndexedDB
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('aicam-offline-db', 1);
    
    request.onerror = (event) => {
      reject(new Error('Failed to open IndexedDB'));
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      resolve({
        getAll: (storeName) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        },
        delete: (storeName, id) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }
      });
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingExperiments')) {
        db.createObjectStore('pendingExperiments', { keyPath: 'id' });
      }
    };
  });
};

// 报告错误到服务器
const reportError = async (error, context = {}) => {
  try {
    await fetch('/api/log/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message || 'Unknown error',
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: self.navigator ? self.navigator.userAgent : 'ServiceWorker'
      })
    });
  } catch (e) {
    // 如果报告错误失败，只记录到控制台
    logError('Failed to report error to server:', e);
  }
};

// 发送心跳检查，确保Service Worker活跃
const sendHeartbeat = async () => {
  try {
    const response = await fetch('/api/heartbeat/sw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: CACHE_VERSION,
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      log('Heartbeat sent successfully');
    } else {
      log('Heartbeat failed with status:', response.status);
    }
  } catch (error) {
    // 静默处理心跳错误，避免控制台刷屏
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      // 后端服务未启动，这是正常情况，不记录错误
      return;
    }
    logError('Failed to send heartbeat:', error);
  }
};

// 设置心跳检查计时器
setInterval(sendHeartbeat, 30 * 60 * 1000); // 30分钟

// 向客户端发送消息
const sendMessageToClients = (message) => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
};

// 响应消息事件
self.addEventListener('message', (event) => {
  log('Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: CACHE_VERSION
    });
  }
});

log('Service Worker loaded - Version', CACHE_VERSION);
