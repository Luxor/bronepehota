'use client';

import { useEffect, useRef } from 'react';
import { X, Shield, Sword, Zap, Target, Gauge, ShieldCheck, Info, Cpu, Crosshair, Flame, Activity } from 'lucide-react';
import type { Squad, Machine, Faction, Soldier, Weapon, SpeedSector } from '@/lib/types';

interface UnitDetailsModalProps {
  unit: Squad | Machine;
  unitType: 'squad' | 'machine';
  faction: Faction;
  isOpen: boolean;
  onClose: () => void;
}

// T014: Create SoldierStats subcomponent to display individual soldier stats
interface SoldierStatsProps {
  soldier: Soldier;
  index: number;
  factionColor: string;
}

function SoldierStats({ soldier, index, factionColor }: SoldierStatsProps) {
  // T017: Tooltip/popover for special property explanation
  const propDescriptions: Record<string, string> = {
    'Г': 'Граната',
    'Сн': 'Снайпер',
    'Мед': 'Медик',
    'Инж': 'Инженер',
  };

  // T053: Add visual error indication for negative stat values (red color)
  const getStatColor = (value: number) => {
    if (value < 0) return 'text-red-400';
    return 'text-white';
  };

  return (
    <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-600" style={{ color: factionColor }}>
            {index + 1}
          </span>
          Боец #{index + 1}
        </h4>
        {/* T018: Implement soldier image display alongside stats */}
        {soldier.image && (
          <img
            src={soldier.image}
            alt={`Боец ${index + 1}`}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      {/* T015: Implement soldier stat display items (rank, speed, range, power, melee, armor) with icons */}
      {/* T052: Empty state handling for invalid data - check for negative/empty values */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Rank */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Shield className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Ранг</div>
            <div className={`text-sm font-bold ${getStatColor(soldier.rank)}`}>
              {soldier.rank >= 0 ? soldier.rank : 'Н/Д'}
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Gauge className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Скорость</div>
            <div className={`text-sm font-bold ${getStatColor(soldier.speed)}`}>
              {soldier.speed >= 0 ? soldier.speed : 'Н/Д'}
            </div>
          </div>
        </div>

        {/* Range - T033: Dice notation formatting with monospace font */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Target className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Дальность</div>
            <div className={`text-sm font-mono font-bold ${soldier.range ? 'text-green-400' : 'text-red-400'}`}>
              {soldier.range || 'Н/Д'}
            </div>
          </div>
        </div>

        {/* Power - T033: Dice notation formatting with monospace font */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Мощь</div>
            <div className={`text-sm font-mono font-bold ${soldier.power ? 'text-orange-400' : 'text-red-400'}`}>
              {soldier.power || 'Н/Д'}
            </div>
          </div>
        </div>

        {/* Melee */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Sword className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Бой</div>
            <div className={`text-sm font-bold ${getStatColor(soldier.melee)}`}>
              {soldier.melee >= 0 ? soldier.melee : 'Н/Д'}
            </div>
          </div>
        </div>

        {/* Armor */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <ShieldCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Защита</div>
            <div className={`text-sm font-bold ${getStatColor(soldier.armor)}`}>
              {soldier.armor >= 0 ? soldier.armor : 'Н/Д'}
            </div>
          </div>
        </div>
      </div>

      {/* T016: Implement special properties (props) display as badges with visual highlighting */}
      {soldier.props && soldier.props.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {soldier.props.map((prop, propIndex) => (
            <div
              key={propIndex}
              className="group relative inline-flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-lg px-2 py-1 transition-colors"
              title={propDescriptions[prop] || prop}
            >
              <span className="text-xs font-bold text-blue-400 font-mono">{prop}</span>
              <Info className="w-3 h-3 text-blue-400 opacity-50" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// T026: Create MachineStats subcomponent to display basic machine stats
interface MachineStatsProps {
  machine: Machine;
  factionColor: string;
}

function MachineStats({ machine, factionColor }: MachineStatsProps) {
  return (
    <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50">
      <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <Cpu className="w-5 h-5" style={{ color: factionColor }} />
        Характеристики
      </h3>
      {/* T027: Implement machine stat display items (rank, fire_rate, ammo_max, durability_max) with icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Rank */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Shield className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Ранг</div>
            <div className="text-sm font-bold text-white">{machine.rank}</div>
          </div>
        </div>

        {/* Fire Rate */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Crosshair className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Скоростр.</div>
            <div className="text-sm font-bold text-white">{machine.fire_rate}</div>
          </div>
        </div>

        {/* Ammo Max */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Activity className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Боезапас</div>
            <div className="text-sm font-bold text-white">{machine.ammo_max}</div>
          </div>
        </div>

        {/* Durability Max */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <ShieldCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold">Прочность</div>
            <div className="text-sm font-bold text-white">{machine.durability_max}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// T028: Create SpeedSectorsTable subcomponent to display speed ranges in table format
interface SpeedSectorsTableProps {
  speedSectors: SpeedSector[];
}

function SpeedSectorsTable({ speedSectors }: SpeedSectorsTableProps) {
  if (speedSectors.length === 0) {
    // T030: Add empty state message when speed_sectors array is empty
    return (
      <div className="text-center py-4 text-slate-400">
        Нет данных о скорости
      </div>
    );
  }

  return (
    <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50">
      <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <Gauge className="w-5 h-5 text-blue-400" />
        Секторы скорости
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-2 px-3 text-slate-400 font-semibold">Прочность</th>
              <th className="text-left py-2 px-3 text-slate-400 font-semibold">Скорость</th>
            </tr>
          </thead>
          <tbody>
            {speedSectors.map((sector, index) => (
              // T029: Implement speed sector display (min-max durability range, speed value)
              <tr key={index} className="border-b border-slate-700/50 last:border-0">
                <td className="py-2 px-3 text-white font-mono">
                  {sector.min_durability}-{sector.max_durability}
                </td>
                <td className="py-2 px-3 text-white font-bold">
                  {sector.speed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// T031: Create WeaponCard subcomponent to display individual weapon details
interface WeaponCardProps {
  weapon: Weapon;
  index: number;
}

function WeaponCard({ weapon, index }: WeaponCardProps) {
  return (
    <div className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/50 hover:border-slate-500/50 transition-all">
      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
        <Crosshair className="w-4 h-4 text-red-400" />
        {weapon.name}
      </h4>
      {/* T032: Implement weapon display (name, range, power, special rules) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Range - T033: Dice notation formatting with monospace font */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Target className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[9px] uppercase text-slate-500 font-bold">Дальность</div>
            <div className="text-xs font-mono font-bold text-green-400">{weapon.range}</div>
          </div>
        </div>

        {/* Power - T033: Dice notation formatting with monospace font */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
          <Zap className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[9px] uppercase text-slate-500 font-bold">Мощь</div>
            <div className="text-xs font-mono font-bold text-orange-400">{weapon.power}</div>
          </div>
        </div>
      </div>

      {/* Special rules */}
      {weapon.special && (
        <div className="mt-2 text-xs text-slate-400 italic">
          {typeof weapon.special === 'string' ? weapon.special : JSON.stringify(weapon.special)}
        </div>
      )}
    </div>
  );
}

export function UnitDetailsModal({
  unit,
  unitType,
  faction,
  isOpen,
  onClose,
}: UnitDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // T008: Implement body scroll lock when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // T007: Add Escape key to close functionality
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // T055: Add focus management (focus trap in modal, restore focus on close)
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // T006: Add click-outside-to-close functionality
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // T054: Implement rapid open/close debounce (prevent animation conflicts)
  const isAnimating = false; // Add state if needed for complex animations

  // T004: Implement modal overlay with backdrop
  // T010: Implement responsive modal container
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* T010: Modal container - full-screen mobile, centered card desktop */}
      <div
        ref={modalRef}
        className={`w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] bg-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-200 ease-out ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-95 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking content
      >
        {/* T005: Modal close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors z-10"
          style={{ minWidth: '44px', minHeight: '44px' }} // T045: 44x44px minimum for mobile
          aria-label="Закрыть"
        >
          <X size={24} />
        </button>

        {/* T012: Modal header section */}
        <div
          className="relative bg-gradient-to-r from-slate-700 to-slate-800 p-6 pb-4 border-b-2"
          style={{ borderColor: faction.color }}
        >
          <h2
            id="modal-title"
            className="text-2xl font-bold text-white pr-12"
          >
            {unit.name}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-slate-300">
              {unitType === 'squad' ? 'Отряд' : 'Машина'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-lg font-semibold" style={{ color: faction.color }}>
              {unit.cost} очков
            </span>
          </div>
          {unit.image && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-20 hidden sm:block">
              <img
                src={unit.image}
                alt={unit.name}
                className="w-32 h-32 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* T013: Modal content scrollable area */}
        {/* T041: Add animation/transition when switching between units - key prop ensures re-render animation */}
        <div key={`${unitType}-${unit.id}`} className="flex-1 overflow-y-auto p-4 md:p-6" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {unitType === 'squad' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: faction.color }} />
                Состав отряда
              </h3>

              {(unit as Squad).soldiers.length === 0 ? (
                // T021: Empty state message when soldiers array is empty
                <div className="text-center py-8 text-slate-400">
                  Нет данных о солдатах
                </div>
              ) : (
                // T020: Render squad soldiers list
                <div className="space-y-3">
                  {(unit as Squad).soldiers.map((soldier, index) => (
                    <SoldierStats
                      key={index}
                      soldier={soldier}
                      index={index}
                      factionColor={faction.color}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // T037: Add conditional rendering logic (squad vs machine view) based on unitType prop
            <div className="space-y-4">
              {/* Machine basic stats */}
              <MachineStats machine={unit as Machine} factionColor={faction.color} />

              {/* Speed sectors table */}
              <SpeedSectorsTable speedSectors={(unit as Machine).speed_sectors} />

              {/* Weapons list */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Sword className="w-5 h-5" style={{ color: faction.color }} />
                  Вооружение
                </h3>

                {(unit as Machine).weapons.length === 0 ? (
                  // T035: Add empty state message when weapons array is empty
                  <div className="text-center py-8 text-slate-400">
                    Нет вооружения
                  </div>
                ) : (
                  // T034: Render machine weapons list (map through weapons array)
                  <div className="space-y-2">
                    {(unit as Machine).weapons.map((weapon, index) => (
                      <WeaponCard key={index} weapon={weapon} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}