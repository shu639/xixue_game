/**
 * 存档管理器
 * 封装 LocalStorage 读写（Zustand persist 已自动处理大部分）
 * 这里提供额外的存档操作：导出、导入、清空
 */
import { useSaveStore } from '../stores/saveStore';
import { SaveData } from '../types';

export class SaveManager {
  static readonly SAVE_KEY = 'vampire-survivors-save';

  /**
   * 是否存在存档
   */
  static hasSave(): boolean {
    const data = localStorage.getItem(this.SAVE_KEY);
    return data !== null;
  }

  /**
   * 获取存档数据
   */
  static getSave(): SaveData | null {
    const state = useSaveStore.getState();
    return {
      highScore: state.highScore,
      totalKills: state.totalKills,
      totalGold: state.totalGold,
      gamesPlayed: state.gamesPlayed,
      highestLevel: state.highestLevel,
      unlockedWeapons: state.unlockedWeapons,
      unlockedCharacters: state.unlockedCharacters,
      settings: state.settings,
      stats: state.stats,
    };
  }

  /**
   * 导出存档为 JSON 字符串
   */
  static exportSave(): string {
    const save = this.getSave();
    return JSON.stringify(save, null, 2);
  }

  /**
   * 导入存档
   */
  static importSave(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr) as SaveData;
      const store = useSaveStore.getState();

      // 验证数据
      if (typeof data.highScore !== 'number') return false;

      store.updateHighScore(data.highScore);
      if (data.totalGold) store.addGold(data.totalGold);
      if (data.totalKills) store.addKills(data.totalKills);
      if (data.highestLevel) store.updateHighestLevel(data.highestLevel);
      data.unlockedWeapons?.forEach(w => store.unlockWeapon(w));
      data.unlockedCharacters?.forEach(c => store.unlockCharacter(c));

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 清空存档
   */
  static clearSave(): void {
    const store = useSaveStore.getState();
    store.resetAll();
    localStorage.removeItem(this.SAVE_KEY);
  }

  /**
   * 获取游戏时长格式化字符串
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 格式化大数字
   */
  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
