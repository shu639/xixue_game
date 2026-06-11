/**
 * 武器配置表 - 配置驱动设计
 * 新增武器只需在这里添加配置即可，无需修改核心代码
 */
import { WeaponDef } from '../types';

export const WEAPON_CONFIGS: Record<string, WeaponDef> = {
  // ============ 初始武器 ============
  knife: {
    id: 'knife',
    name: '飞刀',
    description: '向最近敌人投掷飞刀',
    quality: 'common',
    baseDamage: 10,
    cooldown: 800,
    projectileSpeed: 400,
    projectileCount: 1,
    lifetime: 1500,
    pierce: 0,
    areaSize: 4,
    knockback: 50,
    icon: '🗡️',
    color: 0xcccccc,
  },

  // ============ 进阶武器 ============
  fireball: {
    id: 'fireball',
    name: '火球',
    description: '发射火球，命中后爆炸造成范围伤害',
    quality: 'rare',
    baseDamage: 25,
    cooldown: 1200,
    projectileSpeed: 300,
    projectileCount: 1,
    lifetime: 2000,
    pierce: 0,
    areaSize: 60,
    knockback: 100,
    icon: '🔥',
    color: 0xff6600,
  },

  boomerang: {
    id: 'boomerang',
    name: '回旋镖',
    description: '飞出后返回，贯穿路径上所有敌人',
    quality: 'rare',
    baseDamage: 15,
    cooldown: 1500,
    projectileSpeed: 350,
    projectileCount: 1,
    lifetime: 2500,
    pierce: 99,
    areaSize: 8,
    knockback: 60,
    icon: '🪃',
    color: 0x00ccff,
  },

  laser: {
    id: 'laser',
    name: '激光',
    description: '持续发射穿透激光',
    quality: 'epic',
    baseDamage: 8,
    cooldown: 100,
    projectileSpeed: 800,
    projectileCount: 1,
    lifetime: 300,
    pierce: 99,
    areaSize: 3,
    knockback: 20,
    icon: '⚡',
    color: 0xff00ff,
  },

  lightning: {
    id: 'lightning',
    name: '闪电链',
    description: '击中敌人后弹射至附近敌人',
    quality: 'epic',
    baseDamage: 20,
    cooldown: 2000,
    projectileSpeed: 600,
    projectileCount: 1,
    lifetime: 1000,
    pierce: 3,
    areaSize: 5,
    knockback: 80,
    icon: '⚡',
    color: 0x00ffff,
  },

  spinning_sword: {
    id: 'spinning_sword',
    name: '旋转飞剑',
    description: '环绕玩家旋转，持续伤害周围敌人',
    quality: 'legendary',
    baseDamage: 18,
    cooldown: 3000,
    projectileSpeed: 200,
    projectileCount: 3,
    lifetime: 5000,
    pierce: 99,
    areaSize: 10,
    knockback: 120,
    icon: '⚔️',
    color: 0xffaa00,
  },

  missile: {
    id: 'missile',
    name: '导弹',
    description: '追踪最近敌人并爆炸',
    quality: 'legendary',
    baseDamage: 40,
    cooldown: 2500,
    projectileSpeed: 250,
    projectileCount: 1,
    lifetime: 3000,
    pierce: 0,
    areaSize: 80,
    knockback: 200,
    icon: '🚀',
    color: 0xff4444,
  },

  poison_cloud: {
    id: 'poison_cloud',
    name: '毒雾',
    description: '在玩家周围释放毒雾，持续伤害范围内敌人',
    quality: 'epic',
    baseDamage: 5,
    cooldown: 4000,
    projectileSpeed: 0,
    projectileCount: 1,
    lifetime: 6000,
    pierce: 99,
    areaSize: 100,
    knockback: 0,
    icon: '☠️',
    color: 0x00ff00,
  },

  frost_orb: {
    id: 'frost_orb',
    name: '冰霜法球',
    description: '释放冰球，减速并伤害敌人',
    quality: 'legendary',
    baseDamage: 30,
    cooldown: 1800,
    projectileSpeed: 200,
    projectileCount: 2,
    lifetime: 3000,
    pierce: 1,
    areaSize: 40,
    knockback: 150,
    icon: '❄️',
    color: 0x88ccff,
  },
};

/**
 * 获取武器配置
 */
export function getWeaponConfig(id: string): WeaponDef | undefined {
  return WEAPON_CONFIGS[id];
}

/**
 * 获取所有武器 ID
 */
export function getAllWeaponIds(): string[] {
  return Object.keys(WEAPON_CONFIGS);
}
