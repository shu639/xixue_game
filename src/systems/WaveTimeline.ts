/**
 * 波次时间轴系统
 * 根据游戏时间触发对应波次事件
 */
import { WAVE_TIMELINE, getDifficultyMultiplier } from '../configs/WaveConfig';
import { WaveEvent } from '../types';
import { EVENTS } from '../constants';
import { EventBus } from '../managers/EventBus';

export class WaveTimeline {
  private events: WaveEvent[];
  private currentIndex: number = 0;
  private triggeredEvents: Set<number> = new Set(); // 已触发事件的时间索引
  private onSpawn: ((event: WaveEvent) => void) | null = null;
  private onBoss: ((event: WaveEvent) => void) | null = null;
  private onMessage: ((message: string) => void) | null = null;

  constructor() {
    this.events = [...WAVE_TIMELINE].sort((a, b) => a.time - b.time);
  }

  /**
   * 设置事件回调
   */
  setCallbacks(callbacks: {
    onSpawn?: (event: WaveEvent) => void;
    onBoss?: (event: WaveEvent) => void;
    onMessage?: (message: string) => void;
  }): void {
    if (callbacks.onSpawn) this.onSpawn = callbacks.onSpawn;
    if (callbacks.onBoss) this.onBoss = callbacks.onBoss;
    if (callbacks.onMessage) this.onMessage = callbacks.onMessage;
  }

  /**
   * 每帧更新，检查是否有新波次事件需要触发
   */
  update(elapsedTime: number): void {
    while (this.currentIndex < this.events.length) {
      const event = this.events[this.currentIndex];

      if (elapsedTime >= event.time) {
        // 避免重复触发（同一秒可能多次 update）
        if (!this.triggeredEvents.has(event.time) || event.type === 'boss') {
          this.triggeredEvents.add(event.time);
          this.triggerEvent(event);
        }
        this.currentIndex++;
      } else {
        break;
      }
    }
  }

  /**
   * 触发波次事件
   */
  private triggerEvent(event: WaveEvent): void {
    // 显示消息
    if (event.message && this.onMessage) {
      this.onMessage(event.message);
    }

    switch (event.type) {
      case 'spawn':
      case 'flood':
      case 'elite':
        if (this.onSpawn) {
          this.onSpawn(event);
        }
        break;

      case 'boss':
        if (this.onBoss) {
          this.onBoss(event);
          EventBus.emit(EVENTS.BOSS_SPAWNED, event);
        }
        break;
    }
  }

  /**
   * 获取当前难度系数
   */
  getDifficulty(elapsedTime: number): number {
    return getDifficultyMultiplier(elapsedTime);
  }

  /**
   * 获取下一个即将到来的波次信息（用作 UI 提示）
   */
  getNextUpcomingWave(elapsedTime: number): WaveEvent | null {
    for (const event of this.events) {
      if (event.time > elapsedTime && event.message) {
        return event;
      }
    }
    return null;
  }

  /**
   * 重置时间轴
   */
  reset(): void {
    this.currentIndex = 0;
    this.triggeredEvents.clear();
  }
}
