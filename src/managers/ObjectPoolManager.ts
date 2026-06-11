/**
 * 对象池管理器
 * 统一管理所有对象池，防止频繁创建销毁
 * 使用 Phaser 的 Group 对象池机制
 */
import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile } from '../entities/Projectile';
import { Pickup } from '../entities/Pickup';
import { POOL_SIZES } from '../constants';

export interface ObjectPoolStats {
  name: string;
  active: number;
  inactive: number;
  total: number;
  maxSize: number;
}

export class ObjectPoolManager {
  private scene: Phaser.Scene;
  private pools: Map<string, Phaser.Physics.Arcade.Group> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 创建敌人对象池
   */
  createEnemyPool(maxSize: number = POOL_SIZES.ENEMIES): Phaser.Physics.Arcade.Group {
    const group = this.scene.physics.add.group({
      classType: Enemy,
      maxSize,
      runChildUpdate: false,
      active: false,
      visible: false,
    });

    // 预创建一些实例
    group.createMultiple({
      classType: Enemy,
      key: 'enemy',
      quantity: Math.floor(maxSize * 0.3),
      active: false,
      visible: false,
    });

    this.pools.set('enemies', group);
    return group;
  }

  /**
   * 创建Boss对象池
   */
  createBossPool(maxSize: number = 10): Phaser.Physics.Arcade.Group {
    const group = this.scene.physics.add.group({
      classType: Boss,
      maxSize,
      runChildUpdate: false,
      active: false,
      visible: false,
    });

    this.pools.set('bosses', group);
    return group;
  }

  /**
   * 创建投射物对象池
   */
  createProjectilePool(maxSize: number = POOL_SIZES.PROJECTILES): Phaser.Physics.Arcade.Group {
    const group = this.scene.physics.add.group({
      classType: Projectile,
      maxSize,
      runChildUpdate: true,
      active: false,
      visible: false,
    });

    // 预创建
    group.createMultiple({
      classType: Projectile,
      key: 'projectile',
      quantity: Math.floor(maxSize * 0.5),
      active: false,
      visible: false,
    });

    this.pools.set('projectiles', group);
    return group;
  }

  /**
   * 创建掉落物对象池
   */
  createPickupPool(maxSize: number = POOL_SIZES.PICKUPS): Phaser.Physics.Arcade.Group {
    const group = this.scene.physics.add.group({
      classType: Pickup,
      maxSize,
      runChildUpdate: false,
      active: false,
      visible: false,
    });

    group.createMultiple({
      classType: Pickup,
      key: 'pickup',
      quantity: Math.floor(maxSize * 0.3),
      active: false,
      visible: false,
    });

    this.pools.set('pickups', group);
    return group;
  }

  /**
   * 获取对象池
   */
  getPool(name: string): Phaser.Physics.Arcade.Group | undefined {
    return this.pools.get(name);
  }

  /**
   * 获取所有对象池状态（调试用）
   */
  getStats(): ObjectPoolStats[] {
    const stats: ObjectPoolStats[] = [];

    this.pools.forEach((group, name) => {
      const children = group.getChildren();
      const active = group.countActive(true);
      stats.push({
        name,
        active,
        inactive: children.length - active,
        total: children.length,
        maxSize: group.maxSize,
      });
    });

    return stats;
  }

  /**
   * 销毁所有对象池
   */
  destroyAll(): void {
    this.pools.forEach((group) => {
      group.destroy(true);
    });
    this.pools.clear();
  }

  /**
   * 回收所有活动的对象
   */
  deactivateAll(): void {
    this.pools.forEach((group) => {
      group.getChildren().forEach((child: any) => {
        if (child.active && typeof child.deactivate === 'function') {
          child.deactivate();
        } else if (child.active) {
          child.setActive(false);
          child.setVisible(false);
          if (child.body) {
            child.body.enable = false;
          }
        }
      });
    });
  }
}
