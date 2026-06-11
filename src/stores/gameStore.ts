/**
 * 游戏运行时状态
 * 不持久化，每次新游戏重置
 */
import { create } from 'zustand';
import Phaser from 'phaser';
import { PlayerStats, GameState, Quality } from '../types';
import { PLAYER_DEFAULTS, QUALITY_WEIGHTS } from '../constants';

interface GameStoreState {
  // 玩家属性
  playerStats: PlayerStats;
  // 游戏状态
  gameState: GameState;
  // 已获得的技能/武器ID映射 (skillId -> 当前等级)
  acquiredSkills: Map<string, number>;
  // 已装备武器ID列表
  equippedWeapons: string[];

  // Actions
  initNewGame: () => void;
  updatePlayerStats: (partial: Partial<PlayerStats>) => void;
  setHp: (hp: number) => void;
  addExp: (amount: number) => void;
  setGameState: (partial: Partial<GameState>) => void;
  addKill: () => void;
  addGold: (amount: number) => void;
  acquireSkill: (skillId: string) => void;
  equipWeapon: (weaponId: string) => void;
  getSkillLevel: (skillId: string) => number;
  reset: () => void;
}

const defaultPlayerStats = (): PlayerStats => ({
  maxHp: PLAYER_DEFAULTS.maxHp,
  hp: PLAYER_DEFAULTS.maxHp,
  attack: PLAYER_DEFAULTS.attack,
  attackSpeed: PLAYER_DEFAULTS.attackSpeed,
  critRate: PLAYER_DEFAULTS.critRate,
  critDamage: PLAYER_DEFAULTS.critDamage,
  moveSpeed: PLAYER_DEFAULTS.moveSpeed,
  expMultiplier: PLAYER_DEFAULTS.expMultiplier,
  pickupRange: PLAYER_DEFAULTS.pickupRange,
  armor: 0,
  projectileCount: 1,
  projectileSpeed: 1,
  areaSize: 1,
  duration: 1,
  cooldown: 1,
  luck: 0,
  revival: 0,
});

const defaultGameState = (): GameState => ({
  isRunning: false,
  isPaused: false,
  isGameOver: false,
  elapsedTime: 0,
  currentWave: 0,
  kills: 0,
  gold: 0,
});

export const useGameStore = create<GameStoreState>((set, get) => ({
  playerStats: defaultPlayerStats(),
  gameState: defaultGameState(),
  acquiredSkills: new Map(),
  equippedWeapons: ['knife'],

  initNewGame: () => set({
    playerStats: defaultPlayerStats(),
    gameState: { ...defaultGameState(), isRunning: true },
    acquiredSkills: new Map(),
    equippedWeapons: ['knife'],
  }),

  updatePlayerStats: (partial) => set((state) => ({
    playerStats: { ...state.playerStats, ...partial },
  })),

  setHp: (hp) => set((state) => ({
    playerStats: {
      ...state.playerStats,
      hp: Phaser.Math.Clamp(hp, 0, state.playerStats.maxHp),
    },
  })),

  addExp: (_amount) => {
    // 升级检测在 LevelSystem 中处理
    // 这里只做占位，实际经验条由 LevelSystem 管理
  },

  setGameState: (partial) => set((state) => ({
    gameState: { ...state.gameState, ...partial },
  })),

  addKill: () => set((state) => ({
    gameState: { ...state.gameState, kills: state.gameState.kills + 1 },
  })),

  addGold: (amount) => set((state) => ({
    gameState: { ...state.gameState, gold: state.gameState.gold + amount },
  })),

  acquireSkill: (skillId) => set((state) => {
    const newSkills = new Map(state.acquiredSkills);
    newSkills.set(skillId, (newSkills.get(skillId) || 0) + 1);
    return { acquiredSkills: newSkills };
  }),

  equipWeapon: (weaponId) => set((state) => ({
    equippedWeapons: [...new Set([...state.equippedWeapons, weaponId])],
  })),

  getSkillLevel: (skillId) => get().acquiredSkills.get(skillId) || 0,

  reset: () => set({
    playerStats: defaultPlayerStats(),
    gameState: defaultGameState(),
    acquiredSkills: new Map(),
    equippedWeapons: ['knife'],
  }),
}));

