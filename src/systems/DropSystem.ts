/**
 * 掉落系统
 * 怪物死亡时根据概率和类型生成掉落物
 */
import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Pickup } from '../entities/Pickup';
import { PickupType } from '../types';
import { PICKUP_VALUES } from '../constants';
import { EventBus } from '../managers/EventBus';

export class DropSystem {
  private scene: Phaser.Scene;
  private pickupGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, pickupGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.pickupGroup = pickupGroup;
  }

  /**
   * 处理敌人死亡掉落
   */
  handleEnemyDeath(enemy: Enemy): void {
    if (!enemy.active && enemy.hp <= 0) {
      // enemy 已被 deactivate，位置可能已变，用原始位置
      const x = enemy.x;
      const y = enemy.y;

      // 经验宝石（必掉）
      const expValue = Math.round(enemy.expValue * (0.8 + Math.random() * 0.4));
      this.spawnPickup(x + Phaser.Math.Between(-15, 15), y + Phaser.Math.Between(-15, 15), 'exp', expValue);

      // 金币（概率掉落）
      if (Math.random() < enemy.dropRate * 0.5) {
        const coinValue = Phaser.Math.Between(1, 5);
        this.spawnPickup(x + Phaser.Math.Between(-15, 15), y + Phaser.Math.Between(-15, 15), 'coin', coinValue);
      }

      // 回血道具（低概率）
      if (Math.random() < enemy.dropRate * 0.1) {
        this.spawnPickup(x + Phaser.Math.Between(-10, 10), y + Phaser.Math.Between(-10, 10), 'heal', PICKUP_VALUES.heal);
      }
    }
  }

  /**
   * Boss 死亡掉落宝箱
   */
  spawnBossChest(x: number, y: number): void {
    this.spawnPickup(x, y, 'chest', 1);
  }

  /**
   * Boss 召唤小怪时生成怪物（由 Boss 事件触发）
   */
  spawnMinionWave(bossX: number, bossY: number, count: number = 5): void {
    EventBus.emit('spawn-minion-wave', bossX, bossY, count);
  }

  /**
   * 生成掉落物
   */
  private spawnPickup(x: number, y: number, type: PickupType, value: number): void {
    const pickup = this.pickupGroup.get(x, y, 'pickup') as Pickup;
    if (pickup) {
      pickup.spawn(x, y, type, value);
    }
  }

  /**
   * 清理所有掉落物
   */
  clearAll(): void {
    this.pickupGroup.getChildren().forEach((child) => {
      const pickup = child as Pickup;
      if (pickup.active) {
        pickup.deactivate();
      }
    });
  }
}

