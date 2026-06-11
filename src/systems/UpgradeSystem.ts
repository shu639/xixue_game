/**
 * 升级系统
 * 升级时随机生成 3 个选项（类似 Vampire Survivors）
 */
import { Player } from '../entities/Player';
import { UpgradeOption, SkillCategory } from '../types';
import { SKILL_CONFIGS, getSkillConfig } from '../configs/SkillConfig';
import { rollQuality, getQualityMultiplier } from '../configs/QualityConfig';
import { WEAPON_CONFIGS } from '../configs/WeaponConfig';
import { useGameStore } from '../stores/gameStore';

export class UpgradeSystem {
  /**
   * 生成升级选项（3个随机技能）
   * @param player 玩家实体
   * @param count 选项数量
   * @returns 升级选项列表
   */
  static generateOptions(player: Player, count: number = 3): UpgradeOption[] {
    const store = useGameStore.getState();
    const acquiredSkills = store.acquiredSkills;
    const equippedWeapons = store.equippedWeapons;
    const options: UpgradeOption[] = [];
    const usedIds = new Set<string>();

    // 获取可用技能池
    const availableSkills = this.getAvailableSkills(acquiredSkills, equippedWeapons);

    for (let i = 0; i < count; i++) {
      // 随机选择技能
      let attempts = 0;
      let skillId: string | null = null;

      while (attempts < 50) {
        const candidateId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        if (!usedIds.has(candidateId)) {
          skillId = candidateId;
          break;
        }
        attempts++;
      }

      // 如果没有未使用技能，允许重复
      if (!skillId) {
        skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      }

      if (!skillId) break;

      const skillDef = getSkillConfig(skillId);
      if (!skillDef) continue;

      usedIds.add(skillId);

      // 为属性加成类生成品质
      let quality = skillDef.quality;
      if (skillDef.category === 'stat') {
        quality = rollQuality(player.stats.luck);
      }

      // 计算实际效果描述
      const multiplier = getQualityMultiplier(quality);
      const actualValue = this.getActualEffectValue(skillDef.effectType, skillDef.effectValue, multiplier);
      const description = this.generateDescription(skillDef.name, skillDef.effectType, actualValue, quality);

      options.push({
        skillId,
        name: skillDef.name,
        description,
        quality,
        category: skillDef.category,
      });
    }

    return options;
  }

  /**
   * 应用升级选项
   */
  static applyUpgrade(player: Player, option: UpgradeOption): void {
    const store = useGameStore.getState();
    const skillDef = getSkillConfig(option.skillId);
    if (!skillDef) return;

    const multiplier = getQualityMultiplier(option.quality);
    const actualValue = this.getActualEffectValue(skillDef.effectType, skillDef.effectValue, multiplier);

    // 记录获得技能
    store.acquireSkill(option.skillId);

    switch (skillDef.effectType) {
      case 'attack':
        store.updatePlayerStats({ attack: player.stats.attack * (1 + actualValue) });
        break;
      case 'attackSpeed':
        const newSpeed = Math.max(100, player.stats.attackSpeed * (1 + actualValue));
        store.updatePlayerStats({ attackSpeed: newSpeed });
        break;
      case 'maxHp': {
        const oldMaxHp = player.stats.maxHp;
        store.updatePlayerStats({ maxHp: player.stats.maxHp + Math.round(actualValue) });
        // 同比例增加当前HP
        store.updatePlayerStats({ hp: Math.min(player.stats.hp + Math.round(actualValue), player.stats.maxHp) });
        break;
      }
      case 'moveSpeed':
        store.updatePlayerStats({ moveSpeed: player.stats.moveSpeed * (1 + actualValue) });
        break;
      case 'critRate':
        store.updatePlayerStats({ critRate: Math.min(1, player.stats.critRate + actualValue) });
        break;
      case 'critDamage':
        store.updatePlayerStats({ critDamage: player.stats.critDamage + actualValue });
        break;
      case 'expMultiplier':
        store.updatePlayerStats({ expMultiplier: player.stats.expMultiplier + actualValue });
        break;
      case 'pickupRange':
        store.updatePlayerStats({ pickupRange: player.stats.pickupRange * (1 + actualValue) });
        break;
      case 'armor':
        store.updatePlayerStats({ armor: player.stats.armor + Math.round(actualValue) });
        break;
      case 'luck':
        store.updatePlayerStats({ luck: player.stats.luck + Math.round(actualValue) });
        break;
      case 'projectileCount':
        store.updatePlayerStats({ projectileCount: player.stats.projectileCount + Math.round(actualValue) });
        break;
      case 'unlock_weapon':
        if (skillDef.weaponId) {
          store.equipWeapon(skillDef.weaponId);
        }
        break;
      case 'full_heal':
        store.updatePlayerStats({ hp: player.stats.maxHp });
        break;
      case 'revival':
        store.updatePlayerStats({ revival: player.stats.revival + 1 });
        break;
    }
  }

  /**
   * 获取可用技能池
   */
  private static getAvailableSkills(
    acquiredSkills: Map<string, number>,
    equippedWeapons: string[]
  ): string[] {
    const pool: string[] = [];

    for (const [id, def] of Object.entries(SKILL_CONFIGS)) {
      const currentLevel = acquiredSkills.get(id) || 0;

      // 已达最大等级，跳过
      if (currentLevel >= def.maxLevel) continue;

      // 武器解锁类：已装备则跳过
      if (def.category === 'weapon' && def.weaponId && equippedWeapons.includes(def.weaponId)) {
        continue;
      }

      // 复活技能已有时跳过
      if (def.effectType === 'revival' && currentLevel >= 1) continue;

      pool.push(id);
    }

    return pool.length > 0 ? pool : Object.keys(SKILL_CONFIGS);
  }

  /**
   * 计算实际效果值
   */
  private static getActualEffectValue(
    effectType: string,
    baseValue: number,
    qualityMultiplier: number
  ): number {
    // 百分比类效果乘品质倍率
    const percentBased = ['attack', 'attackSpeed', 'critRate', 'critDamage', 'expMultiplier', 'pickupRange', 'moveSpeed'];
    if (percentBased.includes(effectType)) {
      return baseValue * qualityMultiplier;
    }
    // 数值类效果
    return baseValue * qualityMultiplier;
  }

  /**
   * 生成描述文字
   */
  private static generateDescription(
    name: string,
    effectType: string,
    actualValue: number,
    quality: string
  ): string {
    const qualityLabel = quality !== 'common' ? `[${quality}] ` : '';

    switch (effectType) {
      case 'attack': return `${qualityLabel}攻击力 +${Math.round(actualValue * 100)}%`;
      case 'attackSpeed': return `${qualityLabel}攻击速度 +${Math.round(Math.abs(actualValue) * 100)}%`;
      case 'maxHp': return `${qualityLabel}生命上限 +${Math.round(actualValue)}`;
      case 'moveSpeed': return `${qualityLabel}移动速度 +${Math.round(actualValue * 100)}%`;
      case 'critRate': return `${qualityLabel}暴击率 +${Math.round(actualValue * 100)}%`;
      case 'critDamage': return `${qualityLabel}暴击伤害 +${Math.round(actualValue * 100)}%`;
      case 'expMultiplier': return `${qualityLabel}经验获取 +${Math.round(actualValue * 100)}%`;
      case 'pickupRange': return `${qualityLabel}拾取范围 +${Math.round(actualValue * 100)}%`;
      case 'armor': return `${qualityLabel}护甲 +${Math.round(actualValue)}`;
      case 'luck': return `${qualityLabel}幸运 +${Math.round(actualValue)}`;
      case 'projectileCount': return `${qualityLabel}弹射数量 +${Math.round(actualValue)}`;
      case 'unlock_weapon': return `${qualityLabel}获得新武器：${name}`;
      case 'full_heal': return `${qualityLabel}立即回复全部生命值`;
      case 'revival': return `${qualityLabel}死亡时可复活一次`;
      default: return name;
    }
  }
}
