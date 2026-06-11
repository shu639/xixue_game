// ============ 游戏画布 ============
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

// ============ 物理世界边界 ============
// 地图比屏幕大，玩家可以在更大范围内移动
export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 2000;

// ============ 品质颜色 ============
export const QUALITY_COLORS: Record<string, number> = {
  common: 0xffffff,    // 普通 - 白色
  rare: 0x4169e1,      // 稀有 - 蓝色
  epic: 0x9932cc,      // 史诗 - 紫色
  legendary: 0xff8c00, // 传说 - 橙色
  mythic: 0xff0033,    // 神话 - 红色
};

export const QUALITY_NAMES: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
  mythic: '神话',
};

// ============ 品质权重 ============
export const QUALITY_WEIGHTS: Record<string, number> = {
  common: 50,
  rare: 30,
  epic: 13,
  legendary: 5,
  mythic: 2,
};

// ============ 玩家默认属性 ============
export const PLAYER_DEFAULTS = {
  maxHp: 100,
  attack: 10,
  attackSpeed: 1000,    // 攻击间隔(ms)
  critRate: 0.05,       // 暴击率 5%
  critDamage: 1.5,      // 暴击倍率
  moveSpeed: 200,
  expMultiplier: 1,
  pickupRange: 60,
  bodyRadius: 14,
};

// ============ 经验曲线 ============
// 升到 n 级需要的总经验：baseExp * (n ^ exponent)
export const LEVEL_EXP_BASE = 10;
export const LEVEL_EXP_EXPONENT = 1.5;
export const LEVEL_EXP_GROWTH = 1.08;

// ============ 游戏时长(秒) ============
export const GAME_DURATION = 15 * 60; // 15 分钟

// ============ 掉落 ============
export const PICKUP_TYPES = {
  EXP: 'exp',
  COIN: 'coin',
  HEAL: 'heal',
  CHEST: 'chest',
} as const;

export const PICKUP_VALUES = {
  exp: 10,
  coin: 1,
  heal: 20,
};

// ============ 事件名称 ============
export const EVENTS = {
  ENEMY_KILLED: 'enemy-killed',
  PLAYER_DAMAGED: 'player-damaged',
  PLAYER_DEATH: 'player-death',
  PLAYER_LEVEL_UP: 'player-level-up',
  BOSS_SPAWNED: 'boss-spawned',
  BOSS_DEFEATED: 'boss-defeated',
  WAVE_CHANGED: 'wave-changed',
  GAME_OVER: 'game-over',
  GAME_PAUSED: 'game-paused',
  GAME_RESUMED: 'game-resumed',
  PICKUP_COLLECTED: 'pickup-collected',
  PROJECTILE_HIT: 'projectile-hit',
} as const;

// ============ 对象池大小 ============
export const POOL_SIZES = {
  ENEMIES: 400,
  PROJECTILES: 300,
  DAMAGE_TEXTS: 80,
  PICKUPS: 200,
};

// ============ 颜色 ============
export const COLORS = {
  PLAYER: 0x00ff88,
  ENEMY: 0xff4444,
  ENEMY_ELITE: 0xff8800,
  BOSS: 0xff0033,
  PROJECTILE: 0xffff00,
  EXP_GEM: 0x00ff00,
  COIN: 0xffd700,
  HEAL: 0xff69b4,
  CHEST: 0xff8c00,
  BACKGROUND: 0x1a1a2e,
  GROUND: 0x16213e,
  HUD_BG: 0x000000,
  DAMAGE_TEXT: 0xffffff,
  CRIT_TEXT: 0xffff00,
  HP_BAR_BG: 0x333333,
  HP_BAR: 0xff0000,
  HP_BAR_PLAYER: 0x00ff00,
  EXP_BAR: 0x00aaff,
};
