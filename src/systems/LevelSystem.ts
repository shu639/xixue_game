/**
 * 等级系统
 * 管理玩家经验值和升级
 */
import { Player } from '../entities/Player';
import { EVENTS } from '../constants';
import { EventBus } from '../managers/EventBus';

export class LevelSystem {
  /**
   * 计算下一级所需经验
   */
  static getExpToNext(level: number): number {
    return Math.floor(10 * Math.pow(level, 1.5) * Math.pow(1.08, level));
  }

  /**
   * 经验处理：玩家获得经验，返回是否升级
   */
  static addExp(player: Player, amount: number): boolean {
    const gained = Math.round(amount * player.stats.expMultiplier);
    player.exp += gained;

    // 连续升级检测
    let hasLeveled = false;
    while (player.exp >= player.expToNext) {
      player.exp -= player.expToNext;
      player.level++;
      player.expToNext = LevelSystem.getExpToNext(player.level);
      hasLeveled = true;
    }

    if (hasLeveled) {
      EventBus.emit(EVENTS.PLAYER_LEVEL_UP, player.level);
    }

    return hasLeveled;
  }

  /**
   * 获取经验进度百分比 (0-1)
   */
  static getExpProgress(player: Player): number {
    return player.exp / player.expToNext;
  }

  /**
   * 升级时回复部分生命(增加上限后同比例回血)
   */
  static onLevelUp(player: Player, oldMaxHp: number): void {
    const ratio = player.stats.hp / oldMaxHp;
    player.stats.hp = Math.ceil(player.stats.maxHp * ratio);
  }
}
