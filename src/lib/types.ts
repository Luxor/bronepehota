export type FactionID = 'polaris' | 'protectorate' | 'mercenaries';

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

export interface Weapon {
  name: string;
  range: string;
  power: string;
  special?: string;
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
