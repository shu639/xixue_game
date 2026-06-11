/**
 * 通用血条组件
 * 用于敌人头顶血条展示
 */
import Phaser from 'phaser';
import { COLORS } from '../constants';

export class HealthBar {
  private bg: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private target: Phaser.GameObjects.Sprite;
  private offsetY: number;
  private barWidth: number;
  private barHeight: number;
  private isBoss: boolean;

  constructor(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Sprite,
    offsetY: number = -20,
    barWidth: number = 30,
    barHeight: number = 4,
    isBoss: boolean = false
  ) {
    this.target = target;
    this.offsetY = offsetY;
    this.barWidth = barWidth;
    this.barHeight = barHeight;
    this.isBoss = isBoss;

    // 背景
    this.bg = scene.add.rectangle(target.x, target.y + offsetY, barWidth, barHeight, COLORS.HP_BAR_BG);
    this.bg.setDepth(15);
    if (!isBoss) {
      this.bg.setVisible(false);
    }

    // 填充
    const fillColor = isBoss ? COLORS.HP_BAR : COLORS.HP_BAR;
    this.fill = scene.add.rectangle(target.x, target.y + offsetY, barWidth, barHeight, fillColor);
    this.fill.setDepth(16);
    if (!isBoss) {
      this.fill.setVisible(false);
    }
  }

  /**
   * 更新血条
   * @param currentHp 当前血量
   * @param maxHp 最大血量
   */
  update(currentHp: number, maxHp: number): void {
    const ratio = Math.max(0, currentHp / maxHp);
    const x = this.target.x - this.barWidth / 2;
    const y = this.target.y + this.offsetY;

    this.bg.setPosition(this.target.x, y);
    this.fill.setPosition(x, y);
    this.fill.setOrigin(0, 0.5);
    this.fill.setSize(this.barWidth * ratio, this.barHeight);

    // 颜色变化
    if (ratio < 0.25) {
      this.fill.setFillStyle(COLORS.HP_BAR);
    } else if (ratio < 0.5) {
      this.fill.setFillStyle(0xff8800);
    } else if (this.isBoss) {
      this.fill.setFillStyle(0xff4444);
    } else {
      this.fill.setFillStyle(COLORS.HP_BAR);
    }

    // 非Boss只在受伤时显示血条
    if (!this.isBoss) {
      const show = ratio < 1 && ratio > 0;
      this.bg.setVisible(show);
      this.fill.setVisible(show);
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.bg.destroy();
    this.fill.destroy();
  }
}
