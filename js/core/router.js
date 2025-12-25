/**
 * Router Module
 * 簡易 SPA 路由器 - 使用 Hash-based routing
 * 
 * @module core/router
 */

import AppState from './state.js';

const Router = (() => {
    // 路由表
    const routes = new Map();
    
    // 當前路由
    let currentRoute = null;
    
    /**
     * 註冊路由
     * @param {string} path - 路由路徑 (e.g., 'home', 'training', 'worksheet')
     * @param {Object} config - 路由配置
     * @param {string} config.title - 頁面標題
     * @param {Function} config.render - 渲染函數，返回 HTML string
     * @param {Function} [config.onEnter] - 進入路由時的 hook
     * @param {Function} [config.onLeave] - 離開路由時的 hook
     */
    function register(path, config) {
        routes.set(path, {
            title: config.title || '珠心算學院',
            render: config.render,
            onEnter: config.onEnter || (() => {}),
            onLeave: config.onLeave || (() => {}),
        });
    }
    
    /**
     * 導航到指定路由
     * @param {string} path - 目標路由
     * @param {Object} [params] - 路由參數
     */
    function navigate(path, params = {}) {
        // 如果有當前路由，執行 onLeave
        if (currentRoute && routes.has(currentRoute)) {
            routes.get(currentRoute).onLeave();
        }
        
        // 更新 URL hash
        const queryString = Object.keys(params).length 
            ? '?' + new URLSearchParams(params).toString() 
            : '';
        window.location.hash = `#/${path}${queryString}`;
    }
    
    /**
     * 解析當前 hash
     * @returns {Object} { path, params }
     */
    function parseHash() {
        const hash = window.location.hash.slice(2) || 'home'; // 移除 '#/'
        const [path, queryString] = hash.split('?');
        const params = queryString 
            ? Object.fromEntries(new URLSearchParams(queryString)) 
            : {};
        return { path, params };
    }
    
    /**
     * 處理路由變更
     */
    function handleRouteChange() {
        const { path, params } = parseHash();
        
        // 如果路由不存在，回到首頁
        if (!routes.has(path)) {
            console.warn(`Route "${path}" not found, redirecting to home`);
            navigate('home');
            return;
        }
        
        const route = routes.get(path);
        currentRoute = path;
        
        // 更新狀態
        AppState.set('currentView', path);
        
        // 更新頁面標題
        document.title = `${route.title} | 珠心算學院`;
        
        // 執行 onEnter hook
        route.onEnter(params);
        
        // 渲染頁面
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = route.render(params);
        }
        
        // 發送自訂事件，讓其他模組可以響應
        window.dispatchEvent(new CustomEvent('route-changed', { 
            detail: { path, params } 
        }));
    }
    
    /**
     * 初始化路由器
     */
    function init() {
        // 監聽 hashchange 事件
        window.addEventListener('hashchange', handleRouteChange);
        
        // 初始載入
        handleRouteChange();
    }
    
    /**
     * 取得當前路由
     */
    function getCurrentRoute() {
        return currentRoute;
    }
    
    /**
     * 返回上一頁
     */
    function back() {
        window.history.back();
    }
    
    // Public API
    return {
        register,
        navigate,
        init,
        getCurrentRoute,
        back,
        // Expose routes for header/bottom-nav components to check hideHeader
        get routes() {
            return Object.fromEntries(routes);
        },
        get currentRoute() {
            return currentRoute;
        },
        /**
         * Check if current route should hide header
         */
        isRouteHidden() {
            if (!currentRoute || !routes.has(currentRoute)) return false;
            return !!routes.get(currentRoute).hideHeader;
        }
    };
})();

export default Router;
