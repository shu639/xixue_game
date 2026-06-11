/**
 * Boss 实体
 * 继承 Enemy，增加多阶段血条、技能释放、召唤小怪
 */
import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { EnemyDef } from '../types';
import { COLORS, EVENTS } from '../constants';
import { EventBus } from '../managers/EventBus';

export interface BossPhase {
  hpPercent: number;     // 触发该阶段的血量百分比(0-1)
  skillName: string;     // 技能名称
}

export class Boss extends Enemy {
  public phases: BossPhase[] = [];
  public currentPhase: number = 0;
  private skillCooldowns: Map<string, number> = new Map();
  private skillTimers: Map<string, number> = new Map();

  // Boss 特有属性
  public summonMinions: boolean = true;
  private summonCooldown: number = 0;
  private chargeCooldown: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, def: EnemyDef) {
    super(scene, x, y, def);
    this.isBoss = true;

    // 设置 Boss 专属阶段
    if (def.id === 'death_knight') {
      this.phases = [
        { hpPercent: 1.0, skillName: '追踪' },
        { hpPercent: 0.7, skillName: '冲锋' },
        { hpPercent: 0.4, skillName: '召唤' },
        { hpPercent: 0.15, skillName: '狂暴' },
      ];
    } else if (def.id === 'final_boss') {
      this.phases = [
        { hpPercent: 1.0, skillName: '追踪' },
        { hpPercent: 0.8, skillName: '范围攻击' },
        { hpPercent: 0.6, skillName: '召唤' },
        { hpPercent: 0.35, skillName: '冲锋' },
        { hpPercent: 0.1, skillName: '狂暴' },
      ];
    }

    // 初始化技能冷却
    this.skillCooldowns.set('charge', 5000);
    this.skillCooldowns.set('summon', 8000);
    this.skillCooldowns.set('area_attack', 4000);
    this.skillTimers.set('charge', 0);
    this.skillTimers.set('summon', 0);
    this.skillTimers.set('area_attack', 0);
  }

  /**
   * Boss 被重写时重置阶段
   */
  reset(x: number, y: number, def: EnemyDef, difficultyMul: number = 1): void {
    super.reset(x, y, def, difficultyMul);
    this.currentPhase = 0;
    this.skillTimers.forEach((_, key) => this.skillTimers.set(key, 0));
    this.summonCooldown = 0;
    this.chargeCooldown = 0;
  }

  /**
   * Boss AI 更新 (由 BossSystem 或 GameScene 每帧调用)
   */
  updateBoss(delta: number, player: Phaser.Physics.Arcade.Sprite): void {
    if (this.hp <= 0) return;

    // 更新阶段
    const hpPercent = this.hp / this.maxHp;
    for (let i = this.phases.length - 1; i >= 0; i--) {
      if (hpPercent <= this.phases[i].hpPercent && i > this.currentPhase) {
        this.currentPhase = i;
        this.onPhaseChange(this.phases[i]);
      }
    }

    // 更新技能冷却
    this.skillTimers.forEach((timer, key) => {
      if (timer > 0) {
        this.skillTimers.set(key, timer - delta);
      }
    });

    // 阶段技能行为
    this.executePhaseBehavior(delta, player);
  }

  /**
   * 执行阶段行为
   */
  private executePhaseBehavior(delta: number, player: Phaser.Physics.Arcade.Sprite): void {
    const phase = this.phases[this.currentPhase];
    if (!phase) return;

    switch (phase.skillName) {
      case '追踪':
        this.chasePlayer(player);
        break;

      case '冲锋':
        this.chasePlayer(player);
        // 尝试冲锋
        if (this.skillTimers.get('charge')! <= 0) {
          this.chargeAttack(player);
          this.skillTimers.set('charge', this.skillCooldowns.get('charge')!);
        }
        break;

      case '召唤':
        this.chasePlayer(player);
        if (this.skillTimers.get('summon')! <= 0) {
          this.summonMinionWave();
          this.skillTimers.set('summon', this.skillCooldowns.get('summon')!);
        }
        break;

      case '范围攻击':
        this.chasePlayer(player);
        if (this.skillTimers.get('area_attack')! <= 0) {
          this.areaAttack(player);
          this.skillTimers.set('area_attack', this.skillCooldowns.get('area_attack')!);
        }
        break;

      case '狂暴':
        this.speed = this.enemyDef.speed * 2;
        this.damage = this.enemyDef.damage * 2;
        this.setTint(0xff0000);
        this.chasePlayer(player);
        break;

      default:
        this.chasePlayer(player);
    }
  }

  /**
   * 阶段变化
   */
  private onPhaseChange(phase: BossPhase): void {
    EventBus.emit(EVENTS.BOSS_SPAWNED, this, phase);

    // 视觉反馈
    this.scene.tweens.add({
      targets: this,
      scaleX: this.enemyDef.scale * 1.3,
      scaleY: this.enemyDef.scale * 1.3,
      duration: 300,
      yoyo: true,
    });
  }

  /**
   * 冲锋攻击
   */
  private chargeAttack(player: Phaser.Physics.Arcade.Sprite): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const chargeSpeed = this.speed * 3;
      this.setVelocity(
        (dx / dist) * chargeSpeed,
        (dy / dist) * chargeSpeed
      );

      // 冲锋持续 500ms 后恢复
      this.scene.time.delayedCall(500, () => {
        if (this.active) {
          this.speed = this.enemyDef.speed;
        }
      });
    }
  }

  /**
   * 召唤小怪
   */
  private summonMinionWave(): void {
    // 由外部 SpawnSystem 处理
    EventBus.emit('boss-summon-minions', this);
  }

  /**
   * 范围攻击
   */
  private areaAttack(_player: Phaser.Physics.Arcade.Sprite): void {
    // 由外部系统处理伤害区域
    EventBus.emit('boss-area-attack', this);
  }

  /**
   * Boss 死亡
   */
  die(): void {
    // Boss 死亡掉落宝箱
    EventBus.emit(EVENTS.BOSS_DEFEATED, this);

    // 大死亡特效
    this.scene.cameras.main.shake(300, 0.01);
    this.scene.cameras.main.flash(500, 255, 100, 0);

    // 生成掉落宝箱
    EventBus.emit('boss-drop-chest', this.x, this.y);

    super.die();
  }
}
