/**
 * 掉落物实体
 * 经验宝石、金币、回血道具、宝箱
 */
import Phaser from 'phaser';
import { PickupType } from '../types';
import { COLORS } from '../constants';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  public pickupType: PickupType;
  public value: number;
  public isBeingCollected: boolean = false;
  private collectSpeed: number = 300;
  private floatTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'pickup');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(4);
    this.pickupType = 'exp';
    this.value = 10;
  }

  /**
   * 生成掉落物
   */
  spawn(x: number, y: number, type: PickupType, value: number): void {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setScale(1);
    this.setAlpha(1);
    this.isBeingCollected = false;

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = true;
      (this.body as Phaser.Physics.Arcade.Body).reset(x, y);
    }

    this.pickupType = type;
    this.value = value;

    // 根据类型设置颜色和大小
    switch (type) {
      case 'exp':
        this.setTint(COLORS.EXP_GEM);
        this.setScale(0.7);
        break;
      case 'coin':
        this.setTint(COLORS.COIN);
        this.setScale(0.8);
        break;
      case 'heal':
        this.setTint(COLORS.HEAL);
        this.setScale(1.0);
        break;
      case 'chest':
        this.setTint(COLORS.CHEST);
        this.setScale(1.5);
        // 宝箱有脉冲效果
        this.floatTween = this.scene.tweens.add({
          targets: this,
          scaleX: 1.7,
          scaleY: 1.7,
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
        break;
    }

    // 初始散开效果
    if (type !== 'chest') {
      const angle = Math.random() * Math.PI * 2;
      const force = 30 + Math.random() * 40;
      if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(
          Math.cos(angle) * force,
          Math.sin(angle) * force
        );
      }

      // 减速摩擦
      this.scene.tweens.add({
        targets: this.body ? (this.body as Phaser.Physics.Arcade.Body).velocity : null,
        x: 0,
        y: 0,
        duration: 500,
        ease: 'Power2',
      });
    }
  }

  /**
   * 开始被磁吸到玩家
   */
  startCollect(player: Phaser.Physics.Arcade.Sprite): void {
    if (this.isBeingCollected) return;
    this.isBeingCollected = true;

    if (this.floatTween) {
      this.floatTween.stop();
    }
  }

  /**
   * 每帧更新：磁吸逻辑
   */
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.active || !this.isBeingCollected) return;

    // 在外部 update 中处理磁吸移动
  }

  /**
   * 向玩家移动（磁吸）
   */
  moveTowardsPlayer(player: Phaser.Physics.Arcade.Sprite, delta: number): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 8) {
      // 到达玩家，可被收集
      this.deactivate();
      return;
    }

    const speed = this.collectSpeed * (1 + (100 / (dist + 50))); // 越近越快
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(
      (dx / dist) * speed,
      (dy / dist) * speed
    );
  }

  /**
   * 回收
   */
  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.isBeingCollected = false;

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = null;
    }
  }
}
