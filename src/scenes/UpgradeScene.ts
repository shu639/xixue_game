/**
 * 升级场景 - 覆盖在 GameScene 上方
 * 处理升级选卡交互（已迁移到 LevelUpPanel UI 组件）
 * 此场景作为备份和扩展入口
 */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UpgradeScene' });
  }

  create(data: any): void {
    // 升级面板已集成到 GameScene 中
    // 此场景保留用于未来扩展（如天赋树全屏界面）
    this.scene.stop();
  }
}
