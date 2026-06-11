/**
 * 敌人实体基类
 * AI：持续追踪玩家，避免重叠
 */
import Phaser from 'phaser';
import { EnemyDef } from '../types';
import { COLORS, EVENTS } from '../constants';
import { EventBus } from '../managers/EventBus';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public enemyDef: EnemyDef;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public damage: number;
  public expValue: number;
  public dropRate: number;
  public isElite: boolean;
  public isBoss: boolean;

  // 避免重叠
  private separationForce: number = 50;
  private avoidRadius: number = 30;

  // 击退
  private knockbackTimer: number = 0;
  private knockbackResistance: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, def: EnemyDef) {
    const textureKey = def.isBoss ? 'boss' : (def.isElite ? 'enemy_elite' : 'enemy');
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyDef = def;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.speed = def.speed;
    this.damage = def.damage;
    this.expValue = def.exp;
    this.dropRate = def.dropRate;
    this.isElite = def.isElite;
    this.isBoss = def.isBoss;

    // 物理设置
    this.setCircle(def.bodyRadius, 0, 0);
    this.setScale(def.scale);
    this.setDepth(5);

    if (def.isElite) {
      this.setTint(def.color);
    }
  }

  /**
   * 每帧更新
   */
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.hp <= 0) return;

    // 击退处理
    if (this.knockbackTimer > 0) {
      this.knockbackTimer -= delta;
      if (this.knockbackTimer <= 0) {
        this.setTint(0xffffff); // 恢复原色
      }
    }
  }

  /**
   * AI：追踪玩家
   */
  chasePlayer(player: Phaser.Physics.Arcade.Sprite): void {
    if (this.hp <= 0 || this.knockbackTimer > 0) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.setVelocity(0, 0);
      return;
    }

    // 归一化方向
    const nx = dx / dist;
    const ny = dy / dist;

    this.setVelocity(nx * this.speed, ny * this.speed);

    // 翻转
    if (nx < 0) this.setFlipX(true);
    else this.setFlipX(false);
  }

  /**
   * 分离：避免和其他敌人重叠
   */
  separate(enemies: Enemy[]): void {
    if (this.hp <= 0) return;

    let sepX = 0;
    let sepY = 0;
    let count = 0;

    for (const other of enemies) {
      if (other === this || other.hp <= 0) continue;

      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.avoidRadius && dist > 0) {
        sepX += (dx / dist) * this.separationForce;
        sepY += (dy / dist) * this.separationForce;
        count++;
      }
    }

    if (count > 0) {
      sepX /= count;
      sepY /= count;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.velocity.x += sepX;
      body.velocity.y += sepY;
    }
  }

  /**
   * 受到伤害
   * @returns 是否死亡
   */
  takeDamage(amount: number, knockbackX: number = 0, knockbackY: number = 0): boolean {
    this.hp -= amount;

    // 击退
    if (knockbackX !== 0 || knockbackY !== 0) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.velocity.x = knockbackX;
      body.velocity.y = knockbackY;
      this.knockbackTimer = 100;
      this.setTint(0xff8888);
    }

    // 受击变白闪烁
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        if (this.active) this.setAlpha(1);
      },
    });

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  /**
   * 死亡
   */
  die(): void {
    this.setVelocity(0, 0);
    this.setActive(false);
    this.setVisible(false);

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }

    // 发送死亡事件
    EventBus.emit(EVENTS.ENEMY_KILLED, this);

    // 死亡特效
    this.playDeathEffect();
  }

  /**
   * 死亡特效
   */
  private playDeathEffect(): void {
    // 简单消失动画
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      ease: 'Power2',
    });
  }

  /**
   * 重置（对象池复用）
   */
  reset(x: number, y: number, def: EnemyDef, difficultyMul: number = 1): void {
    // 先激活再设置
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1);
    this.setScale(def.scale);
    this.setPosition(x, y);

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = true;
      (this.body as Phaser.Physics.Arcade.Body).reset(x, y);
    }

    this.enemyDef = def;
    this.hp = Math.round(def.hp * difficultyMul);
    this.maxHp = this.hp;
    this.speed = def.speed * (1 + (difficultyMul - 1) * 0.5); // 速度增长减半
    this.damage = Math.round(def.damage * difficultyMul);
    this.expValue = Math.round(def.exp * difficultyMul);
    this.dropRate = def.dropRate;
    this.isElite = def.isElite;
    this.isBoss = def.isBoss;
    this.knockbackTimer = 0;

    if (def.isElite) {
      this.setTint(def.color);
    } else {
      this.clearTint();
    }
  }
}
