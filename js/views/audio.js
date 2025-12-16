/**
 * Audio Mental Math Module
 * 聽力心算訓練模組
 * 
 * @module views/audio
 */

import AppState from '../core/state.js';
import AudioManager from '../core/audio.js';
import { generateProblem, sleep } from '../core/utils.js';

// 訓練狀態
let audioState = {
    isRunning: false,
    isPaused: false,
    currentProblem: null,
    userAnswer: '',
    score: 0,
    totalQuestions: 0,
    correctCount: 0,
    currentIndex: 0,
};

/**
 * 渲染聽力訓練頁面
 * @returns {string} HTML 字串
 */
export function render() {
    const settings = AppState.get('training');
    
    return `
        <div class="view audio-view">
            <!-- 設定面板 -->
            <section class="settings-panel glass-panel" id="audio-settings">
                <h3>🎧 聽力心算訓練</h3>
                <p class="audio-description">
                    電腦會用語音朗讀數字，請在心中計算並輸入答案。
                </p>
                
                <div class="settings-grid">
                    <div class="setting-item">
                        <label>位數</label>
                        <select id="audio-digits" class="setting-select">
                            <option value="1" ${settings.digits === 1 ? 'selected' : ''}>1 位數</option>
                            <option value="2" ${settings.digits === 2 ? 'selected' : ''}>2 位數</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>口數</label>
                        <select id="audio-rows" class="setting-select">
                            <option value="3" ${settings.rows === 3 ? 'selected' : ''}>3 口</option>
                            <option value="4" ${settings.rows === 4 ? 'selected' : ''}>4 口</option>
                            <option value="5" ${settings.rows === 5 ? 'selected' : ''}>5 口</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>語言</label>
                        <select id="audio-lang" class="setting-select">
                            <option value="zh-TW">中文</option>
                            <option value="en-US">English</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>語速</label>
                        <select id="audio-speed" class="setting-select">
                            <option value="0.8">慢速</option>
                            <option value="1.0" selected>正常</option>
                            <option value="1.2">快速</option>
                        </select>
                    </div>
                </div>
                
                <button class="btn btn-primary btn-large" id="start-audio-btn" onclick="window.startAudioTraining()">
                    🎙️ 開始訓練
                </button>
            </section>
            
            <!-- 訓練區域 -->
            <section class="training-area glass-panel" id="audio-training-area" style="display: none;">
                <div class="audio-visual">
                    <div class="sound-wave" id="sound-wave">
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                        <div class="wave-bar"></div>
                    </div>
                    <div class="audio-status" id="audio-status">準備中...</div>
                </div>
                <div class="audio-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="audio-progress-fill"></div>
                    </div>
                    <span class="progress-text" id="audio-progress-text">0 / 0</span>
                </div>
                <button class="btn btn-secondary" onclick="window.stopAudioTraining()">
                    ⏹️ 停止
                </button>
            </section>
            
            <!-- 答題區域 -->
            <section class="answer-area glass-panel" id="audio-answer-area" style="display: none;">
                <h3>請輸入答案</h3>
                <input 
                    type="number" 
                    id="audio-answer-input" 
                    class="answer-input"
                    placeholder="?"
                    autofocus
                    onkeypress="if(event.key==='Enter') window.submitAudioAnswer()"
                >
                <div class="answer-buttons">
                    <button class="btn btn-secondary" onclick="window.replayAudio()">
                        🔄 重播題目
                    </button>
                    <button class="btn btn-primary" onclick="window.submitAudioAnswer()">
                        確認
                    </button>
                </div>
            </section>
            
            <!-- 結果區域 -->
            <section class="result-area glass-panel" id="audio-result-area" style="display: none;">
                <div class="result-icon" id="audio-result-icon">✅</div>
                <div class="result-text" id="audio-result-text">正確！</div>
                <div class="result-details" id="audio-result-details"></div>
                <button class="btn btn-primary" onclick="window.nextAudio()">
                    下一題 →
                </button>
            </section>
            
            <!-- 統計面板 -->
            <section class="stats-panel glass-panel">
                <div class="stat-item">
                    <span class="stat-label">本次得分</span>
                    <span class="stat-value" id="audio-score">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">正確率</span>
                    <span class="stat-value" id="audio-accuracy">--%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">題數</span>
                    <span class="stat-value" id="audio-count">0</span>
                </div>
            </section>
        </div>
    `;
}

/**
 * 開始聽力訓練
 */
async function startAudioTraining() {
    // 初始化音訊
    AudioManager.init();
    
    // 檢查語音合成支援
    if (!('speechSynthesis' in window)) {
        alert('您的瀏覽器不支援語音合成功能');
        return;
    }
    
    // 讀取設定
    const digits = parseInt(document.getElementById('audio-digits').value);
    const rows = parseInt(document.getElementById('audio-rows').value);
    const lang = document.getElementById('audio-lang').value;
    const speed = parseFloat(document.getElementById('audio-speed').value);
    
    // 產生題目
    audioState.currentProblem = generateProblem({ rows, digits });
    audioState.isRunning = true;
    audioState.currentIndex = 0;
    
    // 儲存設定
    audioState.lang = lang;
    audioState.speed = speed;
    
    // 切換 UI
    document.getElementById('audio-settings').style.display = 'none';
    document.getElementById('audio-training-area').style.display = 'block';
    document.getElementById('audio-answer-area').style.display = 'none';
    document.getElementById('audio-result-area').style.display = 'none';
    
    // 開始朗讀
    await speakProblem();
}

/**
 * 朗讀題目
 */
async function speakProblem() {
    const nums = audioState.currentProblem.nums;
    const lang = audioState.lang;
    const speed = audioState.speed;
    
    const statusEl = document.getElementById('audio-status');
    const progressFill = document.getElementById('audio-progress-fill');
    const progressText = document.getElementById('audio-progress-text');
    const soundWave = document.getElementById('sound-wave');
    
    // 顯示音波動畫
    soundWave.classList.add('active');
    
    const operators = lang === 'zh-TW' 
        ? { plus: '加', minus: '減' }
        : { plus: 'plus', minus: 'minus' };
    
    for (let i = 0; i < nums.length; i++) {
        if (!audioState.isRunning) break;
        
        audioState.currentIndex = i;
        
        // 更新進度
        progressFill.style.width = `${((i + 1) / nums.length) * 100}%`;
        progressText.textContent = `${i + 1} / ${nums.length}`;
        
        const num = nums[i];
        
        // 顯示狀態
        if (i > 0) {
            const opText = num >= 0 ? operators.plus : operators.minus;
            statusEl.textContent = `${opText}...`;
            await speakText(opText, lang, speed);
            await sleep(300);
        }
        
        // 朗讀數字
        statusEl.textContent = `${Math.abs(num)}`;
        await speakText(String(Math.abs(num)), lang, speed);
        await sleep(500);
    }
    
    // 朗讀完成
    soundWave.classList.remove('active');
    statusEl.textContent = '請作答';
    
    // 顯示答題區
    if (audioState.isRunning) {
        document.getElementById('audio-training-area').style.display = 'none';
        document.getElementById('audio-answer-area').style.display = 'block';
        document.getElementById('audio-answer-input').focus();
    }
}

/**
 * 朗讀文字
 */
function speakText(text, lang, rate) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = 1.0;
        
        utterance.onend = resolve;
        utterance.onerror = resolve;
        
        window.speechSynthesis.speak(utterance);
    });
}

/**
 * 重播題目
 */
async function replayAudio() {
    document.getElementById('audio-answer-area').style.display = 'none';
    document.getElementById('audio-training-area').style.display = 'block';
    await speakProblem();
}

/**
 * 停止訓練
 */
function stopAudioTraining() {
    audioState.isRunning = false;
    window.speechSynthesis.cancel();
    
    document.getElementById('audio-settings').style.display = 'block';
    document.getElementById('audio-training-area').style.display = 'none';
    document.getElementById('audio-answer-area').style.display = 'none';
    document.getElementById('audio-result-area').style.display = 'none';
}

/**
 * 提交答案
 */
function submitAudioAnswer() {
    const input = document.getElementById('audio-answer-input');
    const userAnswer = parseInt(input.value);
    const correctAnswer = audioState.currentProblem.total;
    
    audioState.totalQuestions++;
    
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
        audioState.correctCount++;
        audioState.score += 15; // 聽力題更難，給更多分
        AudioManager.play('correct');
        
        // 加經驗值
        addXP(15);
    } else {
        AudioManager.play('wrong');
    }
    
    // 更新統計
    document.getElementById('audio-score').textContent = audioState.score;
    document.getElementById('audio-count').textContent = audioState.totalQuestions;
    document.getElementById('audio-accuracy').textContent = 
        `${Math.round((audioState.correctCount / audioState.totalQuestions) * 100)}%`;
    
    // 顯示結果
    document.getElementById('audio-answer-area').style.display = 'none';
    document.getElementById('audio-result-area').style.display = 'block';
    
    document.getElementById('audio-result-icon').textContent = isCorrect ? '✅' : '❌';
    document.getElementById('audio-result-text').textContent = isCorrect ? '正確！' : '答錯了';
    document.getElementById('audio-result-details').innerHTML = `
        <p>題目：${audioState.currentProblem.nums.join(' → ')}</p>
        <p>正確答案：<strong>${correctAnswer}</strong></p>
        ${!isCorrect ? `<p>你的答案：${userAnswer}</p>` : ''}
    `;
    
    // 清空輸入
    input.value = '';
}

/**
 * 加經驗值
 */
function addXP(amount) {
    const currentXP = AppState.get('user.xp');
    const xpToNext = AppState.get('user.xpToNextLevel');
    const newXP = currentXP + amount;
    
    if (newXP >= xpToNext) {
        // 升級！
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
 * 下一題
 */
function nextAudio() {
    document.getElementById('audio-result-area').style.display = 'none';
    document.getElementById('audio-settings').style.display = 'block';
}

/**
 * 頁面進入時初始化
 */
export function onEnter() {
    audioState = {
        isRunning: false,
        isPaused: false,
        currentProblem: null,
        userAnswer: '',
        score: 0,
        totalQuestions: 0,
        correctCount: 0,
        currentIndex: 0,
    };
    
    // 綁定全域函數
    window.startAudioTraining = startAudioTraining;
    window.stopAudioTraining = stopAudioTraining;
    window.submitAudioAnswer = submitAudioAnswer;
    window.replayAudio = replayAudio;
    window.nextAudio = nextAudio;
}

/**
 * 離開時清理
 */
export function onLeave() {
    audioState.isRunning = false;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

export default {
    render,
    onEnter,
    onLeave,
};
