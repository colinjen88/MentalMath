/**
 * Leaderboard View Module
 * 排行榜視圖模組
 * 
 * @module views/leaderboard
 */

import AppState from '../core/state.js';

/**
 * 渲染排行榜頁面
 * @returns {string} HTML 字串
 */
export function render() {
    const stats = AppState.get('statistics');
    const leaderboard = AppState.get('leaderboard');
    const user = AppState.get('user');
    
    const accuracy = stats.totalQuestions > 0 
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) 
        : 0;
    
    return `
        <div class="view leaderboard-view">
            <!-- 個人統計 -->
            <section class="stats-overview glass-panel">
                <h3>📊 我的學習統計</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-info">
                            <span class="stat-number">${stats.totalQuestions}</span>
                            <span class="stat-label">總題數</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-info">
                            <span class="stat-number">${stats.correctAnswers}</span>
                            <span class="stat-label">正確數</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <span class="stat-number">${accuracy}%</span>
                            <span class="stat-label">正確率</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-info">
                            <span class="stat-number">${stats.bestStreak}</span>
                            <span class="stat-label">最佳連續</span>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- 各模式統計 -->
            <section class="mode-stats glass-panel">
                <h3>🏅 各模式表現</h3>
                <div class="mode-stats-grid">
                    <div class="mode-stat-card">
                        <h4>⚡ 閃電算</h4>
                        <div class="mode-stat-row">
                            <span>練習題數</span>
                            <strong>${stats.flashQuestions}</strong>
                        </div>
                        <div class="mode-stat-row">
                            <span>正確率</span>
                            <strong>${stats.flashQuestions > 0 ? Math.round((stats.flashCorrect / stats.flashQuestions) * 100) : 0}%</strong>
                        </div>
                        <div class="mode-stat-row">
                            <span>最高分</span>
                            <strong>${leaderboard.personal.flash.score}</strong>
                        </div>
                    </div>
                    <div class="mode-stat-card">
                        <h4>🎧 聽算</h4>
                        <div class="mode-stat-row">
                            <span>練習題數</span>
                            <strong>${stats.audioQuestions}</strong>
                        </div>
                        <div class="mode-stat-row">
                            <span>正確率</span>
                            <strong>${stats.audioQuestions > 0 ? Math.round((stats.audioCorrect / stats.audioQuestions) * 100) : 0}%</strong>
                        </div>
                        <div class="mode-stat-row">
                            <span>最高分</span>
                            <strong>${leaderboard.personal.audio.score}</strong>
                        </div>
                    </div>
                    <div class="mode-stat-card">
                        <h4>🧮 練功房</h4>
                        <div class="mode-stat-row">
                            <span>練習題數</span>
                            <strong>${stats.practiceQuestions}</strong>
                        </div>
                        <div class="mode-stat-row">
                            <span>正確率</span>
                            <strong>${stats.practiceQuestions > 0 ? Math.round((stats.practiceCorrect / stats.practiceQuestions) * 100) : 0}%</strong>
                        </div>
                        <div class="mode-stat-row">
                            <span>挑戰最高分</span>
                            <strong>${leaderboard.personal.challenge.score}</strong>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- 個人排行榜 -->
            <section class="personal-leaderboard glass-panel">
                <h3>🏆 個人最佳記錄</h3>
                <div class="records-list">
                    ${renderPersonalRecords(leaderboard.personal)}
                </div>
            </section>
            
            <!-- 錯題分析 -->
            <section class="error-analysis glass-panel">
                <h3>📈 學習分析</h3>
                <div class="analysis-content">
                    ${renderErrorAnalysis()}
                </div>
            </section>
        </div>
    `;
}

/**
 * 渲染個人記錄
 */
function renderPersonalRecords(personal) {
    const records = [
        { 
            icon: '⚡', 
            name: '閃電算最高分', 
            value: personal.flash.score,
            date: personal.flash.date ? new Date(personal.flash.date).toLocaleDateString('zh-TW') : '尚無記錄'
        },
        { 
            icon: '🎧', 
            name: '聽算最高分', 
            value: personal.audio.score,
            date: personal.audio.date ? new Date(personal.audio.date).toLocaleDateString('zh-TW') : '尚無記錄'
        },
        { 
            icon: '⏱️', 
            name: '計時挑戰最高分', 
            value: personal.challenge.score,
            date: personal.challenge.date ? new Date(personal.challenge.date).toLocaleDateString('zh-TW') : '尚無記錄'
        },
    ];
    
    return records.map((record, index) => `
        <div class="record-item ${record.value > 0 ? 'has-record' : ''}">
            <span class="record-rank">${index + 1}</span>
            <span class="record-icon">${record.icon}</span>
            <div class="record-info">
                <span class="record-name">${record.name}</span>
                <span class="record-date">${record.date}</span>
            </div>
            <span class="record-value">${record.value}</span>
        </div>
    `).join('');
}

/**
 * 渲染錯題分析
 */
function renderErrorAnalysis() {
    const errorTracking = AppState.get('errorTracking');
    const stats = AppState.get('statistics');
    
    if (stats.totalQuestions < 10) {
        return `
            <div class="analysis-empty">
                <div class="empty-icon">📚</div>
                <p>練習超過 10 題後，這裡會顯示你的學習分析</p>
                <p class="sub">目前已完成 ${stats.totalQuestions} 題</p>
            </div>
        `;
    }
    
    // 計算正確率等級
    const accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
    let level, advice;
    
    if (accuracy >= 90) {
        level = { icon: '🌟', text: '優秀', class: 'excellent' };
        advice = '表現非常棒！可以嘗試提高難度或加快速度。';
    } else if (accuracy >= 70) {
        level = { icon: '👍', text: '良好', class: 'good' };
        advice = '基礎穩固，繼續練習可以更進步！';
    } else if (accuracy >= 50) {
        level = { icon: '💪', text: '加油', class: 'average' };
        advice = '建議多做基礎練習，打好基本功。';
    } else {
        level = { icon: '📖', text: '需練習', class: 'needs-practice' };
        advice = '不要氣餒！從簡單題目開始，慢慢進步。';
    }
    
    const errorCount = errorTracking.errors ? errorTracking.errors.length : 0;
    
    return `
        <div class="analysis-summary">
            <div class="level-badge ${level.class}">
                <span class="level-icon">${level.icon}</span>
                <span class="level-text">${level.text}</span>
            </div>
            <p class="advice">${advice}</p>
        </div>
        <div class="analysis-details">
            <div class="detail-row">
                <span>累計錯題數</span>
                <strong>${errorCount} 題</strong>
            </div>
            <div class="detail-row">
                <span>需要加強</span>
                <strong>${errorTracking.weakAreas && errorTracking.weakAreas.length > 0 ? errorTracking.weakAreas.join('、') : '暫無'}</strong>
            </div>
        </div>
        ${errorCount > 0 ? `
            <button class="btn btn-secondary" onclick="window.practiceErrors()">
                📝 錯題重練
            </button>
        ` : ''}
    `;
}

/**
 * 頁面進入時初始化
 */
export function onEnter() {
    // 綁定全域函數
    window.practiceErrors = () => {
        // TODO: 導航到錯題練習
        alert('錯題重練功能即將推出！');
    };
}

/**
 * 離開時清理
 */
export function onLeave() {
    // 清理
}

export default {
    render,
    onEnter,
    onLeave,
};
