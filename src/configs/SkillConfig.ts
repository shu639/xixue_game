/**
 * 技能/升级配置表
 * 升级时随机从池中抽取技能选项
 */
import { SkillDef } from '../types';

export const SKILL_CONFIGS: Record<string, SkillDef> = {
  // ============ 属性加成 ============
  atk_up: {
    id: 'atk_up',
    name: '攻击力提升',
    description: '攻击力 +20%',
    quality: 'common',
    category: 'stat',
    effectType: 'attack',
    effectValue: 0.2,
    maxLevel: 10,
  },

  atk_speed_up: {
    id: 'atk_speed_up',
    name: '攻击速度提升',
    description: '攻击速度 +15%',
    quality: 'common',
    category: 'stat',
    effectType: 'attackSpeed',
    effectValue: -0.15, // 负数表示减少冷却
    maxLevel: 8,
  },

  max_hp_up: {
    id: 'max_hp_up',
    name: '生命上限提升',
    description: '生命上限 +30',
    quality: 'common',
    category: 'stat',
    effectType: 'maxHp',
    effectValue: 30,
    maxLevel: 15,
  },

  move_speed_up: {
    id: 'move_speed_up',
    name: '移动速度提升',
    description: '移动速度 +10%',
    quality: 'common',
    category: 'stat',
    effectType: 'moveSpeed',
    effectValue: 0.1,
    maxLevel: 5,
  },

  crit_rate_up: {
    id: 'crit_rate_up',
    name: '暴击率提升',
    description: '暴击率 +5%',
    quality: 'rare',
    category: 'stat',
    effectType: 'critRate',
    effectValue: 0.05,
    maxLevel: 10,
  },

  crit_dmg_up: {
    id: 'crit_dmg_up',
    name: '暴击伤害提升',
    description: '暴击伤害 +25%',
    quality: 'rare',
    category: 'stat',
    effectType: 'critDamage',
    effectValue: 0.25,
    maxLevel: 8,
  },

  exp_up: {
    id: 'exp_up',
    name: '经验加成',
    description: '经验获取 +20%',
    quality: 'rare',
    category: 'stat',
    effectType: 'expMultiplier',
    effectValue: 0.2,
    maxLevel: 5,
  },

  pickup_up: {
    id: 'pickup_up',
    name: '拾取范围扩大',
    description: '拾取范围 +25%',
    quality: 'common',
    category: 'stat',
    effectType: 'pickupRange',
    effectValue: 0.25,
    maxLevel: 5,
  },

  armor_up: {
    id: 'armor_up',
    name: '护甲提升',
    description: '护甲 +2',
    quality: 'rare',
    category: 'stat',
    effectType: 'armor',
    effectValue: 2,
    maxLevel: 10,
  },

  luck_up: {
    id: 'luck_up',
    name: '幸运提升',
    description: '幸运 +10',
    quality: 'epic',
    category: 'stat',
    effectType: 'luck',
    effectValue: 10,
    maxLevel: 5,
  },

  projectile_count_up: {
    id: 'projectile_count_up',
    name: '额外弹射',
    description: '弹射数量 +1',
    quality: 'epic',
    category: 'stat',
    effectType: 'projectileCount',
    effectValue: 1,
    maxLevel: 3,
  },

  // ============ 新增武器 ============
  weapon_fireball: {
    id: 'weapon_fireball',
    name: '火球术',
    description: '获得新武器：火球',
    quality: 'rare',
    category: 'weapon',
    effectType: 'unlock_weapon',
    effectValue: 0,
    weaponId: 'fireball',
    maxLevel: 1,
  },

  weapon_boomerang: {
    id: 'weapon_boomerang',
    name: '回旋镖',
    description: '获得新武器：回旋镖',
    quality: 'rare',
    category: 'weapon',
    effectType: 'unlock_weapon',
    effectValue: 0,
    weaponId: 'boomerang',
    maxLevel: 1,
  },

  weapon_laser: {
    id: 'weapon_laser',
    name: '激光射线',
    description: '获得新武器：激光',
    quality: 'epic',
    category: 'weapon',
    effectType: 'unlock_weapon',
    effectValue: 0,
    weaponId: 'laser',
    maxLevel: 1,
  },

  weapon_lightning: {
    id: 'weapon_lightning',
    name: '闪电链',
    description: '获得新武器：闪电链',
    quality: 'epic',
    category: 'weapon',
    effectType: 'unlock_weapon',
    effectValue: 0,
    weaponId: 'lightning',
    maxLevel: 1,
  },

  weapon_spinning_sword: {
    id: 'weapon_spinning_sword',
    name: '旋转飞剑',
    description: '获得新武器：旋转飞剑',
    quality: 'legendary',
    category: 'weapon',
    effectType: 'unlock_weapon',
    effectValue: 0,
    weaponId: 'spinning_sword',
    maxLevel: 1,
  },

  weapon_missile: {
    id: 'weapon_missile',
    name: '追踪导弹',
    description: '获得新武器：导弹',
    quality: 'legendary',
    category: 'weapon',
    effectType: 'unlock_weapon',
    effectValue: 0,
    weaponId: 'missile',
    maxLevel: 1,
  },

  weapon_poison_cloud: {
    id: 'weapon_poison_cloud',
    name: '毒雾',
    description: '获得新武器：毒雾',
    quality: 'epic',
    category: 'weapon',
    effectType: 'unlock_weapon',
    effectValue: 0,
    weaponId: 'poison_cloud',
    maxLevel: 1,
  },

  weapon_frost_orb: {
    id: 'weapon_frost_orb',
    name: '冰霜法球',
    description: '获得新武器：冰霜法球',
    quality: 'legendary',
    category: 'weapon',
    effectType: 'unlock_weapon',
    effectValue: 0,
    weaponId: 'frost_orb',
    maxLevel: 1,
  },

  // ============ 武器升级(提升已有武器等级) ============
  weapon_upgrade: {
    id: 'weapon_upgrade',
    name: '武器强化',
    description: '所有武器伤害 +25%',
    quality: 'epic',
    category: 'weapon_upgrade',
    effectType: 'attack',
    effectValue: 0.25,
    maxLevel: 5,
  },

  // ============ 功能性 ============
  full_heal: {
    id: 'full_heal',
    name: '完全回复',
    description: '立即回复全部生命值',
    quality: 'rare',
    category: 'utility',
    effectType: 'full_heal',
    effectValue: 1,
    maxLevel: 1,
  },

  revival: {
    id: 'revival',
    name: '复活',
    description: '死亡时复活一次，回复50%生命',
    quality: 'legendary',
    category: 'utility',
    effectType: 'revival',
    effectValue: 1,
    maxLevel: 1,
  },
};

/**
 * 获取技能配置
 */
export function getSkillConfig(id: string): SkillDef | undefined {
  return SKILL_CONFIGS[id];
}

/**
 * 获取所有可能的技能 ID 列表
 */
export function getAllSkillIds(): string[] {
  return Object.keys(SKILL_CONFIGS);
}
