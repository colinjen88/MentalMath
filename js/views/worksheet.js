/**
 * Worksheet View Module
 * 學習單列印模組 (保留原有功能)
 * 
 * @module views/worksheet
 */

import AppState from '../core/state.js';
import { generateProblem, generateFriendProblem, randomInt } from '../core/utils.js';

// 模組層級變數：當前題目資料 (避免切換答案時重新生成)
let currentWorksheetData = null;

// 初始化題號格式預設值
if (!AppState.get('worksheet.labelType')) {
    AppState.set('worksheet.labelType', '1-10-repeat');
}

/**
 * 渲染學習單頁面
 * @returns {string} HTML 字串
 */
export function render() {
    const settings = AppState.get('worksheet');
    
    // 初次載入時生成資料
    if (!currentWorksheetData) {
        currentWorksheetData = generateWorksheetData(settings);
    }
    
    return `
        <div class="view worksheet-view">
            <!-- 控制面板 -->
            <section class="worksheet-controls glass-panel no-print">
                <h3>📄 學習單生成器</h3>
                
                <!-- 模式選擇 -->
                <div class="mode-selector">
                    <button class="mode-btn ${settings.mode === 'read' ? 'active' : ''}" 
                            onclick="window.changeWorksheetMode('read')">
                        👁️ 看珠寫數
                    </button>
                    <button class="mode-btn ${settings.mode === 'draw' ? 'active' : ''}" 
                            onclick="window.changeWorksheetMode('draw')">
                        ✏️ 看數畫珠
                    </button>
                    <button class="mode-btn ${settings.mode === 'friends' ? 'active' : ''}" 
                            onclick="window.changeWorksheetMode('friends')">
                        🤝 補數湊數
                    </button>
                    <button class="mode-btn ${settings.mode === 'calc' ? 'active' : ''}" 
                            onclick="window.changeWorksheetMode('calc')">
                        🔢 直式心算
                    </button>
                </div>

                <!-- 通用設定 -->
                <div class="common-settings">
                    <label>題號格式：</label>
                    <select onchange="window.updateWorksheetSetting('labelType', this.value)">
                        <option value="1-10-repeat" ${settings.labelType === '1-10-repeat' ? 'selected' : ''}>1~10 重複 (適合直式)</option>
                        <option value="A-J-repeat" ${settings.labelType === 'A-J-repeat' ? 'selected' : ''}>A~J 重複 (適合直式)</option>
                        <option value="1-continuous" ${settings.labelType === '1-continuous' ? 'selected' : ''}>1, 2, 3... 連續</option>
                        <option value="A-continuous" ${settings.labelType === 'A-continuous' ? 'selected' : ''}>A, B...AA... 連續</option>
                        <option value="none" ${settings.labelType === 'none' ? 'selected' : ''}>不顯示題號</option>
                    </select>
                </div>
                
                <!-- 動態設定 -->
                <div class="worksheet-settings" id="worksheet-settings">
                    ${renderSettingsForMode(settings.mode, settings)}
                </div>
                
                <!-- 操作按鈕 -->
                <div class="worksheet-actions">
                    <button class="btn btn-secondary" id="toggle-answer-btn" onclick="window.toggleWorksheetAnswer()">
                        ${settings.showAnswer ? '🙈 隱藏答案' : '👁️ 顯示答案'}
                    </button>
                    <button class="btn btn-secondary" onclick="window.regenerateWorksheet()">
                        🔄 換新題目
                    </button>
                    <button class="btn btn-primary" onclick="window.print()">
                        🖨️ 列印
                    </button>
                </div>
            </section>
            
            <!-- A4 學習單預覽 -->
            <div class="worksheet-preview-container">
                <div class="a4-paper" id="worksheet-paper">
                    ${renderWorksheetContent(settings, currentWorksheetData)}
                </div>
            </div>
        </div>
    `;
}

/**
 * 根據模式渲染設定選項
 */
function renderSettingsForMode(mode, settings) {
    switch (mode) {
        case 'read':
        case 'draw':
            return `
                <div class="setting-item">
                    <label>難度範圍</label>
                    <select id="ws-rangeType" onchange="window.updateWorksheetSetting('rangeType', this.value)">
                        <option value="0-4" ${settings.rangeType === '0-4' ? 'selected' : ''}>簡單 (0-4)</option>
                        <option value="5-9" ${settings.rangeType === '5-9' ? 'selected' : ''}>進階 (5-9)</option>
                        <option value="0-9" ${settings.rangeType === '0-9' ? 'selected' : ''}>混合 (0-9)</option>
                        <option value="10-99" ${settings.rangeType === '10-99' ? 'selected' : ''}>兩位數</option>
                    </select>
                </div>
            `;
        case 'friends':
            return `
                <div class="setting-item">
                    <label>口訣類型</label>
                    <select id="ws-friendType" onchange="window.updateWorksheetSetting('friendType', this.value)">
                        <option value="5" ${settings.friendType === '5' ? 'selected' : ''}>湊 5</option>
                        <option value="10" ${settings.friendType === '10' ? 'selected' : ''}>湊 10</option>
                        <option value="mix" ${settings.friendType === 'mix' ? 'selected' : ''}>混合</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>口數</label>
                    <select id="ws-friendRows" onchange="window.updateWorksheetSetting('friendRows', parseInt(this.value))">
                        <option value="2" ${settings.friendRows === 2 ? 'selected' : ''}>2 口</option>
                        <option value="3" ${settings.friendRows === 3 ? 'selected' : ''}>3 口</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>組數</label>
                    <select id="ws-friendGroups" onchange="window.updateWorksheetSetting('friendGroups', parseInt(this.value))">
                        <option value="2" ${settings.friendGroups === 2 ? 'selected' : ''}>2 組 (20題)</option>
                        <option value="3" ${settings.friendGroups === 3 ? 'selected' : ''}>3 組 (30題)</option>
                        <option value="4" ${settings.friendGroups === 4 ? 'selected' : ''}>4 組 (40題)</option>
                    </select>
                </div>
            `;
        case 'calc':
            return `
                <div class="setting-item">
                    <label>位數</label>
                    <select id="ws-calcDigits" onchange="window.updateWorksheetSetting('calcDigits', parseInt(this.value))">
                        <option value="1" ${settings.calcDigits === 1 ? 'selected' : ''}>1 位數</option>
                        <option value="2" ${settings.calcDigits === 2 ? 'selected' : ''}>2 位數</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>口數</label>
                    <select id="ws-calcRows" onchange="window.updateWorksheetSetting('calcRows', parseInt(this.value))">
                        <option value="3" ${settings.calcRows === 3 ? 'selected' : ''}>3 口</option>
                        <option value="4" ${settings.calcRows === 4 ? 'selected' : ''}>4 口</option>
                        <option value="5" ${settings.calcRows === 5 ? 'selected' : ''}>5 口</option>
                        <option value="6" ${settings.calcRows === 6 ? 'selected' : ''}>6 口</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>題量</label>
                    <select id="ws-calcBlocks" onchange="window.updateWorksheetSetting('calcBlocks', parseInt(this.value))">
                        <option value="3" ${settings.calcBlocks === 3 ? 'selected' : ''}>30 題</option>
                        <option value="4" ${settings.calcBlocks === 4 ? 'selected' : ''}>40 題</option>
                        <option value="5" ${settings.calcBlocks === 5 ? 'selected' : ''}>50 題</option>
                    </select>
                </div>
            `;
        default:
            return '';
    }
}

/**
 * 渲染學習單內容
 * @param {Object} settings - 設定
 * @param {Array} data - 題目資料 (從外部傳入，避免重複生成)
 */
function renderWorksheetContent(settings, data) {
    const { mode, showAnswer, labelType } = settings;
    
    let title = '';
    let subtitle = '';
    
    switch (mode) {
        case 'read':
            title = '看珠寫數訓練';
            subtitle = `難度：${settings.rangeType}`;
            break;
        case 'draw':
            title = '看數畫珠訓練';
            subtitle = `難度：${settings.rangeType}`;
            break;
        case 'friends':
            title = '好朋友湊數特訓';
            const groups = settings.friendGroups || 2;
            subtitle = `口訣：${settings.friendType} / ${settings.friendRows}口 / ${groups}組`;
            break;
        case 'calc':
            title = '直式心算檢定';
            subtitle = `${settings.calcDigits}位數 × ${settings.calcRows}口`;
            break;
    }
    
    return `
        <!-- 頁首 -->
        <div class="worksheet-header">
            <div class="header-top">
                <h1 class="worksheet-title">${title}</h1>
                <span class="worksheet-subtitle">${subtitle}</span>
            </div>
            <div class="header-fields">
                <div class="field">姓名：<span class="underline"></span></div>
                <div class="field">日期：<span class="underline"></span></div>
                <div class="field">時間：<span class="underline short"></span>分<span class="underline short"></span>秒</div>
                <div class="field">得分：<span class="underline short"></span></div>
            </div>
        </div>
        
        <!-- 內容區 -->
        <div class="worksheet-content">
            ${renderContentByMode(mode, data, settings, showAnswer, labelType)}
        </div>
        
        <!-- 頁尾 -->
        <div class="worksheet-footer">
            <div>家長簽名：_______________</div>
            <div>珠心算學院 - 每日練習成就天才</div>
        </div>
    `;
}

/**
 * 根據模式產生資料
 */
function generateWorksheetData(settings) {
    const { mode, rangeType, friendType, friendRows, friendGroups, calcRows, calcDigits, calcBlocks } = settings;
    const data = [];
    
    switch (mode) {
        case 'read':
        case 'draw':
            for (let i = 0; i < 20; i++) {
                let num;
                if (rangeType === '0-4') num = randomInt(0, 4);
                else if (rangeType === '5-9') num = randomInt(5, 9);
                else if (rangeType === '0-9') num = randomInt(0, 9);
                else num = randomInt(10, 99);
                data.push(num);
            }
            break;
        case 'friends':
            // 根據組數計算題目數量 (每組 10 題)
            const friendsTotal = (friendGroups || 2) * 10;
            for (let i = 0; i < friendsTotal; i++) {
                data.push(generateFriendProblem(friendType, friendRows));
            }
            break;
        case 'calc':
            const total = calcBlocks * 10;
            for (let i = 0; i < total; i++) {
                data.push(generateProblem({ rows: calcRows, digits: calcDigits }));
            }
            break;
    }
    
    return data;
}

/**
 * 根據模式渲染內容
 */
function renderContentByMode(mode, data, settings, showAnswer, labelType) {
    switch (mode) {
        case 'read':
            return renderReadMode(data, showAnswer, labelType);
        case 'draw':
            return renderDrawMode(data, settings.rangeType, showAnswer, labelType);
        case 'friends':
            return renderFriendsMode(data, settings.friendGroups || 2, showAnswer, labelType);
        case 'calc':
            return renderCalcMode(data, settings.calcBlocks, showAnswer, labelType);
        default:
            return '';
    }
}


/**
 * 看珠寫數模式
 */
function renderReadMode(data, showAnswer, labelType) {
    return `
        <div class="grid grid-5">
            ${data.map((num, i) => `
                <div class="abacus-card">
                    ${renderLabel(i, labelType)}
                    ${renderStaticAbacus(num)}
                    <div class="answer-box ${showAnswer ? 'show' : ''}">${showAnswer ? num : ''}</div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 看數畫珠模式
 */
function renderDrawMode(data, rangeType, showAnswer, labelType) {
    return `
        <div class="grid grid-5">
            ${data.map((num, i) => `
                <div class="abacus-card">
                    ${renderLabel(i, labelType)}
                    <div class="number-display">${num}</div>
                    ${showAnswer ? renderStaticAbacus(num) : renderEmptyAbacus(rangeType === '10-99')}
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * 湊數模式 (支援動態組數)
 * @param {Array} data - 題目資料
 * @param {number} groups - 組數 (2-4)
 * @param {boolean} showAnswer - 是否顯示答案
 */
function renderFriendsMode(data, groups, showAnswer, labelType) {
    const perGroup = Math.ceil(data.length / groups);
    
    // 根據組數計算 grid 欄數
    const gridCols = groups <= 2 ? 5 : 5;
    
    return `
        <div class="friends-layout friends-layout-${groups}">
            ${Array.from({ length: groups }, (_, colIndex) => `
                <div class="friends-column">
                    <h4 class="part-title">PART ${colIndex + 1}</h4>
                    <div class="friends-grid friends-grid-${gridCols}">
                        ${data.slice(colIndex * perGroup, (colIndex + 1) * perGroup).map((p, i) => `
                            <div class="friends-item">
                                ${renderLabel(colIndex * perGroup + i, labelType)}
                                <div class="friends-nums">
                                    ${p.nums.map(n => `<span>${n}</span>`).join('')}
                                </div>
                                <div class="friends-answer ${showAnswer ? 'show' : ''}">
                                    ${showAnswer ? p.total : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="formula-hint">
            <div class="hint-box">
                <strong>【湊 5 口訣】</strong> +4 = +5 -1 ｜ +3 = +5 -2 ｜ +2 = +5 -3 ｜ +1 = +5 -4
            </div>
            <div class="hint-box">
                <strong>【湊 10 口訣】</strong> +9 = -1 +10 ｜ +8 = -2 +10 ｜ +7 = -3 +10 ｜ +6 = -4 +10
            </div>
        </div>
    `;
}

/**
 * 直式心算模式
 */
function renderCalcMode(data, blocks, showAnswer, labelType) {
    const perBlock = 10;
    const isRepeated = labelType === '1-10-repeat' || labelType === 'A-J-repeat';
    
    // 如果是重複的，我們生成頂部標籤列
    let headerLabels = [];
    if (isRepeated) {
        for(let i=0; i<10; i++) {
             headerLabels.push(getQuestionLabel(i, labelType));
        }
    }
    
    let html = '<div class="calc-blocks">';
    
    for (let b = 0; b < blocks; b++) {
        const subset = data.slice(b * perBlock, (b + 1) * perBlock);
        if (subset.length === 0) break;
        
        html += `
            <div class="calc-block">
                ${isRepeated ? `
                    <div class="calc-labels">
                        ${headerLabels.map(l => `<span>${l}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="calc-problems" style="${!isRepeated ? 'border-top: 1px solid #1a1a1a;' : ''}">
                    ${subset.map((p, i) => `
                        <div class="calc-problem" style="position: relative;">
                            ${!isRepeated ? renderLabel(b * perBlock + i, labelType) : ''}
                            <div class="calc-nums">
                                ${p.nums.map(n => `<span>${n}</span>`).join('')}
                            </div>
                            <div class="calc-answer ${showAnswer ? 'show' : ''}">
                                ${showAnswer ? p.total : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

/**
 * 輔助函數：渲染題號標籤
 */
function renderLabel(index, format) {
    if (!format || format === 'none') return '';
    const label = getQuestionLabel(index, format);
    return `<span class="question-label">${label}</span>`;
}

/**
 * 輔助函數：計算題號文字
 */
function getQuestionLabel(index, format) {
    switch (format) {
        case '1-10-repeat':
            return (index % 10) + 1;
        case 'A-J-repeat':
            const letters = 'ABCDEFGHIJ';
            return letters[index % 10] || '?';
        case 'A-continuous':
            // 超過 26 題用 AA, AB... 這裡簡化處理，通常一頁不超過 50 題
            // Z=25, AA=26
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (index < 26) return alphabet[index];
            return alphabet[Math.floor(index/26)-1] + alphabet[index%26];
        case '1-continuous':
        default:
            return index + 1;
    }
}

/**
 * 渲染靜態算盤 (SVG 簡化版，用於列印)
 */
function renderStaticAbacus(num) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    const is2D = num >= 10;
    
    let cols = is2D ? [tens, ones] : [ones];
    
    return `
        <div class="static-abacus">
            ${cols.map(val => renderAbacusColumn(val)).join('')}
        </div>
    `;
}

/**
 * 渲染空白算盤 (用於畫珠練習)
 */
function renderEmptyAbacus(is2D) {
    const cols = is2D ? 2 : 1;
    return `
        <div class="static-abacus empty">
            ${Array(cols).fill(0).map(() => renderAbacusColumn(-1)).join('')}
        </div>
    `;
}

/**
 * 渲染算盤單一列
 */
function renderAbacusColumn(val) {
    const hasHeaven = val >= 5;
    const earthCount = val >= 0 ? val % 5 : 0;
    const isEmpty = val < 0;
    
    return `
        <div class="abacus-col">
            <div class="rod"></div>
            <div class="heaven-area">
                <div class="bead ${isEmpty ? 'empty' : ''} ${hasHeaven ? 'active' : 'inactive'}"></div>
            </div>
            <div class="beam"></div>
            <div class="earth-area">
                ${[0, 1, 2, 3].map(i => `
                    <div class="bead ${isEmpty ? 'empty' : ''} ${i < earthCount ? 'active' : 'inactive'}"></div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * 頁面進入時初始化
 */
export function onEnter() {
    // 初始化時生成資料
    const settings = AppState.get('worksheet');
    if (!settings.labelType) {
        AppState.set('worksheet.labelType', '1-10-repeat');
    }
    currentWorksheetData = generateWorksheetData(settings);
    
    // 初始化縮放
    setTimeout(applyWorksheetScale, 100);
    window.addEventListener('resize', applyWorksheetScale);
    
    // 綁定全域函數
    window.changeWorksheetMode = (mode) => {
        AppState.set('worksheet.mode', mode);
        // 切換模式時重新生成資料
        const newSettings = AppState.get('worksheet');
        currentWorksheetData = generateWorksheetData(newSettings);
        refreshWorksheet(false);
    };
    
    window.updateWorksheetSetting = (key, value) => {
        AppState.set(`worksheet.${key}`, value);
        // 設定變更時重新生成資料
        const newSettings = AppState.get('worksheet');
        currentWorksheetData = generateWorksheetData(newSettings);
        refreshWorksheet(false);
    };
    
    window.toggleWorksheetAnswer = () => {
        const current = AppState.get('worksheet.showAnswer');
        AppState.set('worksheet.showAnswer', !current);
        // 切換答案時不重新生成資料，只更新顯示
        refreshWorksheet(true);
    };
    
    window.regenerateWorksheet = () => {
        // 換新題目時重新生成資料
        const settings = AppState.get('worksheet');
        currentWorksheetData = generateWorksheetData(settings);
        refreshWorksheet(false);
    };
}

/**
 * 重新整理學習單
 * @param {boolean} keepData - 是否保留現有資料 (切換答案時為 true)
 */
function refreshWorksheet(keepData = false) {
    const settings = AppState.get('worksheet');
    
    // 更新設定區域
    const settingsEl = document.getElementById('worksheet-settings');
    if (settingsEl) {
        settingsEl.innerHTML = renderSettingsForMode(settings.mode, settings);
    }
    
    // 更新紙張內容
    const paper = document.getElementById('worksheet-paper');
    if (paper) {
        paper.innerHTML = renderWorksheetContent(settings, currentWorksheetData);
        // 重新整理後重新計算縮放
        setTimeout(applyWorksheetScale, 0);
    }
    
    // 更新答案按鈕文字
    const answerBtn = document.getElementById('toggle-answer-btn');
    if (answerBtn) {
        answerBtn.textContent = settings.showAnswer ? '🙈 隱藏答案' : '👁️ 顯示答案';
    }
    
    // 更新模式按鈕
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.textContent.includes(getModeLabel(settings.mode)));
    });
}

function getModeLabel(mode) {
    const labels = {
        'read': '看珠',
        'draw': '看數',
        'friends': '補數',
        'calc': '直式',
    };
    return labels[mode] || '';
}

/**
 * 自動計算並套用學習單縮放 (A4 寬度為 210mm ~ 794px)
 */
function applyWorksheetScale() {
    const paper = document.getElementById('worksheet-paper');
    const container = document.querySelector('.worksheet-preview-container');
    if (!paper || !container) return;
    
    const containerWidth = container.offsetWidth - 32; // 扣除 padding
    const paperWidth = 794; // A4 像素寬度 (96 DPI)
    
    if (containerWidth < paperWidth) {
        const scale = containerWidth / paperWidth;
        paper.style.transform = `scale(${scale})`;
        paper.style.transformOrigin = 'top center';
        // 調整容器高度以匹配縮放後的紙張
        container.style.height = `${paper.offsetHeight * scale + 40}px`;
    } else {
        paper.style.transform = 'none';
        container.style.height = 'auto';
    }
}

export function onLeave() {
    window.removeEventListener('resize', applyWorksheetScale);
}

export default {
    render,
    onEnter,
    onLeave,
};
