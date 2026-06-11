/**
 * 怪物配置表
 * 新增怪物只需添加配置即可
 */
import { EnemyDef } from '../types';
import { COLORS } from '../constants';

export const ENEMY_CONFIGS: Record<string, EnemyDef> = {
  // ============ 普通怪 ============
  slime: {
    id: 'slime',
    name: '史莱姆',
    hp: 20,
    speed: 80,
    damage: 5,
    exp: 5,
    dropRate: 0.3,
    isElite: false,
    isBoss: false,
    bodyRadius: 10,
    color: COLORS.ENEMY,
    scale: 1,
  },

  bat: {
    id: 'bat',
    name: '蝙蝠',
    hp: 15,
    speed: 140,
    damage: 8,
    exp: 6,
    dropRate: 0.25,
    isElite: false,
    isBoss: false,
    bodyRadius: 8,
    color: 0x8866aa,
    scale: 0.8,
  },

  skeleton: {
    id: 'skeleton',
    name: '骷髅兵',
    hp: 40,
    speed: 70,
    damage: 12,
    exp: 10,
    dropRate: 0.35,
    isElite: false,
    isBoss: false,
    bodyRadius: 12,
    color: 0xdddddd,
    scale: 1.1,
  },

  ghost: {
    id: 'ghost',
    name: '幽灵',
    hp: 25,
    speed: 100,
    damage: 10,
    exp: 8,
    dropRate: 0.3,
    isElite: false,
    isBoss: false,
    bodyRadius: 10,
    color: 0x6699cc,
    scale: 1,
  },

  archer: {
    id: 'archer',
    name: '骷髅射手',
    hp: 30,
    speed: 60,
    damage: 15,
    exp: 12,
    dropRate: 0.3,
    isElite: false,
    isBoss: false,
    bodyRadius: 11,
    color: 0xaaddaa,
    scale: 1,
  },

  // ============ 精英怪 ============
  elite_knight: {
    id: 'elite_knight',
    name: '精英骑士',
    hp: 200,
    speed: 60,
    damage: 25,
    exp: 50,
    dropRate: 0.6,
    isElite: true,
    isBoss: false,
    bodyRadius: 18,
    color: COLORS.ENEMY_ELITE,
    scale: 1.8,
  },

  elite_mage: {
    id: 'elite_mage',
    name: '精英法师',
    hp: 150,
    speed: 50,
    damage: 30,
    exp: 60,
    dropRate: 0.6,
    isElite: true,
    isBoss: false,
    bodyRadius: 16,
    color: 0xff44ff,
    scale: 1.6,
  },

  // ============ Boss ============
  death_knight: {
    id: 'death_knight',
    name: '死亡骑士',
    hp: 1000,
    speed: 40,
    damage: 40,
    exp: 200,
    dropRate: 1.0,
    isElite: false,
    isBoss: true,
    bodyRadius: 32,
    color: COLORS.BOSS,
    scale: 3.5,
  },

  final_boss: {
    id: 'final_boss',
    name: '吸血鬼领主',
    hp: 3000,
    speed: 50,
    damage: 60,
    exp: 500,
    dropRate: 1.0,
    isElite: false,
    isBoss: true,
    bodyRadius: 40,
    color: 0xff0033,
    scale: 4.5,
  },
};

/**
 * 获取怪物配置
 */
export function getEnemyConfig(id: string): EnemyDef | undefined {
  return ENEMY_CONFIGS[id];
}

/**
 * 获取所有非Boss怪ID
 */
export function getNormalEnemyIds(): string[] {
  return Object.values(ENEMY_CONFIGS)
    .filter(e => !e.isBoss && !e.isElite)
    .map(e => e.id);
}

/**
 * 获取精英怪ID
 */
export function getEliteEnemyIds(): string[] {
  return Object.values(ENEMY_CONFIGS)
    .filter(e => e.isElite)
    .map(e => e.id);
}

/**
 * 获取Boss ID
 */
export function getBossIds(): string[] {
  return Object.values(ENEMY_CONFIGS)
    .filter(e => e.isBoss)
    .map(e => e.id);
}
