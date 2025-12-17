/**
 * State Management Module
 * 全域狀態管理器 - 使用 Pub/Sub 模式實現響應式狀態
 * 
 * @module core/state
 */

const AppState = (() => {
    // Private state
    const state = {
        // 當前視圖/路由
        currentView: 'home',
        
        // 使用者資料
        user: {
            name: '小珠算師',
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            avatar: '🧒',
            streak: 0,
            lastPracticeDate: null,
        },
        
        // 算盤狀態
        abacus: {
            columns: 5,          // 算盤位數
            values: [0, 0, 0, 0, 0], // 每位的值 (0-9)
            isInteractive: true,
        },
        
        // 訓練設定
        training: {
            mode: 'flash',       // 'flash' | 'audio' | 'practice'
            digits: 1,           // 位數
            rows: 3,             // 口數
            speed: 1000,         // 閃爍速度 (ms)
            flashTime: 600,      // 數字顯示時間比例 (0-100%)
            clearTime: 400,      // 數字清除時間比例
            isRunning: false,
            currentProblem: null,
            score: 0,
        },
        
        // 統計數據
        statistics: {
            totalQuestions: 0,       // 總題數
            correctAnswers: 0,       // 正確數
            flashQuestions: 0,       // 閃電算題數
            flashCorrect: 0,         // 閃電算正確
            audioQuestions: 0,       // 聽算題數
            audioCorrect: 0,         // 聽算正確
            practiceQuestions: 0,    // 練習題數
            practiceCorrect: 0,      // 練習正確
            bestStreak: 0,           // 最佳連續正確
            totalPracticeTime: 0,    // 總練習時間 (分鐘)
        },
        
        // 錯題追蹤
        errorTracking: {
            enabled: true,
            errors: [],              // 錯誤題目記錄 [{problem, userAnswer, correctAnswer, type, timestamp}]
            maxErrors: 50,           // 最多保留錯題數
            weakAreas: [],           // 弱項分析 ['進位加法', '減法借位', ...]
        },
        
        // 排行榜
        leaderboard: {
            daily: [],               // 每日排行 [{name, score, date}]
            weekly: [],              // 每週排行
            allTime: [],             // 歷史最高
            personal: {              // 個人最佳記錄
                flash: { score: 0, accuracy: 0, date: null },
                audio: { score: 0, accuracy: 0, date: null },
                challenge: { score: 0, time: 0, date: null },
            }
        },
        
        // 學習單設定 (Legacy)
        worksheet: {
            mode: 'calc',        // 'read' | 'draw' | 'friends' | 'calc'
            rangeType: '0-9',
            friendType: '5',
            friendRows: 2,
            friendGroups: 2,     // 湊數練習組數 (2-4)
            calcRows: 3,
            calcDigits: 1,
            calcBlocks: 4,
            showAnswer: false,
            data: [],
        },
        
        // UI 狀態
        ui: {
            theme: 'light',      // 'light' | 'dark' | 'neon'
            soundEnabled: true,
            showTutorial: true,
            sidebarOpen: false,
        },
    };
    
    // Subscribers (觀察者)
    const subscribers = new Map();
    
    /**
     * 訂閱狀態變更
     * @param {string} path - 狀態路徑 (e.g., 'user.xp', 'training.mode')
     * @param {Function} callback - 變更時呼叫的函數
     * @returns {Function} 取消訂閱的函數
     */
    function subscribe(path, callback) {
        if (!subscribers.has(path)) {
            subscribers.set(path, new Set());
        }
        subscribers.get(path).add(callback);
        
        // 返回取消訂閱函數
        return () => {
            subscribers.get(path).delete(callback);
        };
    }
    
    /**
     * 通知訂閱者
     * @param {string} path - 變更的路徑
     * @param {*} newValue - 新值
     * @param {*} oldValue - 舊值
     */
    function notify(path, newValue, oldValue) {
        // 通知精確路徑的訂閱者
        if (subscribers.has(path)) {
            subscribers.get(path).forEach(cb => cb(newValue, oldValue, path));
        }
        
        // 通知父路徑的訂閱者 (e.g., 'user' 會被通知 'user.xp' 的變更)
        const parts = path.split('.');
        while (parts.length > 1) {
            parts.pop();
            const parentPath = parts.join('.');
            if (subscribers.has(parentPath)) {
                subscribers.get(parentPath).forEach(cb => cb(get(parentPath), null, path));
            }
        }
        
        // 通知全域訂閱者
        if (subscribers.has('*')) {
            subscribers.get('*').forEach(cb => cb(state, path));
        }
    }
    
    /**
     * 取得狀態值
     * @param {string} path - 狀態路徑
     * @returns {*} 狀態值
     */
    function get(path) {
        if (!path) return state;
        
        const keys = path.split('.');
        let current = state;
        
        for (const key of keys) {
            if (current === undefined || current === null) return undefined;
            current = current[key];
        }
        
        return current;
    }
    
    /**
     * 設置狀態值
     * @param {string} path - 狀態路徑
     * @param {*} value - 新值
     */
    function set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = state;
        
        for (const key of keys) {
            if (current[key] === undefined) {
                current[key] = {};
            }
            current = current[key];
        }
        
        const oldValue = current[lastKey];
        
        // 如果值沒變，不觸發更新
        if (oldValue === value) return;
        
        current[lastKey] = value;
        notify(path, value, oldValue);
        
        // 自動持久化到 localStorage
        saveToStorage();
    }
    
    /**
     * 批次更新狀態 (避免多次存儲)
     * @param {Object} updates - { path: value, ... }
     */
    function batchUpdate(updates) {
        for (const [path, value] of Object.entries(updates)) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            let current = state;
            
            for (const key of keys) {
                if (current[key] === undefined) current[key] = {};
                current = current[key];
            }
            
            const oldValue = current[lastKey];
            current[lastKey] = value;
            notify(path, value, oldValue);
        }
        saveToStorage();
    }
    
    /**
     * 儲存到 localStorage
     */
    function saveToStorage() {
        try {
            const dataToSave = {
                user: state.user,
                ui: state.ui,
                worksheet: state.worksheet,
                statistics: state.statistics,
                errorTracking: state.errorTracking,
                leaderboard: state.leaderboard,
            };
            localStorage.setItem('abacus_academy_state', JSON.stringify(dataToSave));
        } catch (e) {
            console.warn('無法儲存狀態到 localStorage:', e);
        }
    }
    
    /**
     * 從 localStorage 載入
     */
    function loadFromStorage() {
        try {
            const saved = localStorage.getItem('abacus_academy_state');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.user) Object.assign(state.user, data.user);
                if (data.ui) Object.assign(state.ui, data.ui);
                if (data.worksheet) Object.assign(state.worksheet, data.worksheet);
                if (data.statistics) Object.assign(state.statistics, data.statistics);
                if (data.errorTracking) Object.assign(state.errorTracking, data.errorTracking);
                if (data.leaderboard) Object.assign(state.leaderboard, data.leaderboard);
            }
        } catch (e) {
            console.warn('無法從 localStorage 載入狀態:', e);
        }
    }
    
    /**
     * 重置狀態
     */
    function reset() {
        localStorage.removeItem('abacus_academy_state');
        location.reload();
    }
    
    // 初始化時載入
    loadFromStorage();
    
    // Public API
    return {
        get,
        set,
        batchUpdate,
        subscribe,
        reset,
        // Debug 用
        _getState: () => ({ ...state }),
    };
})();

// 匯出
export default AppState;
