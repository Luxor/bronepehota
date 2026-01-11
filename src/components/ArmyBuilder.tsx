'use client';

import { useState, useMemo, useEffect } from 'react';
import { Army, ArmyUnit, FactionID, Faction, Squad, Machine } from '@/lib/types';
import { countByUnitType, validateAddUnit } from '@/lib/unit-utils';
import squadsData from '@/data/squads.json';
import machinesData from '@/data/machines.json';
import factionsData from '@/data/factions.json';
import { Plus, Trash2, Shield, Sword, Cpu, Box, Search, Download, Upload, Info, Globe, Quote, Users, Zap, Skull, LucideIcon } from 'lucide-react';
import { FactionSelector } from './FactionSelector';
import { PointBudgetInput } from './PointBudgetInput';
import { UnitSelector } from './UnitSelector';
import { UnitDetailsModal } from './UnitDetailsModal';

// Type assertions for JSON imports
const typedFactions = factionsData as Faction[];
const typedSquads = squadsData as Squad[];
const typedMachines = machinesData as Machine[];

interface ArmyBuilderProps {
  army: Army;
  setArmy: (army: Army) => void;
  onEnterBattle?: () => void;
}

const factionIcons: Record<string, LucideIcon> = {
  Shield,
  Zap,
  Skull
};

export default function ArmyBuilder({ army, setArmy, onEnterBattle }: ArmyBuilderProps) {
  const [filterFaction, setFilterFaction] = useState<FactionID | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state management (selectedUnit, isModalOpen)
  const [selectedUnit, setSelectedUnit] = useState<Squad | Machine | null>(null);
  const [selectedUnitType, setSelectedUnitType] = useState<'squad' | 'machine'>('squad');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Unit count badges and error state
  const [addError, setAddError] = useState<string | null>(null);
  const unitCounts = useMemo(() => {
    return countByUnitType(army.units);
  }, [army.units]);

  const selectedFactionData = typedFactions.find(f => f.id === army.faction) as Faction & { symbol: string } | undefined;

  const exportArmy = () => {
    const data = JSON.stringify(army, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `army-${army.faction}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importArmy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        setArmy(imported);
      } catch (err) {
        alert('Ошибка при импорте файла');
      }
    };
    reader.readAsText(file);
  };

  const addUnit = (unit: Squad | Machine, type: 'squad' | 'machine') => {
    // Validate 99-unit limit
    const validation = validateAddUnit(army, unit.id);
    if (!validation.valid) {
      setAddError(validation.error);
      setTimeout(() => setAddError(null), 3000);
      return;
    }
    setAddError(null);

    // Calculate instance number for this unit type
    const existingUnitsOfType = army.units.filter(u => u.data.id === unit.id);
    const instanceNumber = existingUnitsOfType.length + 1;

    const newUnit: ArmyUnit = {
      instanceId: `${unit.id}-${Date.now()}`,
      type,
      data: unit,
      instanceNumber,
      currentDurability: type === 'machine' ? (unit as Machine).durability_max : undefined,
      currentAmmo: type === 'machine' ? (unit as Machine).ammo_max : undefined,
      deadSoldiers: [],
      actionsUsed: type === 'squad'
        ? Array((unit as Squad).soldiers.length).fill({ moved: false, shot: false, melee: false, done: false })
        : [{ moved: false, shot: false, melee: false, done: false }],
      machineShotsUsed: type === 'machine' ? 0 : undefined,
      machineWeaponShots: type === 'machine' ? {} : undefined
    };

    setArmy({
      ...army,
      units: [...army.units, newUnit],
      totalCost: army.totalCost + unit.cost
    });
  };

  const removeUnit = (instanceId: string) => {
    const unitToRemove = army.units.find(u => u.instanceId === instanceId);
    if (!unitToRemove) return;

    setArmy({
      ...army,
      units: army.units.filter(u => u.instanceId !== instanceId),
      totalCost: army.totalCost - unitToRemove.data.cost
    });
  };

  // T022: Add click handler to squad/machine cards to open modal with unit data
  const handleUnitClick = (unit: Squad | Machine, type: 'squad' | 'machine') => {
    setSelectedUnit(unit);
    setSelectedUnitType(type);
    setIsModalOpen(true);
  };

  const filteredSquads = typedSquads.filter(s =>
    (filterFaction === 'all' || s.faction === filterFaction) &&
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMachines = typedMachines.filter(m =>
    (filterFaction === 'all' || m.faction === filterFaction) &&
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if we're in guided flow mode
  if (army.currentStep === 'faction-select' || army.currentStep === 'unit-select') {
    // Guided flow - render new components
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {army.currentStep === 'faction-select' && (
          <div className="space-y-8">
            <FactionSelector
              factions={typedFactions}
              selectedFaction={army.faction}
              onFactionSelect={(factionId) => setArmy({ ...army, faction: factionId })}
            />
            {army.faction && (
              <PointBudgetInput
                presets={[250, 350, 500, 1000]}
                value={army.pointBudget}
                onChange={(budget) => setArmy({
                  ...army,
                  pointBudget: budget,
                  currentStep: 'unit-select',
                })}
              />
            )}
          </div>
        )}

        {army.currentStep === 'unit-select' && army.pointBudget && (
          <UnitSelector
            factions={typedFactions}
            squads={typedSquads}
            selectedFaction={army.faction}
            pointBudget={army.pointBudget}
            army={army.units}
            onAddUnit={(squad) => {
              // Calculate instance number for this unit type
              const existingUnitsOfType = army.units.filter(u => u.data.id === squad.id);
              const instanceNumber = existingUnitsOfType.length + 1;

              const newUnit: ArmyUnit = {
                instanceId: `${squad.id}_${Date.now()}`,
                type: 'squad',
                data: squad,
                instanceNumber,
                currentDurability: undefined,
                currentAmmo: undefined,
                deadSoldiers: [],
                actionsUsed: Array(squad.soldiers.length).fill({
                  moved: false,
                  shot: false,
                  melee: false,
                  done: false,
                }),
              };
              setArmy({
                ...army,
                units: [...army.units, newUnit],
                totalCost: army.totalCost + squad.cost,
              });
            }}
            onRemoveUnit={(instanceId) => {
              const unitToRemove = army.units.find(u => u.instanceId === instanceId);
              if (!unitToRemove) return;
              setArmy({
                ...army,
                units: army.units.filter(u => u.instanceId !== instanceId),
                totalCost: army.totalCost - unitToRemove.data.cost,
              });
            }}
            onToBattle={onEnterBattle || (() => {
              setArmy({
                ...army,
                isInBattle: true,
                currentStep: 'battle',
              });
            })}
            onBackToFactionSelect={() => {
              setArmy({
                ...army,
                units: [],
                totalCost: 0,
                pointBudget: undefined,
                currentStep: 'faction-select',
              });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 h-full max-w-7xl mx-auto">
      {/* Available Units Panel */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="glass-strong p-4 md:p-5 rounded-2xl shadow-xl border border-slate-700/50">
          <h2 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20">
              <Plus className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
            <span className="hidden sm:inline">Доступные отряды и техника</span>
            <span className="sm:hidden">Отряды</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full bg-slate-800 border-2 border-slate-600 text-white rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-slate-800 border-2 border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer min-h-[44px]"
              value={filterFaction}
              onChange={(e) => setFilterFaction(e.target.value as FactionID | 'all')}
            >
              <option value="all">Все фракции</option>
              {typedFactions.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Error message for unit limit */}
          {addError && (
            <div className="text-red-500 text-sm mb-4 animate-pulse">
              {addError}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 overflow-y-auto max-h-[55vh] lg:max-h-[60vh] pr-2 custom-scrollbar">
            {/* Squads */}
            {filteredSquads.map(s => {
              const f = typedFactions.find(fac => fac.id === s.faction);
              const FactionIcon = factionIcons[(f as any)?.symbol || 'Shield'];
              return (
                <div
                  key={s.id}
                  onClick={() => handleUnitClick(s, 'squad')}
                  className="group relative bg-slate-700/40 hover:bg-slate-700/60 p-3 md:p-4 pr-14 rounded-xl border border-slate-600/50 hover:border-blue-500/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                >
                  <div
                    className="absolute top-0 left-0 w-1.5 h-full rounded-r-full transition-all duration-200 group-hover:w-2 pointer-events-none"
                    style={{ backgroundColor: f?.color }}
                  />
                  {s.image && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                      <img src={s.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="relative z-10 pl-3 min-w-0 flex-1 pointer-events-none">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FactionIcon className="w-4 h-4 flex-shrink-0" style={{ color: f?.color }} />
                      <span className="font-semibold text-sm md:text-base truncate">{s.name}</span>
                    </div>
                    <div className="text-[10px] md:text-xs opacity-60 flex gap-2 uppercase font-bold tracking-tight">
                      <span style={{ color: f?.color }}>{f?.name}</span>
                      <span>•</span>
                      <span>{s.cost} оч.</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addUnit(s, 'squad');
                    }}
                    className="absolute top-3 right-3 z-20 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 active:scale-95 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center relative"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center z-30 border-2 border-slate-900">
                      {unitCounts[s.id] || 0}
                    </span>
                  </button>
                </div>
              );
            })}

            {/* Machines */}
            {filteredMachines.map(m => {
              const f = typedFactions.find(fac => fac.id === m.faction);
              const FactionIcon = factionIcons[(f as any)?.symbol || 'Shield'];
              return (
                // T038: Add click handler to machine cards to open modal with machine data
                <div
                  key={m.id}
                  onClick={() => handleUnitClick(m, 'machine')}
                  className="group relative bg-slate-700/40 hover:bg-slate-700/60 p-3 md:p-4 pr-14 rounded-xl border border-slate-600/50 hover:border-orange-500/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                >
                  <div
                    className="absolute top-0 left-0 w-1.5 h-full rounded-r-full transition-all duration-200 group-hover:w-2 pointer-events-none"
                    style={{ backgroundColor: f?.color }}
                  />
                  {m.image && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                      <img src={m.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="relative z-10 pl-3 min-w-0 flex-1 pointer-events-none">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FactionIcon className="w-4 h-4 flex-shrink-0" style={{ color: f?.color }} />
                      <span className="font-semibold text-sm md:text-base truncate">{m.name}</span>
                    </div>
                    <div className="text-[10px] md:text-xs opacity-60 flex gap-2 uppercase font-bold tracking-tight">
                      <span style={{ color: f?.color }}>{f?.name}</span>
                      <span>•</span>
                      <span>{m.cost} оч.</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addUnit(m, 'machine');
                    }}
                    className="absolute top-3 right-3 z-20 bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg transition-all shadow-lg shadow-orange-900/40 hover:shadow-orange-900/60 active:scale-95 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center relative"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center z-30 border-2 border-slate-900">
                      {unitCounts[m.id] || 0}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Army Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Faction Lore Card */}
        {selectedFactionData && (
          <div className="glass-strong p-4 md:p-5 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden relative group">
            <div
              className="absolute top-0 right-0 w-40 h-40 -mr-16 -mt-16 opacity-5 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 flex items-center justify-center"
              style={{ backgroundColor: selectedFactionData.color, borderRadius: '50%' }}
            >
              {(() => {
                const Icon = factionIcons[selectedFactionData.symbol];
                return Icon ? <Icon className="w-20 h-20 text-white" /> : null;
              })()}
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Досье фракции
            </h3>
            <div className="relative">
              <div className="text-lg md:text-xl font-bold mb-2 flex items-center gap-2" style={{ color: selectedFactionData.color }}>
                {(() => {
                  const Icon = factionIcons[selectedFactionData.symbol];
                  return Icon ? <Icon className="w-5 h-5 md:w-6 md:h-6" /> : null;
                })()}
                {selectedFactionData.name}
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-60 mb-4">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3.5 md:w-3.5" /> {selectedFactionData.homeWorld}</span>
                <span>•</span>
                <span className="italic flex items-center gap-1"><Quote className="w-3 h-3.5 md:w-3.5" /> {selectedFactionData.motto}</span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed opacity-80 mb-4">
                {selectedFactionData.description}
              </p>
              <select
                className="w-full bg-slate-800 border-2 border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                value={army.faction}
                onChange={(e) => {
                  const newFaction = e.target.value as FactionID;
                  setArmy({ ...army, faction: newFaction });
                  setFilterFaction(newFaction);
                }}
              >
                {typedFactions.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="glass-strong p-4 md:p-5 rounded-2xl shadow-xl border border-slate-700/50 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-600/20">
                <Box className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              </div>
              <span className="hidden sm:inline">Ваша армия</span>
              <span className="sm:hidden">Армия</span>
            </h2>
            <span className="text-sm bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/50 font-bold">
              {army.units.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {army.units.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-6">
                <div className="p-4 rounded-full bg-slate-800/50 mb-3">
                  <Users className="w-12 h-12" />
                </div>
                <p className="text-sm">Армия пока пуста.</p>
                <p className="text-xs opacity-60 mt-1">Добавьте отряды из списка слева</p>
              </div>
            ) : (
              army.units.map((unit) => {
                const f = typedFactions.find(fac => fac.id === unit.data.faction);
                const FactionIcon = factionIcons[(f as any)?.symbol || 'Shield'];
                return (
                  <div key={unit.instanceId} className="group bg-slate-900/50 hover:bg-slate-900/70 p-3 rounded-xl border border-slate-700/50 hover:border-red-500/50 flex justify-between items-center relative overflow-hidden transition-all duration-200">
                    <div
                      className="absolute top-0 left-0 w-1.5 h-full rounded-r-full transition-all duration-200 group-hover:w-2"
                      style={{ backgroundColor: f?.color }}
                    />
                    <div className="min-w-0 pl-3 flex-1">
                      <div className="text-sm md:text-base font-medium truncate flex items-center gap-2 mb-1">
                        <FactionIcon className="w-4 h-4 opacity-40 flex-shrink-0" style={{ color: f?.color }} />
                        {unit.data.name}
                      </div>
                      <div className="text-[10px] md:text-xs opacity-50 flex gap-2 font-bold">
                        <span style={{ color: f?.color }}>{f?.name}</span>
                        <span>•</span>
                        <span>{unit.data.cost} оч.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUnit(unit.instanceId)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-950/30 p-2 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                      title="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm opacity-60">Всего очков:</span>
              <span className={`text-2xl font-black px-3 py-1 rounded-lg ${
                army.totalCost > 1000
                  ? 'text-orange-400 bg-orange-950/30 border border-orange-900/30'
                  : 'text-green-400 bg-green-950/30 border border-green-900/30'
              }`}>
                {army.totalCost}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={exportArmy}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-700/50 hover:bg-slate-600 rounded-xl text-sm font-medium transition-all active:scale-95 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Экспорт</span>
              </button>
              <label className="flex items-center justify-center gap-2 py-2.5 bg-slate-700/50 hover:bg-slate-600 rounded-xl text-sm font-medium transition-all cursor-pointer active:scale-95 min-h-[44px]">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Импорт</span>
                <input type="file" className="hidden" onChange={importArmy} accept=".json" />
              </label>
            </div>

            <button
              onClick={() => setArmy({ ...army, units: [], totalCost: 0 })}
              className="w-full py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] font-medium"
              disabled={army.units.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Очистить список</span>
              <span className="sm:hidden">Очистить</span>
            </button>
          </div>
        </div>
      </div>

      {/* T024: Import and render UnitDetailsModal */}
      {selectedUnit && selectedFactionData && (
        <UnitDetailsModal
          unit={selectedUnit}
          unitType={selectedUnitType}
          faction={selectedFactionData}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
