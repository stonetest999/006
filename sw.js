const CACHE_NAME = 'order-image-generator-v5'; // 更新版本號以清除舊快取
const urlsToCache = [
    '/',                // 根目錄
    '/index.html',      // 主頁面
    '/script.js',       // 主要邏輯
    '/manifest.json'    // Manifest 文件
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching files:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('Cache failed:', err))
    );
    self.skipWaiting(); // 立即激活新版本
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('從快取提供:', event.request.url);
                    return response;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return caches.match('/index.html');
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        console.log('離線模式，返回快取頁面:', event.request.url);
                        return caches.match('/index.html');
                    });
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('刪除舊快取:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 立即控制頁面
    );
});