/**
 * Home View Module
 * 大廳 (首頁) 視圖
 * 
 * @module views/home
 */

import AppState from '../core/state.js';
import Router from '../core/router.js';
import Abacus from '../components/abacus.js';

let abacusInstance = null;

/**
 * 渲染首頁
 * @returns {string} HTML 字串
 */
const QUOTES = [
    "「珠算式心算」被譽為世界上最好的腦力開發工具。",
    "心算就像大腦的體操，每天都要動一動！",
    "專注力是珠心算這門課送給孩子最好的禮物。",
    "眼明手快，心手合一。",
    "練習珠心算，不只是為了算得快，更是為了讓大腦更靈活。",
    "每日累積一點點，進步看得見。",
];

export function render() {
    const user = AppState.get('user');
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    
    return `
        <div class="view home-view">
            <!-- 歡迎區塊 -->
            <section class="welcome-section glass-panel">
                <div class="welcome-content">
                    <h2>歡迎回來，<span class="highlight">${user.name}</span>！</h2>
                    <p class="streak-info">
                        ${user.streak > 0 
                            ? `🔥 連續練習 <strong>${user.streak}</strong> 天！繼續保持！` 
                            : '✨ 今天開始新的練習吧！'}
                    </p>
                    ${AppState.get('ui.canInstall') ? `
                    <div class="install-prompt" style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="window.installPWA()" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #10b981, #059669);">
                            📱 安裝 App 到主畫面
                        </button>
                    </div>
                    ` : ''}
                    <div class="daily-quote">
                        <blockquote>${randomQuote}</blockquote>
                    </div>
                </div>
                <div class="daily-mission">
                    <h3>📋 每日任務</h3>
                    <ul class="mission-list">
                        <li class="mission-item">
                            <span class="mission-icon">✅</span>
                            <span class="mission-text">完成 10 題閃電算</span>
                            <span class="mission-reward">+20 XP</span>
                        </li>
                        <li class="mission-item incomplete">
                            <span class="mission-icon">⬜</span>
                            <span class="mission-text">練習互動算盤 5 分鐘</span>
                            <span class="mission-reward">+15 XP</span>
                        </li>
                        <li class="mission-item incomplete">
                            <span class="mission-icon">⬜</span>
                            <span class="mission-text">挑戰 3 口心算</span>
                            <span class="mission-reward">+25 XP</span>
                        </li>
                    </ul>
                </div>
            </section>
            
            <!-- 互動算盤展示區 -->
            <section class="abacus-showcase glass-panel">
                <h3>🧮 互動算盤</h3>
                <p class="hint">點擊算珠試試看！</p>
                <div id="home-abacus-container" class="abacus-container"></div>
                <div class="abacus-controls">
                    <button class="btn btn-secondary" onclick="window.resetHomeAbacus()">
                        🔄 歸零
                    </button>
                    <button class="btn btn-primary" onclick="window.navigateTo('practice')">
                        開始練習 →
                    </button>
                </div>
            </section>
            
            <!-- 快速入口 -->
            <section class="quick-actions">
                <div class="action-card" onclick="window.navigateTo('flash')">
                    <div class="action-icon">⚡</div>
                    <div class="action-info">
                        <h4>閃電心算</h4>
                        <p>訓練視覺心算速度</p>
                    </div>
                </div>
                <div class="action-card" onclick="window.navigateTo('audio')">
                    <div class="action-icon">🎧</div>
                    <div class="action-info">
                        <h4>聽力訓練</h4>
                        <p>用耳朵做算術</p>
                    </div>
                </div>
                <div class="action-card" onclick="window.navigateTo('worksheet')">
                    <div class="action-icon">📄</div>
                    <div class="action-info">
                        <h4>學習單列印</h4>
                        <p>產生紙本練習題</p>
                    </div>
                </div>
                <div class="action-card" onclick="window.navigateTo('leaderboard')">
                    <div class="action-icon">📊</div>
                    <div class="action-info">
                        <h4>學習報告</h4>
                        <p>查看進度與成就</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}

export function onEnter() {
    // 延遲執行，確保 DOM 已渲染
    setTimeout(() => {
        const container = document.getElementById('home-abacus-container');
        if (container && !abacusInstance) {
            abacusInstance = new Abacus({
                container,
                columns: 5,
                interactive: true,
                showValue: true,
                onChange: (value) => {
                    if (window.navigator && window.navigator.vibrate) {
                         window.navigator.vibrate(5);
                    }
                }
            });
        }
        
        // 綁定歸零按鈕
        window.resetHomeAbacus = () => {
            if (abacusInstance) {
                abacusInstance.reset();
            }
        };
    }, 50);
}

/**
 * 離開首頁時的清理
 */
export function onLeave() {
    if (abacusInstance) {
        abacusInstance.destroy();
        abacusInstance = null;
    }
}

export default {
    render,
    onEnter,
    onLeave,
};
