/**
 * 游戏管理器
 * 控制游戏状态：开始、暂停、继续、结束
 */
import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';
import { useSaveStore } from '../stores/saveStore';
import { EVENTS } from '../constants';
import { EventBus } from './EventBus';

export class GameManager {
  private scene: Phaser.Scene;
  private isPaused: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 初始化新游戏
   */
  initNewGame(): void {
    const store = useGameStore.getState();
    const saveStore = useSaveStore.getState();

    store.initNewGame();
    saveStore.incrementGamesPlayed();
  }

  /**
   * 暂停游戏
   */
  pause(): void {
    if (this.isPaused) return;

    this.scene.physics.pause();
    this.scene.tweens.pauseAll();
    this.isPaused = true;

    const store = useGameStore.getState();
    store.setGameState({ isPaused: true });

    EventBus.emit(EVENTS.GAME_PAUSED);
  }

  /**
   * 继续游戏
   */
  resume(): void {
    if (!this.isPaused) return;

    this.scene.physics.resume();
    this.scene.tweens.resumeAll();
    this.isPaused = false;

    const store = useGameStore.getState();
    store.setGameState({ isPaused: false });

    EventBus.emit(EVENTS.GAME_RESUMED);
  }

  /**
   * 游戏结束
   */
  gameOver(score: number, level: number, kills: number, gold: number): void {
    const store = useGameStore.getState();
    const saveStore = useSaveStore.getState();

    // 更新运行时状态
    store.setGameState({
      isRunning: false,
      isGameOver: true,
      isPaused: false,
    });

    // 更新存档
    saveStore.updateHighScore(score);
    saveStore.updateHighestLevel(level);
    saveStore.addKills(kills);
    saveStore.addGold(gold);

    // 更新统计
    saveStore.updateStats({
      totalEnemiesKilled: saveStore.stats.totalEnemiesKilled + kills,
      maxLevelReached: Math.max(saveStore.stats.maxLevelReached, level),
    });

    EventBus.emit(EVENTS.GAME_OVER, { score, level, kills, gold });

    // 过渡到结算场景
    this.scene.time.delayedCall(1000, () => {
      this.scene.scene.start('GameOverScene', { score, level, kills, gold });
    });
  }

  /**
   * 复活玩家
   */
  revivePlayer(player: any): boolean {
    if (player.stats.revival <= 0) return false;

    player.stats.revival--;
    player.stats.hp = Math.ceil(player.stats.maxHp * 0.5);
    player.isInvincible = true;
    player.invincibleTimer = 2000; // 复活后 2 秒无敌

    return true;
  }

  /**
   * 获取当前游戏状态
   */
  get isGamePaused(): boolean {
    return this.isPaused;
  }
}
