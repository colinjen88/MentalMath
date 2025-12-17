/**
 * Practice View Module
 * 練功房視圖 - 互動式算盤練習
 * 
 * @module views/practice
 */

import AppState from '../core/state.js';
import AudioManager from '../core/audio.js';
import Abacus from '../components/abacus.js';
import { generateProblem, sleep } from '../core/utils.js';

let abacusInstance = null;
let practiceState = {
    mode: 'free',        // 'free' | 'guided' | 'challenge'
    currentProblem: null,
    targetValue: 0,
    score: 0,
    streak: 0,
// ... (在 practiceState 中增加 review 相關屬性)
    timer: null,
    timeLeft: 0,
    reviewIndex: 0,
    reviewErrors: [],
};

export function render() {
    return `
        <div class="view practice-view">
            <!-- 模式選擇 -->
            <section class="practice-modes glass-panel">
                <h3>🧮 練功房 ${practiceState.mode === 'review' ? '<span class="mode-tag">錯題特訓</span>' : ''}</h3>
                <div class="mode-cards" ${practiceState.mode === 'review' ? 'style="display:none"' : ''}>
                    <div class="mode-card ${practiceState.mode === 'free' ? 'active' : ''}" 
                         onclick="window.setPracticeMode('free')">
                        <div class="mode-icon">🎮</div>
                        <h4>自由練習</h4>
                        <p>隨意撥動算珠，熟悉操作</p>
                    </div>
                    <div class="mode-card ${practiceState.mode === 'guided' ? 'active' : ''}" 
                         onclick="window.setPracticeMode('guided')">
                        <div class="mode-icon">📚</div>
                        <h4>指導模式</h4>
                        <p>系統給數字，你來撥珠</p>
                    </div>
                    <div class="mode-card ${practiceState.mode === 'challenge' ? 'active' : ''}" 
                         onclick="window.setPracticeMode('challenge')">
                        <div class="mode-icon">⏱️</div>
                        <h4>計時挑戰</h4>
                        <p>限時內完成越多題越好</p>
                    </div>
                </div>
                
                <!-- 錯題複習控制列 -->
                <div class="review-controls" ${practiceState.mode === 'review' ? '' : 'style="display:none"'}>
                    <div class="review-status">
                        正在複習錯題：<span id="review-progress">1 / 10</span>
                    </div>
                    <button class="btn btn-secondary" onclick="window.exitReviewMode()">
                        🚪 退出特訓
                    </button>
                </div>
            </section>
            
            <!-- 練習區域 -->
            <section class="practice-area glass-panel">
                <!-- 目標顯示 -->
                <div class="target-display" id="target-display" style="display: none;">
                    <div class="problem-display" id="problem-display"></div>
                    <span class="target-label">目標答案：</span>
                    <span class="target-value" id="target-value">?</span>
                </div>
                
                <!-- 計時器 (挑戰模式) -->
                <div class="timer-display" id="timer-display" style="display: none;">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-value" id="timer-value">60</span>
                    <span class="timer-unit">秒</span>
                </div>
                
                <!-- 互動算盤 -->
                <div id="practice-abacus-container" class="abacus-container large"></div>
                
                <!-- 控制按鈕 -->
                <div class="practice-controls">
                    <button class="btn btn-secondary" onclick="window.resetPracticeAbacus()">
                        🔄 歸零
                    </button>
                    <button class="btn btn-primary" id="check-btn" style="display: none;" 
                            onclick="window.checkPracticeAnswer()">
                        ✅ 確認
                    </button>
                    <button class="btn btn-primary" id="start-challenge-btn" style="display: none;" 
                            onclick="window.startChallenge()">
                        ▶️ 開始挑戰
                    </button>
                </div>
            </section>
            
            <!-- 統計/成績 -->
            <section class="practice-stats glass-panel">
                <div class="stat-item">
                    <span class="stat-label">連續正確</span>
                    <span class="stat-value" id="practice-streak">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">本次得分</span>
                    <span class="stat-value" id="practice-score">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">獲得經驗</span>
                    <span class="stat-value xp-value" id="practice-xp">+0 XP</span>
                </div>
            </section>
        </div>
    `;
}

function setPracticeMode(mode) {
    practiceState.mode = mode;
    practiceState.score = 0;
    practiceState.streak = 0;
    
    // 更新 UI ... (略去部分未變更代碼)
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.toggle('active', card.querySelector('h4').textContent.includes(getModeLabel(mode)));
    });
    
    const targetDisplay = document.getElementById('target-display');
    const timerDisplay = document.getElementById('timer-display');
    const checkBtn = document.getElementById('check-btn');
    const startChallengeBtn = document.getElementById('start-challenge-btn');
    const problemDisplay = document.getElementById('problem-display');
    
    if (practiceState.timer) {
        clearInterval(practiceState.timer);
        practiceState.timer = null;
    }
    
    switch (mode) {
        case 'free':
            targetDisplay.style.display = 'none';
            timerDisplay.style.display = 'none';
            checkBtn.style.display = 'none';
            startChallengeBtn.style.display = 'none';
            break;
        case 'guided':
            targetDisplay.style.display = 'flex';
            problemDisplay.style.display = 'none';
            document.getElementById('target-value').textContent = practiceState.targetValue;
            timerDisplay.style.display = 'none';
            checkBtn.style.display = 'inline-flex';
            startChallengeBtn.style.display = 'none';
            generateNewTarget();
            break;
        case 'challenge':
            targetDisplay.style.display = 'none';
            timerDisplay.style.display = 'flex';
            checkBtn.style.display = 'none';
            startChallengeBtn.style.display = 'inline-flex';
            document.getElementById('timer-value').textContent = '60';
            break;
        case 'review':
            targetDisplay.style.display = 'flex';
            problemDisplay.style.display = 'block';
            timerDisplay.style.display = 'none';
            checkBtn.style.display = 'inline-flex';
            startChallengeBtn.style.display = 'none';
            generateNewTarget();
            break;
    }
    
    if (abacusInstance) abacusInstance.reset();
    updateStats();
}

function generateNewTarget() {
    if (practiceState.mode === 'review') {
        if (practiceState.reviewErrors.length === 0) {
            alert('恭喜！錯題複習完成！');
            window.exitReviewMode();
            return;
        }
        
        // 取出一題
        const problem = practiceState.reviewErrors[practiceState.reviewIndex];
        practiceState.currentProblem = problem;
        practiceState.targetValue = problem.correctAnswer;
        
        // 顯示題目
        document.getElementById('problem-display').innerHTML = `
            <div class="review-problem">
                ${problem.problem.join(' + ')} = ?
            </div>
            <div class="review-hint">上次回答: ${problem.userAnswer}</div>
        `;
        document.getElementById('target-value').textContent = '?';
        
        // 更新進度
        document.getElementById('review-progress').textContent = 
            `${practiceState.reviewIndex + 1} / ${practiceState.reviewErrors.length}`;
            
    } else {
        const max = abacusInstance ? Math.pow(10, abacusInstance.columns) - 1 : 99999;
        practiceState.targetValue = Math.floor(Math.random() * Math.min(max, 100));
        document.getElementById('target-value').textContent = practiceState.targetValue;
        document.getElementById('problem-display').innerHTML = '';
    }
}

function checkPracticeAnswer() {
    if (!abacusInstance) return;
    
    const userValue = abacusInstance.getValue();
    const isCorrect = userValue === practiceState.targetValue;
    
    if (isCorrect) {
        practiceState.streak++;
        practiceState.score += 10 + practiceState.streak * 2;
        AudioManager.play('correct');
        const xp = 5 + Math.min(practiceState.streak, 10);
        addXP(xp);
        
        if (practiceState.mode === 'review') {
            // 從錯題列表中移除已解決的題目 (或只是移動索引)
            practiceState.reviewIndex++;
            if (practiceState.reviewIndex >= practiceState.reviewErrors.length) {
                alert(`太棒了！你解決了所有的錯題！\n獲得經驗：+${practiceState.score} XP`);
                addXP(practiceState.score); // 額外獎勵
                
                // 清空錯題記錄 (可選)
                if (confirm('是否清除已解決的錯題記錄？')) {
                     AppState.set('errorTracking.errors', []);
                }
                
                window.exitReviewMode();
                return;
            }
        }
        
        generateNewTarget();
        abacusInstance.reset();
    } else {
        practiceState.streak = 0;
        AudioManager.play('wrong');
        const hint = practiceState.mode === 'review' 
            ? `正確答案是 ${practiceState.targetValue}`
            : `正確答案是 ${practiceState.targetValue}，你撥的是 ${userValue}`;
        showHint(hint);
    }
    
    updateStats();
}

/**
 * 開始挑戰模式
 */
function startChallenge() {
    practiceState.timeLeft = 60;
    practiceState.score = 0;
    practiceState.streak = 0;
    
    document.getElementById('start-challenge-btn').style.display = 'none';
    document.getElementById('check-btn').style.display = 'inline-flex';
    document.getElementById('target-display').style.display = 'flex';
    
    generateNewTarget();
    abacusInstance.reset();
    
    // 開始計時
    practiceState.timer = setInterval(() => {
        practiceState.timeLeft--;
        document.getElementById('timer-value').textContent = practiceState.timeLeft;
        
        if (practiceState.timeLeft <= 0) {
            endChallenge();
        }
    }, 1000);
}

/**
 * 結束挑戰
 */
function endChallenge() {
    clearInterval(practiceState.timer);
    practiceState.timer = null;
    
    document.getElementById('check-btn').style.display = 'none';
    document.getElementById('start-challenge-btn').style.display = 'inline-flex';
    document.getElementById('target-display').style.display = 'none';
    
    // 計算獎勵
    const bonusXP = Math.floor(practiceState.score / 2);
    addXP(bonusXP);
    
    alert(`⏱️ 時間到！\n\n得分：${practiceState.score}\n獲得經驗：+${bonusXP} XP`);
}

/**
 * 顯示提示
 */
function showHint(message) {
    // 簡單的 toast 提示
    const toast = document.createElement('div');
    toast.className = 'toast-hint';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
}

/**
 * 加經驗值
 */
function addXP(amount) {
    const currentXP = AppState.get('user.xp');
    const xpToNext = AppState.get('user.xpToNextLevel');
    const newXP = currentXP + amount;
    
    if (newXP >= xpToNext) {
        const currentLevel = AppState.get('user.level');
        AppState.batchUpdate({
            'user.level': currentLevel + 1,
            'user.xp': newXP - xpToNext,
            'user.xpToNextLevel': Math.floor(xpToNext * 1.5),
        });
        AudioManager.play('levelUp');
    } else {
        AppState.set('user.xp', newXP);
    }
}

/**
 * 更新統計顯示
 */
function updateStats() {
    document.getElementById('practice-streak').textContent = practiceState.streak;
    document.getElementById('practice-score').textContent = practiceState.score;
    
    const totalXP = AppState.get('user.xp');
    document.getElementById('practice-xp').textContent = `${totalXP} XP`;
}

/**
 * 頁面進入時初始化
 */
export function onEnter() {
    // 檢查是否有傳入的模式 (從排行榜跳轉過來)
    const initialMode = AppState.get('training.mode') === 'review' ? 'review' : 'free';
    
    practiceState = {
        mode: initialMode,
        currentProblem: null,
        targetValue: 0,
        score: 0,
        streak: 0,
        timer: null,
        timeLeft: 0,
        reviewIndex: 0,
        reviewErrors: [],
    };
    
    // 如果是複習模式，載入錯題
    if (initialMode === 'review') {
        const errorTracking = AppState.get('errorTracking');
        // 深拷貝，因為我們要打亂順序 (在這個版本我們先不打亂，按時間倒序)
        practiceState.reviewErrors = JSON.parse(JSON.stringify(errorTracking.errors || []));
    }
    
    // 重置全局狀態的 mode，以免下次進來還是 review
    AppState.set('training.mode', 'practice');
    
    // 延遲初始化算盤
    setTimeout(() => {
        const container = document.getElementById('practice-abacus-container');
        if (container && !abacusInstance) {
            // ... (同原有邏輯)
            abacusInstance = new Abacus({
                container,
                columns: 5,
                interactive: true,
                showValue: true,
                onChange: (value) => {
                    // 挑戰模式 或 錯題模式(可選) 下自動檢查
                    // 這裡我們保持錯題模式需要按確認鍵，以免誤觸
                    if (practiceState.mode === 'challenge' && practiceState.timer) {
                        if (value === practiceState.targetValue) {
                            practiceState.streak++;
                            practiceState.score += 10 + practiceState.streak * 2;
                            AudioManager.play('correct');
                            addXP(5);
                            generateNewTarget();
                            abacusInstance.reset();
                            updateStats();
                        }
                    }
                }
            });
        }
        
        // 綁定全域函數
        window.setPracticeMode = setPracticeMode;
        window.resetPracticeAbacus = () => abacusInstance && abacusInstance.reset();
        window.checkPracticeAnswer = checkPracticeAnswer;
        window.startChallenge = startChallenge;
        window.exitReviewMode = () => window.setPracticeMode('free');
        
        // 根據模式設定初始狀態
        setPracticeMode(initialMode);
        
        updateStats();
    }, 50);
}

/**
 * 離開時清理
 */
export function onLeave() {
    if (practiceState.timer) {
        clearInterval(practiceState.timer);
    }
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
