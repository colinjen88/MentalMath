/**
 * Utility Functions
 * 通用工具函數庫
 * 
 * @module core/utils
 */

/**
 * 產生指定範圍的隨機整數
 * @param {number} min - 最小值 (包含)
 * @param {number} max - 最大值 (包含)
 * @returns {number}
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 從陣列中隨機選擇一個元素
 * @param {Array} arr - 來源陣列
 * @returns {*}
 */
export function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 洗牌演算法 (Fisher-Yates)
 * @param {Array} arr - 要洗牌的陣列
 * @returns {Array} 新的洗牌後陣列
 */
export function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * 防抖函數
 * @param {Function} fn - 要防抖的函數
 * @param {number} delay - 延遲毫秒數
 * @returns {Function}
 */
export function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * 節流函數
 * @param {Function} fn - 要節流的函數
 * @param {number} limit - 最小間隔毫秒數
 * @returns {Function}
 */
export function throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 格式化數字 (加入千分位)
 * @param {number} num - 數字
 * @returns {string}
 */
export function formatNumber(num) {
    return num.toLocaleString('zh-TW');
}

/**
 * 等待指定毫秒
 * @param {number} ms - 毫秒數
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 安全地解析 JSON
 * @param {string} str - JSON 字串
 * @param {*} defaultValue - 解析失敗時的預設值
 * @returns {*}
 */
export function safeJsonParse(str, defaultValue = null) {
    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
}

/**
 * 產生唯一 ID
 * @returns {string}
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 深拷貝物件
 * @param {Object} obj - 要拷貝的物件
 * @returns {Object}
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 計算經驗值升級所需
 * @param {number} level - 當前等級
 * @returns {number} 升級所需 XP
 */
export function calculateXpRequired(level) {
    // 使用指數成長公式
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * 取得今天的日期字串 (YYYY-MM-DD)
 * @returns {string}
 */
export function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * 建立 DOM 元素
 * @param {string} tag - 標籤名
 * @param {Object} attrs - 屬性
 * @param {string|Node|Array} children - 子元素
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    }
    
    if (!Array.isArray(children)) {
        children = [children];
    }
    
    for (const child of children) {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    }
    
    return el;
}

/**
 * 產生珠心算題目
 * @param {Object} options - 設定選項
 * @returns {Object} { nums: number[], total: number }
 */
export function generateProblem(options = {}) {
    const {
        rows = 3,
        digits = 1,
        allowNegative = true,
        ensurePositiveResult = true,
    } = options;
    
    const maxVal = Math.pow(10, digits) - 1;
    const minVal = Math.pow(10, digits - 1);
    
    let nums = [];
    let currentSum = 0;
    
    // 第一個數一定是正數
    const first = randomInt(minVal, maxVal);
    nums.push(first);
    currentSum = first;
    
    for (let i = 1; i < rows; i++) {
        const val = randomInt(minVal, maxVal);
        const isAdd = allowNegative ? Math.random() > 0.4 : true;
        
        if (!isAdd && ensurePositiveResult) {
            // 確保結果為正
            if (currentSum - val >= 0) {
                nums.push(-val);
                currentSum -= val;
            } else {
                nums.push(val);
                currentSum += val;
            }
        } else if (!isAdd) {
            nums.push(-val);
            currentSum -= val;
        } else {
            nums.push(val);
            currentSum += val;
        }
    }
    
    return {
        nums,
        total: nums.reduce((a, b) => a + b, 0),
    };
}

/**
 * 產生補數題目 (湊5/湊10)
 * @param {string} type - '5' | '10' | 'mix'
 * @param {number} rows - 口數
 * @returns {Object}
 */
export function generateFriendProblem(type, rows = 2) {
    let nums = [];
    let n1, n2;
    
    const is5 = type === '5' || (type === 'mix' && Math.random() > 0.5);
    
    if (is5) {
        const base = randomInt(1, 4);
        n1 = base;
        n2 = 5 - base;
    } else {
        const base = randomInt(1, 9);
        n1 = base;
        n2 = 10 - base;
    }
    
    nums = [n1, n2];
    
    if (rows >= 3) {
        const current = n1 + n2;
        const n3 = randomInt(1, 9);
        if (Math.random() > 0.5 && current - n3 >= 0) {
            nums.push(-n3);
        } else {
            nums.push(n3);
        }
    }
    
    return {
        nums,
        total: nums.reduce((a, b) => a + b, 0),
    };
}
