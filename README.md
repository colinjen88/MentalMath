# 🧮 珠心算學院 (Abacus Academy)

全方位互動式珠心算學習平台，結合遊戲化設計與專業訓練功能。

## ✨ 完整功能

### 🏠 大廳 (Home)
- 使用者歡迎畫面
- 每日任務清單
- 互動算盤展示
- 快速入口導覽

### 🧮 練功房 (Practice)
- **自由練習** - 隨意撥動算珠，熟悉操作
- **指導模式** - 系統出題，使用者撥珠
- **計時挑戰** - 60秒限時挑戰

### ⚡ 閃電心算 (Flash Anzan)
- 可自訂位數 (1-3位)
- 可自訂口數 (3-10口)
- 可自訂速度 (0.3-2秒)
- 即時評分與統計
- 經驗值獎勵

### 🎧 聽力訓練 (Audio)
- 語音朗讀數字
- 支援中文/英文
- 可調語速
- 可重播題目

### 📄 學習單列印 (Worksheet)
- **看珠寫數** - 看算盤寫答案
- **看數畫珠** - 看數字畫算盤
- **好朋友湊數** - 2-4組可選
- **直式心算** - 多位數計算
- A4 尺寸最佳化
- 答案切換顯示

### 👤 個人檔案 (Profile)
- 等級與經驗值系統
- 成就徽章收集
- 可自訂頭像與名稱
- 音效設定

## 🎮 遊戲化系統

- **經驗值 (XP)** - 練習獲得經驗
- **等級系統** - 累積經驗升級
- **連續簽到** - 每日練習獎勵
- **成就徽章** - 達成目標解鎖

## 📁 專案結構

```
MentalMath/
├── index.html              # 主入口
├── css/
│   └── styles.css          # 主樣式表 (1400+ 行)
├── js/
│   ├── app.js              # 應用程式入口與路由註冊
│   ├── core/
│   │   ├── state.js        # 狀態管理 (Pub/Sub 模式)
│   │   ├── router.js       # SPA 路由器 (Hash-based)
│   │   ├── audio.js        # 音效管理 (Web Audio API)
│   │   └── utils.js        # 工具函數庫
│   ├── components/
│   │   ├── abacus.js       # 互動式算盤元件 (SVG)
│   │   └── header.js       # 頂部導航列
│   └── views/
│       ├── home.js         # 首頁/大廳
│       ├── practice.js     # 練功房
│       ├── flash.js        # 閃電心算
│       ├── audio.js        # 聽力訓練
│       └── worksheet.js    # 學習單列印
└── README.md               # 文件說明
```

## 🚀 快速開始

### 本地運行
```bash
# 使用任何靜態檔案伺服器
npx serve -l 3000

# 或使用 Python
python -m http.server 3000

# 然後訪問
http://localhost:3000
```

### 技術堆疊
- **前端**: 原生 JavaScript (ES Modules)
- **樣式**: 自訂 CSS (Glassmorphism, CSS Variables)
- **字體**: Inter, JetBrains Mono, Noto Sans TC
- **音效**: Web Audio API 合成
- **語音**: Web Speech Synthesis API

## 🎨 設計特色

1. **玻璃擬態 (Glassmorphism)** - 半透明毛玻璃效果
2. **深色主題** - 護眼深色背景
3. **動態背景** - 漸層光暈效果
4. **微動畫** - 過場與互動回饋
5. **響應式** - 支援桌面/平板/手機
6. **列印友善** - A4 尺寸最佳化

## 📝 開發進度

### ✅ Phase 1 - 核心架構
- [x] 狀態管理 (Pub/Sub)
- [x] SPA 路由系統
- [x] 互動式算盤元件
- [x] 音效系統

### ✅ Phase 2 - 訓練模組
- [x] 閃電心算
- [x] 聽力訓練
- [x] 練功房
- [x] 學習單列印

### ✅ Phase 3 - 遊戲化
- [x] 經驗值系統
- [x] 等級系統
- [x] 成就徽章
- [x] 使用者資料

### 📋 Phase 4 - 進階功能 (規劃中)
- [ ] AI 錯題分析
- [ ] RPG 冒險模式
- [ ] 排行榜
- [ ] PWA 離線支援

## 📄 授權

MIT License

