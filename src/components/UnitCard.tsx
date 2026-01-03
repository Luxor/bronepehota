'use client';

import { useState, useEffect } from 'react';
import { ArmyUnit, Squad, Machine, Soldier, Weapon, FactionID } from '@/lib/types';
import factionsData from '@/data/factions.json';
import { Shield, Sword, Move, Target, Heart, Zap, RotateCcw, ExternalLink, Crosshair, Dices, X, CheckCircle2, Bomb, ChevronDown, ChevronUp, UserX } from 'lucide-react';
import { calculateHit, calculateDamage, calculateMelee, executeRoll, rollDie } from '@/lib/game-logic';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UnitCardProps {
  unit: ArmyUnit;
  updateUnit: (unit: ArmyUnit) => void;
}

export default function UnitCard({ unit, updateUnit }: UnitCardProps) {
  const [showImage, setShowImage] = useState(false);
  const [isManualCollapsed, setIsManualCollapsed] = useState(false);
  const [activeCombatSoldier, setActiveCombatSoldier] = useState<number | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [combatType, setCombatType] = useState<'shot' | 'melee' | 'grenade'>('shot');
  const [shotDistance, setShotDistance] = useState(5);
  const [targetArmor, setTargetArmor] = useState(2);
  const [targetMelee, setTargetMelee] = useState(2);
  const [shotCover, setShotCover] = useState(0);
  const [shotResult, setShotResult] = useState<{ hit: any, damage: any } | null>(null);
  const [meleeResult, setMeleeResult] = useState<any | null>(null);

  // Animation states for dice
  const [isRolling, setIsRolling] = useState(false);
  const [displayRolls, setDisplayRolls] = useState<{hit?: number, power?: number[], meleeA?: number, meleeD?: number}>({});

  const isSquad = unit.type === 'squad';
  const data = unit.data;
  const faction = factionsData.find(f => f.id === data.faction);

  const isSquadDone = isSquad && (data as Squad).soldiers.every((_, idx) => {
    const isDead = unit.deadSoldiers?.includes(idx);
    const isDone = unit.actionsUsed?.[idx]?.done;
    return isDead || isDone;
  });

  const isAllDead = isSquad && unit.deadSoldiers?.length === (data as Squad).soldiers.length;
  const isMachineDestroyed = !isSquad && (unit.currentDurability === 0);
  const isMachineDone = !isSquad && (unit.isMachineDone || isMachineDestroyed);
  const isCollapsed = isManualCollapsed || isSquadDone || isMachineDone || isAllDead;

  const toggleAction = (soldierIdx: number, action: 'moved' | 'shot' | 'melee' | 'done') => {
    const newActions = [...(unit.actionsUsed || [])];
    newActions[soldierIdx] = {
      ...newActions[soldierIdx],
      [action]: !newActions[soldierIdx][action]
    };
    updateUnit({ ...unit, actionsUsed: newActions });
  };

  const toggleDead = (idx: number) => {
    const dead = unit.deadSoldiers || [];
    const newDead = dead.includes(idx) 
      ? dead.filter(i => i !== idx) 
      : [...dead, idx];
    updateUnit({ ...unit, deadSoldiers: newDead });
  };

  const updateMachineStat = (stat: 'durability' | 'ammo', delta: number) => {
    const max = stat === 'durability' ? (data as Machine).durability_max : (data as Machine).ammo_max;
    const current = stat === 'durability' ? unit.currentDurability! : unit.currentAmmo!;
    const newVal = Math.max(0, Math.min(max, current + delta));
    
    // Если прочность достигла 0, автоматически помечаем как уничтоженную
    if (stat === 'durability' && newVal === 0) {
      updateUnit({ ...unit, currentDurability: 0, isMachineDone: true });
    } else {
      updateUnit({ ...unit, [stat === 'durability' ? 'currentDurability' : 'currentAmmo']: newVal });
    }
  };

  const toggleMachineDestroyed = () => {
    if (unit.currentDurability === 0) {
      // Восстанавливаем до 1 HP
      updateUnit({ ...unit, currentDurability: 1, isMachineDone: false });
    } else {
      // Уничтожаем
      updateUnit({ ...unit, currentDurability: 0, isMachineDone: true });
    }
  };

  const getMachineSpeed = () => {
    if (!unit.currentDurability) return 0;
    const m = data as Machine;
    const sector = m.speed_sectors.find(s => unit.currentDurability! >= s.min_durability && unit.currentDurability! <= s.max_durability);
    return sector ? sector.speed : 0;
  };

  const handleOpenOriginal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (data.originalUrl) {
      window.open(data.originalUrl, '_blank');
    } else {
      setShowImage(true);
    }
  };

  const handleShot = async () => {
    if (activeCombatSoldier === null) return;
    setIsRolling(true);
    setShotResult(null);

    const soldier = (data as Squad).soldiers[activeCombatSoldier];
    
    // Hit roll animation
    for (let i = 0; i < 8; i++) {
      setDisplayRolls({ hit: rollDie(12) });
      await new Promise(r => setTimeout(r, 60));
    }

    const hit = calculateHit(soldier.range, shotDistance);
    setDisplayRolls({ hit: hit.total });
    await new Promise(r => setTimeout(r, 400));

    let damage = { damage: 0, rolls: [] as number[] };
    if (hit.success) {
      // Damage rolls animation
      const powerDice = soldier.power.includes('D12') ? 12 : soldier.power.includes('D20') ? 20 : 6;
      for (let i = 0; i < 8; i++) {
        setDisplayRolls({ hit: hit.total, power: [rollDie(powerDice), rollDie(powerDice)] });
        await new Promise(r => setTimeout(r, 60));
      }
      damage = calculateDamage(soldier.power, targetArmor + shotCover);
      setDisplayRolls({ hit: hit.total, power: damage.rolls });
    }

    setShotResult({ hit, damage });
    setIsRolling(false);
    
    const newActions = [...(unit.actionsUsed || [])];
    newActions[activeCombatSoldier] = { ...newActions[activeCombatSoldier], shot: true };
    updateUnit({ ...unit, actionsUsed: newActions });
  };

  const handleGrenadeThrow = async () => {
    if (activeCombatSoldier === null || unit.grenadesUsed) return;
    setIsRolling(true);
    setShotResult(null);

    // Range roll animation
    for (let i = 0; i < 8; i++) {
      setDisplayRolls({ hit: rollDie(6) });
      await new Promise(r => setTimeout(r, 60));
    }
    const distanceRoll = rollDie(6);
    setDisplayRolls({ hit: distanceRoll });
    await new Promise(r => setTimeout(r, 400));

    // Power roll animation (1D20)
    for (let i = 0; i < 8; i++) {
      setDisplayRolls({ hit: distanceRoll, power: [rollDie(20)] });
      await new Promise(r => setTimeout(r, 60));
    }
    const damageResult = calculateDamage("1D20", targetArmor + shotCover);
    setDisplayRolls({ hit: distanceRoll, power: damageResult.rolls });

    setShotResult({ 
      hit: { success: true, total: distanceRoll, roll: distanceRoll, isGrenade: true }, 
      damage: damageResult 
    });
    
    setIsRolling(false);
    const newActions = [...(unit.actionsUsed || [])];
    newActions[activeCombatSoldier] = { ...newActions[activeCombatSoldier], shot: true };
    updateUnit({ ...unit, grenadesUsed: true, actionsUsed: newActions });
  };

  const handleMeleeClick = async () => {
    if (activeCombatSoldier === null) return;
    setIsRolling(true);
    setMeleeResult(null);

    // Roll animation
    for (let i = 0; i < 10; i++) {
      setDisplayRolls({ meleeA: rollDie(6), meleeD: rollDie(6) });
      await new Promise(r => setTimeout(r, 60));
    }

    const attackerMelee = (data as Squad).soldiers[activeCombatSoldier].melee;
    const result = calculateMelee(attackerMelee, targetMelee);
    setDisplayRolls({ meleeA: result.attackerRoll, meleeD: result.defenderRoll });
    setMeleeResult(result);
    setIsRolling(false);

    const newActions = [...(unit.actionsUsed || [])];
    newActions[activeCombatSoldier] = { ...newActions[activeCombatSoldier], melee: true };
    updateUnit({ ...unit, actionsUsed: newActions });
  };

  const closeCombat = () => {
    setActiveCombatSoldier(null);
    setShowActionMenu(null);
    setShotResult(null);
    setMeleeResult(null);
    setDisplayRolls({});
    setIsRolling(false);
  };

  const getSoldierImage = (idx: number) => {
    if (!isSquad) return null;
    const soldier = (data as Squad).soldiers[idx];
    // Используем отдельное изображение солдата, если оно есть
    if (soldier.image) {
      return soldier.image;
    }
    // Fallback: используем старое изображение армлиста с позиционированием
    if (data.image) {
      return null; // Вернем null, чтобы использовать background-position
    }
    return null;
  };

  const getSoldierStyle = (idx: number) => {
    // Если есть отдельное изображение солдата, не используем background-position
    const soldierImg = getSoldierImage(idx);
    if (soldierImg) return {};
    
    // Fallback: старое позиционирование из большого армлиста
    if (!data.image) return {};
    const isRightSide = idx % 2 === 1;
    const row = Math.floor(idx / 2);
    const xPos = isRightSide ? 94 : 6;
    const yPos = 24 + (row * 36); 
    return {
      backgroundImage: `url(${data.image})`,
      backgroundSize: '550%',
      backgroundPosition: `${xPos}% ${yPos}%`,
      backgroundRepeat: 'no-repeat'
    };
  };

  const machineImage = !isSquad && (data as Machine).image;

  return (
    <div 
      onDoubleClick={handleOpenOriginal}
      className={cn(
      "bg-slate-800 rounded-xl border-2 transition-all shadow-lg overflow-hidden relative cursor-default select-none",
      (isSquadDone || (isMachineDone && !isMachineDestroyed)) ? "opacity-70 grayscale-[0.3]" : "",
      isAllDead || isMachineDestroyed ? "opacity-40 grayscale" : "",
      data.faction === 'polaris' ? "border-red-900/50" : data.faction === 'protectorate' ? "border-blue-900/50" : "border-green-900/50",
      !isSquad && machineImage ? "min-h-[600px]" : ""
    )}
    style={machineImage ? {
      backgroundImage: `url(${machineImage})`,
      backgroundSize: 'contain',
      backgroundPosition: 'top center',
      backgroundRepeat: 'no-repeat'
    } : {}}
    >
      {/* Background overlay for machine cards */}
      {machineImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/95 pointer-events-none z-0" />
      )}
      {/* Action Selection Modal */}
      {showActionMenu !== null && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-xs bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h4 className="font-bold flex items-center gap-2 uppercase tracking-wider text-xs" style={{ color: faction?.color }}>
                  <Sword className="w-4 h-4" />
                  Выберите действие
                </h4>
                <button onClick={closeCombat} className="p-1 hover:bg-slate-800 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {/* Shot */}
                <button
                  onClick={() => {
                  setShowActionMenu(null);
                  setActiveCombatSoldier(showActionMenu);
                  setCombatType('shot');
                  setShotResult(null);
                }}
                  className="w-full p-3 bg-slate-800 hover:bg-orange-900/30 border-2 border-slate-700 rounded-xl flex items-center gap-3 transition-all group"
                >
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <Target className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-orange-400">Выстрел</div>
                    <div className="text-[10px] text-slate-500">Дистанция, броня, укрытие</div>
                  </div>
                </button>

                {/* Melee */}
                <button
                  onClick={() => {
                  setShowActionMenu(null);
                  setActiveCombatSoldier(showActionMenu);
                  setCombatType('melee');
                  setMeleeResult(null);
                }}
                  className="w-full p-3 bg-slate-800 hover:bg-red-900/30 border-2 border-slate-700 rounded-xl flex items-center gap-3 transition-all group"
                >
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <Sword className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-red-400">Ближний бой</div>
                    <div className="text-[10px] text-slate-500">Кубики против кубиков</div>
                  </div>
                </button>

                {/* Grenade */}
                <button
                  onClick={() => {
                  if (unit.grenadesUsed) return;
                  setShowActionMenu(null);
                  setActiveCombatSoldier(showActionMenu);
                  setCombatType('grenade');
                  setShotResult(null);
                }}
                  disabled={unit.grenadesUsed}
                  className={cn(
                    "w-full p-3 bg-slate-800 hover:bg-green-900/30 border-2 border-slate-700 rounded-xl flex items-center gap-3 transition-all group",
                    unit.grenadesUsed ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    unit.grenadesUsed ? "bg-slate-700" : "bg-green-600/20"
                  )}>
                    <Bomb className={cn("w-5 h-5", unit.grenadesUsed ? "text-slate-500" : "text-green-400")} />
                  </div>
                  <div className="text-left flex-1">
                    <div className={cn("font-bold", unit.grenadesUsed ? "text-slate-500" : "text-green-400")}>
                      {unit.grenadesUsed ? 'Гранаты израсходованы' : 'Граната'}
                    </div>
                    <div className="text-[10px] text-slate-500">1D20 на площадь, D6 дистанция</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combat Modal - when action is selected */}
      {activeCombatSoldier !== null && showActionMenu === null && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h4 className={cn("font-bold flex items-center gap-2 uppercase tracking-wider text-xs",
                  combatType === 'shot' ? "text-orange-500" :
                  combatType === 'melee' ? "text-red-500" : "text-green-500"
                )}>
                  {combatType === 'shot' ? <Crosshair className="w-4 h-4" /> :
                   combatType === 'melee' ? <Sword className="w-4 h-4" /> : <Bomb className="w-4 h-4" />}
                  {combatType === 'shot' ? 'Выстрел' :
                   combatType === 'melee' ? 'Ближний Бой' : 'Метание гранаты'} Бойца #{activeCombatSoldier + 1}
                </h4>
                <button onClick={closeCombat} className="p-1 hover:bg-slate-800 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Shot/Grenade Mode */}
                {(combatType === 'shot' || combatType === 'grenade') && (
                  !shotResult && !isRolling ? (
                    <>
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <div className="text-[10px] opacity-50 uppercase font-bold mb-2">Параметры</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] opacity-40">{combatType === 'shot' ? 'Дистанция (шаги)' : 'Цель (шагов)'}</label>
                            <input
                              type="number"
                              value={shotDistance}
                              onChange={(e) => setShotDistance(parseInt(e.target.value))}
                              className="w-full bg-slate-800 border-2 border-slate-600 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] opacity-40">Броня цели (Бр)</label>
                            <input
                              type="number"
                              value={targetArmor}
                              onChange={(e) => setTargetArmor(parseInt(e.target.value))}
                              className="w-full bg-slate-800 border-2 border-slate-600 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-1">
                          <label className="text-[10px] opacity-40">Укрытие цели</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 3].map(v => (
                              <button
                                key={v}
                                onClick={() => setShotCover(v)}
                                className={cn(
                                  "py-1.5 text-[10px] rounded border transition-all font-bold",
                                  shotCover === v ? "bg-blue-600 border-blue-400 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                                )}
                              >
                                {v === 0 ? 'НЕТ' : `+${v}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={combatType === 'shot' ? handleShot : handleGrenadeThrow}
                        className={cn(
                          "w-full py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all",
                          combatType === 'shot' ? "bg-orange-600 hover:bg-orange-500" : "bg-green-700 hover:bg-green-600"
                        )}
                      >
                        {combatType === 'shot' ? 'ОГОНЬ!' : 'БРОСОК!'}
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col justify-center gap-4 text-center animate-in fade-in">
                      {/* Dice Animation Display */}
                      <div className="flex flex-col gap-4">
                        <div className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          shotResult ? (shotResult.hit.success ? "bg-green-900/20 border-green-500/50" : "bg-red-900/20 border-red-500/50") : "bg-slate-800 border-blue-500/30"
                        )}>
                          <div className="text-[10px] opacity-50 uppercase font-bold mb-1 tracking-widest">
                            {combatType === 'grenade' ? 'Дальность броска' : 'Бросок на попадание'}
                          </div>
                          <div className="flex justify-center items-center gap-3">
                            <div className={cn(
                              "w-12 h-12 bg-slate-800 rounded-lg border-2 flex items-center justify-center text-xl font-black shadow-lg transition-transform",
                              isRolling && !shotResult ? "animate-bounce scale-110 border-orange-500" : "border-slate-600"
                            )}>
                              {displayRolls.hit || '?'}
                            </div>
                            {shotResult && (
                              <div className={cn("text-xl font-black", shotResult.hit.success ? "text-green-400" : "text-red-400")}>
                                {shotResult.hit.isGrenade ? 'ВЗРЫВ!' : (shotResult.hit.success ? 'ПОПАЛ' : 'ПРОМАХ')}
                              </div>
                            )}
                          </div>
                        </div>

                        {(displayRolls.power || (shotResult && (shotResult.hit.success || shotResult.hit.isGrenade))) && (
                          <div className={cn(
                            "p-4 rounded-xl border-2 transition-all",
                            shotResult ? (shotResult.damage.damage > 0 ? "bg-orange-900/20 border-orange-500/50" : "bg-slate-800 border-slate-600") : "bg-slate-800 border-orange-500/30"
                          )}>
                            <div className="text-[10px] opacity-50 uppercase font-bold mb-1 tracking-widest">Бросок мощности</div>
                            <div className="flex justify-center items-center gap-2 flex-wrap">
                              {displayRolls.power?.map((r, i) => (
                                <div key={i} className={cn(
                                  "w-10 h-10 bg-slate-800 rounded-lg border-2 flex items-center justify-center text-lg font-black shadow-lg",
                                  isRolling && shotResult ? "animate-pulse border-orange-500" : "border-slate-600",
                                  shotResult && r > (targetArmor + shotCover) ? "text-orange-400 border-orange-400" : ""
                                )}>
                                  {r}
                                </div>
                              ))}
                            </div>
                            {shotResult && (
                              <div className="text-xl font-black text-orange-400 mt-2">
                                {shotResult.damage.damage > 0 ? `-${shotResult.damage.damage} HP` : 'НЕ ПРОБИТО'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {shotResult && (
                        <button onClick={closeCombat} className="w-full bg-slate-700 py-2 rounded-lg font-bold text-xs mt-4">ГОТОВО</button>
                      )}
                    </div>
                  )
                )}

                {/* Melee Mode */}
                {combatType === 'melee' && !meleeResult && !isRolling && (
                  <>
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <div className="text-[10px] opacity-50 uppercase font-bold mb-2">Параметры ближнего боя</div>
                      <div className="space-y-1">
                        <label className="text-[10px] opacity-40">Ближний бой цели (ББ)</label>
                        <input
                          type="number"
                          value={targetMelee}
                          onChange={(e) => setTargetMelee(parseInt(e.target.value))}
                          className="w-full bg-slate-800 border-2 border-slate-600 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleMeleeClick}
                      className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                    >
                      АТАКОВАТЬ!
                    </button>
                  </>
                )}

                {meleeResult && (
                  <div className="flex-1 flex flex-col justify-center gap-4 text-center animate-in fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn(
                        "bg-slate-800 p-4 rounded-xl border-2 transition-all",
                        isRolling ? "border-blue-500/50 animate-pulse" : "border-slate-600"
                      )}>
                        <div className="text-[8px] opacity-50 uppercase mb-1">Вы</div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-2xl font-black text-blue-400 mb-1 border border-blue-500/30">
                            {displayRolls.meleeA || '?'}
                          </div>
                          {meleeResult && <div className="text-xl font-black text-blue-400">{meleeResult.attackerTotal}</div>}
                          <div className="text-[8px] opacity-30 mt-1">D6 + ББ({(data as Squad).soldiers[activeCombatSoldier].melee})</div>
                        </div>
                      </div>
                      <div className={cn(
                        "bg-slate-800 p-4 rounded-xl border-2 transition-all",
                        isRolling ? "border-red-500/50 animate-pulse" : "border-slate-600"
                      )}>
                        <div className="text-[8px] opacity-50 uppercase mb-1">Цель</div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-2xl font-black text-red-400 mb-1 border border-red-500/30">
                            {displayRolls.meleeD || '?'}
                          </div>
                          {meleeResult && <div className="text-xl font-black text-red-400">{meleeResult.defenderTotal}</div>}
                          <div className="text-[8px] opacity-30 mt-1">D6 + ББ({targetMelee})</div>
                        </div>
                      </div>
                    </div>

                    {meleeResult && (
                      <div className={cn(
                        "p-6 rounded-2xl border-2 flex flex-col items-center",
                        meleeResult.winner === 'attacker' ? "bg-green-900/20 border-green-500/50" :
                        meleeResult.winner === 'defender' ? "bg-red-900/20 border-red-500/50" : "bg-slate-800 border-slate-700"
                      )}>
                        <div className="text-xs opacity-50 uppercase font-bold mb-1 tracking-widest">Итог</div>
                        <div className={cn("text-3xl font-black",
                          meleeResult.winner === 'attacker' ? "text-green-400" :
                          meleeResult.winner === 'defender' ? "text-red-400" : "text-slate-400"
                        )}>
                          {meleeResult.winner === 'attacker' ? 'ПОБЕДА' :
                           meleeResult.winner === 'defender' ? 'КОНТРАТАКА' : 'НИЧЬЯ'}
                        </div>
                      </div>
                    )}
                    {meleeResult && (
                      <button onClick={closeCombat} className="w-full bg-slate-700 py-2 rounded-lg font-bold text-xs mt-4">ГОТОВО</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Overlay */}
      {showImage && data.image && (
        <div 
          className="absolute inset-0 z-50 bg-slate-950 flex flex-col p-2 animate-in fade-in duration-200"
          onClick={() => setShowImage(false)}
        >
          <div className="flex justify-between items-center mb-1 px-2">
            <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest truncate">{data.name}</span>
            <button className="text-[10px] bg-slate-800 px-2 py-1 rounded font-mono">X</button>
          </div>
          <div className="flex-1 overflow-auto rounded border border-slate-700 custom-scrollbar">
            <img src={data.image} alt={data.name} className="max-w-none w-[400%]" />
          </div>
          <p className="text-[9px] text-center opacity-40 mt-1">Прокрутите, чтобы увидеть характеристики</p>
        </div>
      )}

      {/* Unit Header */}
      <div 
        onClick={() => setIsManualCollapsed(!isManualCollapsed)}
        className={cn(
          "p-2 md:p-3 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors relative z-10",
          data.faction === 'polaris' ? "bg-red-900/20" : data.faction === 'protectorate' ? "bg-blue-900/20" : "bg-green-900/20"
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2">
            {isCollapsed ? (isManualCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />) : <ChevronUp className="w-4 h-4" />}
            <h3 className="font-bold text-xs md:text-sm uppercase tracking-wide truncate">{data.name}</h3>
            {isSquad && (
              <div className={cn(
                "flex items-center gap-0.5 md:gap-1 px-1 md:px-1.5 py-0.5 rounded text-[7px] md:text-[8px] font-black uppercase tracking-tighter",
                unit.grenadesUsed ? "bg-red-900/40 text-red-400 border border-red-900/50" : "bg-green-900/40 text-green-400 border border-green-900/50"
              )}>
                <Bomb className="w-2 h-2 md:w-2.5 md:h-2.5" />
                <span className="hidden sm:inline">{unit.grenadesUsed ? 'Пусто' : '1'}</span>
              </div>
            )}
            {isAllDead && <div className="bg-red-600 text-white text-[7px] md:text-[8px] px-1 md:px-1.5 py-0.5 rounded font-black uppercase"><UserX className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5 md:mr-1" />УНИЧТОЖЕН</div>}
          </div>
          <div className="text-[9px] md:text-[10px] opacity-50 flex gap-1.5 md:gap-2 items-center">
            <span className="hidden sm:inline" style={{ color: faction?.color }}>{faction?.name || data.faction.toUpperCase()}</span>
            <span className="hidden sm:inline">•</span>
            <span>{data.cost} ОЧК.</span>
            {isSquadDone && !isAllDead && <span className="text-green-400 font-bold ml-auto flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden sm:inline">ГОТОВ</span></span>}
            {isMachineDone && !isMachineDestroyed && <span className="text-green-400 font-bold ml-auto flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden sm:inline">ГОТОВ</span></span>}
            {isMachineDestroyed && <div className="bg-red-600 text-white text-[7px] md:text-[8px] px-1 md:px-1.5 py-0.5 rounded font-black uppercase ml-auto"><UserX className="w-2.5 h-2.5 md:w-3 md:h-3 inline mr-0.5 md:mr-1" />УНИЧТОЖЕН</div>}
          </div>
        </div>
        <div className="flex gap-0.5 md:gap-1" onClick={e => e.stopPropagation()}>
          {(data.image || data.originalUrl) && (
            <button 
              onClick={() => handleOpenOriginal()}
              className="p-1.5 md:p-1 hover:bg-white/10 rounded transition-colors text-blue-400 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
              title={data.originalUrl ? "Открыть оригинал в VK (двойной клик)" : "Показать оригинал армлиста"}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => {
              if (isSquad) {
                updateUnit({ ...unit, grenadesUsed: false, actionsUsed: Array((data as Squad).soldiers.length).fill({ moved: false, shot: false, melee: false, done: false }) });
              } else {
                updateUnit({ ...unit, isMachineMoved: false, isMachineShot: false, isMachineMelee: false, isMachineDone: false });
              }
            }}
            className="p-1.5 md:p-1 hover:bg-white/10 rounded transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
            title="Сбросить ходы"
          >
            <RotateCcw className="w-4 h-4 opacity-50" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-2 md:p-3 animate-in slide-in-from-top-2 duration-200 relative z-10">
          {isSquad ? (
            <div className="grid grid-cols-1 gap-1.5 md:gap-2">
              {(data as Squad).soldiers.map((s, idx) => {
                const isDead = unit.deadSoldiers?.includes(idx);
                const actions = unit.actionsUsed?.[idx] || { moved: false, shot: false, melee: false, done: false };
                const isDone = actions.done;

                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-1.5 md:p-2 rounded-lg border flex gap-2 md:gap-3 transition-all relative overflow-hidden",
                      isDead ? "bg-slate-950 border-slate-800 opacity-40 grayscale" : 
                      isDone ? "bg-slate-900/50 border-slate-700 opacity-80" : "bg-slate-700/30 border-slate-600"
                    )}
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-md border border-slate-600 overflow-hidden flex-shrink-0 bg-slate-900 relative">
                      {getSoldierImage(idx) ? (
                        <img 
                          src={getSoldierImage(idx)!} 
                          alt={`Солдат ${idx + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full" style={getSoldierStyle(idx)} />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        {/* Single Action button */}
                        <button
                          disabled={isDone || isDead}
                          onClick={() => setShowActionMenu(idx)}
                          className={cn(
                            "p-1.5 md:p-2 rounded-lg transition-all min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center gap-1",
                            "text-slate-800 border-2 border-slate-700 text-white hover:bg-slate-700 active:scale-95"
                          )}
                          style={{
                            backgroundColor: `${faction?.color}20`,
                            borderColor: `${faction?.color}40`
                          }}
                          title="Действие"
                        >
                          <Dices className="w-5 h-5" />
                          <span className="hidden sm:inline text-xs font-bold">ДЕЙСТВИЕ</span>
                        </button>
                        <div className="flex gap-0.5 md:gap-1 flex-shrink-0">
                          <button
                            onClick={() => !isDead && toggleAction(idx, 'done')}
                            className={cn(
                              "p-1.5 md:p-2 rounded-lg transition-all min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center",
                              isDone ? "bg-green-600 text-white" : "bg-slate-800 text-slate-500 border border-slate-700"
                            )}
                            title="Завершить ход бойца"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleDead(idx)}
                            className={cn("text-[8px] md:text-[9px] px-1.5 md:px-2 py-1 md:py-0.5 rounded font-black uppercase tracking-tighter min-h-[44px] md:min-h-0 flex items-center justify-center", isDead ? "bg-red-900 text-red-100" : "bg-slate-800 text-slate-400 border border-slate-700")}
                          >
                            {isDead ? 'УБИТ' : 'ЖИВ'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4 mt-1.5 md:mt-2 flex-wrap">
                        <div className="flex gap-2 md:gap-4 flex-1">
                          <span className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm font-black text-yellow-500 bg-slate-900/50 px-1.5 md:px-2 py-0.5 rounded border border-yellow-900/30" title="Броня">
                            <Shield className="w-3 h-3 md:w-4 md:h-4" /> {s.armor}
                          </span>
                          <span className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm font-black text-blue-400 bg-slate-900/50 px-1.5 md:px-2 py-0.5 rounded border border-blue-900/30" title="Скорость">
                            <Zap className="w-3 h-3 md:w-4 md:h-4" /> {s.speed}
                          </span>
                        </div>
                        <div className="flex gap-1.5 md:gap-2 ml-auto">
                          <div className="bg-slate-900/80 px-1.5 md:px-2 py-0.5 rounded border border-slate-700 flex flex-col items-center">
                            <span className="text-[6px] md:text-[7px] opacity-40 leading-none hidden sm:inline">ДАЛЬН</span>
                            <span className="text-[9px] md:text-[10px] font-mono font-bold text-orange-400">{s.range}</span>
                          </div>
                          <div className="bg-slate-900/80 px-1.5 md:px-2 py-0.5 rounded border border-slate-700 flex flex-col items-center">
                            <span className="text-[6px] md:text-[7px] opacity-40 leading-none hidden sm:inline">МОЩН</span>
                            <span className="text-[9px] md:text-[10px] font-mono font-bold text-orange-400">{s.power}</span>
                          </div>
                          <div className="bg-slate-900/80 px-1.5 md:px-2 py-0.5 rounded border border-slate-700 flex flex-col items-center">
                            <span className="text-[6px] md:text-[7px] opacity-40 leading-none hidden sm:inline">ББ</span>
                            <span className="text-[9px] md:text-[10px] font-mono font-bold text-red-400">{s.melee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div 
              className={cn(
                "p-2 md:p-3 rounded-lg border flex flex-col gap-2 md:gap-3 transition-all relative overflow-hidden",
                isMachineDestroyed ? "bg-slate-950 border-slate-800 opacity-40 grayscale" : 
                isMachineDone ? "bg-slate-900/50 border-slate-700 opacity-80" : "bg-slate-700/30 border-slate-600"
              )}
            >
              {/* Machine Status Header */}
              <div className="flex justify-between items-start gap-1">
                <div className="flex gap-1 md:gap-1.5 flex-wrap">
                  <button
                    disabled={isMachineDone || isMachineDestroyed}
                    onClick={() => updateUnit({ ...unit, isMachineMoved: !unit.isMachineMoved })}
                    className={cn(
                      "p-1.5 md:p-2 rounded transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center",
                      unit.isMachineMoved ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "bg-slate-800 text-slate-500 border border-slate-700"
                    )}
                    title="Движение"
                  >
                    <Move className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    disabled={isMachineDone || isMachineDestroyed}
                    onClick={() => updateUnit({ ...unit, isMachineShot: !unit.isMachineShot })}
                    className={cn(
                      "p-1.5 md:p-2 rounded transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center",
                      unit.isMachineShot ? "bg-orange-600 text-white shadow-lg shadow-orange-900/50" : "bg-slate-800 text-slate-500 border border-slate-700"
                    )}
                    title="Стрельба"
                  >
                    <Target className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    disabled={isMachineDone || isMachineDestroyed}
                    onClick={() => updateUnit({ ...unit, isMachineMelee: !unit.isMachineMelee })}
                    className={cn(
                      "p-1.5 md:p-2 rounded transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center",
                      unit.isMachineMelee ? "bg-red-600 text-white shadow-lg shadow-red-900/50" : "bg-slate-800 text-slate-500 border border-slate-700"
                    )}
                    title="Ближний бой"
                  >
                    <Sword className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
                <div className="flex gap-0.5 md:gap-1 flex-shrink-0">
                  <button 
                    onClick={() => !isMachineDestroyed && updateUnit({ ...unit, isMachineDone: !unit.isMachineDone })}
                    disabled={isMachineDestroyed}
                    className={cn(
                      "p-1.5 md:p-2 rounded-lg transition-all min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center",
                      isMachineDone ? "bg-green-600 text-white" : "bg-slate-800 text-slate-500 border border-slate-700"
                    )}
                    title="Завершить ход"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={toggleMachineDestroyed}
                    className={cn(
                      "text-[8px] md:text-[9px] px-1.5 md:px-2 py-1 md:py-0.5 rounded font-black uppercase tracking-tighter min-h-[44px] md:min-h-0 flex items-center justify-center",
                      isMachineDestroyed ? "bg-red-900 text-red-100" : "bg-slate-800 text-slate-400 border border-slate-700"
                    )}
                  >
                    {isMachineDestroyed ? 'УНИЧТОЖЕН' : 'ИСПРАВЕН'}
                  </button>
                </div>
              </div>

              {/* Durability and Ammo */}
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] md:text-[10px] opacity-50 uppercase font-bold">
                    <span>Прочность</span>
                    <span>{unit.currentDurability}/{ (data as Machine).durability_max }</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-green-500 transition-all" 
                      style={{ width: `${(unit.currentDurability! / (data as Machine).durability_max) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-1 mt-1">
                    <button 
                      onClick={() => updateMachineStat('durability', -1)} 
                      disabled={isMachineDestroyed}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs py-1.5 md:py-1 min-h-[44px] md:min-h-0"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => updateMachineStat('durability', 1)} 
                      disabled={isMachineDestroyed || unit.currentDurability === (data as Machine).durability_max}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs py-1.5 md:py-1 min-h-[44px] md:min-h-0"
                    >
                      +1
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] md:text-[10px] opacity-50 uppercase font-bold">
                    <span>Боезапас</span>
                    <span>{unit.currentAmmo}/{ (data as Machine).ammo_max }</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-blue-500 transition-all" 
                      style={{ width: `${(unit.currentAmmo! / (data as Machine).ammo_max) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-1 mt-1">
                    <button 
                      onClick={() => updateMachineStat('ammo', -1)} 
                      disabled={isMachineDestroyed}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs py-1.5 md:py-1 min-h-[44px] md:min-h-0"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => updateMachineStat('ammo', 1)} 
                      disabled={isMachineDestroyed || unit.currentAmmo === (data as Machine).ammo_max}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs py-1.5 md:py-1 min-h-[44px] md:min-h-0"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>

              {/* Speed Display */}
              <div className="bg-slate-900/50 p-1.5 md:p-2 rounded-lg border border-slate-700 flex justify-between items-center">
                <span className="text-[10px] md:text-xs opacity-50">Текущая скорость:</span>
                <span className="text-base md:text-lg font-black text-yellow-400">{getMachineSpeed()}</span>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] md:text-[10px] font-black uppercase opacity-40">Арсенал</h4>
                  <div className={cn(
                    "text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded",
                    (unit.machineShotsUsed || 0) >= (data as Machine).fire_rate 
                      ? "bg-red-900/40 text-red-400 border border-red-900/50" 
                      : (unit.machineShotsUsed || 0) > 0
                      ? "bg-orange-900/40 text-orange-400 border border-orange-900/50"
                      : "opacity-50"
                  )}>
                    <span className="hidden sm:inline">Выстрелов: </span>{unit.machineShotsUsed || 0} / {(data as Machine).fire_rate}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {(data as Machine).weapons.map((w, weaponIdx) => {
                    const weaponShots = (unit.machineWeaponShots?.[weaponIdx] || 0);
                    const totalShotsUsed = unit.machineShotsUsed || 0;
                    const fireRate = (data as Machine).fire_rate;
                    const canShoot = !isMachineDone && !isMachineDestroyed && 
                                    (unit.currentAmmo || 0) > 0 && 
                                    totalShotsUsed < fireRate;
                    
                    return (
                      <div 
                        key={weaponIdx} 
                        className={cn(
                          "bg-slate-900 p-1.5 md:p-2 rounded border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] md:text-[11px] transition-all",
                          weaponShots > 0 ? "border-orange-500/50 bg-orange-900/20" : ""
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            <span className="font-bold truncate">{w.name}</span>
                            {weaponShots > 0 && (
                              <span className="text-[8px] md:text-[9px] text-orange-400 font-bold">
                                ({weaponShots} выстр.)
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5 md:gap-2 font-mono opacity-70 text-[9px] md:text-[10px] mt-0.5 flex-wrap">
                            <span>{w.range}</span>
                            <span>•</span>
                            <span>{w.power}</span>
                            {w.special && <span className="opacity-50 hidden sm:inline">• {w.special}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (canShoot && (unit.currentAmmo || 0) > 0) {
                              const newAmmo = Math.max(0, (unit.currentAmmo || 0) - 1);
                              const newShotsUsed = (unit.machineShotsUsed || 0) + 1;
                              const newWeaponShots = { ...(unit.machineWeaponShots || {}), [weaponIdx]: weaponShots + 1 };
                              updateUnit({ 
                                ...unit, 
                                currentAmmo: newAmmo,
                                machineShotsUsed: newShotsUsed,
                                machineWeaponShots: newWeaponShots,
                                isMachineShot: true
                              });
                            }
                          }}
                          disabled={!canShoot}
                          className={cn(
                            "px-2 md:px-3 py-1.5 md:py-1.5 rounded text-[9px] md:text-[10px] font-bold uppercase transition-all flex items-center gap-1 w-full sm:w-auto min-h-[44px] sm:min-h-0 justify-center",
                            canShoot 
                              ? "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/50 active:scale-95" 
                              : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-50"
                          )}
                          title={!canShoot ? 
                            (totalShotsUsed >= fireRate ? `Достигнут лимит выстрелов (${fireRate})` : 
                             (unit.currentAmmo || 0) === 0 ? "Нет боезапаса" : 
                             isMachineDone ? "Ход завершен" : "Техника уничтожена") 
                            : `Выстрел (тратит 1 боезапас, осталось ${fireRate - totalShotsUsed} выстрелов)`}
                        >
                          <Target className="w-3 h-3" />
                          <span className="hidden sm:inline">Выстрел</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isCollapsed && (
        <div 
          onClick={() => setIsManualCollapsed(false)}
          className="px-3 pb-3 pt-1 flex gap-4 items-center animate-in fade-in duration-300 relative z-10"
        >
          {isSquad ? (
            <div className="flex gap-2 items-center flex-1">
              <div className="flex -space-x-2">
                {(data as Squad).soldiers.slice(0, 3).map((_, idx) => (
                  <div key={idx} className="w-6 h-6 rounded-full border border-slate-700 overflow-hidden bg-slate-900 ring-2 ring-slate-800 relative">
                    {getSoldierImage(idx) ? (
                      <img 
                        src={getSoldierImage(idx)!} 
                        alt={`Солдат ${idx + 1}`}
                        className="w-full h-full object-cover object-center scale-150"
                      />
                    ) : (
                      <div className="w-full h-full scale-150" style={getSoldierStyle(idx)} />
                    )}
                  </div>
                ))}
                {(data as Squad).soldiers.length > 3 && (
                  <div className="w-6 h-6 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-[8px] font-bold ring-2 ring-slate-800">
                    +{(data as Squad).soldiers.length - 3}
                  </div>
                )}
              </div>
              <div className="text-[10px] font-bold opacity-60">
                ЖИВЫХ: <span className="text-white">{(data as Squad).soldiers.length - (unit.deadSoldiers?.length || 0)}/{(data as Squad).soldiers.length}</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-center flex-1">
              <div className="flex items-center gap-2">
                <Heart className={cn("w-3 h-3", isMachineDestroyed ? "text-red-500" : "text-green-500")} />
                <span className={cn("text-[10px] font-bold", isMachineDestroyed ? "text-red-400" : "text-white")}>
                  {unit.currentDurability} HP
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bomb className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold text-white">{unit.currentAmmo} AMMO</span>
              </div>
              {isMachineDestroyed && (
                <div className="ml-auto text-[8px] font-black uppercase text-red-400">
                  УНИЧТОЖЕН
                </div>
              )}
            </div>
          )}
          <div className="text-[10px] opacity-40 italic">Нажмите, чтобы развернуть...</div>
        </div>
      )}
    </div>
  );
}
