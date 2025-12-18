/**
 * Header Component
 * 頂部導航列元件
 * 
 * @module components/header
 */

import AppState from '../core/state.js';
import Router from '../core/router.js';

/**
 * 渲染頂部導航列
 * @returns {string} HTML 字串
 */
export function renderHeader() {
    // 檢查當前路徑是否有 hideHeader 標記
    const currentRoute = Router.currentRoute; 
    const isHidden = Router.routes[currentRoute]?.hideHeader;
    
    if (isHidden) {
        return ''; // 不渲染 Header
    }

    const user = AppState.get('user');
    const currentView = AppState.get('currentView');
    
    // ... existing code ...
    const navItems = [
        { id: 'home', icon: '🏠', label: '大廳' },
        { id: 'practice', icon: '🧮', label: '練功房' },
        { id: 'flash', icon: '⚡', label: '閃電算' },
        { id: 'audio', icon: '🎧', label: '聽算' },
        { id: 'worksheet', icon: '📄', label: '學習單' },
        { id: 'leaderboard', icon: '🏆', label: '排行榜' },
        { id: 'profile', icon: '👤', label: '我的' },
    ];
    
    const navHTML = navItems.map(item => `
        <button 
            onclick="window.navigateTo('${item.id}')"
            class="nav-item ${currentView === item.id ? 'active' : ''}"
            data-view="${item.id}"
        >
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
        </button>
    `).join('');
    
    return `
        <header class="app-header">
            <div class="header-left">
                <h1 class="app-title">🧮 珠心算學院</h1>
            </div>
            <nav class="header-nav">
                ${navHTML}
            </nav>
            <div class="header-right">
                <div class="user-info">
                    <span class="user-avatar">${user.avatar}</span>
                    <div class="user-details">
                        <span class="user-name">${user.name}</span>
                        <span class="user-level">Lv.${user.level}</span>
                    </div>
                    <div class="xp-bar">
                        <div class="xp-fill" style="width: ${(user.xp / user.xpToNextLevel) * 100}%"></div>
                    </div>
                </div>
                <button class="settings-btn" onclick="window.toggleSettings()">⚙️</button>
            </div>
        </header>
    `;
}

/**
 * 綁定導航事件
 */
export function initHeaderEvents() {
    // 全域導航函數 (供 onclick 使用)
    window.navigateTo = (viewId) => {
        Router.navigate(viewId);
    };
    
    window.toggleSettings = () => {
        // TODO: 實作設定面板
        console.log('Toggle settings');
    };
}

export default {
    renderHeader,
    initHeaderEvents,
};
