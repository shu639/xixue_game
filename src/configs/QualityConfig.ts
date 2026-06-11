import { Quality } from '../types';
import { QUALITY_COLORS, QUALITY_NAMES, QUALITY_WEIGHTS } from '../constants';

export interface QualityConfig {
  key: Quality;
  name: string;
  color: number;
  weight: number;
  multiplier: number; // 属性加成倍率
}

export const QUALITIES: QualityConfig[] = [
  { key: 'common',    name: QUALITY_NAMES.common,    color: QUALITY_COLORS.common,    weight: QUALITY_WEIGHTS.common,    multiplier: 1.0 },
  { key: 'rare',      name: QUALITY_NAMES.rare,      color: QUALITY_COLORS.rare,      weight: QUALITY_WEIGHTS.rare,      multiplier: 1.3 },
  { key: 'epic',      name: QUALITY_NAMES.epic,      color: QUALITY_COLORS.epic,      weight: QUALITY_WEIGHTS.epic,      multiplier: 1.7 },
  { key: 'legendary', name: QUALITY_NAMES.legendary, color: QUALITY_COLORS.legendary, weight: QUALITY_WEIGHTS.legendary, multiplier: 2.2 },
  { key: 'mythic',    name: QUALITY_NAMES.mythic,    color: QUALITY_COLORS.mythic,    weight: QUALITY_WEIGHTS.mythic,    multiplier: 3.0 },
];

/**
 * 根据权重随机选择品质
 */
export function rollQuality(luck: number = 0): Quality {
  const adjustedWeights = QUALITIES.map((q, i) => ({
    key: q.key,
    weight: q.weight + (i >= 2 ? luck * 2 : 0), // 幸运值提升高品质量概率
  }));

  const totalWeight = adjustedWeights.reduce((sum, q) => sum + q.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const q of adjustedWeights) {
    roll -= q.weight;
    if (roll <= 0) return q.key;
  }

  return 'common';
}

export function getQualityColor(quality: Quality): number {
  return QUALITIES.find(q => q.key === quality)?.color ?? QUALITY_COLORS.common;
}

export function getQualityMultiplier(quality: Quality): number {
  return QUALITIES.find(q => q.key === quality)?.multiplier ?? 1.0;
}
