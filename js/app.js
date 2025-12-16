/**
 * Main Application Entry Point
 * 應用程式主入口
 * 
 * @module app
 */

import AppState from './core/state.js';
import Router from './core/router.js';
import AudioManager from './core/audio.js';
import { renderHeader, initHeaderEvents } from './components/header.js';

// Views
import HomeView from './views/home.js';
import FlashView from './views/flash.js';
import AudioView from './views/audio.js';
import PracticeView from './views/practice.js';
import WorksheetView from './views/worksheet.js';

/**
 * 初始化應用程式
 */
function initApp() {
    console.log('🧮 珠心算學院啟動中...');
    
    // 初始化音訊 (需要使用者互動才能解鎖)
    document.addEventListener('click', () => AudioManager.init(), { once: true });
    
    // 渲染基礎結構
    renderAppShell();
    
    // 註冊路由
    registerRoutes();
    
    // 初始化 Header 事件
    initHeaderEvents();
    
    // 啟動路由器
    Router.init();
    
    // 監聽狀態變更更新 UI
    AppState.subscribe('user', () => updateHeader());
    AppState.subscribe('currentView', () => updateHeader());
    
    console.log('✅ 珠心算學院啟動完成！');
}

/**
 * 渲染應用程式外殼
 */
function renderAppShell() {
    const appRoot = document.getElementById('app-root');
    
    if (!appRoot) {
        console.error('找不到 #app-root 元素');
        return;
    }
    
    appRoot.innerHTML = `
        ${renderHeader()}
        <main id="app" class="app-main">
            <!-- 路由內容會渲染在這裡 -->
        </main>
    `;
}

/**
 * 更新 Header
 */
function updateHeader() {
    const headerEl = document.querySelector('.app-header');
    if (headerEl) {
        headerEl.outerHTML = renderHeader();
        initHeaderEvents();
    }
}

/**
 * 註冊所有路由
 */
function registerRoutes() {
    // 首頁
    Router.register('home', {
        title: '大廳',
        render: HomeView.render,
        onEnter: HomeView.onEnter,
        onLeave: HomeView.onLeave,
    });
    
    // 練功房
    Router.register('practice', {
        title: '練功房',
        render: PracticeView.render,
        onEnter: PracticeView.onEnter,
        onLeave: PracticeView.onLeave,
    });
    
    // 閃電算
    Router.register('flash', {
        title: '閃電心算',
        render: FlashView.render,
        onEnter: FlashView.onEnter,
        onLeave: FlashView.onLeave,
    });
    
    // 聽力訓練
    Router.register('audio', {
        title: '聽力訓練',
        render: AudioView.render,
        onEnter: AudioView.onEnter,
        onLeave: AudioView.onLeave,
    });
    
    // 學習單
    Router.register('worksheet', {
        title: '學習單列印',
        render: WorksheetView.render,
        onEnter: WorksheetView.onEnter,
        onLeave: WorksheetView.onLeave,
    });
    
    // 個人檔案
    Router.register('profile', {
        title: '我的',
        render: renderProfileView,
        onEnter: () => {
            window.toggleSound = () => {
                const current = AppState.get('ui.soundEnabled');
                AppState.set('ui.soundEnabled', !current);
                location.reload();
            };
            
            window.editName = () => {
                const newName = prompt('請輸入新名稱', AppState.get('user.name'));
                if (newName && newName.trim()) {
                    AppState.set('user.name', newName.trim());
                    location.reload();
                }
            };
            
            window.changeAvatar = () => {
                const avatars = ['🧒', '👦', '👧', '🧒🏻', '👦🏻', '👧🏻', '🐱', '🐶', '🦊', '🐼'];
                const current = AppState.get('user.avatar');
                const currentIndex = avatars.indexOf(current);
                const nextIndex = (currentIndex + 1) % avatars.length;
                AppState.set('user.avatar', avatars[nextIndex]);
                location.reload();
            };
        },
        onLeave: () => {},
    });
}

/**
 * 渲染個人檔案頁面
 */
function renderProfileView() {
    const user = AppState.get('user');
    const xpPercent = (user.xp / user.xpToNextLevel) * 100;
    
    return `
        <div class="view profile-view">
            <section class="profile-card glass-panel">
                <div class="avatar-large" onclick="window.changeAvatar()" style="cursor: pointer;" title="點擊更換頭像">
                    ${user.avatar}
                </div>
                <h2 onclick="window.editName()" style="cursor: pointer;" title="點擊修改名稱">
                    ${user.name} ✏️
                </h2>
                <div class="level-badge">Lv.${user.level}</div>
                <div class="xp-display">
                    <div class="xp-bar-large">
                        <div class="xp-fill" style="width: ${xpPercent}%"></div>
                    </div>
                    <span class="xp-text">${user.xp} / ${user.xpToNextLevel} XP</span>
                </div>
            </section>
            
            <section class="achievements-section glass-panel">
                <h3>🏆 成就徽章</h3>
                <div class="badge-grid">
                    <div class="badge unlocked" title="完成第一次練習">
                        <span class="badge-icon">🎯</span>
                        <span class="badge-name">初學者</span>
                    </div>
                    <div class="badge ${user.level >= 5 ? 'unlocked' : 'locked'}" title="達到 Lv.5">
                        <span class="badge-icon">⭐</span>
                        <span class="badge-name">小達人</span>
                    </div>
                    <div class="badge ${user.level >= 10 ? 'unlocked' : 'locked'}" title="達到 Lv.10">
                        <span class="badge-icon">🌟</span>
                        <span class="badge-name">珠算高手</span>
                    </div>
                    <div class="badge ${user.streak >= 7 ? 'unlocked' : 'locked'}" title="連續練習 7 天">
                        <span class="badge-icon">🔥</span>
                        <span class="badge-name">勤奮學員</span>
                    </div>
                    <div class="badge locked" title="完成 100 道題目">
                        <span class="badge-icon">💯</span>
                        <span class="badge-name">百題達人</span>
                    </div>
                    <div class="badge locked" title="閃電算連續 10 題全對">
                        <span class="badge-icon">⚡</span>
                        <span class="badge-name">閃電大師</span>
                    </div>
                </div>
            </section>
            
            <section class="settings-section glass-panel">
                <h3>⚙️ 設定</h3>
                <div class="setting-row">
                    <span>🔊 音效</span>
                    <button class="toggle-btn ${AppState.get('ui.soundEnabled') ? 'on' : 'off'}"
                            onclick="window.toggleSound()">
                        ${AppState.get('ui.soundEnabled') ? '開' : '關'}
                    </button>
                </div>
                <div class="setting-row">
                    <span>🔄 連續練習天數</span>
                    <span class="streak-count">${user.streak} 天</span>
                </div>
                <div class="setting-row">
                    <button class="btn btn-danger" onclick="if(confirm('確定要重置所有資料嗎？這將清除所有進度！')) AppState.reset()">
                        🗑️ 重置所有資料
                    </button>
                </div>
            </section>
        </div>
    `;
}

// DOM Ready 時啟動
document.addEventListener('DOMContentLoaded', initApp);

// 匯出供除錯
window.AppState = AppState;
window.Router = Router;

