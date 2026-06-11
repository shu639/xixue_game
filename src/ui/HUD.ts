/**
 * HUD - 顶部信息栏
 * 显示等级、经验条、时间、击杀数、金币
 */
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { COLORS, GAME_WIDTH, GAME_DURATION } from '../constants';
import { SaveManager } from '../managers/SaveManager';

export class HUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  // UI 元素
  private levelText!: Phaser.GameObjects.Text;
  private expBarBg!: Phaser.GameObjects.Rectangle;
  private expBarFill!: Phaser.GameObjects.Rectangle;
  private timeText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;

  // HP 条
  private hpBarBg!: Phaser.GameObjects.Rectangle;
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;

  // 波次提示
  private waveMessageTimer: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setScrollFactor(0);

    this.createUI();
  }

  private createUI(): void {
    const padding = 10;
    const topOffset = 30; // 顶部安全区域偏移

    // ========== 半透明背景条 ==========
    const bgBar = this.scene.add.rectangle(
      GAME_WIDTH / 2, 0,
      GAME_WIDTH, 100 + topOffset,
      COLORS.HUD_BG, 0.6
    );
    bgBar.setOrigin(0.5, 0);
    this.container.add(bgBar);

    // ========== 等级 ==========
    this.levelText = this.scene.add.text(padding, topOffset + 5, 'Lv.1', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.container.add(this.levelText);

    // ========== 经验条 ==========
    const expBarWidth = 130;
    const expBarHeight = 8;
    const expBarY = topOffset + 28;

    this.expBarBg = this.scene.add.rectangle(
      52, expBarY, expBarWidth, expBarHeight, COLORS.HP_BAR_BG
    );
    this.expBarBg.setOrigin(0, 0.5);
    this.container.add(this.expBarBg);

    this.expBarFill = this.scene.add.rectangle(
      52, expBarY, 0, expBarHeight, COLORS.EXP_BAR
    );
    this.expBarFill.setOrigin(0, 0.5);
    this.container.add(this.expBarFill);

    // ========== 时间 ==========
    this.timeText = this.scene.add.text(GAME_WIDTH - padding, topOffset + 5, '00:00', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.timeText.setOrigin(1, 0);
    this.container.add(this.timeText);

    // ========== 击杀数 ==========
    this.killText = this.scene.add.text(padding, topOffset + 42, '击杀: 0', {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.container.add(this.killText);

    // ========== 金币 ==========
    this.goldText = this.scene.add.text(GAME_WIDTH - padding, topOffset + 42, '💰 0', {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.goldText.setOrigin(1, 0);
    this.container.add(this.goldText);

    // ========== HP 条 ==========
    const hpBarWidth = GAME_WIDTH - padding * 2;
    const hpBarHeight = 6;
    const hpBarY = topOffset + 65;

    this.hpBarBg = this.scene.add.rectangle(
      padding, hpBarY, hpBarWidth, hpBarHeight, COLORS.HP_BAR_BG
    );
    this.hpBarBg.setOrigin(0, 0.5);
    this.container.add(this.hpBarBg);

    this.hpBarFill = this.scene.add.rectangle(
      padding, hpBarY, hpBarWidth, hpBarHeight, COLORS.HP_BAR
    );
    this.hpBarFill.setOrigin(0, 0.5);
    this.container.add(this.hpBarFill);

    this.hpText = this.scene.add.text(GAME_WIDTH / 2, hpBarY, 'HP', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.hpText.setOrigin(0.5);
    this.container.add(this.hpText);

    // ========== 波次消息 ==========
    this.messageText = this.scene.add.text(GAME_WIDTH / 2, topOffset + 85, '', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.messageText.setOrigin(0.5, 0);
    this.messageText.setAlpha(0);
    this.container.add(this.messageText);
  }

  /**
   * 每帧更新 HUD
   */
  update(player: Player, elapsedTime: number, kills: number, gold: number): void {
    // 等级
    this.levelText.setText(`Lv.${player.level}`);

    // 经验条
    const expWidth = 130 * player.getExpProgress();
    this.expBarFill.setSize(expWidth, 8);

    // 时间
    const remaining = Math.max(0, GAME_DURATION - elapsedTime);
    this.timeText.setText(SaveManager.formatTime(remaining));

    // 击杀
    this.killText.setText(`击杀: ${SaveManager.formatNumber(kills)}`);

    // 金币
    this.goldText.setText(`💰 ${SaveManager.formatNumber(gold)}`);

    // HP 条
    const hpRatio = player.stats.hp / player.stats.maxHp;
    const hpBarWidth = GAME_WIDTH - 20;
    this.hpBarFill.setSize(hpBarWidth * hpRatio, 6);

    // HP 颜色变化
    if (hpRatio < 0.25) {
      this.hpBarFill.setFillStyle(COLORS.HP_BAR);
    } else if (hpRatio < 0.5) {
      this.hpBarFill.setFillStyle(0xff8800);
    } else {
      this.hpBarFill.setFillStyle(COLORS.HP_BAR_PLAYER);
    }

    this.hpText.setText(`HP ${player.stats.hp}/${player.stats.maxHp}`);

    // 波次消息淡出
    if (this.waveMessageTimer > 0) {
      this.waveMessageTimer -= 16;
      if (this.waveMessageTimer <= 0) {
        this.scene.tweens.add({
          targets: this.messageText,
          alpha: 0,
          duration: 500,
        });
      }
    }
  }

  /**
   * 显示波次消息
   */
  showWaveMessage(message: string): void {
    this.messageText.setText(message);
    this.messageText.setAlpha(1);
    this.waveMessageTimer = 3000; // 显示 3 秒
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.container.destroy();
  }
}
