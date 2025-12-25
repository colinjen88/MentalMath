/**
 * Bottom Navigation Component
 * 底部導航列元件 (Mobile Only)
 * 
 * @module components/bottom-nav
 */

import AppState from '../core/state.js';
import Router from '../core/router.js';

/**
 * 渲染底部導航列
 * @returns {string} HTML 字串
 */
export function renderBottomNav() {
    try {
        // 檢查當前路徑是否有 hideHeader 標記 (通常也隱藏 Bottom Nav)
        const isHidden = Router.isRouteHidden && Router.isRouteHidden();
        
        if (isHidden) {
            return '';
        }

        const currentView = AppState.get('currentView');
        
        const navItems = [
            { id: 'home', icon: '🏠', label: '大廳' },
            { id: 'practice', icon: '🧮', label: '練功' },
            { id: 'flash', icon: '⚡', label: '閃電' },
            { id: 'leaderboard', icon: '🏆', label: '榜單' },
            { id: 'profile', icon: '👤', label: '我的' },
        ];
        
        const navHTML = navItems.map(item => `
            <button 
                onclick="window.navigateTo('${item.id}')"
                class="bottom-nav-item ${currentView === item.id ? 'active' : ''}"
                data-view="${item.id}"
            >
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
            </button>
        `).join('');
        
        return `
            <nav class="bottom-nav">
                ${navHTML}
            </nav>
        `;
    } catch (e) {
        console.error('RenderBottomNav Error:', e);
        return '';
    }
}

/**
 * 初始化底部導航事件
 * (目前依賴全域 window.navigateTo，所以只需重繪)
 */
export function initBottomNavEvents() {
    // 這裡可以加入特定的動畫或互動邏輯
}

export default {
    renderBottomNav,
    initBottomNavEvents,
};
