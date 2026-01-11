import { RulesVersion, RulesVersionID } from './types';
import { tehnologRules } from './rules/tehnolog';
import { fanRules } from './rules/fan';

// Rules version registry with type safety
export const rulesRegistry: Record<RulesVersionID, RulesVersion> = {
  tehnolog: tehnologRules,
  fan: fanRules,
};

// Get default rules version
export function getDefaultRulesVersion(): RulesVersionID {
  return 'tehnolog';
}

// Get rules version object by ID
export function getRulesVersion(id: RulesVersionID): RulesVersion {
  return rulesRegistry[id];
}

// Get all available rules versions
export function getAllRulesVersions(): RulesVersion[] {
  return Object.values(rulesRegistry);
}

// Validate if a string is a valid rules version ID
export function isValidRulesVersion(id: string): id is RulesVersionID {
  return Object.keys(rulesRegistry).includes(id);
}
