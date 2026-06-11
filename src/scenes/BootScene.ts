/**
 * 启动场景 - 最小化验证版本
 */
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    console.log('[BootScene] create() 开始');

    // 先生成纹理
    this.generateAllTextures();
    console.log('[BootScene] 纹理生成完成');

    // 点击任意位置进入菜单
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, '🧛 吸血鬼幸存者', {
      fontSize: '36px',
      fontFamily: 'sans-serif',
      color: '#ff0033',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'Roguelike 生存挑战', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, '👆 点击屏幕开始游戏', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#888888',
    }).setOrigin(0.5);

    // 闪烁提示
    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // 全屏透明按钮，点击进入菜单（用 pointerup 避免输入冲突）
    const clickZone = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
    ).setInteractive({ useHandCursor: true });

    clickZone.on('pointerup', () => {
      console.log('[BootScene] 点击 -> 进入 MenuScene');
      clickZone.disableInteractive();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MenuScene');
      });
    });

    console.log('[BootScene] create() 完成');
  }

  /**
   * 用 Canvas API 生成所有纹理
   */
  private generateAllTextures(): void {
    this.makeTex('player', 32, (ctx) => {
      ctx.fillStyle = '#00ff88'; ctx.beginPath(); ctx.arc(16, 16, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#00cc66'; ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI * 2); ctx.fill();
    });

    this.makeTex('enemy', 24, (ctx) => {
      ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(12, 12, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cc2222'; ctx.beginPath(); ctx.arc(12, 12, 6, 0, Math.PI * 2); ctx.fill();
    });

    this.makeTex('enemy_elite', 32, (ctx) => {
      ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(16, 16, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cc6600'; ctx.beginPath(); ctx.arc(16, 16, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffaa00'; ctx.fillRect(8, 1, 16, 5);
    });

    this.makeTex('boss', 64, (ctx) => {
      ctx.fillStyle = '#ff0033'; ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cc0022'; ctx.beginPath(); ctx.arc(32, 32, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.arc(24, 22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(40, 22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.fillRect(25, 36, 14, 8);
    });

    this.makeTex('projectile', 8, (ctx) => {
      ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(4, 4, 3, 0, Math.PI * 2); ctx.fill();
    });

    this.makeTex('pickup', 12, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(6, 6, 5, 0, Math.PI * 2); ctx.fill();
    });

    this.makeTex('ground_tile', 64, (ctx) => {
      ctx.fillStyle = '#16213e'; ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = 'rgba(26,26,62,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(0, 0, 64, 64);
    });

    console.log('[BootScene] 所有纹理创建完成');
  }

  private makeTex(key: string, size: number, draw: (ctx: CanvasRenderingContext2D) => void): void {
    const canvas = this.textures.createCanvas(key, size, size);
    if (canvas) {
      draw(canvas.getContext());
      canvas.refresh();
    }
  }
}
