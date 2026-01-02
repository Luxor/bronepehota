'use client';

import { useState } from 'react';
import { Army, ArmyUnit, FactionID, Faction, Squad, Machine } from '@/lib/types';
import squadsData from '@/data/squads.json';
import machinesData from '@/data/machines.json';
import factionsData from '@/data/factions.json';
import { Plus, Trash2, Shield, Sword, Cpu, Box, Search, Download, Upload, Info, Globe, Quote, Users, Zap, Skull, LucideIcon } from 'lucide-react';

interface ArmyBuilderProps {
  army: Army;
  setArmy: (army: Army) => void;
}

const factionIcons: Record<string, LucideIcon> = {
  Shield,
  Zap,
  Skull
};

export default function ArmyBuilder({ army, setArmy }: ArmyBuilderProps) {
  const [filterFaction, setFilterFaction] = useState<FactionID | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedFactionData = factionsData.find(f => f.id === army.faction) as Faction & { symbol: string } | undefined;

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
    const newUnit: ArmyUnit = {
      instanceId: `${unit.id}-${Date.now()}`,
      type,
      data: unit,
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

  const filteredSquads = (squadsData as Squad[]).filter(s => 
    (filterFaction === 'all' || s.faction === filterFaction) &&
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMachines = (machinesData as Machine[]).filter(m => 
    (filterFaction === 'all' || m.faction === filterFaction) &&
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 md:p-4 flex flex-col md:flex-row gap-3 md:gap-6 h-full max-w-7xl mx-auto">
      {/* Available Units Panel */}
      <div className="flex-1 flex flex-col gap-3 md:gap-4">
        <div className="bg-slate-800 p-3 md:p-4 rounded-xl shadow-lg border border-slate-700">
          <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            <span className="hidden sm:inline">Доступные отряды и техника</span>
            <span className="sm:hidden">Отряды</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-3 md:mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 md:py-2 pl-8 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-slate-900 border border-slate-700 rounded-md py-2 px-2 md:px-4 text-xs md:text-sm"
              value={filterFaction}
              onChange={(e) => setFilterFaction(e.target.value as FactionID | 'all')}
            >
              <option value="all">Все</option>
              {factionsData.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {/* Squads */}
            {filteredSquads.map(s => {
              const f = factionsData.find(fac => fac.id === s.faction);
              const FactionIcon = factionIcons[(f as any)?.symbol || 'Shield'];
              return (
                <div key={s.id} className="bg-slate-700/50 p-2 md:p-3 rounded-lg border border-slate-600 md:hover:border-blue-500 transition-colors flex justify-between items-center group relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-1 h-full" 
                    style={{ backgroundColor: f?.color }}
                  />
                  {s.image && (
                    <div className="absolute inset-0 opacity-0 md:group-hover:opacity-10 transition-opacity pointer-events-none">
                      <img src={s.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="relative z-10 pl-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <FactionIcon className="w-3 h-3 opacity-50 flex-shrink-0" style={{ color: f?.color }} />
                      <span className="font-semibold text-xs md:text-sm truncate">{s.name}</span>
                    </div>
                    <div className="text-[9px] md:text-[10px] opacity-60 flex gap-1.5 md:gap-2 uppercase font-bold tracking-tight">
                      <span className="hidden sm:inline" style={{ color: f?.color }}>{f?.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{s.cost} оч.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addUnit(s, 'squad')}
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 md:p-2 rounded-md transition-all relative z-10 shadow-lg shadow-blue-900/40 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Machines */}
            {filteredMachines.map(m => {
              const f = factionsData.find(fac => fac.id === m.faction);
              const FactionIcon = factionIcons[(f as any)?.symbol || 'Shield'];
              return (
                <div key={m.id} className="bg-slate-700/50 p-2 md:p-3 rounded-lg border border-slate-600 md:hover:border-orange-500 transition-colors flex justify-between items-center group relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-1 h-full" 
                    style={{ backgroundColor: f?.color }}
                  />
                  {m.image && (
                    <div className="absolute inset-0 opacity-0 md:group-hover:opacity-10 transition-opacity pointer-events-none">
                      <img src={m.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="relative z-10 pl-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <FactionIcon className="w-3 h-3 opacity-50 flex-shrink-0" style={{ color: f?.color }} />
                      <span className="font-semibold text-xs md:text-sm truncate">{m.name}</span>
                    </div>
                    <div className="text-[9px] md:text-[10px] opacity-60 flex gap-1.5 md:gap-2 uppercase font-bold tracking-tight">
                      <span className="hidden sm:inline" style={{ color: f?.color }}>{f?.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{m.cost} оч.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addUnit(m, 'machine')}
                    className="bg-orange-600 hover:bg-orange-500 text-white p-2 md:p-2 rounded-md transition-all relative z-10 shadow-lg shadow-orange-900/40 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Army Panel */}
      <div className="w-full md:w-80 flex flex-col gap-3 md:gap-4">
        {/* Faction Lore Card */}
        {selectedFactionData && (
          <div className="hidden md:block bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 overflow-hidden relative group">
            <div 
              className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-110 flex items-center justify-center"
              style={{ backgroundColor: selectedFactionData.color, borderRadius: '50%' }}
            >
              {(() => {
                const Icon = factionIcons[selectedFactionData.symbol];
                return Icon ? <Icon className="w-16 h-16 text-white opacity-20" /> : null;
              })()}
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Досье фракции
            </h3>
            <div className="relative">
              <div className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: selectedFactionData.color }}>
                {(() => {
                  const Icon = factionIcons[selectedFactionData.symbol];
                  return Icon ? <Icon className="w-5 h-5" /> : null;
                })()}
                {selectedFactionData.name}
              </div>
              <div className="flex items-center gap-2 text-[10px] opacity-60 mb-3">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {selectedFactionData.homeWorld}</span>
                <span>•</span>
                <span className="italic flex items-center gap-1"><Quote className="w-3 h-3" /> {selectedFactionData.motto}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-80 mb-3">
                {selectedFactionData.description}
              </p>
              <div className="flex gap-2">
                <select 
                  className="bg-slate-900 border border-slate-700 rounded p-1 text-[10px] flex-1"
                  value={army.faction}
                  onChange={(e) => setArmy({ ...army, faction: e.target.value as FactionID })}
                >
                  {factionsData.map(f => (
                    <option key={f.id} value={f.id}>Сменить штаб на {f.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800 p-3 md:p-4 rounded-xl shadow-lg border border-slate-700 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <Box className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              <span className="hidden sm:inline">Ваша армия</span>
              <span className="sm:hidden">Армия</span>
            </h2>
            <span className="text-xs bg-slate-900 px-2 py-1 rounded-full border border-slate-700">
              {army.units.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {army.units.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-4">
                <Users className="w-12 h-12 mb-2" />
                <p className="text-sm">Армия пока пуста. Добавьте отряды слева.</p>
              </div>
            ) : (
              army.units.map((unit) => {
                const f = factionsData.find(fac => fac.id === unit.data.faction);
                const FactionIcon = factionIcons[(f as any)?.symbol || 'Shield'];
                return (
                  <div key={unit.instanceId} className="bg-slate-900/50 p-2 md:p-3 rounded-lg border border-slate-700 flex justify-between items-center group relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 w-1 h-full" 
                      style={{ backgroundColor: f?.color }}
                    />
                    <div className="min-w-0 pl-2 flex-1">
                      <div className="text-xs md:text-sm font-medium truncate flex items-center gap-1.5">
                        <FactionIcon className="w-3 h-3 opacity-40 flex-shrink-0" style={{ color: f?.color }} />
                        {unit.data.name}
                      </div>
                      <div className="text-[9px] md:text-[10px] opacity-50 flex gap-1.5 md:gap-2 font-bold">
                        <span className="hidden sm:inline" style={{ color: f?.color }}>{f?.name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{unit.data.cost} оч.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUnit(unit.instanceId)}
                      className="text-slate-500 hover:text-red-400 p-2 md:p-1 rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-60">Всего очков:</span>
              <span className="text-xl font-bold">{army.totalCost}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportArmy}
                className="flex items-center justify-center gap-1 md:gap-2 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors min-h-[44px]"
              >
                <Download className="w-4 h-4 md:w-3 md:h-3" />
                <span className="hidden sm:inline">Экспорт</span>
              </button>
              <label className="flex items-center justify-center gap-1 md:gap-2 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors cursor-pointer min-h-[44px]">
                <Upload className="w-4 h-4 md:w-3 md:h-3" />
                <span className="hidden sm:inline">Импорт</span>
                <input type="file" className="hidden" onChange={importArmy} accept=".json" />
              </label>
            </div>

            <button
              onClick={() => setArmy({ ...army, units: [], totalCost: 0 })}
              className="w-full py-2 text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              disabled={army.units.length === 0}
            >
              <Trash2 className="w-4 h-4 md:w-3 md:h-3" />
              <span className="hidden sm:inline">Очистить список</span>
              <span className="sm:hidden">Очистить</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
