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
  const [showInitiative, setShowInitiative] = useState(false);
  const [initRoll, setInitRoll] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [showCombat, setShowCombat] = useState(false);

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
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Initiative Modal */}
      {showInitiative && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-2 md:p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-strong border-2 border-blue-500/20 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 md:space-y-6 animate-in zoom-in duration-300 mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter text-blue-400 leading-tight">Бросок Инициативы</h3>
            <div className="flex justify-center">
              <div className={cn(
                "w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl md:rounded-3xl border-4 border-blue-500/50 flex items-center justify-center text-4xl md:text-6xl font-black shadow-2xl transition-all",
                isRolling ? "scale-110 rotate-12 shadow-blue-500/30" : "scale-100 rotate-0"
              )}>
                {initRoll}
              </div>
            </div>
            <div className="bg-slate-900/50 p-3 md:p-4 rounded-xl border border-slate-700/50 space-y-2">
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="opacity-50 uppercase font-bold tracking-wider text-left">Боеспособных:</span>
                <span className="text-blue-400 font-black text-base md:text-lg">{activeUnitsCount}</span>
              </div>
            </div>
            <button onClick={startNewTurn} disabled={isRolling} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg shadow-lg shadow-blue-900/50 transition-all active:scale-95">
              НАЧАТЬ ТУР
            </button>
          </div>
        </div>
      )}

      {/* Unified Top Bar with Controls and Unit Navigation */}
      <div className="bg-slate-900/90 border-b border-slate-800/50 shrink-0">
        {/* Top Row: View toggle, New Turn, Combat toggle */}
        <div className="flex items-center justify-between px-2 md:px-3 py-2 gap-1 md:gap-2 border-b border-slate-800/30">
          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/50 shrink-0">
            <button
              onClick={() => setViewMode('focused')}
              className={cn("p-1.5 md:p-2 rounded-lg transition-all flex items-center justify-center", viewMode === 'focused' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700")}
              title="Фокус"
            >
              <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 md:p-2 rounded-lg transition-all flex items-center justify-center", viewMode === 'grid' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700")}
              title="Сетка"
            >
              <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>

          {/* New Turn Button */}
          <button
            onClick={calculateInitiative}
            className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-black uppercase bg-blue-600/20 text-blue-400 border border-blue-500/40 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all hover:bg-blue-600/30 active:scale-95 shadow-lg shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Новый Тур</span>
          </button>

          {/* Combat Toggle */}
          <button
            onClick={() => setShowCombat(!showCombat)}
            className={cn(
              "flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-black uppercase px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all border shrink-0",
              showCombat
                ? "bg-orange-600/20 text-orange-400 border-orange-500/40"
                : "bg-slate-800/50 text-slate-500 border-slate-700/50 hover:text-slate-300"
            )}
          >
            <Target className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Атака</span>
          </button>
        </div>

        {/* Unit Navigation Row with Arrows */}
        <div className="flex items-center gap-2 px-2 py-2 min-h-[52px]">
          {/* Prev Button */}
          <button
            onClick={prevUnit}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-300 active:scale-90 transition-all min-w-[36px] h-9 flex items-center justify-center border border-slate-700/50 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Unit Cards Scrollable */}
          <div className="flex-1 overflow-x-auto flex gap-1.5 min-w-0 overflow-y-hidden">
            {army.units.map((unit, idx) => {
              const { isDead, isDone } = getUnitStatus(unit);
              const isActive = focusedUnitIdx === idx && viewMode === 'focused' && !showCombat;

              // Calculate health percentage for visual bar
              let healthPercent = 100;
              if (unit.type === 'squad') {
                const total = (unit.data as Squad).soldiers.length;
                const dead = unit.deadSoldiers?.length || 0;
                healthPercent = ((total - dead) / total) * 100;
              } else {
                const max = (unit.data as Machine).durability_max;
                const current = unit.currentDurability || 0;
                healthPercent = (current / max) * 100;
              }

              return (
                <button
                  key={unit.instanceId}
                  onClick={() => { setFocusedUnitIdx(idx); setViewMode('focused'); setShowCombat(false); }}
                  className={cn(
                    "shrink-0 w-14 h-9 rounded-lg border flex flex-row items-center justify-center gap-1 transition-all relative overflow-hidden min-w-[44px]",
                    isActive
                      ? "border-blue-500 bg-blue-900/30 scale-105 shadow-lg shadow-blue-900/30"
                      : "border-slate-700/50 bg-slate-800/50 opacity-70 hover:opacity-100",
                    isDead ? "border-red-900/50 bg-red-950/20" : "",
                    isDone && !isDead ? "border-green-900/50 bg-green-950/30" : ""
                  )}
                >
                  {/* Unit Number */}
                  <div className="text-sm md:text-base font-black relative z-10">{idx + 1}</div>

                  {/* Unit Type Icon */}
                  {unit.type === 'squad' ? (
                    <Users className="w-3 h-3 relative z-10" />
                  ) : (
                    <Dices className="w-3 h-3 relative z-10" />
                  )}

                  {/* Status dot */}
                  <div className={cn(
                    "absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full",
                    isDead ? "bg-red-500" : isDone ? "bg-green-500" : "bg-blue-500"
                  )} />

                  {/* Health bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900/50">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${healthPercent}%`,
                        backgroundColor: isDead ? '#ef4444' : isDone ? '#22c55e' : '#3b82f6'
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={nextUnit}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-slate-300 active:scale-90 transition-all min-w-[36px] h-9 flex items-center justify-center border border-slate-700/50 shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 pb-12">
        {showCombat ? (
          /* Combat Assistant */
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <CombatAssistant />
          </div>
        ) : (
          /* Units View */
          <div className="flex-1 overflow-hidden flex flex-col">
            {viewMode === 'focused' ? (
              /* Focused Carousel View */
              <div className="flex-1 flex items-center justify-center p-4 md:p-6 min-h-0">
                <div className={cn(
                  "w-full h-full overflow-y-auto custom-scrollbar rounded-2xl border border-slate-800/50 bg-slate-900/30 shadow-2xl p-2",
                  army.units[focusedUnitIdx]?.type === 'machine' ? "max-w-6xl" : "max-w-2xl"
                )}>
                  {army.units.length > 0 && (
                    <UnitCard
                      unit={army.units[focusedUnitIdx]}
                      updateUnit={updateUnit}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Grid View */
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {army.units.map((unit, idx) => (
                    <div
                      key={unit.instanceId}
                      onClick={() => { setFocusedUnitIdx(idx); setViewMode('focused'); }}
                      className={cn(
                        "cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                        unit.type === 'machine' ? "md:col-span-2 lg:col-span-2 xl:col-span-2" : ""
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
        )}
      </div>

      {/* Status Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800/50 shadow-xl z-40">
        <div className="flex items-center justify-between px-3 py-2 text-[10px] md:text-xs uppercase font-bold tracking-wider">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span className="hidden sm:inline">Готов</span>
              <span className="sm:hidden">{army.units.filter(u => {
                const { isDead, isDone } = getUnitStatus(u);
                return isDone && !isDead;
              }).length}</span>
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span className="hidden sm:inline">Активен</span>
              <span className="sm:hidden">{army.units.filter(u => !getUnitStatus(u).isDead && !getUnitStatus(u).isDone).length}</span>
            </span>
            <span className="text-red-400 flex items-center gap-1">
              <UserX className="w-3 h-3" />
              <span className="hidden sm:inline">Потерян</span>
              <span className="sm:hidden">{army.units.filter(u => getUnitStatus(u).isDead).length}</span>
            </span>
          </div>
          <span className="text-slate-500">{army.units.length} <span className="hidden sm:inline">Всего</span></span>
        </div>
      </div>
    </div>
  );
}
