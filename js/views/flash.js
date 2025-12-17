/**
 * Flash Mental Math Module
 * 閃電心算訓練模組
 * 
 * @module views/flash
 */

import AppState from '../core/state.js';
import AudioManager from '../core/audio.js';
import { generateProblem, sleep } from '../core/utils.js';

// 訓練狀態
let trainingState = {
    isRunning: false,
    currentProblem: null,
    userAnswer: '',
    score: 0,
    totalQuestions: 0,
    correctCount: 0,
    timeoutId: null,
};

/**
 * 渲染閃電算頁面
 * @returns {string} HTML 字串
 */
export function render() {
    const settings = AppState.get('training');
    
    return `
        <div class="view flash-view">
            <!-- 設定面板 -->
            <section class="settings-panel glass-panel" id="flash-settings">
                <h3>⚡ 閃電心算設定</h3>
                <div class="settings-grid">
                    <div class="setting-item">
                        <label>位數</label>
                        <select id="flash-digits" class="setting-select">
                            <option value="1" ${settings.digits === 1 ? 'selected' : ''}>1 位數</option>
                            <option value="2" ${settings.digits === 2 ? 'selected' : ''}>2 位數</option>
                            <option value="3" ${settings.digits === 3 ? 'selected' : ''}>3 位數</option>
                            <option value="4" ${settings.digits === 4 ? 'selected' : ''}>4 位數</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>口數</label>
                        <select id="flash-rows" class="setting-select">
                            <option value="3" ${settings.rows === 3 ? 'selected' : ''}>3 口</option>
                            <option value="4" ${settings.rows === 4 ? 'selected' : ''}>4 口</option>
                            <option value="5" ${settings.rows === 5 ? 'selected' : ''}>5 口</option>
                            <option value="6" ${settings.rows === 6 ? 'selected' : ''}>6 口</option>
                            <option value="8" ${settings.rows === 8 ? 'selected' : ''}>8 口</option>
                            <option value="10" ${settings.rows === 10 ? 'selected' : ''}>10 口</option>
                            <option value="12" ${settings.rows === 12 ? 'selected' : ''}>12 口</option>
                            <option value="15" ${settings.rows === 15 ? 'selected' : ''}>15 口</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>顯示時間</label>
                        <select id="flash-time" class="setting-select">
                            <option value="2000" ${settings.speed === 2000 ? 'selected' : ''}>超慢 (2秒)</option>
                            <option value="1500" ${settings.speed === 1500 ? 'selected' : ''}>慢 (1.5秒)</option>
                            <option value="1000" ${settings.speed === 1000 ? 'selected' : ''}>中 (1秒)</option>
                            <option value="700" ${settings.speed === 700 ? 'selected' : ''}>快 (0.7秒)</option>
                            <option value="500" ${settings.speed === 500 ? 'selected' : ''}>很快 (0.5秒)</option>
                            <option value="300" ${settings.speed === 300 ? 'selected' : ''}>極快 (0.3秒)</option>
                            <option value="200" ${settings.speed === 200 ? 'selected' : ''}>瞬間 (0.2秒)</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>間隔時間</label>
                        <select id="flash-gap" class="setting-select">
                            <option value="50">極短</option>
                            <option value="100">短</option>
                            <option value="200" selected>正常</option>
                            <option value="400">長</option>
                        </select>
                    </div>
                </div>
                <div class="difficulty-preview">
                    <span class="preview-label">難度預覽：</span>
                    <span class="preview-value" id="difficulty-preview">初級</span>
                </div>
                <button class="btn btn-primary btn-large" id="start-flash-btn" onclick="window.startFlash()">
                    ▶️ 開始訓練
                </button>
            </section>
            
            <!-- 訓練區域 -->
            <section class="training-area glass-panel" id="flash-training-area" style="display: none;">
                <div class="flash-display" id="flash-display">
                    <span class="flash-number">0</span>
                </div>
                <div class="flash-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="flash-progress-fill"></div>
                    </div>
                    <span class="progress-text" id="flash-progress-text">0 / 0</span>
                </div>
            </section>
            
            <!-- 答題區域 -->
            <section class="answer-area glass-panel" id="flash-answer-area" style="display: none;">
                <h3>請輸入答案</h3>
                <input 
                    type="number" 
                    id="flash-answer-input" 
                    class="answer-input"
                    placeholder="?"
                    autofocus
                    onkeypress="if(event.key==='Enter') window.submitFlashAnswer()"
                >
                <button class="btn btn-primary" onclick="window.submitFlashAnswer()">
                    確認
                </button>
            </section>
            
            <!-- 結果區域 -->
            <section class="result-area glass-panel" id="flash-result-area" style="display: none;">
                <div class="result-icon" id="result-icon">✅</div>
                <div class="result-text" id="result-text">正確！</div>
                <div class="result-details" id="result-details"></div>
                <button class="btn btn-primary" onclick="window.nextFlash()">
                    下一題 →
                </button>
            </section>
            
            <!-- 統計面板 -->
            <section class="stats-panel glass-panel">
                <div class="stat-item">
                    <span class="stat-label">本次得分</span>
                    <span class="stat-value" id="flash-score">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">正確率</span>
                    <span class="stat-value" id="flash-accuracy">--%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">題數</span>
                    <span class="stat-value" id="flash-count">0</span>
                </div>
            </section>
        </div>
    `;
}

/**
 * 開始閃電訓練
 */
async function startFlash() {
    // 初始化音訊 (必須在使用者互動後)
    AudioManager.init();
    
    // 讀取設定
    const digits = parseInt(document.getElementById('flash-digits').value);
    const rows = parseInt(document.getElementById('flash-rows').value);
    const speed = parseInt(document.getElementById('flash-time').value);
    const gap = parseInt(document.getElementById('flash-gap').value);
    
    // 更新狀態
    AppState.batchUpdate({
        'training.digits': digits,
        'training.rows': rows,
        'training.speed': speed,
    });
    
    // 儲存間隔時間到本地狀態
    trainingState.gap = gap;
    
    // 產生題目
    trainingState.currentProblem = generateProblem({ rows, digits });
    trainingState.isRunning = true;
    trainingState.userAnswer = '';
    
    // 切換 UI
    document.getElementById('flash-settings').style.display = 'none';
    document.getElementById('flash-training-area').style.display = 'block';
    document.getElementById('flash-answer-area').style.display = 'none';
    document.getElementById('flash-result-area').style.display = 'none';
    
    const display = document.getElementById('flash-display');
    const numberEl = display.querySelector('.flash-number');
    const progressFill = document.getElementById('flash-progress-fill');
    const progressText = document.getElementById('flash-progress-text');
    
    const nums = trainingState.currentProblem.nums;
    
    // 開始閃爍
    for (let i = 0; i < nums.length; i++) {
        if (!trainingState.isRunning) break;
        
        // 更新進度
        progressFill.style.width = `${((i + 1) / nums.length) * 100}%`;
        progressText.textContent = `${i + 1} / ${nums.length}`;
        
        // 顯示數字
        numberEl.textContent = nums[i] >= 0 ? nums[i] : nums[i];
        numberEl.setAttribute('data-digits', digits); // 設定位數以調整字體大小
        numberEl.classList.add('flash-active');
        
        // 播放音效
        AudioManager.play('flash');
        
        await sleep(speed * 0.7);
        
        // 隱藏數字
        numberEl.classList.remove('flash-active');
        
        // 使用設定的間隔時間
        await sleep(trainingState.gap || 200);
    }
    
    // 顯示答題區
    if (trainingState.isRunning) {
        document.getElementById('flash-training-area').style.display = 'none';
        document.getElementById('flash-answer-area').style.display = 'block';
        document.getElementById('flash-answer-input').focus();
    }
}

/**
 * 提交答案
 */
function submitFlashAnswer() {
    const input = document.getElementById('flash-answer-input');
    const userAnswer = parseInt(input.value);
    const correctAnswer = trainingState.currentProblem.total;
    
    trainingState.totalQuestions++;
    
    const isCorrect = userAnswer === correctAnswer;
    
    // 更新全局統計
    const stats = AppState.get('statistics');
    const leaderboard = AppState.get('leaderboard');
    
    if (isCorrect) {
        trainingState.correctCount++;
        trainingState.streak = (trainingState.streak || 0) + 1;
        trainingState.score += 10 + Math.min(trainingState.streak, 10) * 2; // 連續加分
        AudioManager.play('correct');
        
        // 更新最佳連續記錄
        if (trainingState.streak > stats.bestStreak) {
            AppState.set('statistics.bestStreak', trainingState.streak);
        }
    } else {
        trainingState.streak = 0;
        AudioManager.play('wrong');
        
        // 記錄錯題
        const errorTracking = AppState.get('errorTracking');
        if (errorTracking.enabled) {
            const errors = errorTracking.errors || [];
            errors.unshift({
                problem: trainingState.currentProblem.nums,
                userAnswer,
                correctAnswer,
                type: 'flash',
                timestamp: Date.now(),
            });
            // 保持最多 50 題
            if (errors.length > errorTracking.maxErrors) {
                errors.pop();
            }
            AppState.set('errorTracking.errors', errors);
        }
    }
    
    // 更新全局統計
    AppState.batchUpdate({
        'statistics.totalQuestions': stats.totalQuestions + 1,
        'statistics.correctAnswers': stats.correctAnswers + (isCorrect ? 1 : 0),
        'statistics.flashQuestions': stats.flashQuestions + 1,
        'statistics.flashCorrect': stats.flashCorrect + (isCorrect ? 1 : 0),
    });
    
    // 更新個人最佳記錄
    if (trainingState.score > leaderboard.personal.flash.score) {
        AppState.set('leaderboard.personal.flash', {
            score: trainingState.score,
            accuracy: Math.round((trainingState.correctCount / trainingState.totalQuestions) * 100),
            date: Date.now(),
        });
    }
    
    // 更新 UI 統計
    document.getElementById('flash-score').textContent = trainingState.score;
    document.getElementById('flash-count').textContent = trainingState.totalQuestions;
    document.getElementById('flash-accuracy').textContent = 
        `${Math.round((trainingState.correctCount / trainingState.totalQuestions) * 100)}%`;
    
    // 顯示結果
    document.getElementById('flash-answer-area').style.display = 'none';
    document.getElementById('flash-result-area').style.display = 'block';
    
    document.getElementById('result-icon').textContent = isCorrect ? '✅' : '❌';
    document.getElementById('result-text').textContent = isCorrect ? '正確！' : '答錯了';
    document.getElementById('result-details').innerHTML = `
        <p>題目：${trainingState.currentProblem.nums.join(' → ')}</p>
        <p>正確答案：<strong>${correctAnswer}</strong></p>
        ${!isCorrect ? `<p>你的答案：${userAnswer}</p>` : ''}
        ${trainingState.streak >= 3 ? `<p class="streak-bonus">🔥 連續 ${trainingState.streak} 題正確！</p>` : ''}
    `;
    
    // 清空輸入
    input.value = '';
}

/**
 * 下一題
 */
function nextFlash() {
    document.getElementById('flash-result-area').style.display = 'none';
    document.getElementById('flash-settings').style.display = 'block';
}

/**
 * 進入閃電算頁面時的初始化
 */
export function onEnter() {
    trainingState = {
        isRunning: false,
        currentProblem: null,
        userAnswer: '',
        score: 0,
        totalQuestions: 0,
        correctCount: 0,
        timeoutId: null,
    };
    
    // 綁定全域函數
    window.startFlash = startFlash;
    window.submitFlashAnswer = submitFlashAnswer;
    window.nextFlash = nextFlash;
}

/**
 * 離開時清理
 */
export function onLeave() {
    trainingState.isRunning = false;
    if (trainingState.timeoutId) {
        clearTimeout(trainingState.timeoutId);
    }
}

export default {
    render,
    onEnter,
    onLeave,
};
