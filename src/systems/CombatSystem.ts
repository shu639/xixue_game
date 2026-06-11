/**
 * 战斗系统
 * 处理伤害计算、暴击判定、碰撞检测
 */
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { EVENTS } from '../constants';
import { EventBus } from '../managers/EventBus';

export class CombatSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 计算伤害（含暴击）
   * @returns { damage: number, isCrit: boolean }
   */
  calculateDamage(baseDamage: number, player: Player): { damage: number; isCrit: boolean } {
    let damage = baseDamage;

    // 攻击力加成
    damage *= (1 + (player.stats.attack - 10) * 0.1);

    // 暴击判定
    const isCrit = Math.random() < player.stats.critRate;
    if (isCrit) {
      damage *= player.stats.critDamage;
    }

    // 随机浮动 ±10%
    damage *= 0.9 + Math.random() * 0.2;

    return {
      damage: Math.round(Math.max(1, damage)),
      isCrit,
    };
  }

  /**
   * 查找最近敌人（给自动瞄准用）
   */
  findNearestEnemy(
    player: Player,
    enemies: Phaser.Physics.Arcade.Group,
    maxRange: number = 500
  ): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = maxRange;

    enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.active || enemy.hp <= 0) return;

      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  /**
   * 获取攻击角度（朝向最近敌人）
   */
  getAttackAngle(player: Player, target: Enemy): number {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    return Math.atan2(dy, dx) * (180 / Math.PI) + 90; // Phaser 角度制，0度朝上
  }

  /**
   * 处理投射物命中敌人
   * @returns 是否击杀
   */
  handleProjectileHit(projectile: Projectile, enemy: Enemy): boolean {
    // 防止重复命中
    const enemyId = enemy.x * 10000 + enemy.y; // 简单ID
    if (projectile.hitEnemies.has(enemyId)) return false;

    const isKilled = enemy.takeDamage(
      projectile.damage,
      projectile.knockback * (projectile.x > enemy.x ? 1 : -1) * 0.5,
      projectile.knockback * (projectile.y > enemy.y ? 1 : -1) * 0.5
    );

    projectile.hitEnemies.add(enemyId);
    EventBus.emit(EVENTS.PROJECTILE_HIT, projectile, enemy, projectile.damage, projectile.isCrit);

    // 穿透检查
    if (projectile.pierce <= 0 || projectile.hitEnemies.size > projectile.pierce) {
      projectile.deactivate();
    }

    // 范围伤害
    if (projectile.areaSize > 10 && !projectile.active) {
      this.applyAreaDamage(projectile);
    }

    return isKilled;
  }

  /**
   * 范围伤害（爆炸等）
   */
  private applyAreaDamage(projectile: Projectile): void {
    const scene = this.scene;
    const enemies = (scene as any).enemies as Phaser.Physics.Arcade.Group | undefined;
    if (!enemies) return;

    enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.active || enemy.hp <= 0) return;

      const dx = enemy.x - projectile.x;
      const dy = enemy.y - projectile.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= projectile.areaSize) {
        // 距离越远伤害越低
        const falloff = 1 - (dist / projectile.areaSize) * 0.5;
        const aoeDamage = Math.round(projectile.damage * falloff);
        enemy.takeDamage(aoeDamage);
      }
    });

    // 爆炸视觉
    const circle = scene.add.circle(projectile.x, projectile.y, projectile.areaSize, 0xffffff, 0.2);
    circle.setDepth(3);
    scene.tweens.add({
      targets: circle,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      onComplete: () => circle.destroy(),
    });
  }

  /**
   * 敌人碰撞玩家
   */
  handleEnemyPlayerCollision(enemy: Enemy, player: Player): number {
    if (player.isInvincible || player.isDead()) return 0;
    return player.takeDamage(enemy.damage);
  }

  /**
   * 计算武器实际冷却(考虑攻速)
   */
  getEffectiveCooldown(baseCooldown: number, player: Player): number {
    return baseCooldown * (1 / player.stats.cooldown);
  }
}
