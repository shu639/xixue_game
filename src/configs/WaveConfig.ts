/**
 * 波次时间轴配置
 * 15 分钟游戏时长，按时间轴推进
 */
import { WaveEvent } from '../types';

/**
 * 波次时间轴
 * time: 触发时间（秒）
 */
export const WAVE_TIMELINE: WaveEvent[] = [
  // ============ 第 1 分钟：普通怪入门 ============
  { time: 0,   type: 'spawn', enemyId: 'slime',    count: 5,  interval: 2000, message: '史莱姆出现了！' },
  { time: 15,  type: 'spawn', enemyId: 'slime',    count: 8,  interval: 1800 },
  { time: 30,  type: 'spawn', enemyId: 'bat',      count: 5,  interval: 2000 },
  { time: 45,  type: 'spawn', enemyId: 'slime',    count: 10, interval: 1500 },

  // ============ 第 3 分钟：高速怪 ============
  { time: 60,  type: 'spawn', enemyId: 'bat',      count: 15, interval: 1200, message: '蝙蝠来袭！' },
  { time: 80,  type: 'spawn', enemyId: 'slime',    count: 12, interval: 1500 },
  { time: 100, type: 'spawn', enemyId: 'bat',      count: 10, interval: 1500 },
  { time: 120, type: 'spawn', enemyId: 'ghost',    count: 8,  interval: 2000 },
  { time: 140, type: 'spawn', enemyId: 'skeleton', count: 5,  interval: 2500 },
  { time: 160, type: 'spawn', enemyId: 'bat',      count: 15, interval: 1200 },

  // ============ 第 5 分钟：远程怪 ============
  { time: 180, type: 'spawn', enemyId: 'skeleton', count: 12, interval: 1500, message: '骷髅兵来袭！' },
  { time: 200, type: 'spawn', enemyId: 'archer',   count: 8,  interval: 2000 },
  { time: 220, type: 'spawn', enemyId: 'skeleton', count: 10, interval: 1500 },
  { time: 240, type: 'spawn', enemyId: 'archer',   count: 10, interval: 1800 },
  { time: 260, type: 'spawn', enemyId: 'ghost',    count: 10, interval: 1500 },
  { time: 280, type: 'spawn', enemyId: 'bat',      count: 20, interval: 1000 },

  // ============ 第 8 分钟：精英怪 ============
  { time: 300, type: 'spawn', enemyId: 'skeleton', count: 15, interval: 1200, message: '精英怪物出现了！' },
  { time: 320, type: 'elite', enemyId: 'elite_knight', count: 2, interval: 5000 },
  { time: 340, type: 'spawn', enemyId: 'archer',   count: 15, interval: 1200 },
  { time: 360, type: 'elite', enemyId: 'elite_mage', count: 2, interval: 5000 },
  { time: 380, type: 'spawn', enemyId: 'ghost',    count: 15, interval: 1000 },
  { time: 420, type: 'spawn', enemyId: 'skeleton', count: 20, interval: 1000 },
  { time: 450, type: 'elite', enemyId: 'elite_knight', count: 4, interval: 3000 },

  // ============ 第 10 分钟：第一 Boss ============
  { time: 480, type: 'boss',  enemyId: 'death_knight', count: 1, interval: 0, message: '⚠️ 死亡骑士降临！' },
  { time: 500, type: 'spawn', enemyId: 'skeleton', count: 10, interval: 2000 },
  { time: 520, type: 'spawn', enemyId: 'archer',   count: 10, interval: 2000 },
  { time: 550, type: 'spawn', enemyId: 'bat',      count: 25, interval: 800 },

  // ============ 第 13 分钟：大量怪潮 ============
  { time: 600, type: 'flood', enemyId: 'slime',    count: 30, interval: 500, message: '⚠️ 怪物潮来了！' },
  { time: 620, type: 'flood', enemyId: 'bat',      count: 30, interval: 500 },
  { time: 640, type: 'flood', enemyId: 'skeleton', count: 25, interval: 600 },
  { time: 660, type: 'flood', enemyId: 'ghost',    count: 25, interval: 600 },
  { time: 680, type: 'elite', enemyId: 'elite_knight', count: 6, interval: 2000 },
  { time: 700, type: 'flood', enemyId: 'archer',   count: 25, interval: 600 },
  { time: 720, type: 'flood', enemyId: 'bat',      count: 40, interval: 400 },
  { time: 740, type: 'spawn', enemyId: 'skeleton', count: 30, interval: 800 },
  { time: 760, type: 'elite', enemyId: 'elite_mage', count: 6, interval: 2000 },

  // ============ 第 15 分钟：最终 Boss ============
  { time: 780, type: 'boss',  enemyId: 'final_boss', count: 1, interval: 0, message: '⚠️ 吸血鬼领主降临！' },
  { time: 790, type: 'spawn', enemyId: 'skeleton', count: 20, interval: 800 },
  { time: 810, type: 'spawn', enemyId: 'bat',      count: 20, interval: 800 },
  { time: 830, type: 'flood', enemyId: 'slime',    count: 50, interval: 300 },
  { time: 850, type: 'flood', enemyId: 'ghost',    count: 40, interval: 400 },
  { time: 870, type: 'spawn', enemyId: 'archer',   count: 30, interval: 600 },

  // 游戏结束标记
  { time: 900, type: 'spawn', enemyId: 'slime', count: 0, interval: 0 },
];

/**
 * 获取指定时间点之前的波次事件
 */
export function getActiveWaveEvents(elapsedTime: number): WaveEvent[] {
  return WAVE_TIMELINE.filter(
    event => event.time <= elapsedTime && event.time > elapsedTime - 5
  );
}

/**
 * 获取下一个未触发的波次事件
 */
export function getNextWaveEvent(elapsedTime: number): WaveEvent | null {
  return WAVE_TIMELINE.find(event => event.time > elapsedTime) ?? null;
}

/**
 * 获取所有波次事件
 */
export function getAllWaveEvents(): WaveEvent[] {
  return [...WAVE_TIMELINE];
}

/**
 * 波次难度系数：随时间提升怪物属性
 */
export function getDifficultyMultiplier(elapsedTime: number): number {
  // 每分钟增加 15% 难度
  return 1 + (elapsedTime / 60) * 0.15;
}
