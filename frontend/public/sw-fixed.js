const CACHE_NAME = 'ai-experiment-platform-v1.0.2';
const STATIC_CACHE = 'static-v1.0.2';
const DYNAMIC_CACHE = 'dynamic-v1.0.2';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo18060.png'
];

// 需要缓存的API路径
const CACHE_API_PATTERNS = [
  /^\/api\/experiments/,
  /^\/api\/devices/,
  /^\/api\/users/,
  /^\/api\/guidance/
];

// Service Worker安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中... 版本 v1.0.2');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] 缓存静态资源...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] 静态资源缓存完成');
        return self.skipWaiting(); // 强制激活新的SW
      })
      .catch((error) => {
        console.error('[SW] 静态资源缓存失败:', error);
      })
  );
});

// Service Worker激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] 激活完成');
        return self.clients.claim(); // 立即控制所有客户端
      })
  );
});

// Service Worker fetch事件 - 网络请求拦截，修复了网络错误问题
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }

  // 跳过API请求的拦截，避免Failed to fetch错误
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // HTML页面请求 - 网络优先，离线时使用缓存
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 缓存成功响应
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 网络失败时从缓存获取
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/');
            });
        })
    );
    return;
  }

  // 静态资源请求 - 缓存优先，但简化错误处理
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                // 只缓存成功的响应
                const responseClone = response.clone();
                caches.open(STATIC_CACHE).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              // 失败时返回空响应而不是抛出错误
              console.log('[SW] 无法获取资源:', request.url);
              return new Response(null, {
                status: 404,
                statusText: 'Not Found'
              });
            });
        })
    );
    return;
  }
});

// Service Worker消息事件
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data && data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data && data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 简化版的推送通知事件
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '您有新的通知',
      icon: '/logo18060.png',
      badge: '/favicon.ico'
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '人工智能辅助实验平台', options)
    );
  } catch (e) {
    console.error('[SW] 处理推送通知时出错:', e);
  }
});

// 简化版的通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
  );
});

console.log('[SW] Service Worker 已加载');
