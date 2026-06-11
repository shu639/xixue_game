/**
 * 安全区域适配
 * 处理手机刘海屏、底部横条等安全区域
 */
import { GAME_HEIGHT } from '../constants';

export class SafeArea {
  public top: number;
  public bottom: number;
  public left: number;
  public right: number;

  constructor() {
    this.top = 0;
    this.bottom = 0;
    this.left = 0;
    this.right = 0;
    this.calculate();
  }

  /**
   * 计算安全区域
   */
  private calculate(): void {
    // 读取 CSS 环境变量
    const rootStyle = getComputedStyle(document.documentElement);

    // env(safe-area-inset-*) 在支持的设备上返回实际值
    const sat = rootStyle.getPropertyValue('--safe-area-inset-top') ||
               this.getEnvSafeArea('top');
    const sab = rootStyle.getPropertyValue('--safe-area-inset-bottom') ||
               this.getEnvSafeArea('bottom');
    const sal = rootStyle.getPropertyValue('--safe-area-inset-left') ||
               this.getEnvSafeArea('left');
    const sar = rootStyle.getPropertyValue('--safe-area-inset-right') ||
               this.getEnvSafeArea('right');

    this.top = this.parsePixel(sat);
    this.bottom = this.parsePixel(sab);
    this.left = this.parsePixel(sal);
    this.right = this.parsePixel(sar);

    // 如果是模拟器或桌面浏览器，给个默认值（状态栏高度）
    if (this.top === 0 && this.isMobileDevice()) {
      this.top = 20;  // 基本状态栏高度
    }
  }

  /**
   * 获取 env 安全区域值
   */
  private getEnvSafeArea(side: string): string {
    try {
      // CSS env() 常量在 JS 中无法直接获取，需要通过 CSS 变量桥接
      // HTML 中已经定义了 viewport-fit=cover
      const testEl = document.createElement('div');
      testEl.style.cssText = `padding-top: env(safe-area-inset-${side}); position: absolute; visibility: hidden;`;
      document.body.appendChild(testEl);
      const value = getComputedStyle(testEl).paddingTop;
      document.body.removeChild(testEl);
      return value;
    } catch {
      return '0px';
    }
  }

  /**
   * 解析像素值
   */
  private parsePixel(value: string): number {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]);
    }
    return 0;
  }

  /**
   * 检查是否为移动设备
   */
  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
  }

  /**
   * 获取可用游戏区域高度
   */
  get playableHeight(): number {
    return GAME_HEIGHT - this.top - this.bottom;
  }

  /**
   * 获取可用游戏区域宽度
   */
  get playableWidth(): number {
    return 390 - this.left - this.right; // GAME_WIDTH
  }
}

// 全局单例
export const safeArea = new SafeArea();
