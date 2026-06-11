/**
 * 主菜单场景
 */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { useSaveStore } from '../stores/saveStore';

export class MenuScene extends Phaser.Scene {
  private uiElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    console.log('[MenuScene] create()');
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // 装饰粒子
    for (let i = 0; i < 15; i++) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(2, 4), 0xff0033, 0.08
      );
      this.tweens.add({
        targets: dot, y: dot.y - Phaser.Math.Between(30, 80), alpha: 0.02,
        duration: Phaser.Math.Between(3000, 6000), yoyo: true, repeat: -1,
      });
    }

    this.showMainMenu();
  }

  private destroyUI(): void {
    this.uiElements.forEach(e => e.destroy());
    this.uiElements = [];
  }

  private showMainMenu(): void {
    this.destroyUI();

    const t1 = this.add.text(GAME_WIDTH / 2, 180, '吸血鬼\n幸存者', {
      fontSize: '48px', fontFamily: 'sans-serif', color: '#ff0033',
      fontStyle: 'bold', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);
    this.uiElements.push(t1);

    const t2 = this.add.text(GAME_WIDTH / 2, 290, 'Roguelike 生存挑战', {
      fontSize: '14px', fontFamily: 'sans-serif', color: '#888888',
    }).setOrigin(0.5);
    this.uiElements.push(t2);

    const btnY = 420;
    this.makeBtn(btnY, '🎮 开始游戏', () => this.startGame());
    this.makeBtn(btnY + 70, '⚙️ 设置', () => this.showSettings());

    const save = useSaveStore.getState();
    const stats = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50,
      `🏆 最高分: ${save.highScore}  |  ⭐ Lv.${save.highestLevel}  |  🎯 ${save.gamesPlayed} 局`, {
        fontSize: '12px', fontFamily: 'sans-serif', color: '#666666',
      }).setOrigin(0.5);
    this.uiElements.push(stats);
  }

  // ===================== 设置面板 =====================

  private showSettings(): void {
    this.destroyUI();

    const settings = useSaveStore.getState().settings;

    // 背景遮罩
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);
    this.uiElements.push(overlay);

    const title = this.add.text(GAME_WIDTH / 2, 120, '⚙️ 设置', {
      fontSize: '32px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.uiElements.push(title);

    let y = 220;

    // BGM 音量
    const bgmLabel = this.add.text(50, y, '🎵 背景音乐', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#cccccc',
    });
    this.uiElements.push(bgmLabel);
    this.makeSlider(y + 35, settings.bgmVolume, (val) => {
      useSaveStore.getState().updateSettings({ bgmVolume: val });
    });
    y += 95;

    // SFX 音量
    const sfxLabel = this.add.text(50, y, '🔊 音效', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#cccccc',
    });
    this.uiElements.push(sfxLabel);
    this.makeSlider(y + 35, settings.sfxVolume, (val) => {
      useSaveStore.getState().updateSettings({ sfxVolume: val });
    });
    y += 95;

    // 伤害数字
    const dmgLabel = this.add.text(50, y, '💥 伤害数字', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#cccccc',
    });
    this.uiElements.push(dmgLabel);
    this.makeToggle(y + 35, settings.showDamage, (val) => {
      useSaveStore.getState().updateSettings({ showDamage: val });
    });
    y += 80;

    // 屏幕震动
    const shakeLabel = this.add.text(50, y, '📳 屏幕震动', {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#cccccc',
    });
    this.uiElements.push(shakeLabel);
    this.makeToggle(y + 35, settings.screenShake, (val) => {
      useSaveStore.getState().updateSettings({ screenShake: val });
    });
    y += 95;

    // 返回
    this.makeBtn(y, '✅ 返回', () => this.showMainMenu());
  }

  private makeSlider(y: number, initial: number, onChange: (val: number) => void): void {
    const barW = 250;
    const barH = 8;
    const x0 = 55;
    const mid = x0 + barW / 2;

    const track = this.add.rectangle(mid, y, barW, barH, 0x333333);
    this.uiElements.push(track);

    const fill = this.add.rectangle(x0, y, barW * initial, barH, 0x4488cc).setOrigin(0, 0.5);
    this.uiElements.push(fill);

    const knobX = x0 + barW * initial;
    const knob = this.add.circle(knobX, y, 14, 0x4488cc)
      .setInteractive({ useHandCursor: true, draggable: true });
    this.uiElements.push(knob);

    const pct = this.add.text(x0 + barW + 15, y, `${Math.round(initial * 100)}%`, {
      fontSize: '16px', fontFamily: 'sans-serif', color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.uiElements.push(pct);

    const updateSlider = (val: number) => {
      const clamped = Phaser.Math.Clamp(val, 0, 1);
      knob.x = x0 + barW * clamped;
      fill.setSize(barW * clamped, barH);
      pct.setText(`${Math.round(clamped * 100)}%`);
    };

    this.input.on('drag', (_ptr: any, obj: any, dragX: number) => {
      if (obj !== knob) return;
      updateSlider((dragX - x0) / barW);
    });

    this.input.on('dragend', (_ptr: any, obj: any) => {
      if (obj !== knob) return;
      const val = Phaser.Math.Clamp((obj.x - x0) / barW, 0, 1);
      onChange(val);
    });

    track.setInteractive({ useHandCursor: true });
    track.on('pointerdown', (ptr: any) => {
      updateSlider((ptr.x - x0) / barW);
      onChange(Phaser.Math.Clamp((ptr.x - x0) / barW, 0, 1));
    });
  }

  private makeToggle(y: number, initial: boolean, onChange: (val: boolean) => void): void {
    const x = 250;
    const w = 52;
    const h = 28;
    let isOn = initial;

    const bg = this.add.rectangle(x + w / 2, y, w, h, isOn ? 0x4488cc : 0x555555, 1)
      .setInteractive({ useHandCursor: true });
    this.uiElements.push(bg);

    const knob = this.add.circle(isOn ? x + w - 14 : x + 14, y, 12, 0xffffff);
    this.uiElements.push(knob);

    const label = this.add.text(x + w + 15, y, isOn ? '开' : '关', {
      fontSize: '16px', fontFamily: 'sans-serif', color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.uiElements.push(label);

    bg.on('pointerup', () => {
      isOn = !isOn;
      bg.setFillStyle(isOn ? 0x4488cc : 0x555555);
      this.tweens.add({ targets: knob, x: isOn ? x + w - 14 : x + 14, duration: 100 });
      label.setText(isOn ? '开' : '关');
      onChange(isOn);
    });
  }

  // ===================== 通用 =====================

  private makeBtn(y: number, label: string, cb: () => void): void {
    const bg = this.add.rectangle(GAME_WIDTH / 2, y, 240, 48, 0x1a3a5c, 0.9)
      .setStrokeStyle(2, 0x4488cc, 0.5).setInteractive({ useHandCursor: true });
    const txt = this.add.text(GAME_WIDTH / 2, y, label, {
      fontSize: '18px', fontFamily: 'sans-serif', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.uiElements.push(bg, txt);

    bg.on('pointerover', () => { bg.setScale(1.04); txt.setScale(1.04); });
    bg.on('pointerout', () => { bg.setScale(1); txt.setScale(1); });
    bg.on('pointerup', cb);
  }

  private startGame(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => this.scene.start('GameScene'));
  }
}
