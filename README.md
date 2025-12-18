# 🧮 Abacus Academy (珠心算學院)

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PWA](https://img.shields.io/badge/PWA-Supported-orange.svg)

**Abacus Academy** 是一個專為兒童與珠心算學習者設計的現代化網頁應用程式。結合了遊戲化學習、互動式算盤與專業的練習模式，幫助使用者在趣味中掌握心算技巧。

**Abacus Academy** is a modern web application designed for children and mental math learners. Combining gamified learning, an interactive abacus, and professional practice modes, it helps users master mental arithmetic skills with fun.

---

## ✨ 特色功能 (Features)

### 🎯 多元訓練模式 (Training Modes)
*   **👁️ 看珠寫數 (Read)**: 快速辨識算盤數字。
*   **⚡ 閃電心算 (Flash)**: 經典的視覺暫留心算訓練，支援多位數。
*   **🎧 聽力訓練 (Audio)**: 真人語音朗讀算式，訓練聽算能力。
*   **🤝 補數湊數 (Friends)**: 專項訓練「湊5」與「湊10」口訣。

### 📄 學習單生成器 (Worksheet Generator)
*   **可自訂格式**: 支援直式心算、看珠、畫珠等多種題型。
*   **A4 列印優化**: 完美的列印排版，且支援自訂題號 (A-J, 1-10) 與行距，方便訂正。
*   **動態生成**: 每次均可生成全新的題目。

### 🎮 遊戲化體驗 (Gamification)
*   **XP 經驗值系統**: 練習即可獲得經驗值與升級。
*   **連續登入獎勵 (Streak)**: 鼓勵每日練習。
*   **成就徽章 (Badges)**: 達成特定目標解鎖精美徽章。
*   **排行榜 (Leaderboard)**: 追蹤學習進度與詳細數據分析。

### 📱 現代化技術 (Modern Tech)
*   **PWA 支援**: 可安裝至手機或電腦桌面，支援離線使用。
*   **觸覺回饋**: 手機操作算盤時提供震動回饋，還原真實手感。
*   **響應式設計**: 手機版專屬優化，包含底部導航欄與適配介面。

---

## 🛠️ 技術棧 (Tech Stack)

*   **Frontend**: HTML5, CSS3 (Glassmorphism UI), Vanilla JavaScript (ES6+)
*   **Architecture**: MVC (Model-View-Controller) Pattern, Observer Pattern for State Management
*   **Features**:
    *   Web Audio API (for sound effects & speech synthesis)
    *   Vibration API (for haptic feedback)
    *   Service Workers & Web Manifest (for PWA)
    *   Local Storage (for data persistence)

---

## 🚀 快速開始 (Getting Started)

### 線上體驗 (Demo)
[https://colinjen88.github.io/MentalMath/](https://colinjen88.github.io/MentalMath/)

### 本地安裝 (Local Installation)

1.  複製專案 (Clone the repo)
    ```bash
    git clone https://github.com/colinjen88/MentalMath.git
    ```

2.  進入目錄
    ```bash
    cd MentalMath
    ```

3.  啟動本地伺服器
    如果您安裝了 Node.js，可以使用 `serve` 或 `http-server`:
    ```bash
    npx serve .
    ```
    或者使用 Python:
    ```bash
    python -m http.server 3000
    ```

4.  打開瀏覽器
    前往 `http://localhost:3000` 即可開始使用。

---

## 📱 PWA 安裝說明

本應用程式支援 **Progressive Web App (PWA)** 技術：
1.  **電腦版**: 點擊瀏覽器網址列右側的「安裝」圖示。
2.  **手機版**: 點擊「分享」按鈕 -> 選擇「加入主畫面」。
3.  **離線使用**: 安裝後即使沒有網路也能進行練習！

---

## 📝 授權 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

Created with ❤️ by **Colin Jen** ([colinjen88](https://github.com/colinjen88))
