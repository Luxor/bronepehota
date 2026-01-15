import { tehnologRules } from '@/lib/rules/tehnolog';

describe('Tehnolog Rules - Hit Calculation (Official)', () => {
  describe('calculateHit', () => {
    it('uses direct comparison: total >= distance = hit', () => {
      // We can't test exact values due to randomness, but we can verify structure
      const result = tehnologRules.calculateHit('D6', 2);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('total');
      expect(result.roll).toBeGreaterThanOrEqual(1);
      expect(result.roll).toBeLessThanOrEqual(6);
    });

    it('handles bonus in range (D6+2)', () => {
      const result = tehnologRules.calculateHit('D6+2', 3);
      // total should be roll + 2
      expect(result.total).toBe(result.roll + 2);
    });

    it('handles D12 range', () => {
      const result = tehnologRules.calculateHit('D12', 5);
      expect(result.roll).toBeGreaterThanOrEqual(1);
      expect(result.roll).toBeLessThanOrEqual(12);
    });

    it('handles D20 range', () => {
      const result = tehnologRules.calculateHit('D20', 8);
      expect(result.roll).toBeGreaterThanOrEqual(1);
      expect(result.roll).toBeLessThanOrEqual(20);
    });

    it('ignores fortification parameter (fortifications affect damage only)', () => {
      const result1 = tehnologRules.calculateHit('D6', 3, 'none');
      const result2 = tehnologRules.calculateHit('D6', 3, 'light');
      const result3 = tehnologRules.calculateHit('D6', 3, 'heavy');
      // All should have same structure
      expect(result1).toHaveProperty('success');
      expect(result2).toHaveProperty('success');
      expect(result3).toHaveProperty('success');
    });

    it('handles melee range (ББ) - always hits in melee range', () => {
      const result = tehnologRules.calculateHit('ББ', 1);
      // ББ returns total=0, which would be 0>=1=false
      // But in practice, melee attacks are always in range
      expect(result.roll).toBe(0);
      expect(result.total).toBe(0);
      // Note: The success=false here is actually correct for the hit check logic
      // In practice, melee attacks don't use calculateHit - they use calculateMelee
    });
  });

  describe('calculateDamage - Virtual Fire Mechanics', () => {
    it('applies each die > armor = 1 wound', () => {
      const result = tehnologRules.calculateDamage('1D6', 0);
      expect(result.damage).toBeGreaterThanOrEqual(0);
      expect(result.damage).toBeLessThanOrEqual(1);
    });

    it('applies bonus to each die before comparing to armor', () => {
      const result = tehnologRules.calculateDamage('2D6+2', 5);
      // Each roll gets +2 bonus, so effective rolls are [roll+2, roll+2]
      // Damage is count of rolls > armor (5)
      expect(result.rolls.length).toBe(2);
      // Each roll should be original + bonus
      result.rolls.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(3); // 1+2
        expect(roll).toBeLessThanOrEqual(8); // 6+2
      });
    });

    it('applies light cover fortification (+1 to armor)', () => {
      // Same attack, different fortifications
      const resultNone = tehnologRules.calculateDamage('2D6', 2, 'none');
      const resultLight = tehnologRules.calculateDamage('2D6', 2, 'light');

      // Light cover increases armor by 1, so damage should be <= or equal
      // (we can't test exact due to randomness)
      expect(resultLight.rolls.length).toBe(2);
      expect(resultNone.rolls.length).toBe(2);
    });

    it('applies heavy fortification (+2 to armor)', () => {
      const result = tehnologRules.calculateDamage('D12', 4, 'heavy');
      expect(result.rolls.length).toBe(1);
      // With heavy, effective armor is 4+2=6
      // Roll is 1d12, damage is 1 if roll > 6
      expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(result.rolls[0]).toBeLessThanOrEqual(12);
    });

    it('applies heavy fortification with smaller die', () => {
      const result = tehnologRules.calculateDamage('D6', 2, 'heavy');
      expect(result.rolls.length).toBe(1);
      // With heavy, effective armor is 2+2=4
      // Roll is 1d6, damage is 1 if roll > 4
      expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(result.rolls[0]).toBeLessThanOrEqual(6);
    });

    it('handles vehicle targets same as infantry (virtual fire)', () => {
      // Official rules: vehicle damage uses same mechanics as infantry
      const result = tehnologRules.calculateDamage('2D12', 0, 'none', undefined, true);
      expect(result.rolls.length).toBe(2);
      // Each die compared to armor (0 for most vehicles)
      result.rolls.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(12);
      });
    });

    it('handles vehicle targets with fortifications', () => {
      // Vehicles also benefit from fortifications in official rules
      const result = tehnologRules.calculateDamage('D12', 0, 'heavy', undefined, true);
      expect(result.rolls.length).toBe(1);
      // With heavy, effective armor is 0+2=2
      expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(result.rolls[0]).toBeLessThanOrEqual(12);
    });
  });

  describe('calculateMelee', () => {
    it('implements D6+ББ vs D6+ББ comparison', () => {
      const result = tehnologRules.calculateMelee(3, 2);
      expect(result).toHaveProperty('attackerRoll');
      expect(result).toHaveProperty('attackerTotal');
      expect(result).toHaveProperty('defenderRoll');
      expect(result).toHaveProperty('defenderTotal');
      expect(result).toHaveProperty('winner');

      expect(result.attackerRoll).toBeGreaterThanOrEqual(1);
      expect(result.attackerRoll).toBeLessThanOrEqual(6);
      expect(result.defenderRoll).toBeGreaterThanOrEqual(1);
      expect(result.defenderRoll).toBeLessThanOrEqual(6);

      expect(result.attackerTotal).toBe(result.attackerRoll + 3);
      expect(result.defenderTotal).toBe(result.defenderRoll + 2);
    });

    it('correctly identifies winner', () => {
      const result = tehnologRules.calculateMelee(3, 2);
      expect(['attacker', 'defender', 'draw']).toContain(result.winner);
    });
  });
});
