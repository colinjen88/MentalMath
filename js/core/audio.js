/**
 * Audio Manager Module
 * 音效管理器 - 使用 Web Audio API 產生合成音效
 * 
 * @module core/audio
 */

import AppState from './state.js';

const AudioManager = (() => {
    let audioContext = null;
    
    // 預定義音效參數
    const SOUNDS = {
        beadClick: {
            type: 'sine',
            frequency: 800,
            duration: 0.08,
            gain: 0.3,
        },
        beadSnap: {
            type: 'triangle',
            frequency: 1200,
            duration: 0.05,
            gain: 0.2,
        },
        correct: {
            type: 'sine',
            frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 (C Major chord)
            duration: 0.15,
            gain: 0.25,
        },
        wrong: {
            type: 'sawtooth',
            frequency: 200,
            duration: 0.3,
            gain: 0.2,
        },
        levelUp: {
            type: 'sine',
            frequencies: [523.25, 659.25, 783.99, 1046.50], // Ascending
            duration: 0.2,
            gain: 0.3,
        },
        tick: {
            type: 'square',
            frequency: 1000,
            duration: 0.02,
            gain: 0.1,
        },
        flash: {
            type: 'sine',
            frequency: 440,
            duration: 0.1,
            gain: 0.15,
        },
    };
    
    /**
     * 初始化 Audio Context
     * 必須在使用者互動後呼叫 (瀏覽器政策)
     */
    function init() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // 如果被暫停，恢復它
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
    
    /**
     * 播放簡單音效
     * @param {string} soundName - 音效名稱
     */
    function play(soundName) {
        // 檢查音效是否啟用
        if (!AppState.get('ui.soundEnabled')) return;
        
        // 確保已初始化
        if (!audioContext) {
            init();
        }
        
        const config = SOUNDS[soundName];
        if (!config) {
            console.warn(`Unknown sound: ${soundName}`);
            return;
        }
        
        // 如果是多音符 (和弦或序列)
        if (config.frequencies) {
            config.frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    playTone(config.type, freq, config.duration, config.gain);
                }, index * config.duration * 500);
            });
        } else {
            playTone(config.type, config.frequency, config.duration, config.gain);
        }
    }
    
    /**
     * 播放單一音符
     * @param {string} type - 波形類型
     * @param {number} frequency - 頻率 (Hz)
     * @param {number} duration - 持續時間 (秒)
     * @param {number} gain - 音量 (0-1)
     */
    function playTone(type, frequency, duration, gain) {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        // ADSR Envelope (簡化版)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(gain, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    /**
     * 播放算珠撞擊音 (帶隨機變化)
     */
    function playBeadSound() {
        if (!AppState.get('ui.soundEnabled')) return;
        if (!audioContext) init();
        
        // 隨機微調頻率，讓每次聽起來略有不同
        const baseFreq = 800 + Math.random() * 400;
        playTone('sine', baseFreq, 0.06, 0.25);
        
        // 加入輕微的高頻泛音
        setTimeout(() => {
            playTone('triangle', baseFreq * 2.5, 0.03, 0.1);
        }, 10);
    }
    
    /**
     * 使用 Speech Synthesis 朗讀數字
     * @param {number} num - 要朗讀的數字
     * @param {string} lang - 語言 ('zh-TW' | 'en-US')
     * @returns {Promise}
     */
    function speakNumber(num, lang = 'zh-TW') {
        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                console.warn('Speech Synthesis not supported');
                resolve();
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(String(num));
            utterance.lang = lang;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            utterance.onend = resolve;
            utterance.onerror = reject;
            
            window.speechSynthesis.speak(utterance);
        });
    }
    
    /**
     * 朗讀運算式 (例如: "三 加 五 減 二")
     * @param {number[]} nums - 數字陣列
     * @param {string} lang - 語言
     * @returns {Promise}
     */
    async function speakProblem(nums, lang = 'zh-TW') {
        const operators = lang === 'zh-TW' 
            ? { plus: '加', minus: '減' }
            : { plus: 'plus', minus: 'minus' };
        
        for (let i = 0; i < nums.length; i++) {
            const num = nums[i];
            
            if (i > 0) {
                // 朗讀運算符
                const op = num >= 0 ? operators.plus : operators.minus;
                await speakNumber(op, lang);
                await new Promise(r => setTimeout(r, 200));
            }
            
            // 朗讀數字 (絕對值)
            await speakNumber(Math.abs(num), lang);
            await new Promise(r => setTimeout(r, 300));
        }
    }
    
    /**
     * 停止所有語音
     */
    function stopSpeaking() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
    
    // Public API
    return {
        init,
        play,
        playBeadSound,
        speakNumber,
        speakProblem,
        stopSpeaking,
    };
})();

export default AudioManager;
