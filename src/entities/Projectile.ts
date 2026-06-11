/**
 * 子弹/投射物实体
 * 由武器系统生成，在场景中飞行
 */
import Phaser from 'phaser';
import { WeaponDef } from '../types';
import { COLORS } from '../constants';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public weaponDef!: WeaponDef;
  public damage: number = 0;
  public pierce: number = 0;
  public lifetime: number = 0;
  public maxLifetime: number = 2000;
  public isCrit: boolean = false;
  public knockback: number = 0;
  public areaSize: number = 0;

  // 已穿过的敌人集合（防止多次伤害同一敌人）
  public hitEnemies: Set<number> = new Set();

  // 追踪目标（导弹等）
  public homingTarget: Phaser.Physics.Arcade.Sprite | null = null;
  public homingStrength: number = 0;

  // 特殊行为
  public isBoomerang: boolean = false;
  private boomerangTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'projectile');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(4, 0, 0);
    this.setDepth(8);

    // 默认值
    this.maxLifetime = 2000;
  }

  /**
   * 发射投射物
   */
  fire(
    x: number,
    y: number,
    angle: number,
    speed: number,
    weaponDef: WeaponDef,
    damage: number,
    isCrit: boolean = false,
    target: Phaser.Physics.Arcade.Sprite | null = null
  ): void {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = true;
      (this.body as Phaser.Physics.Arcade.Body).reset(x, y);
    }

    this.weaponDef = weaponDef;
    this.damage = damage;
    this.pierce = weaponDef.pierce;
    this.lifetime = 0;
    this.maxLifetime = weaponDef.lifetime;
    this.isCrit = isCrit;
    this.knockback = weaponDef.knockback;
    this.areaSize = weaponDef.areaSize;
    this.hitEnemies.clear();
    this.boomerangTime = 0;

    // 速度
    const rad = Phaser.Math.DegToRad(angle - 90);
    const vx = Math.cos(rad) * speed;
    const vy = Math.sin(rad) * speed;

    this.setVelocity(vx, vy);
    this.setRotation(rad + Math.PI / 2);

    // 颜色
    this.setTint(isCrit ? COLORS.CRIT_TEXT : weaponDef.color);

    // 追踪目标
    this.homingTarget = target;

    // 特殊：回旋镖
    if (weaponDef.id === 'boomerang') {
      this.isBoomerang = true;
    }
  }

  /**
   * 每帧更新
   */
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.active) return;

    this.lifetime += delta;

    // 生命周期结束
    if (this.lifetime >= this.maxLifetime) {
      this.deactivate();
      return;
    }

    // 追踪
    if (this.homingTarget && this.homingTarget.active && this.lifetime < this.maxLifetime * 0.8) {
      const dx = this.homingTarget.x - this.x;
      const dy = this.homingTarget.y - this.y;
      const angle = Math.atan2(dy, dx);
      const currentAngle = Math.atan2(
        (this.body as Phaser.Physics.Arcade.Body).velocity.y,
        (this.body as Phaser.Physics.Arcade.Body).velocity.x
      );

      // 渐进转向
      const lerpAngle = Phaser.Math.Angle.RotateTo(currentAngle, angle, 0.05);
      const speed = Math.sqrt(
        (this.body as Phaser.Physics.Arcade.Body).velocity.x ** 2 +
        (this.body as Phaser.Physics.Arcade.Body).velocity.y ** 2
      );

      this.setVelocity(Math.cos(lerpAngle) * speed, Math.sin(lerpAngle) * speed);
    }

    // 回旋镖：飞到一半后返回玩家
    if (this.isBoomerang && this.lifetime > this.maxLifetime * 0.4) {
      this.homingTarget = null;
      const scene = this.scene;
      // 获取玩家位置
      const player = (scene as any).player;
      if (player && player.active) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        const speed = Math.sqrt(
          (this.body as Phaser.Physics.Arcade.Body).velocity.x ** 2 +
          (this.body as Phaser.Physics.Arcade.Body).velocity.y ** 2
        ) * 1.1;
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
    }
  }

  /**
   * 停用（回收到对象池）
   */
  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    this.homingTarget = null;
  }
}
