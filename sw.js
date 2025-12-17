const CACHE_NAME = 'abacus-academy-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/core/router.js',
    './js/core/state.js',
    './js/core/audio.js',
    './js/core/utils.js',
    './js/components/abacus.js',
    './js/components/header.js',
    './js/views/home.js',
    './js/views/practice.js',
    './js/views/flash.js',
    './js/views/audio.js',
    './js/views/worksheet.js',
    './js/views/leaderboard.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&family=Noto+Sans+TC:wght@400;500;700&display=swap'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all: app shell and content');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 攔截請求
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果快取中有，直接返回
                if (response) {
                    return response;
                }
                // 否則發起網絡請求
                return fetch(event.request).then(
                    (response) => {
                        // 檢查回應是否有效
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 將請求加入快取 (動態快取)
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// 更新 Service Worker
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
