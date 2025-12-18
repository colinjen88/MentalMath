/**
 * Splash Screen Logic
 * 啟動頁面邏輯
 * 
 * @module views/splash
 */

import Router from '../core/router.js';
import AudioManager from '../core/audio.js';

export function render() {
    return `
        <div class="view splash-view">
            <div class="splash-content">
                <div class="splash-logo-container">
                    <div class="splash-logo">🧮</div>
                    <div class="splash-rings"></div>
                </div>
                
                <div class="splash-text">
                    <h1 class="splash-title">珠心算學院</h1>
                    <p class="splash-subtitle">啟動大腦的無限潛能</p>
                </div>
                
                <button class="btn-start" onclick="window.startApp()">
                    <span class="btn-text">開始練習</span>
                    <span class="btn-icon">➜</span>
                </button>
                
                <p class="splash-footer">Unlock Your Brain's Potential</p>
            </div>
        </div>
    `;
}

export function onEnter() {
    window.startApp = async () => {
        // 初始化音訊 (這是最佳時機，因為是在使用者點擊後)
        await AudioManager.init();
        
        // 加上轉場動畫
        const splashView = document.querySelector('.splash-view');
        if (splashView) {
            splashView.classList.add('exiting');
            setTimeout(() => {
                Router.navigate('home');
            }, 500);
        } else {
            Router.navigate('home');
        }
    };
}

export function onLeave() {
    window.startApp = null;
}

export default {
    render,
    onEnter,
    onLeave
};
