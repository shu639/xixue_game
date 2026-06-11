/**
 * 玩家实体
 * 处理玩家移动、受伤、死亡
 */
import Phaser from 'phaser';
import { PlayerStats } from '../types';
import { PLAYER_DEFAULTS, COLORS } from '../constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public stats: PlayerStats;
  public level: number = 1;
  public exp: number = 0;
  public expToNext: number = 20;
  public isInvincible: boolean = false;
  public invincibleTimer: number = 0;
  private flashTween: Phaser.Tweens.Tween | null = null;

  // 武器冷却计时器 (weaponId -> 剩余冷却ms)
  public weaponCooldowns: Map<string, number> = new Map();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 物理设置
    this.setCircle(PLAYER_DEFAULTS.bodyRadius, 2, 2);
    this.setCollideWorldBounds(false);
    this.setDepth(10);

    // 初始化属性
    this.stats = {
      maxHp: PLAYER_DEFAULTS.maxHp,
      hp: PLAYER_DEFAULTS.maxHp,
      attack: PLAYER_DEFAULTS.attack,
      attackSpeed: PLAYER_DEFAULTS.attackSpeed,
      critRate: PLAYER_DEFAULTS.critRate,
      critDamage: PLAYER_DEFAULTS.critDamage,
      moveSpeed: PLAYER_DEFAULTS.moveSpeed,
      expMultiplier: PLAYER_DEFAULTS.expMultiplier,
      pickupRange: PLAYER_DEFAULTS.pickupRange,
      armor: 0,
      projectileCount: 1,
      projectileSpeed: 1,
      areaSize: 1,
      duration: 1,
      cooldown: 1,
      luck: 0,
      revival: 0,
    };

    // 初始武器冷却
    this.weaponCooldowns.set('knife', 0);
  }

  /**
   * 更新玩家移动
   * @param vx 虚拟摇杆 x 方向 (-1 ~ 1)
   * @param vy 虚拟摇杆 y 方向 (-1 ~ 1)
   * @param delta 帧间隔(ms)
   */
  moveWithJoystick(vx: number, vy: number, delta: number): void {
    if (this.stats.hp <= 0) {
      this.setVelocity(0, 0);
      return;
    }

    const speed = this.stats.moveSpeed;
    // 归一化速度
    const length = Math.sqrt(vx * vx + vy * vy);
    if (length > 1) {
      vx /= length;
      vy /= length;
    }

    if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) {
      this.setVelocity(0, 0);
      this.playIdle();
      return;
    }

    this.setVelocity(vx * speed, vy * speed);

    // 根据移动方向翻转精灵
    if (vx < 0) {
      this.setFlipX(true);
    } else if (vx > 0) {
      this.setFlipX(false);
    }
  }

  /**
   * 受到伤害
   */
  takeDamage(amount: number): number {
    if (this.isInvincible || this.stats.hp <= 0) return 0;

    // 护甲减伤
    const armorReduction = this.stats.armor / (this.stats.armor + 100);
    const actualDamage = Math.max(1, Math.round(amount * (1 - armorReduction)));

    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);

    // 无敌帧
    this.isInvincible = true;
    this.invincibleTimer = 300; // 300ms 无敌

    // 闪烁效果
    this.startFlashEffect();

    // 屏幕震动
    this.scene.cameras.main.shake(100, 0.005);

    return actualDamage;
  }

  /**
   * 回复生命
   */
  heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  /**
   * 获取经验
   */
  gainExp(amount: number): number {
    const gained = Math.round(amount * this.stats.expMultiplier);
    this.exp += gained;

    // 检查是否升级
    if (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.level++;
      this.expToNext = this.calculateExpToNext();
      return 1; // 返回 1 表示升级了
    }

    return 0; // 没有升级
  }

  /**
   * 计算下一级所需经验
   */
  private calculateExpToNext(): number {
    // 指数增长
    return Math.floor(10 * Math.pow(this.level, 1.5) * Math.pow(1.08, this.level));
  }

  /**
   * 无敌闪烁效果
   */
  private startFlashEffect(): void {
    if (this.flashTween) {
      this.flashTween.stop();
    }
    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 100,
      repeat: 2,
      yoyo: true,
      onComplete: () => {
        this.setAlpha(1);
      },
    });
  }

  /**
   * 更新无敌计时
   */
  updateInvincible(delta: number): void {
    if (this.isInvincible) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.setAlpha(1);
        if (this.flashTween) {
          this.flashTween.stop();
          this.flashTween = null;
        }
      }
    }
  }

  /**
   * 是否死亡
   */
  isDead(): boolean {
    return this.stats.hp <= 0;
  }

  /**
   * 空闲动画
   */
  private playIdle(): void {
    // 使用几何图形时无动画，预留接口
  }

  /**
   * 获取经验进度 (0-1)
   */
  getExpProgress(): number {
    return this.exp / this.expToNext;
  }
}
