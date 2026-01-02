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

