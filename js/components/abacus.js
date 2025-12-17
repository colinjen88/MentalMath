/**
 * Interactive Abacus Component
 * 互動式算盤元件 - 使用 SVG 繪製，支援拖曳與觸控
 * 
 * @module components/abacus
 */

import AppState from '../core/state.js';
import AudioManager from '../core/audio.js';

/**
 * Abacus Class
 * 單一算盤實例，可建立多個用於不同場景
 */
class Abacus {
    /**
     * @param {Object} options - 設定選項
     * @param {HTMLElement|string} options.container - 容器元素或選擇器
     * @param {number} [options.columns=5] - 算盤位數 (從右開始: 個位、十位...)
     * @param {boolean} [options.interactive=true] - 是否可互動
     * @param {boolean} [options.showValue=true] - 是否顯示數值
     * @param {Function} [options.onChange] - 值變更時的回調
     */
    constructor(options = {}) {
        this.container = typeof options.container === 'string'
            ? document.querySelector(options.container)
            : options.container;
        
        if (!this.container) {
            throw new Error('Abacus: Container element not found');
        }
        
        this.columns = options.columns || 5;
        this.interactive = options.interactive !== false;
        this.showValue = options.showValue !== false;
        this.onChange = options.onChange || (() => {});
        
        // 每列的值 (0-9)
        this.values = new Array(this.columns).fill(0);
        
        // SVG 元素參考
        this.svg = null;
        this.beads = [];
        
        // 尺寸設定
        this.config = {
            columnWidth: 50,
            height: 220,        // 增加高度容納所有珠子
            beadHeight: 20,     // 稍微縮小珠子
            beadWidth: 38,
            beadGap: 3,
            rodWidth: 4,
            beamY: 60,          // 橫樑 Y 位置
            beamHeight: 8,
            heavenTop: 10,      // 上珠區頂部
            earthTop: 75,       // 下珠區頂部 (橫樑下方)
            padding: 10,
        };
        
        // 拖曳狀態
        this.dragging = null;
        
        this.init();
    }
    
    /**
     * 初始化算盤
     */
    init() {
        this.render();
        if (this.interactive) {
            this.bindEvents();
        }
    }
    
    /**
     * 渲染 SVG 算盤
     */
    render() {
        const { columnWidth, height, padding } = this.config;
        const totalWidth = this.columns * columnWidth + padding * 2;
        
        // 建立 SVG
        const svgNS = 'http://www.w3.org/2000/svg';
        this.svg = document.createElementNS(svgNS, 'svg');
        this.svg.setAttribute('viewBox', `0 0 ${totalWidth} ${height + 40}`);
        this.svg.setAttribute('class', 'abacus-svg');
        this.svg.style.width = '100%';
        this.svg.style.maxWidth = `${totalWidth}px`;
        this.svg.style.height = 'auto';
        this.svg.style.userSelect = 'none';
        this.svg.style.touchAction = 'none';
        
        // 背景漸層
        const defs = document.createElementNS(svgNS, 'defs');
        
        // 木紋背景漸層
        const bgGradient = document.createElementNS(svgNS, 'linearGradient');
        bgGradient.setAttribute('id', 'abacus-bg');
        bgGradient.setAttribute('x1', '0%');
        bgGradient.setAttribute('y1', '0%');
        bgGradient.setAttribute('x2', '0%');
        bgGradient.setAttribute('y2', '100%');
        bgGradient.innerHTML = `
            <stop offset="0%" style="stop-color:#8B4513"/>
            <stop offset="50%" style="stop-color:#A0522D"/>
            <stop offset="100%" style="stop-color:#8B4513"/>
        `;
        defs.appendChild(bgGradient);
        
        // 算珠漸層
        const beadGradient = document.createElementNS(svgNS, 'radialGradient');
        beadGradient.setAttribute('id', 'bead-gradient');
        beadGradient.setAttribute('cx', '30%');
        beadGradient.setAttribute('cy', '30%');
        beadGradient.innerHTML = `
            <stop offset="0%" style="stop-color:#555"/>
            <stop offset="100%" style="stop-color:#1a1a1a"/>
        `;
        defs.appendChild(beadGradient);
        
        // 算珠高亮漸層 (點擊時)
        const beadActiveGradient = document.createElementNS(svgNS, 'radialGradient');
        beadActiveGradient.setAttribute('id', 'bead-active-gradient');
        beadActiveGradient.setAttribute('cx', '30%');
        beadActiveGradient.setAttribute('cy', '30%');
        beadActiveGradient.innerHTML = `
            <stop offset="0%" style="stop-color:#FFD700"/>
            <stop offset="100%" style="stop-color:#B8860B"/>
        `;
        defs.appendChild(beadActiveGradient);
        
        this.svg.appendChild(defs);
        
        // 外框背景
        const frame = document.createElementNS(svgNS, 'rect');
        frame.setAttribute('x', 0);
        frame.setAttribute('y', 0);
        frame.setAttribute('width', totalWidth);
        frame.setAttribute('height', height);
        frame.setAttribute('rx', 8);
        frame.setAttribute('fill', 'url(#abacus-bg)');
        frame.setAttribute('stroke', '#5D3A1A');
        frame.setAttribute('stroke-width', 3);
        this.svg.appendChild(frame);
        
        // 橫樑
        const beam = document.createElementNS(svgNS, 'rect');
        beam.setAttribute('x', 0);
        beam.setAttribute('y', this.config.beamY);
        beam.setAttribute('width', totalWidth);
        beam.setAttribute('height', this.config.beamHeight);
        beam.setAttribute('fill', '#3D2314');
        this.svg.appendChild(beam);
        
        // 繪製每一列
        this.beads = [];
        for (let col = 0; col < this.columns; col++) {
            this.renderColumn(col);
        }
        
        // 數值顯示區
        if (this.showValue) {
            this.valueDisplay = document.createElementNS(svgNS, 'text');
            this.valueDisplay.setAttribute('x', totalWidth / 2);
            this.valueDisplay.setAttribute('y', height + 28);
            this.valueDisplay.setAttribute('text-anchor', 'middle');
            this.valueDisplay.setAttribute('font-size', '24');
            this.valueDisplay.setAttribute('font-weight', 'bold');
            this.valueDisplay.setAttribute('font-family', 'monospace');
            this.valueDisplay.setAttribute('fill', '#333');
            this.valueDisplay.textContent = this.getValue();
            this.svg.appendChild(this.valueDisplay);
        }
        
        // 清空並插入容器
        this.container.innerHTML = '';
        this.container.appendChild(this.svg);
    }
    
    /**
     * 渲染單一列 (包含竿子和珠子)
     * @param {number} col - 列索引 (0 = 最左邊)
     */
    renderColumn(col) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const { columnWidth, beadHeight, beadWidth, rodWidth, padding } = this.config;
        
        const x = padding + col * columnWidth + columnWidth / 2;
        
        // 竿子
        const rod = document.createElementNS(svgNS, 'rect');
        rod.setAttribute('x', x - rodWidth / 2);
        rod.setAttribute('y', 5);
        rod.setAttribute('width', rodWidth);
        rod.setAttribute('height', this.config.height - 10);
        rod.setAttribute('fill', '#C0A080');
        rod.setAttribute('rx', 2);
        this.svg.appendChild(rod);
        
        // 定位點 (在橫樑上)
        const locator = document.createElementNS(svgNS, 'circle');
        locator.setAttribute('cx', x);
        locator.setAttribute('cy', this.config.beamY + this.config.beamHeight / 2);
        locator.setAttribute('r', 3);
        locator.setAttribute('fill', '#FFD700');
        this.svg.appendChild(locator);
        
        // 算珠群組
        const colBeads = {
            heaven: null,   // 上珠
            earth: [],      // 下珠 (4顆)
        };
        
        // 上珠 (1顆)
        const heavenBead = this.createBead(x, col, 'heaven', 0);
        this.svg.appendChild(heavenBead);
        colBeads.heaven = heavenBead;
        
        // 下珠 (4顆)
        for (let i = 0; i < 4; i++) {
            const earthBead = this.createBead(x, col, 'earth', i);
            this.svg.appendChild(earthBead);
            colBeads.earth.push(earthBead);
        }
        
        this.beads[col] = colBeads;
        
        // 根據初始值更新位置
        this.updateColumnBeads(col);
    }
    
    /**
     * 建立單一算珠 SVG 元素
     */
    createBead(x, col, type, index) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const { beadWidth, beadHeight } = this.config;
        
        const bead = document.createElementNS(svgNS, 'ellipse');
        bead.setAttribute('cx', x);
        bead.setAttribute('rx', beadWidth / 2);
        bead.setAttribute('ry', beadHeight / 2);
        bead.setAttribute('fill', 'url(#bead-gradient)');
        bead.setAttribute('stroke', '#333');
        bead.setAttribute('stroke-width', 1);
        bead.setAttribute('cursor', this.interactive ? 'pointer' : 'default');
        bead.setAttribute('class', 'abacus-bead');
        
        // 儲存資料屬性
        bead.dataset.col = col;
        bead.dataset.type = type;
        bead.dataset.index = index;
        
        // 加入陰影效果
        bead.style.filter = 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))';
        
        return bead;
    }
    
    /**
     * 更新指定列的算珠位置
     * @param {number} col - 列索引
     */
    updateColumnBeads(col) {
        const value = this.values[col];
        const hasHeaven = value >= 5;
        const earthCount = value % 5;
        
        const { beadHeight, beadGap, beamY, beamHeight, heavenTop, height } = this.config;
        
        const colBeads = this.beads[col];
        
        // 上珠位置
        // 激活時靠近橫樑 (向下移動)，未激活時在頂部
        const heavenY = hasHeaven 
            ? beamY - beadHeight / 2 - beadGap 
            : heavenTop + beadHeight / 2;
        colBeads.heaven.setAttribute('cy', heavenY);
        colBeads.heaven.style.opacity = hasHeaven ? 1 : 0.5;
        
        // 下珠位置 - 從橫樑下方開始排列
        // 4顆珠子，i=0 最靠近橫樑，i=3 最遠離橫樑
        const earthStartY = beamY + beamHeight + beadGap + beadHeight / 2; // 第一顆珠子的Y位置 (最靠近橫樑)
        
        for (let i = 0; i < 4; i++) {
            const isActive = i < earthCount;
            let earthY;
            
            if (isActive) {
                // 激活的珠子緊貼在橫樑下方，依序排列
                earthY = earthStartY + i * (beadHeight + beadGap);
            } else {
                // 未激活的珠子在底部區域
                // 計算未激活珠子的起始位置 (從底部往上排)
                const inactiveCount = 4 - earthCount;
                const inactiveIndex = i - earthCount; // 在未激活珠子中的索引
                const bottomY = height - beadHeight / 2 - 5; // 最底部珠子位置
                earthY = bottomY - (inactiveCount - 1 - inactiveIndex) * (beadHeight + beadGap);
            }
            
            colBeads.earth[i].setAttribute('cy', earthY);
            colBeads.earth[i].style.opacity = isActive ? 1 : 0.5;
        }
    }
    
    /**
     * 綁定互動事件
     */
    bindEvents() {
        // 點擊/觸控事件
        this.svg.addEventListener('click', (e) => this.handleClick(e));
        this.svg.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
    }
    
    /**
     * 處理點擊事件
     */
    handleClick(e) {
        const bead = e.target.closest('.abacus-bead');
        if (!bead) return;
        
        const col = parseInt(bead.dataset.col);
        const type = bead.dataset.type;
        
        this.toggleBead(col, type);
    }
    
    /**
     * 處理觸控事件
     */
    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('abacus-bead')) {
            const col = parseInt(element.dataset.col);
            const type = element.dataset.type;
            this.toggleBead(col, type);
        }
    }
    
    /**
     * 切換算珠狀態
     * @param {number} col - 列索引
     * @param {string} type - 'heaven' | 'earth'
     */
    toggleBead(col, type) {
        const currentValue = this.values[col];
        let newValue;
        
        if (type === 'heaven') {
            // 上珠: 加減 5
            if (currentValue >= 5) {
                newValue = currentValue - 5;
            } else {
                newValue = currentValue + 5;
            }
        } else {
            // 下珠: 加減 1
            const earthCount = currentValue % 5;
            const hasHeaven = currentValue >= 5;
            
            if (earthCount < 4) {
                newValue = hasHeaven ? 5 + earthCount + 1 : earthCount + 1;
            } else {
                newValue = hasHeaven ? 5 : 0;
            }
        }
        
        // 確保在 0-9 範圍內
        newValue = Math.max(0, Math.min(9, newValue));
        
        if (newValue !== this.values[col]) {
            this.values[col] = newValue;
            this.updateColumnBeads(col);
            this.updateValueDisplay();
            
            // 播放音效
            AudioManager.playBeadSound();
            
            // 觸發回調
            this.onChange(this.getValue(), this.values);
        }
    }
    
    /**
     * 更新數值顯示
     */
    updateValueDisplay() {
        if (this.valueDisplay) {
            this.valueDisplay.textContent = this.getValue();
        }
    }
    
    /**
     * 取得當前數值
     * @returns {number}
     */
    getValue() {
        let total = 0;
        for (let i = 0; i < this.columns; i++) {
            // 從右到左: index 0 = 最高位
            const power = this.columns - 1 - i;
            total += this.values[i] * Math.pow(10, power);
        }
        return total;
    }
    
    /**
     * 設置算盤值
     * @param {number} value - 要設置的數值
     */
    setValue(value) {
        value = Math.max(0, Math.min(Math.pow(10, this.columns) - 1, value));
        const str = String(value).padStart(this.columns, '0');
        
        for (let i = 0; i < this.columns; i++) {
            this.values[i] = parseInt(str[i]);
            this.updateColumnBeads(i);
        }
        
        this.updateValueDisplay();
    }
    
    /**
     * 重置算盤
     */
    reset() {
        this.values = new Array(this.columns).fill(0);
        for (let i = 0; i < this.columns; i++) {
            this.updateColumnBeads(i);
        }
        this.updateValueDisplay();
    }
    
    /**
     * 銷毀算盤
     */
    destroy() {
        if (this.svg) {
            this.svg.remove();
        }
        this.beads = [];
    }
}

export default Abacus;
