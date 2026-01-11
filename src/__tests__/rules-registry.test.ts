import { rulesRegistry, isValidRulesVersion, getDefaultRulesVersion, getRulesVersion, getAllRulesVersions } from '@/lib/rules-registry';

describe('Rules Registry', () => {
  test('getDefaultRulesVersion returns tehnolog', () => {
    expect(getDefaultRulesVersion()).toBe('tehnolog');
  });

  test('isValidRulesVersion validates correctly', () => {
    expect(isValidRulesVersion('tehnolog')).toBe(true);
    expect(isValidRulesVersion('fan')).toBe(true);
    expect(isValidRulesVersion('invalid')).toBe(false);
  });

  test('rulesRegistry contains all versions', () => {
    expect(Object.keys(rulesRegistry)).toEqual(['tehnolog', 'fan']);
  });

  test('getRulesVersion returns correct version', () => {
    const tehnolog = getRulesVersion('tehnolog');
    expect(tehnolog.id).toBe('tehnolog');
    expect(tehnolog.name).toBe('Технолог');

    const fan = getRulesVersion('fan');
    expect(fan.id).toBe('fan');
    expect(fan.name).toBe('Фанатская Редакция');
  });

  test('getAllRulesVersions returns all versions', () => {
    const versions = getAllRulesVersions();
    expect(versions).toHaveLength(2);
    expect(versions.map(v => v.id)).toEqual(expect.arrayContaining(['tehnolog', 'fan']));
  });

  test('each version has required functions', () => {
    Object.values(rulesRegistry).forEach((version) => {
      expect(version).toHaveProperty('calculateHit');
      expect(version).toHaveProperty('calculateDamage');
      expect(version).toHaveProperty('calculateMelee');
      expect(typeof version.calculateHit).toBe('function');
      expect(typeof version.calculateDamage).toBe('function');
      expect(typeof version.calculateMelee).toBe('function');
    });
  });
});

describe('Extensibility Verification', () => {
  test('each rules version exports all required functions', () => {
    Object.values(rulesRegistry).forEach((version) => {
      expect(version).toHaveProperty('calculateHit');
      expect(version).toHaveProperty('calculateDamage');
      expect(version).toHaveProperty('calculateMelee');
    });
  });

  test('getAllRulesVersions returns all registered versions', () => {
    const versions = getAllRulesVersions();
    expect(versions.length).toBeGreaterThan(0);
    expect(versions.every(v => Object.values(rulesRegistry).includes(v)));
  });
});

describe('Special Effects (Fan Edition Rules)', () => {
  const fan = rulesRegistry.fan;
  const tehnolog = rulesRegistry.tehnolog;

  test('Fan supports special effects, Tehnolog does not', () => {
    expect(fan.supportsSpecialEffects).toBe(true);
    expect(tehnolog.supportsSpecialEffects).toBe(false);
  });

  test('Fan parses AoE effect from string', () => {
    const result = fan.calculateDamage('4D20', 3, 'Взрыв 2ш - 1D20');
    expect(result.special).toBeDefined();
    expect(result.special?.type).toBe('aoe');
    expect(result.special?.description).toContain('2ш');
  });

  test('Fan parses Repair effect from string', () => {
    const result = fan.calculateDamage('1D20', 3, 'Ремонт 2 повреждения');
    expect(result.special).toBeDefined();
    expect(result.special?.type).toBe('repair');
    expect(result.special?.additionalDamage).toBe(-2);
  });

  test('Fan parses Burst effect from string', () => {
    const result = fan.calculateDamage('1D6', 3, '3 выстрела в 3х направлениях');
    expect(result.special).toBeDefined();
    expect(result.special?.type).toBe('burst');
    expect(result.special?.targets).toHaveLength(3);
  });

  test('Tehnolog ignores special effects', () => {
    const result = tehnolog.calculateDamage('4D20', 3, 'Взрыв 2ш - 1D20');
    expect(result.special).toBeUndefined();
  });

  test('Fan calculates normal damage without special effects', () => {
    const result = fan.calculateDamage('2D12', 5);
    expect(result.damage).toBeGreaterThanOrEqual(0);
    expect(result.rolls).toHaveLength(2);
    expect(result.special).toBeUndefined();
  });
});
