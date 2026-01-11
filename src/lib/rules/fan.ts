import { RulesVersion, HitResult, DamageResult, MeleeResult, WeaponSpecial, AoEEffect, RepairEffect, BurstEffect } from '../types';
import { rollDie, parseRoll, executeRoll } from '../game-logic';

// Вспомогательные функции для парсинга special-эффектов
function parseAoEEffect(special: string): AoEEffect | null {
  // Парсинг формата "Взрыв 2ш - 1D20" или "Взрыв 3ш - 2D12"
  const aoeMatch = special.match(/Взрыв\s+(\d+)ш\s*[-–]\s*(\d+D\d+)/i);
  if (aoeMatch) {
    return {
      type: 'aoe',
      radius: parseInt(aoeMatch[1]),
      damage: aoeMatch[2]
    };
  }
  return null;
}

function parseRepairEffect(special: string): RepairEffect | null {
  // Парсинг формата "Ремонт 2 повреждения" или "Ремонт 2"
  const repairMatch = special.match(/Ремонт\s+(\d+)/i);
  if (repairMatch) {
    return {
      type: 'repair',
      amount: parseInt(repairMatch[1])
    };
  }
  return null;
}

function parseBurstEffect(special: string): BurstEffect | null {
  // Парсинг формата "3 выстрела в 3х направлениях"
  const burstMatch = special.match(/(\d+)\s+выстрел.*?(\d+)[xх]\s+направл/i);
  if (burstMatch) {
    const count = parseInt(burstMatch[1]);
    return {
      type: 'burst',
      count: count,
      directions: ['вперёд', 'влево-вперёд', 'вправо-вперёд'].slice(0, count)
    };
  }
  return null;
}

export const fanRules: RulesVersion = {
  id: 'fan',
  name: 'Фанатская Редакция',
  source: 'docs/panov/rules-originnal.pdf',
  supportsSpecialEffects: true, // Фанатская редакция поддерживает расширенные special-эффекты

  calculateHit: (rangeStr: string, distanceSteps: number): HitResult => {
    const { total, rolls } = executeRoll(rangeStr);
    return {
      success: total >= distanceSteps,
      roll: rolls[0] || 0,
      total
    };
  },

  calculateDamage: (powerStr: string, targetArmor: number, special?: WeaponSpecial): DamageResult => {
    const { dice, sides, bonus } = parseRoll(powerStr);
    let damage = 0;
    const rolls = [];

    for (let i = 0; i < dice; i++) {
      const r = rollDie(sides) + bonus;
      rolls.push(r);
      if (r > targetArmor) {
        damage += 1;
      }
    }

    // Базовый результат
    const result: DamageResult = { damage, rolls };

    // Обработка special-эффектов (Фанатская Редакция)
    if (special) {
      if (typeof special === 'string') {
        // Парсим строковые special-эффекты
        const aoe = parseAoEEffect(special);
        if (aoe) {
          result.special = {
            type: 'aoe',
            description: `Взрыв в радиусе ${aoe.radius}ш`,
            additionalDamage: 0 // Дополнительный урон рассчитывается отдельно для каждой цели в зоне
          };
          return result;
        }

        const repair = parseRepairEffect(special);
        if (repair) {
          result.special = {
            type: 'repair',
            description: `Ремонт ${repair.amount} повреждений`,
            additionalDamage: -repair.amount // Отрицательный урон = восстановление
          };
          return result;
        }

        const burst = parseBurstEffect(special);
        if (burst) {
          result.special = {
            type: 'burst',
            description: `${burst.count} выстрела в ${burst.count} направлениях`,
            targets: burst.directions
          };
          return result;
        }
      } else if (special.type === 'aoe') {
        // Структурированный AoE эффект
        result.special = {
          type: 'aoe',
          description: `Взрыв в радиусе ${special.radius}ш`,
          additionalDamage: 0
        };
        return result;
      } else if (special.type === 'repair') {
        // Структурированный ремонт эффект
        result.special = {
          type: 'repair',
          description: `Ремонт ${special.amount} повреждений` + (special.range ? ` (радиус ${special.range})` : ''),
          additionalDamage: -special.amount
        };
        return result;
      } else if (special.type === 'burst') {
        // Структурированный burst эффект
        result.special = {
          type: 'burst',
          description: `${special.count} выстрела в ${special.directions.length} направлениях`,
          targets: special.directions
        };
        return result;
      }
    }

    return result;
  },

  calculateMelee: (attackerMelee: number, defenderMelee: number): MeleeResult => {
    const aRoll = rollDie(6);
    const dRoll = rollDie(6);
    const aTotal = aRoll + attackerMelee;
    const dTotal = dRoll + defenderMelee;

    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    if (aTotal > dTotal) winner = 'attacker';
    else if (dTotal > aTotal) winner = 'defender';

    return {
      attackerRoll: aRoll,
      attackerTotal: aTotal,
      defenderRoll: dRoll,
      defenderTotal: dTotal,
      winner
    };
  }
};
