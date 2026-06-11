/**
 * 浮动伤害数字
 * 使用对象池，避免频繁创建 Text 对象
 */
import Phaser from 'phaser';
import { COLORS, POOL_SIZES } from '../constants';

interface DamageTextItem {
  text: Phaser.GameObjects.Text;
  timer: number;
  active: boolean;
}

export class DamageText {
  private scene: Phaser.Scene;
  private pool: DamageTextItem[] = [];
  private poolSize: number;

  constructor(scene: Phaser.Scene, poolSize: number = POOL_SIZES.DAMAGE_TEXTS) {
    this.scene = scene;
    this.poolSize = poolSize;
    this.initPool();
  }

  private initPool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const text = this.scene.add.text(0, 0, '', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      });
      text.setOrigin(0.5);
      text.setDepth(50);
      text.setVisible(false);
      text.setScrollFactor(1);

      this.pool.push({ text, timer: 0, active: false });
    }
  }

  /**
   * 显示伤害数字
   */
  show(
    x: number,
    y: number,
    damage: number,
    isCrit: boolean = false,
    isHeal: boolean = false
  ): void {
    const item = this.getInactive();
    if (!item) return;

    const text = item.text;
    text.setPosition(x + Phaser.Math.Between(-10, 10), y - 20);
    text.setVisible(true);
    text.setAlpha(1);
    text.setScale(1);

    if (isHeal) {
      text.setText(`+${damage}`);
      text.setColor('#00ff00');
      text.setFontSize(14);
    } else if (isCrit) {
      text.setText(`${damage}`);
      text.setColor('#ffff00');
      text.setFontSize(22);
      text.setScale(1.2);
    } else {
      text.setText(`${damage}`);
      text.setColor('#ffffff');
      text.setFontSize(14);
    }

    item.active = true;
    item.timer = 800; // 显示 800ms

    // 浮动动画
    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power1',
      onComplete: () => {
        text.setVisible(false);
        item.active = false;
        item.timer = 0;
      },
    });
  }

  /**
   * 显示经验获取
   */
  showExp(x: number, y: number, amount: number): void {
    const item = this.getInactive();
    if (!item) return;

    const text = item.text;
    text.setPosition(x, y - 15);
    text.setVisible(true);
    text.setAlpha(1);
    text.setScale(1);
    text.setText(`+${amount} EXP`);
    text.setColor('#00aaff');
    text.setFontSize(11);

    item.active = true;
    item.timer = 600;

    this.scene.tweens.add({
      targets: text,
      y: text.y - 25,
      alpha: 0,
      duration: 600,
      ease: 'Power1',
      onComplete: () => {
        text.setVisible(false);
        item.active = false;
      },
    });
  }

  /**
   * 获取一个未使用的池对象
   */
  private getInactive(): DamageTextItem | null {
    for (const item of this.pool) {
      if (!item.active) return item;
    }
    return null; // 池满了
  }

  /**
   * 回收所有
   */
  clearAll(): void {
    for (const item of this.pool) {
      item.text.setVisible(false);
      item.active = false;
      item.timer = 0;
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    for (const item of this.pool) {
      item.text.destroy();
    }
    this.pool = [];
  }
}
