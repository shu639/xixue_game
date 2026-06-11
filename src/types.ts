// ============ 品质类型 ============
export type Quality = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

// ============ 玩家属性 ============
export interface PlayerStats {
  maxHp: number;
  hp: number;
  attack: number;
  attackSpeed: number;    // 攻击间隔(ms)
  critRate: number;       // 0-1
  critDamage: number;     // 倍率, 1.5 = 150%
  moveSpeed: number;      // 像素/秒
  expMultiplier: number;
  pickupRange: number;
  armor: number;          // 护甲，减伤
  projectileCount: number;// 额外弹射数
  projectileSpeed: number;// 弹射速度倍率
  areaSize: number;       // 范围倍率
  duration: number;       // 持续时间倍率
  cooldown: number;       // 冷却缩减倍率
  luck: number;           // 幸运值(影响掉落)
  revival: number;        // 复活次数
}

// ============ 武器定义 ============
export interface WeaponDef {
  id: string;
  name: string;
  description: string;
  quality: Quality;
  baseDamage: number;
  cooldown: number;       // 冷却时间(ms)
  projectileSpeed: number;
  projectileCount: number;
  lifetime: number;       // 弹射存活时间(ms)
  pierce: number;         // 穿透数(0=不穿透)
  areaSize: number;       // 范围半径
  knockback: number;      // 击退力
  icon: string;           // 图标字符(emoji/文字)
  color: number;          // 弹射颜色
}

// ============ 怪物定义 ============
export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  exp: number;
  dropRate: number;       // 掉落倍率
  isElite: boolean;
  isBoss: boolean;
  bodyRadius: number;
  color: number;
  scale: number;
}

// ============ 技能/升级定义 ============
export interface SkillDef {
  id: string;
  name: string;
  description: string;
  quality: Quality;
  category: SkillCategory;
  // 效果值
  effectType: string;
  effectValue: number;
  // 新增武器时使用
  weaponId?: string;
  maxLevel: number;       // 该技能最大可升级次数
}

export type SkillCategory =
  | 'stat'          // 属性加成
  | 'weapon'        // 新增武器
  | 'weapon_upgrade'// 武器升级
  | 'utility';      // 功能性

// ============ 掉落物类型 ============
export type PickupType = 'exp' | 'coin' | 'heal' | 'chest';

// ============ 波次配置 ============
export interface WaveEvent {
  time: number;           // 触发时间(秒)
  type: 'spawn' | 'boss' | 'flood' | 'elite';
  enemyId: string;
  count: number;
  interval: number;       // 生成间隔(ms)
  message?: string;       // 提示文字
}

// ============ 存档数据 ============
export interface SaveData {
  highScore: number;
  totalKills: number;
  totalGold: number;
  gamesPlayed: number;
  highestLevel: number;
  unlockedWeapons: string[];
  unlockedCharacters: string[];
  settings: GameSettings;
  stats: PlayerStatsRecord;
}

export interface GameSettings {
  bgmVolume: number;      // 0-1
  sfxVolume: number;      // 0-1
  showDamage: boolean;
  screenShake: boolean;
}

export interface PlayerStatsRecord {
  totalPlayTime: number;
  totalEnemiesKilled: number;
  totalBossesKilled: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  maxLevelReached: number;
}

// ============ 游戏运行时状态 ============
export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  elapsedTime: number;    // 已过秒数
  currentWave: number;
  kills: number;
  gold: number;
}

// ============ 升级选项 ============
export interface UpgradeOption {
  skillId: string;
  name: string;
  description: string;
  quality: Quality;
  category: SkillCategory;
}
