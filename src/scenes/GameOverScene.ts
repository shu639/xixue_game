/**
 * 游戏结束场景 - 结算画面
 */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { SaveManager } from '../managers/SaveManager';
import { useSaveStore } from '../stores/saveStore';

interface GameOverData {
  score: number;
  level: number;
  kills: number;
  gold: number;
  time: number;
  victory?: boolean;
}

export class GameOverScene extends Phaser.Scene {
  private gameData: GameOverData = { score: 0, level: 0, kills: 0, gold: 0, time: 0 };

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData): void {
    this.gameData = data;
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // 更新存档
    const saveStore = useSaveStore.getState();
    saveStore.updateHighScore(data.score);
    saveStore.updateHighestLevel(data.level);
    saveStore.addKills(data.kills);
    saveStore.addGold(data.gold);
    saveStore.updateStats({
      totalEnemiesKilled: saveStore.stats.totalEnemiesKilled + data.kills,
      maxLevelReached: Math.max(saveStore.stats.maxLevelReached, data.level),
    });

    // 淡入
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // ========== 标题 ==========
    const title = data.victory ? '🎉 胜利！' : '💀 游戏结束';
    const titleColor = data.victory ? '#00ff88' : '#ff4444';

    const titleText = this.add.text(GAME_WIDTH / 2, 100, title, {
      fontSize: '40px',
      fontFamily: 'Arial, sans-serif',
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    });
    titleText.setOrigin(0.5);
    titleText.setAlpha(0);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      y: 110,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // ========== 统计信息 ==========
    const statsY = 220;
    const statsItems = [
      { label: '得分', value: SaveManager.formatNumber(data.score), color: '#ffd700' },
      { label: '等级', value: `Lv.${data.level}`, color: '#ffffff' },
      { label: '击杀', value: SaveManager.formatNumber(data.kills), color: '#ff8888' },
      { label: '金币', value: `💰 ${SaveManager.formatNumber(data.gold)}`, color: '#ffd700' },
      { label: '存活时间', value: SaveManager.formatTime(data.time), color: '#88ccff' },
    ];

    statsItems.forEach((item, index) => {
      const y = statsY + index * 45;

      const label = this.add.text(100, y, item.label, {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#888888',
      });

      const value = this.add.text(290, y, item.value, {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        color: item.color,
        fontStyle: 'bold',
      });
      value.setOrigin(1, 0);

      // 延迟动画
      label.setAlpha(0);
      value.setAlpha(0);
      this.tweens.add({
        targets: [label, value],
        alpha: 1,
        x: { from: label.x - 30, to: label.x },
        duration: 400,
        delay: 300 + index * 100,
      });
    });

    // ========== 最高分信息 ==========
    const hsY = statsY + statsItems.length * 45 + 20;
    const highScoreText = this.add.text(GAME_WIDTH / 2, hsY,
      `🏆 最高分: ${SaveManager.formatNumber(saveStore.highScore)}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffaa00',
    });
    highScoreText.setOrigin(0.5);

    // ========== 按钮 ==========
    const buttonY = GAME_HEIGHT - 140;

    // 重新开始
    this.createButton(GAME_WIDTH / 2, buttonY, '🔄 重新开始', COLORS.EXP_BAR, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene');
      });
    });

    // 返回菜单
    this.createButton(GAME_WIDTH / 2, buttonY + 60, '🏠 返回菜单', 0x444444, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene');
      });
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
    callback: () => void
  ): void {
    const width = 250;
    const height = 48;

    const bg = this.add.rectangle(x, y, width, height, color, 0.9);
    bg.setStrokeStyle(2, 0xffffff, 0.3);
    bg.setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, label, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);

    bg.on('pointerover', () => { bg.setScale(1.05); text.setScale(1.05); });
    bg.on('pointerout', () => { bg.setScale(1); text.setScale(1); });
    bg.on('pointerdown', () => {
      bg.setScale(0.95);
      this.time.delayedCall(100, callback);
    });
  }
}
