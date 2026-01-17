export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const parseRoll = (rollStr: string): { dice: number, sides: number, bonus: number } => {
  // Matches formats like "D6", "D6+2", "2D12", "D12+1", etc.
  const regex = /(?:(\d+))?D(\d+)(?:\+(\d+))?/;
  const match = rollStr.match(regex);
  if (!match) return { dice: 1, sides: 6, bonus: 0 };

  return {
    dice: parseInt(match[1] || '1'),
    sides: parseInt(match[2]),
    bonus: parseInt(match[3] || '0')
  };
};

export const executeRoll = (rollStr: string): { total: number, rolls: number[] } => {
  if (rollStr === 'ББ') return { total: 0, rolls: [] }; // Special case for melee range
  
  const { dice, sides, bonus } = parseRoll(rollStr);
  const rolls = [];
  let total = 0;
  for (let i = 0; i < dice; i++) {
    const r = rollDie(sides);
    rolls.push(r);
    total += r;
  }
  return { total: total + bonus, rolls };
};

export const calculateHit = (rangeStr: string, distanceSteps: number): { success: boolean, roll: number, total: number } => {
  const { total, rolls } = executeRoll(rangeStr);
  return {
    success: total >= distanceSteps,
    roll: rolls[0], // Assuming single die for range most of the time
    total
  };
};

export const calculateDamage = (powerStr: string, targetArmor: number): { damage: number, rolls: number[] } => {
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
  return { damage, rolls };
};

export const calculateMelee = (attackerMelee: number, defenderMelee: number): {
  attackerRoll: number,
  attackerTotal: number,
  defenderRoll: number,
  defenderTotal: number,
  winner: 'attacker' | 'defender' | 'draw'
} => {
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
};

/**
 * Combat flow validation utilities
 */

export interface CombatValidation {
  isValid: boolean;
  errors: string[];
}

export function validateCombatParameters(
  actionType: 'shot' | 'melee' | 'grenade',
  distance: number,
  targetArmor: number,
  targetMelee: number,
  ammo?: number,
  grenadesAvailable?: boolean
): CombatValidation {
  const errors: string[] = [];

  if (actionType === 'shot' || actionType === 'grenade') {
    if (distance < 1 || distance > 20) {
      errors.push('Дистанция должна быть от 1 до 20');
    }
    if (targetArmor < 0 || targetArmor > 10) {
      errors.push('Броня должна быть от 0 до 10');
    }
    if (actionType === 'grenade' && !grenadesAvailable) {
      errors.push('Гранаты уже израсходованы');
    }
  }

  if (actionType === 'melee') {
    if (targetMelee < 0 || targetMelee > 10) {
      errors.push('Ближний бой цели должен быть от 0 до 10');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format combat result for display
 */
export function formatCombatResult(
  actionType: 'shot' | 'melee' | 'grenade',
  hitResult?: { success: boolean; roll: number; total: number },
  damageResult?: { damage: number; rolls: number[] },
  meleeResult?: { attackerRoll: number; attackerTotal: number; defenderRoll: number; defenderTotal: number; winner: 'attacker' | 'defender' | 'draw' }
): string {
  if (actionType === 'melee' && meleeResult) {
    if (meleeResult.winner === 'attacker') return 'Победа в ближнем бою';
    if (meleeResult.winner === 'defender') return 'Контратака';
    return 'Ничья в ближнем бою';
  }

  if (hitResult) {
    if (!hitResult.success) return 'Промах';
    if (damageResult) {
      if (damageResult.damage === 0) return 'Попадание, но не пробито';
      return `Попадание: ${damageResult.damage} ранений`;
    }
  }

  return 'Завершено';
}

/**
 * Calculate dice type from roll string
 */
export function getDiceType(rollStr: string): 6 | 12 | 20 {
  if (rollStr.includes('D20')) return 20;
  if (rollStr.includes('D12')) return 12;
  return 6;
}