/**
 * 怪物生成系统
 * 根据波次配置在屏幕外围生成怪物
 */
import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { EnemyDef } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from '../constants';
import { getEnemyConfig, getNormalEnemyIds, getEliteEnemyIds } from '../configs/EnemyConfig';
import { getDifficultyMultiplier } from '../configs/WaveConfig';

export class SpawnSystem {
  private scene: Phaser.Scene;
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private bossGroup: Phaser.Physics.Arcade.Group;

  // 持续生成参数
  private continuousSpawns: Array<{
    enemyId: string;
    count: number;
    interval: number;
    timer: number;
    spawned: number;
  }> = [];

  constructor(
    scene: Phaser.Scene,
    enemyGroup: Phaser.Physics.Arcade.Group,
    bossGroup: Phaser.Physics.Arcade.Group
  ) {
    this.scene = scene;
    this.enemyGroup = enemyGroup;
    this.bossGroup = bossGroup;
  }

  /**
   * 添加持续生成波次
   */
  addSpawnWave(enemyId: string, count: number, interval: number): void {
    // 如果已有同类型的持续生成，追加数量
    const existing = this.continuousSpawns.find(s => s.enemyId === enemyId);
    if (existing) {
      existing.count += count;
      return;
    }

    this.continuousSpawns.push({
      enemyId,
      count,
      interval,
      timer: 0,
      spawned: 0,
    });
  }

  /**
   * 添加精英生成
   */
  addEliteSpawn(enemyId: string, count: number, interval: number): void {
    this.continuousSpawns.push({
      enemyId,
      count,
      interval,
      timer: 0,
      spawned: 0,
    });
  }

  /**
   * 生成Boss
   */
  spawnBoss(enemyId: string): void {
    const def = getEnemyConfig(enemyId);
    if (!def) return;

    // 获取玩家位置
    const scene = this.scene as any;
    const player = scene.player;
    if (!player || !player.active) return;

    const spawnPos = this.getSpawnPosition();
    const boss = this.bossGroup.get(spawnPos.x, spawnPos.y, 'boss') as Boss;
    if (!boss) return;

    const elapsedTime = (scene as any).gameState?.elapsedTime || 0;
    const difficultyMul = getDifficultyMultiplier(elapsedTime);

    if (typeof boss.reset === 'function') {
      boss.reset(spawnPos.x, spawnPos.y, def, difficultyMul);
    }
  }

  /**
   * 生成怪潮
   */
  spawnFlood(enemyId: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const spawnPos = this.getSpawnPosition();
      this.spawnEnemyAt(enemyId, spawnPos.x, spawnPos.y);
    }
  }

  /**
   * 在指定位置生成敌人
   */
  spawnEnemyAt(enemyId: string, x: number, y: number): Enemy | null {
    const def = getEnemyConfig(enemyId);
    if (!def) return null;

    // 根据类型选择池
    const group = def.isBoss ? this.bossGroup : this.enemyGroup;
    const enemy = group.get(x, y, def.isBoss ? 'boss' : (def.isElite ? 'enemy_elite' : 'enemy')) as Enemy;

    if (!enemy) return null;

    const elapsedTime = ((this.scene as any).gameState?.elapsedTime) || 0;
    const difficultyMul = getDifficultyMultiplier(elapsedTime);

    enemy.reset(x, y, def, difficultyMul);
    return enemy;
  }

  /**
   * 获取屏幕外的随机生成位置
   */
  private getSpawnPosition(): { x: number; y: number } {
    // 以玩家或摄像头为中心
    const camera = this.scene.cameras.main;
    const cx = camera.scrollX + GAME_WIDTH / 2;
    const cy = camera.scrollY + GAME_HEIGHT / 2;

    const side = Math.floor(Math.random() * 4); // 0:上 1:下 2:左 3:右
    const margin = 60;
    let x: number, y: number;

    switch (side) {
      case 0: // 上
        x = cx + (Math.random() - 0.5) * GAME_WIDTH * 1.5;
        y = cy - GAME_HEIGHT / 2 - margin;
        break;
      case 1: // 下
        x = cx + (Math.random() - 0.5) * GAME_WIDTH * 1.5;
        y = cy + GAME_HEIGHT / 2 + margin;
        break;
      case 2: // 左
        x = cx - GAME_WIDTH / 2 - margin;
        y = cy + (Math.random() - 0.5) * GAME_HEIGHT * 1.5;
        break;
      case 3: // 右
        x = cx + GAME_WIDTH / 2 + margin;
        y = cy + (Math.random() - 0.5) * GAME_HEIGHT * 1.5;
        break;
      default:
        x = cx;
        y = cy - GAME_HEIGHT / 2 - margin;
    }

    // 限制在世界范围内
    x = Phaser.Math.Clamp(x, 0, WORLD_WIDTH);
    y = Phaser.Math.Clamp(y, 0, WORLD_HEIGHT);

    return { x, y };
  }

  /**
   * 每帧更新持续生成
   */
  update(delta: number): void {
    for (let i = this.continuousSpawns.length - 1; i >= 0; i--) {
      const spawn = this.continuousSpawns[i];
      spawn.timer += delta;

      while (spawn.timer >= spawn.interval && spawn.spawned < spawn.count) {
        spawn.timer -= spawn.interval;
        spawn.spawned++;

        const pos = this.getSpawnPosition();
        this.spawnEnemyAt(spawn.enemyId, pos.x, pos.y);
      }

      // 生成完毕，移除
      if (spawn.spawned >= spawn.count) {
        this.continuousSpawns.splice(i, 1);
      }
    }
  }

  /**
   * 清理所有待生成
   */
  clearAll(): void {
    this.continuousSpawns = [];
  }

  /**
   * 获取当前活跃敌人数量
   */
  getActiveEnemyCount(): number {
    return this.enemyGroup.countActive(true);
  }
}
