import { parseRoll, executeRoll } from '../lib/game-logic';
import { rulesRegistry } from '@/lib/rules-registry';

describe('Game Logic - Dice Rolls', () => {
  test('parseRoll should correctly parse various formats', () => {
    expect(parseRoll('D6')).toEqual({ dice: 1, sides: 6, bonus: 0 });
    expect(parseRoll('D12+2')).toEqual({ dice: 1, sides: 12, bonus: 2 });
    expect(parseRoll('2D20')).toEqual({ dice: 2, sides: 20, bonus: 0 });
    expect(parseRoll('3D6+1')).toEqual({ dice: 3, sides: 6, bonus: 1 });
  });

  test('executeRoll should return a total within expected range', () => {
    const result = executeRoll('2D6+2');
    // Min: 1+1+2 = 4, Max: 6+6+2 = 14
    expect(result.total).toBeGreaterThanOrEqual(4);
    expect(result.total).toBeLessThanOrEqual(14);
    expect(result.rolls.length).toBe(2);
  });

  test('executeRoll should handle ББ special case', () => {
    const result = executeRoll('ББ');
    expect(result.total).toBe(0);
    expect(result.rolls).toEqual([]);
  });
});

describe('Version-Specific Calculations', () => {
  describe('Tehnolog version', () => {
    const tehnolog = rulesRegistry.tehnolog;

    test('calculateHit works correctly', () => {
      const result = tehnolog.calculateHit('D6+2', 5);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('total');
    });

    test('calculateDamage works correctly', () => {
      const result = tehnolog.calculateDamage('2D6', 3);
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('rolls');
      expect(result.rolls.length).toBe(2);
    });

    test('calculateMelee works correctly', () => {
      const result = tehnolog.calculateMelee(4, 3);
      expect(result).toHaveProperty('attackerRoll');
      expect(result).toHaveProperty('attackerTotal');
      expect(result).toHaveProperty('defenderRoll');
      expect(result).toHaveProperty('defenderTotal');
      expect(result).toHaveProperty('winner');
      expect(['attacker', 'defender', 'draw']).toContain(result.winner);
    });
  });

  describe('Fan Edition version', () => {
    const fan = rulesRegistry.fan;

    test('calculateHit works correctly', () => {
      const result = fan.calculateHit('D6+2', 5);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('total');
    });

    test('calculateDamage works correctly', () => {
      const result = fan.calculateDamage('2D6', 3);
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('rolls');
      expect(result.rolls.length).toBe(2);
    });

    test('calculateMelee works correctly', () => {
      const result = fan.calculateMelee(4, 3);
      expect(result).toHaveProperty('attackerRoll');
      expect(result).toHaveProperty('attackerTotal');
      expect(result).toHaveProperty('defenderRoll');
      expect(result).toHaveProperty('defenderTotal');
      expect(result).toHaveProperty('winner');
      expect(['attacker', 'defender', 'draw']).toContain(result.winner);
    });
  });
});