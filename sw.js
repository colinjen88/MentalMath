const CACHE_NAME = 'abacus-academy-v6';
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
    './js/components/bottom-nav.js',
    './js/views/home.js',
    './js/views/practice.js',
    './js/views/flash.js',
    './js/views/audio.js',
    './js/views/worksheet.js',
    './js/views/leaderboard.js',
    './js/views/splash.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&family=Noto+Sans+TC:wght@400;500;700&display=swap'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
    // 強制立即進入 waiting 狀態
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all: app shell and content');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// ...

// 更新 Service Worker
self.addEventListener('activate', (event) => {
    // 取得頁面控制權
    event.waitUntil(self.clients.claim());
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
