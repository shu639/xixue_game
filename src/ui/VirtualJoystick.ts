/**
 * 虚拟摇杆
 * 支持单指触控移动
 * 触摸屏幕左半区域 = 移动
 */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  // 视觉元素
  private baseCircle: Phaser.GameObjects.Arc;
  private thumbCircle: Phaser.GameObjects.Arc;

  // 状态
  private baseX: number;
  private baseY: number;
  private maxRadius: number = 50;

  // 输出
  public vx: number = 0;  // -1 ~ 1
  public vy: number = 0;  // -1 ~ 1
  public isActive: boolean = false;

  // 触控指针
  private pointerId: number = -1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(110);
    this.container.setScrollFactor(0);

    // 摇杆底座位置（左下角）
    this.baseX = 90;
    this.baseY = GAME_HEIGHT - 100;

    // 底座
    this.baseCircle = scene.add.circle(this.baseX, this.baseY, 60, 0xffffff, 0.15);
    this.baseCircle.setStrokeStyle(2, 0xffffff, 0.3);
    this.container.add(this.baseCircle);

    // 拇指
    this.thumbCircle = scene.add.circle(this.baseX, this.baseY, 30, 0xffffff, 0.4);
    this.thumbCircle.setStrokeStyle(2, 0xffffff, 0.5);
    this.container.add(this.thumbCircle);

    // 设置触控事件
    this.setupTouchEvents();
  }

  private setupTouchEvents(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 只响应左半屏幕触控
      if (pointer.x < GAME_WIDTH * 0.5) {
        // 移动摇杆底座到触控位置
        this.baseX = pointer.x;
        this.baseY = pointer.y;
        this.baseCircle.setPosition(this.baseX, this.baseY);
        this.thumbCircle.setPosition(this.baseX, this.baseY);
        this.pointerId = pointer.id;
        this.isActive = true;
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.pointerId) return;

      const dx = pointer.x - this.baseX;
      const dy = pointer.y - this.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 限制在最大半径内
      let clampedX = dx;
      let clampedY = dy;
      if (dist > this.maxRadius) {
        clampedX = (dx / dist) * this.maxRadius;
        clampedY = (dy / dist) * this.maxRadius;
      }

      // 归一化输出 (-1 ~ 1)
      this.vx = dx / this.maxRadius;
      this.vy = dy / this.maxRadius;

      // 限制范围
      this.vx = Phaser.Math.Clamp(this.vx, -1, 1);
      this.vy = Phaser.Math.Clamp(this.vy, -1, 1);

      // 设置死区
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
      if (Math.abs(this.vy) < 0.1) this.vy = 0;

      // 更新拇指位置
      this.thumbCircle.setPosition(this.baseX + clampedX, this.baseY + clampedY);
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.pointerId) return;

      this.reset();
    });
  }

  /**
   * 重置摇杆状态
   */
  private reset(): void {
    this.vx = 0;
    this.vy = 0;
    this.isActive = false;
    this.pointerId = -1;

    // 回弹动画
    this.scene.tweens.add({
      targets: this.thumbCircle,
      x: this.baseX,
      y: this.baseY,
      duration: 100,
      ease: 'Power2',
    });
  }

  /**
   * 可视性切换
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
    this.container.destroy();
  }
}
