/**
 * 游戏入口 - 吸血鬼幸存者
 * Vampire Survivors 风格 Roguelike 生存手游
 */
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

// 启动前检查 DOM
console.log('[Game] DOM ready, container:', document.getElementById('game-container'));

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    activePointers: 3,
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  callbacks: {
    postBoot: (game) => {
      console.log('[Game] postBoot - Phaser 已启动, 渲染器:', game.renderer.type === 1 ? 'WebGL' : 'Canvas');
    },
  },
  scene: [BootScene, MenuScene, GameScene, UpgradeScene, GameOverScene],
};

// 全局错误捕获
window.addEventListener('error', (e) => {
  console.error('[Game] 全局错误:', e.message, e.filename, e.lineno);
});

// 启动游戏
try {
  const game = new Phaser.Game(config);
  console.log('[Game] Phaser.Game 创建成功');
  (window as any).__game = game;
} catch (e) {
  console.error('[Game] 创建 Phaser.Game 失败:', e);
  document.getElementById('game-container')!.innerHTML =
    '<div style="color:red;padding:20px;text-align:center;">' +
    '<h2>游戏启动失败</h2>' +
    '<p>' + String(e) + '</p>' +
    '</div>';
}
