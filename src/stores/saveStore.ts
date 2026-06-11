/**
 * 存档 Store - 使用 Zustand persist 中间件
 * 所有需要持久化的数据都存在这里
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SaveData, GameSettings, PlayerStatsRecord } from '../types';

interface SaveStoreState extends SaveData {
  // Actions
  updateHighScore: (score: number) => void;
  addGold: (amount: number) => void;
  incrementGamesPlayed: () => void;
  addKills: (kills: number) => void;
  updateHighestLevel: (level: number) => void;
  unlockWeapon: (weaponId: string) => void;
  unlockCharacter: (characterId: string) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  updateStats: (partial: Partial<PlayerStatsRecord>) => void;
  spendGold: (amount: number) => boolean;
  resetAll: () => void;
}

const defaultSave: SaveData = {
  highScore: 0,
  totalKills: 0,
  totalGold: 0,
  gamesPlayed: 0,
  highestLevel: 0,
  unlockedWeapons: ['knife'],
  unlockedCharacters: ['default'],
  settings: {
    bgmVolume: 0.7,
    sfxVolume: 0.8,
    showDamage: true,
    screenShake: true,
  },
  stats: {
    totalPlayTime: 0,
    totalEnemiesKilled: 0,
    totalBossesKilled: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    totalHealing: 0,
    maxLevelReached: 0,
  },
};

export const useSaveStore = create<SaveStoreState>()(
  persist(
    (set, get) => ({
      ...defaultSave,

      updateHighScore: (score) => set((s) => ({
        highScore: Math.max(s.highScore, score),
      })),

      addGold: (amount) => set((s) => ({
        totalGold: s.totalGold + amount,
      })),

      incrementGamesPlayed: () => set((s) => ({
        gamesPlayed: s.gamesPlayed + 1,
      })),

      addKills: (kills) => set((s) => ({
        totalKills: s.totalKills + kills,
      })),

      updateHighestLevel: (level) => set((s) => ({
        highestLevel: Math.max(s.highestLevel, level),
      })),

      unlockWeapon: (weaponId) => set((s) => ({
        unlockedWeapons: s.unlockedWeapons.includes(weaponId)
          ? s.unlockedWeapons
          : [...s.unlockedWeapons, weaponId],
      })),

      unlockCharacter: (characterId) => set((s) => ({
        unlockedCharacters: s.unlockedCharacters.includes(characterId)
          ? s.unlockedCharacters
          : [...s.unlockedCharacters, characterId],
      })),

      updateSettings: (partial) => set((s) => ({
        settings: { ...s.settings, ...partial },
      })),

      updateStats: (partial) => set((s) => ({
        stats: { ...s.stats, ...partial },
      })),

      spendGold: (amount) => {
        const state = get();
        if (state.totalGold >= amount) {
          set({ totalGold: state.totalGold - amount });
          return true;
        }
        return false;
      },

      resetAll: () => set({ ...defaultSave }),
    }),
    {
      name: 'vampire-survivors-save',
      version: 1,
    }
  )
);
