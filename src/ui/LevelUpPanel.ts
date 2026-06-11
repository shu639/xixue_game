/**
 * 升级选卡面板
 * 所有元素直接添加到场景（不用 Container，避免输入事件失效）
 */
import Phaser from 'phaser';
import { UpgradeOption } from '../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { getQualityColor } from '../configs/QualityConfig';

export class LevelUpPanel {
  private scene: Phaser.Scene;
  private isVisible: boolean = false;
  private elements: Phaser.GameObjects.GameObject[] = [];
  private onSelectCallback: ((option: UpgradeOption) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(options: UpgradeOption[], onSelect: (option: UpgradeOption) => void): void {
    this.hide();
    this.onSelectCallback = onSelect;
    this.isVisible = true;

    // 半透明遮罩（防止点击穿透到游戏）
    const overlay = this.scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.65
    );
    overlay.setDepth(200);
    overlay.setScrollFactor(0);
    overlay.setInteractive();
    this.elements.push(overlay);

    // 标题
    const title = this.scene.add.text(GAME_WIDTH / 2, 50, '⬆ 升级！选择一个技能 ⬆', {
      fontSize: '22px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
    this.elements.push(title);

    // 3 张选项卡片（每张独立处理输入）
    const cardW = GAME_WIDTH - 40;
    const cardH = 110;
    const startY = 130;
    const gap = 18;

    const qualityLabels: Record<string, string> = {
      common: '普通', rare: '稀有', epic: '史诗',
      legendary: '传说', mythic: '神话',
    };

    options.forEach((option, i) => {
      const cy = startY + i * (cardH + gap);
      const qColor = getQualityColor(option.quality);

      // 卡片背景（独立交互）
      const bg = this.scene.add.rectangle(GAME_WIDTH / 2, cy + cardH / 2, cardW, cardH, 0x1a1a3e, 0.95);
      bg.setStrokeStyle(3, qColor, 1);
      bg.setDepth(201);
      bg.setScrollFactor(0);
      bg.setInteractive({ useHandCursor: true });
      this.elements.push(bg);

      // 品质标签
      const qLabel = this.scene.add.text(25, cy + 12, qualityLabels[option.quality] || '', {
        fontSize: '11px', fontFamily: 'sans-serif',
        color: '#' + qColor.toString(16).padStart(6, '0'),
        fontStyle: 'bold',
      }).setDepth(202).setScrollFactor(0);
      this.elements.push(qLabel);

      // 技能名
      const nameTxt = this.scene.add.text(25, cy + 34, option.name, {
        fontSize: '20px', fontFamily: 'sans-serif',
        color: '#ffffff', fontStyle: 'bold',
      }).setDepth(202).setScrollFactor(0);
      this.elements.push(nameTxt);

      // 描述
      const descTxt = this.scene.add.text(25, cy + 60, option.description, {
        fontSize: '14px', fontFamily: 'sans-serif', color: '#cccccc',
      }).setDepth(202).setScrollFactor(0);
      this.elements.push(descTxt);

      // 分类标签
      const catLabels: Record<string, string> = {
        stat: '属性', weapon: '武器', weapon_upgrade: '强化', utility: '功能',
      };
      const catTxt = this.scene.add.text(GAME_WIDTH - 35, cy + 12, catLabels[option.category] || '', {
        fontSize: '11px', fontFamily: 'sans-serif', color: '#888888',
      }).setOrigin(1, 0).setDepth(202).setScrollFactor(0);
      this.elements.push(catTxt);

      // 交互效果和点击
      bg.on('pointerover', () => bg.setFillStyle(0x2a2a5e, 0.95));
      bg.on('pointerout', () => bg.setFillStyle(0x1a1a3e, 0.95));
      bg.on('pointerup', () => {
        this.selectOption(option);
      });
    });

    // 跳过按钮
    const skipY = startY + options.length * (cardH + gap) + 25;
    const skipBtn = this.scene.add.text(GAME_WIDTH / 2, skipY, '跳过（随机选择）', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#666666',
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0).setInteractive({ useHandCursor: true });
    skipBtn.on('pointerup', () => {
      const rnd = options[Math.floor(Math.random() * options.length)];
      this.selectOption(rnd);
    });
    this.elements.push(skipBtn);

    console.log('[LevelUpPanel] 面板已显示, 选项数:', options.length);
  }

  private selectOption(option: UpgradeOption): void {
    console.log('[LevelUpPanel] 选择了:', option.name);
    const cb = this.onSelectCallback;
    this.hide();
    if (cb) cb(option);
  }

  hide(): void {
    this.elements.forEach(el => el.destroy());
    this.elements = [];
    this.isVisible = false;
  }

  get visible(): boolean { return this.isVisible; }

  destroy(): void { this.hide(); }
}
