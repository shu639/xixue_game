/**
 * 音频管理器
 * 统一管理背景音乐和音效
 * MVP 阶段使用 Tone.js 或 Web Audio API 生成简单音效
 * 后续替换为真实音频资源
 */
import Phaser from 'phaser';
import { useSaveStore } from '../stores/saveStore';

export class AudioManager {
  private scene: Phaser.Scene;
  private bgm: Phaser.Sound.BaseSound | null = null;
  private audioContext: AudioContext | null = null;

  // 音频是否已初始化（需要用户交互后才能播放）
  private initialized: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.tryInitAudioContext();
  }

  /**
   * 尝试初始化 AudioContext（需要用户交互）
   */
  private tryInitAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API 不可用');
    }
  }

  /**
   * 确保 AudioContext 已启动
   */
  ensureAudio(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.initialized = true;
  }

  /**
   * 播放背景音乐（MVP 阶段用简单音调替代）
   */
  playBGM(): void {
    if (!this.initialized) return;
    // BGM 将在有音频资源后实现
    // 当前使用静默占位
  }

  /**
   * 停止背景音乐
   */
  stopBGM(): void {
    if (this.bgm) {
      this.bgm.stop();
    }
  }

  /**
   * 播放攻击音效 - 轻柔嗖声，避免刺耳
   */
  playAttackSound(): void {
    // 快速下降的 sine 波，模拟"嗖"声
    this.playSweep(600, 300, 0.06, 'sine', 0.15);
  }

  /**
   * 播放升级音效 - 三连上升音
   */
  playLevelUpSound(): void {
    this.playBeep(500, 0.12, 'sine', 0.2);
    setTimeout(() => this.playBeep(660, 0.12, 'sine', 0.2), 100);
    setTimeout(() => this.playBeep(880, 0.18, 'sine', 0.25), 200);
  }

  /**
   * 播放受击音效 - 低沉闷响
   */
  playHitSound(): void {
    this.playBeep(120, 0.1, 'sine', 0.25);
  }

  /**
   * 播放敌人死亡音效 - 清脆弹出
   */
  playEnemyDeathSound(): void {
    this.playSweep(500, 200, 0.08, 'sine', 0.18);
  }

  /**
   * 播放Boss出场音效 - 沉重低频
   */
  playBossAppearSound(): void {
    this.playBeep(60, 0.4, 'sine', 0.3);
    setTimeout(() => this.playBeep(80, 0.3, 'sine', 0.25), 250);
    setTimeout(() => this.playBeep(100, 0.25, 'sine', 0.2), 500);
  }

  /**
   * 播放玩家死亡音效 - 缓慢下降
   */
  playPlayerDeathSound(): void {
    this.playBeep(300, 0.25, 'sine', 0.3);
    setTimeout(() => this.playBeep(220, 0.25, 'sine', 0.25), 200);
    setTimeout(() => this.playBeep(150, 0.35, 'sine', 0.2), 400);
    setTimeout(() => this.playBeep(80, 0.5, 'sine', 0.15), 600);
  }

  /**
   * 播放宝箱拾取音效
   */
  playChestSound(): void {
    this.playBeep(500, 0.08, 'sine');
    setTimeout(() => this.playBeep(700, 0.08, 'sine'), 80);
    setTimeout(() => this.playBeep(900, 0.1, 'sine'), 160);
  }

  /**
   * 简单蜂鸣音效
   * @param frequency 频率(Hz)
   * @param duration 时长(秒)
   * @param type 波形类型
   * @param volumeMul 额外音量倍率 (0-1)
   */
  private playBeep(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volumeMul: number = 0.3
  ): void {
    if (!this.audioContext) return;
    this.ensureAudio();
    if (!this.audioContext) return;

    const settings = useSaveStore.getState().settings;
    if (settings.sfxVolume <= 0) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      const baseVolume = settings.sfxVolume * volumeMul;
      gainNode.gain.setValueAtTime(baseVolume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch {
      // 忽略音频播放错误
    }
  }

  /**
   * 频率滑降音效 - 从高频滑到低频，模拟"嗖"声
   */
  private playSweep(
    fromFreq: number,
    toFreq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volumeMul: number = 0.2
  ): void {
    if (!this.audioContext) return;
    this.ensureAudio();
    if (!this.audioContext) return;

    const settings = useSaveStore.getState().settings;
    if (settings.sfxVolume <= 0) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = type;
      const now = this.audioContext.currentTime;
      oscillator.frequency.setValueAtTime(fromFreq, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(toFreq, 20), now + duration);

      const baseVolume = settings.sfxVolume * volumeMul;
      gainNode.gain.setValueAtTime(baseVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch {
      // 忽略音频播放错误
    }
  }

  /**
   * 设置音量
   */
  setBGMVolume(volume: number): void {
    useSaveStore.getState().updateSettings({ bgmVolume: volume });
    if (this.bgm) {
      (this.bgm as any).setVolume?.(volume);
    }
  }

  setSFXVolume(volume: number): void {
    useSaveStore.getState().updateSettings({ sfxVolume: volume });
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopBGM();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
