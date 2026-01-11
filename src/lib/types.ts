export type FactionID = 'polaris' | 'protectorate' | 'mercenaries';

// Rules version selection
export type RulesVersionID = 'tehnolog' | 'fan';

export interface Faction {
  id: FactionID;
  name: string;
  color: string;
  symbol?: string;
  description: string;
  homeWorld: string;
  motto: string;
}

export interface Soldier {
  rank: number;
  speed: number;
  range: string;
  power: string;
  melee: number;
  props: string[];
  armor: number;
  image?: string;
}

export interface Squad {
  id: string;
  name: string;
  faction: FactionID;
  cost: number;
  soldiers: Soldier[];
  image?: string;
  originalUrl?: string;
}

export interface SpeedSector {
  min_durability: number;
  max_durability: number;
  speed: number;
}

// Special weapon effects (Panov rules)
export interface AoEEffect {
  type: 'aoe';
  radius: number; // Количество hex-ов радиуса
  damage: string; // Формула урона для зоны
}

export interface RepairEffect {
  type: 'repair';
  amount: number; // Количество восстанавливаемой прочности
  range?: number; // Радиус действия (для ремонта соседних юнитов)
}

export interface BurstEffect {
  type: 'burst';
  count: number; // Количество выстрелов
  directions: string[]; // Направления ['вперёд', 'влево-вперёд', 'вправо-вперёд']
}

export type WeaponSpecial = AoEEffect | RepairEffect | BurstEffect | string;

export interface Weapon {
  name: string;
  range: string;
  power: string;
  special?: WeaponSpecial;
}

export interface Machine {
  id: string;
  name: string;
  faction: FactionID;
  cost: number;
  rank: number;
  fire_rate: number;
  ammo_max: number;
  durability_max: number;
  speed_sectors: SpeedSector[];
  weapons: Weapon[];
  image?: string;
  originalUrl?: string;
}

export interface ArmyUnit {
  instanceId: string;
  type: 'squad' | 'machine';
  data: Squad | Machine;
  // Unit numbering for identification
  instanceNumber?: number; // Sequential number per unit type, e.g., 1, 2, 3...
  // Current state in game
  currentDurability?: number;
  currentAmmo?: number;
  grenadesUsed?: boolean;
  deadSoldiers?: number[]; // indices of dead soldiers
  actionsUsed?: {
    moved: boolean;
    shot: boolean;
    melee: boolean;
    done: boolean;
  }[]; // for soldiers or single for machine
  isMachineMoved?: boolean;
  isMachineShot?: boolean;
  isMachineMelee?: boolean;
  isMachineDone?: boolean;
  machineShotsUsed?: number; // количество выстрелов в этом ходу
  machineWeaponShots?: { [weaponIndex: number]: number }; // количество выстрелов из каждого оружия
}

export interface Army {
  name: string;
  faction: FactionID;
  units: ArmyUnit[];
  totalCost: number;
  // Army Building Flow extensions
  pointBudget?: number;
  currentStep?: 'faction-select' | 'unit-select' | 'battle';
  isInBattle?: boolean;
  isLoading?: boolean;
  loadError?: string;
}

// Rules version selection
export interface HitResult {
  success: boolean;
  roll: number;
  total: number;
}

export interface DamageResult {
  damage: number;
  rolls: number[];
  special?: {
    type: 'aoe' | 'repair' | 'burst';
    description: string;
    additionalDamage?: number;
    targets?: string[];
  };
}

export interface MeleeResult {
  attackerRoll: number;
  attackerTotal: number;
  defenderRoll: number;
  defenderTotal: number;
  winner: 'attacker' | 'defender' | 'draw';
}

export type CalculateHitFn = (rangeStr: string, distanceSteps: number) => HitResult;
export type CalculateDamageFn = (powerStr: string, targetArmor: number, special?: WeaponSpecial) => DamageResult;
export type CalculateMeleeFn = (attackerMelee: number, defenderMelee: number) => MeleeResult;

export interface RulesVersion {
  id: RulesVersionID;
  name: string;
  source: string;
  calculateHit: CalculateHitFn;
  calculateDamage: CalculateDamageFn;
  calculateMelee: CalculateMeleeFn;
  supportsSpecialEffects: boolean; // Панов поддерживает special-эффекты
}
