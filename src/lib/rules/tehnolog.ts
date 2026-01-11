import { RulesVersion, HitResult, DamageResult, MeleeResult, WeaponSpecial } from '../types';
import { rollDie, parseRoll, executeRoll } from '../game-logic';

export const tehnologRules: RulesVersion = {
  id: 'tehnolog',
  name: 'Технолог',
  source: 'docs/original/Bronepekhota_Pravila_05_08_08.pdf',
  supportsSpecialEffects: false, // Технолог не поддерживает расширенные special-эффекты

  calculateHit: (rangeStr: string, distanceSteps: number): HitResult => {
    const { total, rolls } = executeRoll(rangeStr);
    return {
      success: total >= distanceSteps,
      roll: rolls[0] || 0,
      total
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  calculateDamage: (powerStr: string, targetArmor: number, _special?: WeaponSpecial): DamageResult => {
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

    // Технолог игнорирует special-эффекты (базовая реализация)
    return { damage, rolls };
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
