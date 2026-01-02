'use client';

import { useState, useEffect } from 'react';
import { Army, ArmyUnit, Squad, Machine } from '@/lib/types';
import UnitCard from './UnitCard';
import DiceRoller from './DiceRoller';
import CombatAssistant from './CombatAssistant';
import { LayoutGrid, Target, Dices, RotateCcw, Users, X, Info, ChevronLeft, ChevronRight, Maximize2, Minimize2, CheckCircle2, Bomb, Heart, UserX } from 'lucide-react';
import { rollDie } from '@/lib/game-logic';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GameSessionProps {
  army: Army;
  setArmy: (army: Army) => void;
}

export default function GameSession({ army, setArmy }: GameSessionProps) {
  const [activeTab, setActiveTab] = useState<'units' | 'combat'>('units');
  const [showInitiative, setShowInitiative] = useState(false);
  const [initRoll, setInitRoll] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  
  // New state for focused view
  const [viewMode, setViewMode] = useState<'grid' | 'focused'>('focused');
  const [focusedUnitIdx, setFocusedUnitIdx] = useState(0);

  const updateUnit = (updatedUnit: ArmyUnit) => {
    setArmy({
      ...army,
      units: army.units.map(u => u.instanceId === updatedUnit.instanceId ? updatedUnit : u)
    });
  };

  const calculateInitiative = () => {
    setIsRolling(true);
    setShowInitiative(true);
    
    let count = 0;
    const interval = setInterval(() => {
      setInitRoll(rollDie(6));
      count++;
      if (count > 10) {
        clearInterval(interval);
        const final = rollDie(6);
        setInitRoll(final);
        setIsRolling(false);
      }
    }, 50);
  };

  const startNewTurn = () => {
    setArmy({
      ...army,
      units: army.units.map(u => {
        if (u.type === 'squad') {
          return {
            ...u,
            actionsUsed: (u.data as Squad).soldiers.map(() => ({ moved: false, shot: false, melee: false, done: false }))
          };
        } else {
          return {
            ...u,
            isMachineMoved: false,
            isMachineShot: false,
            isMachineMelee: false,
            isMachineDone: false,
            machineShotsUsed: 0,
            machineWeaponShots: {}
          };
        }
      })
    });
    setShowInitiative(false);
    setFocusedUnitIdx(0);
  };

  const activeUnitsCount = army.units.filter(u => {
    if (u.type === 'squad') {
      return (u.deadSoldiers?.length || 0) < (u.data as Squad).soldiers.length;
    }
    return (u.currentDurability || 0) > 0;
  }).length;

  const nextUnit = () => setFocusedUnitIdx((prev) => (prev + 1) % army.units.length);
  const prevUnit = () => setFocusedUnitIdx((prev) => (prev - 1 + army.units.length) % army.units.length);

  // Helper to get unit status for summary
  const getUnitStatus = (unit: ArmyUnit) => {
    const isSquad = unit.type === 'squad';
    const isDead = isSquad 
      ? (unit.deadSoldiers?.length || 0) === (unit.data as Squad).soldiers.length
      : (unit.currentDurability || 0) === 0;
    const isDone = isSquad
      ? (unit.data as Squad).soldiers.every((_, idx) => unit.deadSoldiers?.includes(idx) || unit.actionsUsed?.[idx]?.done)
      : unit.isMachineDone;
    
    return { isDead, isDone };
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Initiative Modal */}
      {showInitiative && (
        <div className="absolute inset-0 z-[100] bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Бросок Инициативы</h3>
            <div className="flex justify-center">
              <div className={cn(
                "w-24 h-24 bg-slate-900 rounded-2xl border-2 border-blue-500/50 flex items-center justify-center text-5xl font-black shadow-lg transition-all",
                isRolling ? "scale-110 rotate-12" : "scale-100 rotate-0"
              )}>
                {initRoll}
              </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-50 uppercase font-bold">Боеспособных отрядов:</span>
                <span className="text-blue-400 font-black">{activeUnitsCount}</span>
              </div>
            </div>
            <button onClick={startNewTurn} disabled={isRolling} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-bold text-lg shadow-lg">
              НАЧАТЬ ТУР
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900 border-b border-slate-800 p-1 shrink-0">
        <button
          onClick={() => setActiveTab('units')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all min-h-[44px]",
            activeTab === 'units' ? "bg-slate-800 text-blue-400 shadow-inner" : "text-slate-500"
          )}
        >
          <Users className="w-5 h-5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Войска</span>
        </button>
        <button
          onClick={() => setActiveTab('combat')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all min-h-[44px]",
            activeTab === 'combat' ? "bg-slate-800 text-orange-400 shadow-inner" : "text-slate-500"
          )}
        >
          <Target className="w-5 h-5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Атака</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'units' ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Toolbar */}
            <div className="px-2 md:px-4 py-2 flex justify-between items-center bg-slate-900/50 border-b border-slate-800 shrink-0">
              <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('focused')}
                  className={cn("p-2 md:p-1.5 rounded-md transition-all min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center", viewMode === 'focused' ? "bg-blue-600 text-white shadow-md" : "text-slate-400")}
                  title="Фокус"
                >
                  <Maximize2 className="w-5 h-5 md:w-4 md:h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 md:p-1.5 rounded-md transition-all min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center", viewMode === 'grid' ? "bg-blue-600 text-white shadow-md" : "text-slate-400")}
                  title="Сетка"
                >
                  <LayoutGrid className="w-5 h-5 md:w-4 md:h-4" />
                </button>
              </div>
              <button
                onClick={calculateInitiative}
                className="flex items-center gap-1 md:gap-2 text-[9px] md:text-[10px] font-black uppercase bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 md:px-3 py-2 md:py-1.5 rounded-full transition-all active:scale-95 min-h-[44px] md:min-h-0"
              >
                <RotateCcw className="w-4 h-4 md:w-3 md:h-3" />
                <span className="hidden sm:inline">Новый Тур</span>
                <span className="sm:hidden">Тур</span>
              </button>
            </div>

            {/* Quick Summary Navigation (Mobile) */}
            <div className="bg-slate-900/80 border-b border-slate-800 overflow-x-auto custom-scrollbar flex p-1.5 md:p-2 gap-1.5 md:gap-2 shrink-0">
              {army.units.map((unit, idx) => {
                const { isDead, isDone } = getUnitStatus(unit);
                const isActive = focusedUnitIdx === idx && viewMode === 'focused';
                
                return (
                  <button
                    key={unit.instanceId}
                    onClick={() => { setFocusedUnitIdx(idx); setViewMode('focused'); }}
                    className={cn(
                      "shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden min-w-[44px] min-h-[44px]",
                      isActive ? "border-blue-500 bg-blue-900/20 scale-105" : "border-slate-700 bg-slate-800 opacity-60",
                      isDead ? "border-red-900/50 bg-red-950/20 opacity-30" : "",
                      isDone && !isDead ? "border-green-900/50 bg-green-950/20" : ""
                    )}
                  >
                    {/* Tiny visual representation */}
                    <div className="text-[9px] md:text-[10px] font-black">{idx + 1}</div>
                    <div className="flex gap-0.5 mt-0.5">
                      {unit.type === 'squad' ? (
                        <Users className="w-2.5 h-2.5 md:w-2 md:h-2" />
                      ) : (
                        <Dices className="w-2.5 h-2.5 md:w-2 md:h-2" />
                      )}
                    </div>
                    {/* Status Overlays */}
                    {isDone && !isDead && <CheckCircle2 className="w-3 h-3 text-green-500 absolute -top-0.5 -right-0.5 bg-slate-900 rounded-full" />}
                    {isDead && <UserX className="w-3 h-3 text-red-500 absolute -top-0.5 -right-0.5 bg-slate-900 rounded-full" />}
                  </button>
                );
              })}
            </div>

            {/* Units Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {viewMode === 'focused' ? (
                /* Focused Carousel View */
                <div className="flex-1 flex flex-col p-4 gap-4 min-h-0">
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <div className={cn(
                      "w-full h-full overflow-y-auto custom-scrollbar rounded-xl border border-slate-800 bg-slate-900/30 shadow-2xl",
                      army.units[focusedUnitIdx]?.type === 'machine' ? "max-w-4xl" : "max-w-lg"
                    )}>
                      {army.units.length > 0 && (
                        <UnitCard 
                          unit={army.units[focusedUnitIdx]} 
                          updateUnit={updateUnit} 
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Carousel Controls */}
                  <div className="flex items-center justify-between gap-2 md:gap-4 shrink-0 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl">
                    <button 
                      onClick={prevUnit}
                      className="p-3 md:p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center flex-1 min-w-0">
                      <div className="text-[9px] md:text-[10px] font-black uppercase opacity-40 tracking-widest mb-1 truncate px-2">
                        {army.units[focusedUnitIdx]?.data.name}
                      </div>
                      <div className="text-xs md:text-sm font-black text-blue-400">{focusedUnitIdx + 1} / {army.units.length}</div>
                    </div>
                    <button 
                      onClick={nextUnit}
                      className="p-3 md:p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Classic Grid View */
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {army.units.map((unit, idx) => (
                      <div 
                        key={unit.instanceId} 
                        onClick={() => { setFocusedUnitIdx(idx); setViewMode('focused'); }}
                        className={cn(
                          "cursor-pointer transition-transform active:scale-[0.98]",
                          unit.type === 'machine' ? "md:col-span-2 lg:col-span-2" : ""
                        )}
                      >
                        <UnitCard 
                          unit={unit} 
                          updateUnit={updateUnit} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Combat Assistant Tab */
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <CombatAssistant />
          </div>
        )}
      </div>
    </div>
  );
}
