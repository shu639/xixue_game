/**
 * 事件总线 - 跨系统通信
 * 使用 Phaser 内置事件系统
 */
import Phaser from 'phaser';

class EventBusManager {
  private emitter: Phaser.Events.EventEmitter;

  constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  on(event: string, fn: (...args: any[]) => void, context?: any): void {
    this.emitter.on(event, fn, context);
  }

  once(event: string, fn: (...args: any[]) => void, context?: any): void {
    this.emitter.once(event, fn, context);
  }

  off(event: string, fn?: (...args: any[]) => void, context?: any): void {
    this.emitter.off(event, fn, context);
  }

  emit(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }

  removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }

  destroy(): void {
    this.emitter.destroy();
  }
}

// 全局单例
export const EventBus = new EventBusManager();
