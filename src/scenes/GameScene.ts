/**
 * 核心战斗场景
 * 整合所有系统、实体、UI
 */
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile } from '../entities/Projectile';
import { Pickup } from '../entities/Pickup';
import { CombatSystem } from '../systems/CombatSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { LevelSystem } from '../systems/LevelSystem';
import { DropSystem } from '../systems/DropSystem';
import { WaveTimeline } from '../systems/WaveTimeline';
import { GameManager } from '../managers/GameManager';
import { AudioManager } from '../managers/AudioManager';
import { ObjectPoolManager } from '../managers/ObjectPoolManager';
import { EventBus } from '../managers/EventBus';
import { HUD } from '../ui/HUD';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { DamageText } from '../ui/DamageText';
import { LevelUpPanel } from '../ui/LevelUpPanel';
import { HealthBar } from '../ui/HealthBar';
import { getWeaponConfig } from '../configs/WeaponConfig';
import { getSkillConfig } from '../configs/SkillConfig';
import { WaveEvent } from '../types';
import {
  GAME_WIDTH, GAME_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT,
  EVENTS, COLORS, GAME_DURATION, PICKUP_VALUES,
} from '../constants';
import { useGameStore } from '../stores/gameStore';
import { useSaveStore } from '../stores/saveStore';

export class GameScene extends Phaser.Scene {
  // ========== 核心实体 ==========
  public player!: Player;

  // ========== 对象池 ==========
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private bossGroup!: Phaser.Physics.Arcade.Group;
  private projectileGroup!: Phaser.Physics.Arcade.Group;
  private pickupGroup!: Phaser.Physics.Arcade.Group;

  // ========== 系统 ==========
  private combatSystem!: CombatSystem;
  private spawnSystem!: SpawnSystem;
  private dropSystem!: DropSystem;
  private waveTimeline!: WaveTimeline;

  // ========== 管理器 ==========
  private gameManager!: GameManager;
  private audioManager!: AudioManager;
  private poolManager!: ObjectPoolManager;

  // ========== UI ==========
  private hud!: HUD;
  private joystick!: VirtualJoystick;
  private damageText!: DamageText;
  private levelUpPanel!: LevelUpPanel;

  // ========== 状态 ==========
  private elapsedTime: number = 0;
  private gameOver: boolean = false;
  private aimUpdateTimer: number = 0;
  private nearestEnemy: Enemy | null = null;

  // ========== Boss 血条 ==========
  private bossHealthBars: Map<string, HealthBar> = new Map();

  // ========== 暂停系统 ==========
  private isPaused: boolean = false;
  private pauseElements: Phaser.GameObjects.GameObject[] = [];
  private pauseBtn!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // 重置 Zustand Store
    useGameStore.getState().initNewGame();

    // 创建世界
    this.createWorld();

    // 创建对象池
    this.poolManager = new ObjectPoolManager(this);
    this.enemyGroup = this.poolManager.createEnemyPool();
    this.bossGroup = this.poolManager.createBossPool();
    this.projectileGroup = this.poolManager.createProjectilePool();
    this.pickupGroup = this.poolManager.createPickupPool();

    // 创建系统
    this.combatSystem = new CombatSystem(this);
    this.spawnSystem = new SpawnSystem(this, this.enemyGroup, this.bossGroup);
    this.dropSystem = new DropSystem(this, this.pickupGroup);
    this.waveTimeline = new WaveTimeline();

    // 创建管理器
    this.gameManager = new GameManager(this);
    this.audioManager = new AudioManager(this);

    // 创建玩家
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    // 创建 UI（必须在玩家之后）
    this.hud = new HUD(this);
    this.joystick = new VirtualJoystick(this);
    this.damageText = new DamageText(this);
    this.levelUpPanel = new LevelUpPanel(this);

    // 创建暂停按钮和菜单
    this.createPauseButton();

    // 设置摄像头
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // 设置波次回调
    this.waveTimeline.setCallbacks({
      onSpawn: (event) => this.handleWaveSpawn(event),
      onBoss: (event) => this.handleBossSpawn(event),
      onMessage: (msg) => this.hud.showWaveMessage(msg),
    });

    // 注册事件
    this.registerEvents();

    // 设置碰撞
    this.setupCollisions();

    // 游戏开始
    this.elapsedTime = 0;
    this.gameOver = false;

    // 触发音频初始化（需要用户交互）
    this.input.once('pointerdown', () => {
      this.audioManager.ensureAudio();
    });
  }

  /**
   * 创建世界（瓦片地面 + 边界）
   */
  private createWorld(): void {
    // 地面瓦片
    this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'ground_tile')
      .setOrigin(0, 0)
      .setDepth(0);

    // 物理世界边界
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 玩家不能移出世界（通过 Player 自行限制，不在物理边界上反弹）
  }

  /**
   * 设置碰撞检测
   */
  private setupCollisions(): void {
    // 投射物 vs 敌人
    this.physics.add.overlap(
      this.projectileGroup,
      this.enemyGroup,
      (proj, enemy) => {
        this.combatSystem.handleProjectileHit(
          proj as Projectile,
          enemy as Enemy
        );
      },
      undefined,
      this
    );

    // 投射物 vs Boss
    this.physics.add.overlap(
      this.projectileGroup,
      this.bossGroup,
      (proj, boss) => {
        this.combatSystem.handleProjectileHit(
          proj as Projectile,
          boss as Enemy
        );
      },
      undefined,
      this
    );

    // 敌人 vs 玩家
    this.physics.add.overlap(
      this.enemyGroup,
      this.player,
      (player, enemy) => {
        this.combatSystem.handleEnemyPlayerCollision(
          enemy as Enemy,
          player as Player
        );
      },
      undefined,
      this
    );

    // Boss vs 玩家
    this.physics.add.overlap(
      this.bossGroup,
      this.player,
      (player, boss) => {
        this.combatSystem.handleEnemyPlayerCollision(
          boss as Enemy,
          player as Player
        );
      },
      undefined,
      this
    );

    // 掉落物 vs 玩家
    this.physics.add.overlap(
      this.pickupGroup,
      this.player,
      (player, pickup) => {
        this.handlePickupCollected(pickup as Pickup);
      },
      undefined,
      this
    );
  }

  /**
   * 注册全局事件
   */
  private registerEvents(): void {
    // 敌人击杀
    EventBus.on(EVENTS.ENEMY_KILLED, (enemy: Enemy) => {
      this.onEnemyKilled(enemy);
    });

    // 玩家升级
    EventBus.on(EVENTS.PLAYER_LEVEL_UP, (level: number) => {
      this.onPlayerLevelUp(level);
    });

    // Boss 掉落宝箱
    EventBus.on('boss-drop-chest', (x: number, y: number) => {
      this.dropSystem.spawnBossChest(x, y);
    });

    // Boss 召唤小怪
    EventBus.on('boss-summon-minions', (boss: Boss) => {
      this.spawnBossMinions(boss);
    });

    // Boss 范围攻击
    EventBus.on('boss-area-attack', (boss: Boss) => {
      this.handleBossAreaAttack(boss);
    });

    // 生成小怪波
    EventBus.on('spawn-minion-wave', (x: number, y: number, count: number) => {
      this.spawnMinionWave(x, y, count);
    });
  }

  /**
   * 主更新循环
   */
  update(time: number, delta: number): void {
    if (this.gameOver) return;
    if (this.isPaused) return;            // 暂停菜单打开时冻结游戏
    if (this.levelUpPanel.visible) return; // 升级面板打开时暂停游戏

    // 更新时间
    this.elapsedTime += delta / 1000;

    // 检查游戏结束
    if (this.elapsedTime >= GAME_DURATION) {
      this.endGame(true); // 时间到，胜利
      return;
    }

    // ========== 更新波次 ==========
    this.waveTimeline.update(this.elapsedTime);
    this.spawnSystem.update(delta);

    // ========== 更新玩家 ==========
    this.player.moveWithJoystick(this.joystick.vx, this.joystick.vy, delta);
    this.player.updateInvincible(delta);

    // 限制玩家在世界范围内
    this.player.x = Phaser.Math.Clamp(this.player.x, this.player.body!.halfWidth, WORLD_WIDTH - this.player.body!.halfWidth);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.player.body!.halfHeight, WORLD_HEIGHT - this.player.body!.halfHeight);

    // ========== 自动瞄准 ==========
    this.aimUpdateTimer += delta;
    if (this.aimUpdateTimer >= 100) { // 每 100ms 更新一次目标
      this.aimUpdateTimer = 0;
      this.nearestEnemy = this.combatSystem.findNearestEnemy(this.player, this.enemyGroup);
      if (!this.nearestEnemy) {
        this.nearestEnemy = this.combatSystem.findNearestEnemy(this.player, this.bossGroup) as Enemy;
      }
    }

    // ========== 武器自动攻击 ==========
    this.updateWeapons(delta);

    // ========== 更新敌人 AI ==========
    this.updateEnemyAI(delta);

    // ========== 更新掉落物 ==========
    this.updatePickups(delta);

    // ========== 玩家死亡检测 ==========
    if (this.player.isDead()) {
      this.handlePlayerDeath();
      return;
    }

    // ========== 更新 HUD ==========
    const store = useGameStore.getState();
    this.hud.update(
      this.player,
      this.elapsedTime,
      store.gameState.kills,
      store.gameState.gold
    );

    // ========== 更新 Boss 血条 ==========
    this.updateBossHealthBars();
  }

  /**
   * 更新武器自动攻击
   */
  private updateWeapons(delta: number): void {
    const store = useGameStore.getState();
    const equippedWeapons = store.equippedWeapons;

    for (const weaponId of equippedWeapons) {
      const weaponDef = getWeaponConfig(weaponId);
      if (!weaponDef) continue;

      // 更新冷却
      let cooldown = this.player.weaponCooldowns.get(weaponId) ?? 0;
      cooldown -= delta;
      this.player.weaponCooldowns.set(weaponId, cooldown);

      // 冷却完毕，自动攻击
      if (cooldown <= 0 && this.nearestEnemy && this.nearestEnemy.active) {
        // 部分武器不需要目标也可攻击
        this.fireWeapon(weaponId, weaponDef, this.nearestEnemy);
      } else if (cooldown <= 0 && !this.nearestEnemy) {
        // 没有目标时，某些范围武器也可以触发（旋转飞剑、毒雾）
        if (weaponId === 'spinning_sword' || weaponId === 'poison_cloud') {
          this.fireWeapon(weaponId, weaponDef, null);
        }
      }
    }
  }

  /**
   * 发射武器
   */
  private fireWeapon(
    weaponId: string,
    weaponDef: ReturnType<typeof getWeaponConfig>,
    target: Enemy | null
  ): void {
    if (!weaponDef) return;

    // 重置冷却
    const effectiveCooldown = this.combatSystem.getEffectiveCooldown(
      weaponDef.cooldown,
      this.player
    );
    this.player.weaponCooldowns.set(weaponId, effectiveCooldown);

    // 弹射数量
    const count = weaponDef.projectileCount +
      (this.player.stats.projectileCount - 1);

    const baseAngle = target
      ? this.combatSystem.getAttackAngle(this.player, target)
      : 0;

    // 特殊武器：旋转飞剑（环绕玩家）
    if (weaponId === 'spinning_sword') {
      this.fireSpinningSwords(weaponDef, count);
      return;
    }

    // 特殊武器：毒雾（玩家周围）
    if (weaponId === 'poison_cloud') {
      this.firePoisonCloud(weaponDef);
      return;
    }

    // 普通发射
    for (let i = 0; i < count; i++) {
      const angle = count > 1
        ? baseAngle + (i - (count - 1) / 2) * 15
        : baseAngle;

      const proj = this.projectileGroup.get(
        this.player.x, this.player.y, 'projectile'
      ) as Projectile;

      if (!proj) continue;

      const { damage, isCrit } = this.combatSystem.calculateDamage(
        weaponDef.baseDamage,
        this.player
      );

      proj.fire(
        this.player.x,
        this.player.y,
        angle,
        weaponDef.projectileSpeed * this.player.stats.projectileSpeed,
        weaponDef,
        damage,
        isCrit,
        weaponId === 'missile' ? target : null
      );

      this.audioManager.playAttackSound();
    }
  }

  /**
   * 旋转飞剑（环绕玩家）
   */
  private fireSpinningSwords(weaponDef: any, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360 + (this.elapsedTime * 100);
      const rad = Phaser.Math.DegToRad(angle);
      const orbitRadius = 60 * this.player.stats.areaSize;
      const sx = this.player.x + Math.cos(rad) * orbitRadius;
      const sy = this.player.y + Math.sin(rad) * orbitRadius;

      const proj = this.projectileGroup.get(sx, sy, 'projectile') as Projectile;
      if (!proj) continue;

      const { damage, isCrit } = this.combatSystem.calculateDamage(
        weaponDef.baseDamage,
        this.player
      );

      proj.fire(sx, sy, angle, 0, weaponDef, damage, isCrit, null);
      // 飞剑在玩家周围旋转（通过自定义行为）
      proj.setVelocity(0, 0);
    }
  }

  /**
   * 毒雾（玩家周围区域）
   */
  private firePoisonCloud(weaponDef: any): void {
    const { damage, isCrit } = this.combatSystem.calculateDamage(
      weaponDef.baseDamage,
      this.player
    );

    // 毒雾是一个范围伤害区域
    const radius = weaponDef.areaSize * this.player.stats.areaSize;

    // 对范围内的敌人造成伤害
    this.enemyGroup.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.active || enemy.hp <= 0) return;

      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        enemy.takeDamage(damage * 0.5); // DPS 减半避免过强
      }
    });

    // 对 Boss 也生效
    this.bossGroup.getChildren().forEach((child) => {
      const boss = child as Boss;
      if (!boss.active || boss.hp <= 0) return;

      const dx = boss.x - this.player.x;
      const dy = boss.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        boss.takeDamage(damage * 0.5);
      }
    });

    // 毒雾视觉效果
    const circle = this.add.circle(
      this.player.x, this.player.y,
      radius, 0x00ff00, 0.1
    );
    circle.setDepth(1);
    this.tweens.add({
      targets: circle,
      alpha: 0,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      onComplete: () => circle.destroy(),
    });
  }

  /**
   * 更新敌人 AI
   */
  private updateEnemyAI(delta: number): void {
    const players = [this.player];
    const enemyList: Enemy[] = [];

    // 普通敌人
    this.enemyGroup.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.active || enemy.hp <= 0) return;
      enemy.chasePlayer(this.player);
      enemyList.push(enemy);
    });

    // Boss
    this.bossGroup.getChildren().forEach((child) => {
      const boss = child as Boss;
      if (!boss.active || boss.hp <= 0) return;
      boss.updateBoss(delta, this.player);
      enemyList.push(boss);
    });

    // 分离避免重叠（每3帧执行以节省性能）
    if (this.time.now % 3 === 0 && enemyList.length > 0) {
      for (const enemy of enemyList) {
        enemy.separate(enemyList);
      }
    }
  }

  /**
   * 更新掉落物（磁吸）
   */
  private updatePickups(delta: number): void {
    this.pickupGroup.getChildren().forEach((child) => {
      const pickup = child as Pickup;
      if (!pickup.active) return;

      const dx = this.player.x - pickup.x;
      const dy = this.player.y - pickup.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 在拾取范围内，开始磁吸
      if (dist <= this.player.stats.pickupRange) {
        pickup.startCollect(this.player);
      }

      if (pickup.isBeingCollected) {
        pickup.moveTowardsPlayer(this.player, delta);
      }
    });
  }

  /**
   * 处理掉落物收集
   */
  private handlePickupCollected(pickup: Pickup): void {
    if (!pickup.active) return;

    const store = useGameStore.getState();

    switch (pickup.pickupType) {
      case 'exp': {
        const leveled = LevelSystem.addExp(this.player, pickup.value);
        this.damageText.showExp(pickup.x, pickup.y, pickup.value);
        if (leveled) {
          // 已由事件处理
        }
        break;
      }
      case 'coin':
        store.addGold(pickup.value);
        break;
      case 'heal':
        this.player.heal(PICKUP_VALUES.heal);
        this.damageText.show(pickup.x, pickup.y, PICKUP_VALUES.heal, false, true);
        break;
      case 'chest':
        this.audioManager.playChestSound();
        this.openChest(pickup);
        break;
    }

    pickup.deactivate();
  }

  /**
   * 开启宝箱
   */
  private openChest(pickup: Pickup): void {
    // 宝箱奖励：大量金币 + 可能的回血
    const goldReward = Phaser.Math.Between(20, 50);
    useGameStore.getState().addGold(goldReward);
    this.damageText.show(pickup.x, pickup.y, goldReward, false, false);
    this.hud.showWaveMessage(`获得 ${goldReward} 金币！`);
  }

  /**
   * 敌人被击杀
   */
  private onEnemyKilled(enemy: Enemy): void {
    const store = useGameStore.getState();
    store.addKill();

    // 经验
    LevelSystem.addExp(this.player, enemy.expValue);

    // 掉落
    this.dropSystem.handleEnemyDeath(enemy);

    // 伤害数字（击杀特效）
    this.damageText.show(enemy.x, enemy.y, enemy.expValue, false, false);

    this.audioManager.playEnemyDeathSound();
  }

  /**
   * 玩家升级
   */
  private onPlayerLevelUp(level: number): void {
    this.audioManager.playLevelUpSound();

    // 暂停游戏
    this.physics.pause();
    this.tweens.pauseAll();

    // 生成升级选项
    const options = UpgradeSystem.generateOptions(this.player, 3);

    // 显示升级面板
    this.levelUpPanel.show(options, (selected) => {
      // 应用升级
      UpgradeSystem.applyUpgrade(this.player, selected);

      // 如果解锁新武器，添加到冷却表
      const skillDef = getSkillConfig(selected.skillId);
      if (skillDef && skillDef.weaponId) {
        this.player.weaponCooldowns.set(skillDef.weaponId, 0);
      }

      // 恢复游戏
      this.physics.resume();
      this.tweens.resumeAll();
    });
  }

  /**
   * 波次生成处理
   */
  private handleWaveSpawn(event: WaveEvent): void {
    switch (event.type) {
      case 'spawn':
        this.spawnSystem.addSpawnWave(event.enemyId, event.count, event.interval);
        break;
      case 'flood':
        this.spawnSystem.spawnFlood(event.enemyId, event.count);
        break;
      case 'elite':
        this.spawnSystem.addEliteSpawn(event.enemyId, event.count, event.interval);
        break;
    }
  }

  /**
   * Boss 生成处理
   */
  private handleBossSpawn(event: WaveEvent): void {
    this.spawnSystem.spawnBoss(event.enemyId);
    this.audioManager.playBossAppearSound();

    if (event.message) {
      this.hud.showWaveMessage(event.message);
    }
  }

  /**
   * Boss 召唤小怪
   */
  private spawnBossMinions(boss: Boss): void {
    const minionTypes = ['slime', 'bat', 'ghost'];
    const minionType = minionTypes[Math.floor(Math.random() * minionTypes.length)];

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const dist = 60;
      const x = boss.x + Math.cos(angle) * dist;
      const y = boss.y + Math.sin(angle) * dist;
      this.spawnSystem.spawnEnemyAt(minionType, x, y);
    }
  }

  /**
   * Boss 范围攻击
   */
  private handleBossAreaAttack(boss: Boss): void {
    // 范围伤害
    const radius = 120;
    const damage = 40;

    const dx = this.player.x - boss.x;
    const dy = this.player.y - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= radius) {
      this.player.takeDamage(damage);
      this.damageText.show(this.player.x, this.player.y, damage, false, false);
    }

    // 视觉
    const circle = this.add.circle(boss.x, boss.y, radius, 0xff0000, 0.15);
    circle.setDepth(3);
    this.tweens.add({
      targets: circle,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 600,
      onComplete: () => circle.destroy(),
    });
  }

  /**
   * 在Boss周围生成小怪
   */
  private spawnMinionWave(x: number, y: number, count: number): void {
    const types = ['slime', 'bat'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Phaser.Math.Between(40, 100);
      const mx = x + Math.cos(angle) * dist;
      const my = y + Math.sin(angle) * dist;
      const type = types[Math.floor(Math.random() * types.length)];
      this.spawnSystem.spawnEnemyAt(type, mx, my);
    }
  }

  /**
   * 更新 Boss 血条
   */
  private updateBossHealthBars(): void {
    this.bossGroup.getChildren().forEach((child) => {
      const boss = child as Boss;
      if (!boss.active || boss.hp <= 0) return;

      const bossId = boss.enemyDef.id + '_' + boss.x + '_' + boss.y; // 粗糙ID
      let healthBar = this.bossHealthBars.get(bossId);

      if (!healthBar) {
        healthBar = new HealthBar(this, boss, -40, 80, 8, true);
        this.bossHealthBars.set(bossId, healthBar);
      }

      healthBar.update(boss.hp, boss.maxHp);
    });
  }

  /**
   * 玩家死亡
   */
  private handlePlayerDeath(): void {
    // 尝试复活
    if (this.player.stats.revival > 0) {
      this.player.stats.revival--;
      this.player.stats.hp = Math.ceil(this.player.stats.maxHp * 0.5);
      this.player.isInvincible = true;
      this.player.invincibleTimer = 2000;
      this.hud.showWaveMessage('复活！');

      this.audioManager.playLevelUpSound();
      return;
    }

    this.audioManager.playPlayerDeathSound();
    this.endGame(false);
  }

  /**
   * 结束游戏
   */
  private endGame(victory: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;

    const store = useGameStore.getState();

    // 计算得分
    const score = Math.round(
      this.player.level * 100 +
      store.gameState.kills * 10 +
      store.gameState.gold +
      this.elapsedTime * 2
    );

    // 停止物理
    this.physics.pause();

    // 延迟过渡
    this.time.delayedCall(1500, () => {
      this.scene.start('GameOverScene', {
        score,
        level: this.player.level,
        kills: store.gameState.kills,
        gold: store.gameState.gold,
        time: this.elapsedTime,
        victory,
      });
    });
  }

  // ===================== 暂停系统 =====================

  private createPauseButton(): void {
    // 右上角暂停按钮（直接加场景，不用 Container）
    this.pauseBtn = this.add.text(GAME_WIDTH - 15, 25, '⏸', {
      fontSize: '28px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(120).setScrollFactor(0).setInteractive({ useHandCursor: true });

    this.pauseBtn.on('pointerup', () => {
      if (!this.isPaused && !this.levelUpPanel.visible && !this.gameOver) {
        this.showPauseMenu();
      }
    });
  }

  private showPauseMenu(): void {
    this.isPaused = true;
    this.physics.pause();
    this.tweens.pauseAll();
    this.pauseBtn.setVisible(false);

    // 半透明遮罩
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.7
    ).setDepth(250).setScrollFactor(0).setInteractive();
    this.pauseElements.push(overlay);

    // 标题
    const title = this.add.text(GAME_WIDTH / 2, 250, '⏸ 游戏暂停', {
      fontSize: '32px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(251).setScrollFactor(0);
    this.pauseElements.push(title);

    // 继续按钮
    this.addPauseButton(GAME_WIDTH / 2, 380, '▶ 继续游戏', () => {
      this.hidePauseMenu();
    });

    // 返回菜单按钮
    this.addPauseButton(GAME_WIDTH / 2, 450, '🏠 返回菜单', () => {
      this.quitToMenu();
    });
  }

  private addPauseButton(x: number, y: number, label: string, cb: () => void): void {
    const bg = this.add.rectangle(x, y, 240, 48, 0x1a3a5c, 0.9)
      .setStrokeStyle(2, 0x4488cc, 0.5)
      .setDepth(251).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(252).setScrollFactor(0);

    this.pauseElements.push(bg, txt);

    bg.on('pointerover', () => { bg.setScale(1.04); txt.setScale(1.04); });
    bg.on('pointerout', () => { bg.setScale(1); txt.setScale(1); });
    bg.on('pointerup', cb);
  }

  private hidePauseMenu(): void {
    this.isPaused = false;
    this.physics.resume();
    this.tweens.resumeAll();
    this.pauseBtn.setVisible(true);

    this.pauseElements.forEach(el => el.destroy());
    this.pauseElements = [];
  }

  private quitToMenu(): void {
    // 保存进度数据
    const store = useGameStore.getState();
    const saveStore = useSaveStore.getState();
    saveStore.addKills(store.gameState.kills);
    saveStore.addGold(store.gameState.gold);
    saveStore.updateHighestLevel(this.player.level);

    // 清理暂停界面
    this.pauseElements.forEach(el => el.destroy());
    this.pauseElements = [];
    this.isPaused = false;

    // 返回菜单
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }

  /**
   * 场景关闭时清理
   */
  shutdown(): void {
    EventBus.removeAllListeners();
    this.poolManager.destroyAll();
    this.bossHealthBars.forEach(bar => bar.destroy());
    this.bossHealthBars.clear();

    if (this.hud) this.hud.destroy();
    if (this.joystick) this.joystick.destroy();
    if (this.damageText) this.damageText.destroy();
    if (this.levelUpPanel) this.levelUpPanel.destroy();
  }
}

