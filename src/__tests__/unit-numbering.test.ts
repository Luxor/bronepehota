/**
 * Unit Numbering Tests
 *
 * Tests for unit count aggregation, numbering, and validation functions
 */

import {
  countByUnitType,
  getNextInstanceNumber,
  canAddUnit,
  validateAddUnit,
  formatUnitNumber,
  formatCountBadge,
  assignInstanceNumber,
} from '../lib/unit-utils';
import type { Army, ArmyUnit } from '../lib/types';

// Mock data helpers
function createMockUnit(id: string, instanceNumber?: number): ArmyUnit {
  return {
    instanceId: `${id}-${Date.now()}`,
    type: 'squad',
    data: {
      id,
      name: `Unit ${id}`,
      faction: 'polaris',
      cost: 50,
      soldiers: [],
    },
    instanceNumber,
  };
}

function createMockArmy(units: ArmyUnit[]): Army {
  return {
    name: 'Test Army',
    faction: 'polaris',
    units,
    totalCost: units.reduce((sum, u) => sum + (u.data.cost || 0), 0),
  };
}

describe('countByUnitType', () => {
  it('should return empty object for empty array', () => {
    const result = countByUnitType([]);
    expect(result).toEqual({});
  });

  it('should count units by type correctly with multiple unit types', () => {
    const units = [
      createMockUnit('polaris_light_assault_clone', 1),
      createMockUnit('polaris_light_assault_clone', 2),
      createMockUnit('polaris_light_assault_clone', 3),
      createMockUnit('polaris_heavy_mech', 1),
      createMockUnit('polaris_heavy_mech', 2),
    ];
    const result = countByUnitType(units);
    expect(result).toEqual({
      'polaris_light_assault_clone': 3,
      'polaris_heavy_mech': 2,
    });
  });
});

describe('canAddUnit', () => {
  it('should return true when under 99 units', () => {
    const units = Array.from({ length: 50 }, (_, i) =>
      createMockUnit('polaris_light_assault_clone', i + 1)
    );
    const army = createMockArmy(units);
    expect(canAddUnit(army, 'polaris_light_assault_clone')).toBe(true);
  });

  it('should return false at 99 limit', () => {
    const units = Array.from({ length: 99 }, (_, i) =>
      createMockUnit('polaris_light_assault_clone', i + 1)
    );
    const army = createMockArmy(units);
    expect(canAddUnit(army, 'polaris_light_assault_clone')).toBe(false);
  });
});

describe('validateAddUnit', () => {
  it('should return valid: true for under limit', () => {
    const units = Array.from({ length: 50 }, (_, i) =>
      createMockUnit('polaris_light_assault_clone', i + 1)
    );
    const army = createMockArmy(units);
    const result = validateAddUnit(army, 'polaris_light_assault_clone');
    expect(result).toEqual({ valid: true });
  });

  it('should return Russian error message at limit', () => {
    const units = Array.from({ length: 99 }, (_, i) =>
      createMockUnit('polaris_light_assault_clone', i + 1)
    );
    const army = createMockArmy(units);
    const result = validateAddUnit(army, 'polaris_light_assault_clone');
    expect(result).toEqual({
      valid: false,
      error: 'Максимум 99 юнитов этого типа',
    });
  });
});

describe('getNextInstanceNumber', () => {
  it('should return 1 for new unit type', () => {
    const army = createMockArmy([]);
    expect(getNextInstanceNumber(army, 'polaris_light_assault_clone')).toBe(1);
  });

  it('should return count + 1 for existing type', () => {
    const units = [
      createMockUnit('polaris_light_assault_clone', 1),
      createMockUnit('polaris_light_assault_clone', 2),
    ];
    const army = createMockArmy(units);
    expect(getNextInstanceNumber(army, 'polaris_light_assault_clone')).toBe(3);
  });
});

describe('formatUnitNumber', () => {
  it('should format with instanceNumber', () => {
    const unit = createMockUnit('test', 5);
    expect(formatUnitNumber(unit)).toBe('#5');
  });

  it('should use fallback when instanceNumber is undefined', () => {
    const unit = createMockUnit('test');
    expect(formatUnitNumber(unit, 2)).toBe('#3');
  });

  it('should return empty string when no instanceNumber or fallback', () => {
    const unit = createMockUnit('test');
    expect(formatUnitNumber(unit)).toBe('');
  });
});

describe('formatCountBadge', () => {
  it('should return null for 0 count', () => {
    expect(formatCountBadge(0)).toBeNull();
  });

  it('should return string representation for positive number', () => {
    expect(formatCountBadge(3)).toBe('3');
    expect(formatCountBadge(99)).toBe('99');
  });
});

describe('assignInstanceNumber', () => {
  it('should assign instanceNumber to unit', () => {
    const unit = createMockUnit('test');
    const updated = assignInstanceNumber(unit, 5);
    expect(updated.instanceNumber).toBe(5);
  });

  it('should preserve other unit properties', () => {
    const unit = createMockUnit('test');
    const updated = assignInstanceNumber(unit, 5);
    expect(updated.instanceId).toBe(unit.instanceId);
    expect(updated.type).toBe(unit.type);
    expect(updated.data).toBe(unit.data);
  });
});

describe('export/import with instanceNumber', () => {
  it('should preserve instanceNumber during export/import', () => {
    const units = [
      createMockUnit('polaris_light_assault_clone'),
      createMockUnit('polaris_light_assault_clone'),
      createMockUnit('polaris_light_assault_clone'),
    ];
    // Assign instance numbers
    units[0].instanceNumber = 1;
    units[1].instanceNumber = 2;
    units[2].instanceNumber = 3;

    const army = createMockArmy(units);

    // Simulate export/import
    const exported = JSON.stringify(army);
    const imported = JSON.parse(exported) as Army;

    expect(imported.units[0].instanceNumber).toBe(1);
    expect(imported.units[1].instanceNumber).toBe(2);
    expect(imported.units[2].instanceNumber).toBe(3);
  });

  it('should handle missing instanceNumber on import (backward compatibility)', () => {
    const units = [
      createMockUnit('polaris_light_assault_clone'),
      createMockUnit('polaris_light_assault_clone'),
    ];
    // Remove instanceNumber to simulate old data
    delete units[0].instanceNumber;
    delete units[1].instanceNumber;

    const army = createMockArmy(units);

    // Simulate export/import
    const exported = JSON.stringify(army);
    const imported = JSON.parse(exported) as Army;

    // Should load without error
    expect(imported.units).toHaveLength(2);
    // formatUnitNumber should handle missing instanceNumber
    expect(formatUnitNumber(imported.units[0], 0)).toBe('#1');
    expect(formatUnitNumber(imported.units[1], 1)).toBe('#2');
  });
});
