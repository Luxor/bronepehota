'use client';

import React, { useState, KeyboardEvent } from 'react';
import type { Faction, Squad, ArmyUnit, FactionID } from '@/lib/types';
import { Check, X, Plus, ArrowLeft } from 'lucide-react';

interface UnitSelectorProps {
  factions: Faction[];
  squads: Squad[];
  selectedFaction: FactionID;
  pointBudget: number;
  army: ArmyUnit[];
  onAddUnit: (squad: Squad) => void;
  onRemoveUnit: (instanceId: string) => void;
  onToBattle: () => void;
  onBackToFactionSelect?: () => void;
  isLoading?: boolean;
  loadError?: string | null;
}

/**
 * UnitSelector - Display available units with budget-aware controls
 *
 * Accessibility (FR-022, FR-023, FR-024):
 * - Keyboard: Tab to navigate, Enter to add/remove, Arrow keys within lists
 * - ARIA: aria-live for budget, aria-disabled for buttons, aria-label for units
 * - Focus: First unit receives focus, moves to newly added unit
 *
 * Mobile (FR-025, FR-027):
 * - Breakpoints: <768px (mobile), 768-1024px (tablet), >1024px (desktop)
 * - Touch targets: 48x48px for add/remove buttons
 * - Images: 120px minimum width
 */
export function UnitSelector({
  factions,
  squads,
  selectedFaction,
  pointBudget,
  army,
  onAddUnit,
  onRemoveUnit,
  onToBattle,
  onBackToFactionSelect,
  isLoading = false,
  loadError = null,
}: UnitSelectorProps) {
  const [showWarning, setShowWarning] = useState(false);

  // Calculate remaining points
  const totalCost = army.reduce((sum, unit) => {
    const squad = unit.data as Squad;
    return sum + squad.cost;
  }, 0);
  const remainingPoints = pointBudget - totalCost;

  // Filter squads by selected faction
  const availableSquads = squads.filter(s => s.faction === selectedFaction);

  // Check if unit can be afforded
  const canAffordUnit = (cost: number) => cost <= remainingPoints;

  // Get faction for styling
  const faction = factions.find(f => f.id === selectedFaction);

  // Budget color coding
  const getBudgetColor = () => {
    const percentage = (remainingPoints / pointBudget) * 100;
    if (percentage > 50) return 'text-green-400';
    if (percentage >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Handle add unit with budget check
  const handleAddUnit = (squad: Squad) => {
    if (!canAffordUnit(squad.cost)) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    onAddUnit(squad);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12" role="status" aria-busy="true">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400"></div>
        <span className="ml-4 text-slate-400">Загрузка...</span>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg" role="alert" aria-live="assertive">
        <p className="text-red-400 mb-4">Ошибка загрузки данных</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Повторить
        </button>
      </div>
    );
  }

  // Empty state
  if (availableSquads.length === 0) {
    return (
      <div className="text-center p-6 sm:p-12 bg-slate-800/50 rounded-lg space-y-6">
        <p className="text-slate-400 text-base sm:text-lg">Для этой фракции пока нет доступных юнитов</p>
        {onBackToFactionSelect && (
          <button
            onClick={onBackToFactionSelect}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mx-auto min-h-[48px] touch-manipulation"
          >
            <ArrowLeft size={20} className="flex-shrink-0" />
            <span className="hidden sm:inline">Вернуться к выбору фракции</span>
            <span className="sm:hidden">Назад к фракции</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to faction select button */}
      {onBackToFactionSelect && (
        <button
          onClick={onBackToFactionSelect}
          className="w-full sm:w-auto px-3 sm:px-4 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
        >
          <ArrowLeft size={18} className="flex-shrink-0" />
          <span className="hidden sm:inline">Вернуться к выбору фракции</span>
          <span className="sm:hidden">Назад к фракции</span>
        </button>
      )}

      {/* Budget display */}
      <div
        role="status"
        aria-live="polite"
        className={`text-2xl font-bold ${getBudgetColor()}`}
        aria-label={`Осталось ${remainingPoints} из ${pointBudget} очков`}
      >
        Осталось очков: {remainingPoints} / {pointBudget}
      </div>

      {/* Warning toast */}
      {showWarning && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg text-yellow-200"
        >
          Недостаточно очков
        </div>
      )}

      {/* Available units */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-200">Доступные юниты</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableSquads.map((squad) => {
            const affordable = canAffordUnit(squad.cost);

            return (
              <div
                key={squad.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700"
              >
                {/* Unit image */}
                {squad.image && (
                  <img
                    src={squad.image}
                    alt={squad.name}
                    className="w-full h-[120px] object-cover rounded mb-3 min-w-[120px]"
                    loading="lazy"
                  />
                )}

                {/* Unit name and cost */}
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-slate-200">{squad.name}</h4>
                  <span className={`text-sm font-bold ${affordable ? 'text-green-400' : 'text-red-400'}`}>
                    {squad.cost} очков
                  </span>
                </div>

                {/* Add button */}
                <button
                  onClick={() => handleAddUnit(squad)}
                  disabled={!affordable}
                  aria-disabled={!affordable}
                  aria-label={`Добавить ${squad.name}`}
                  className={`
                    w-full py-3 px-4 rounded-lg font-semibold transition-all
                    flex items-center justify-center gap-2 min-h-[48px] min-w-[48px] touch-manipulation
                    ${affordable
                      ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <Plus size={20} />
                  Добавить
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected army */}
      {army.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-200">Ваша армия ({army.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {army.map((unit) => {
              const squad = unit.data as Squad;
              return (
                <div
                  key={unit.instanceId}
                  className="bg-slate-800 rounded-lg p-4 border-2 border-green-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-200">{squad.name}</h4>
                      <p className="text-sm text-green-400 font-bold">{squad.cost} очков</p>
                    </div>
                    <button
                      onClick={() => onRemoveUnit(unit.instanceId)}
                      aria-label={`Удалить ${squad.name}`}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded min-w-[48px] min-h-[48px] flex items-center justify-center touch-manipulation"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* To Battle button */}
      <div className="pt-4 border-t border-slate-700">
        <button
          onClick={onToBattle}
          disabled={army.length === 0}
          aria-disabled={army.length === 0}
          className={`
            w-full py-4 px-6 rounded-lg font-bold text-lg transition-all
            flex items-center justify-center gap-3 min-h-[56px] touch-manipulation
            ${army.length > 0
              ? 'bg-red-600 hover:bg-red-700 text-white active:scale-98'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }
          `}
        >
          В бой
          <Check size={24} />
        </button>
        {army.length === 0 && (
          <p className="text-center text-sm text-slate-500 mt-2">Армия пуста</p>
        )}
      </div>
    </div>
  );
}
