'use client';

import { useState, useEffect } from 'react';
import { Army, RulesVersionID } from '@/lib/types';
import ArmyBuilder from '@/components/ArmyBuilder';
import GameSession from '@/components/GameSession';
import factionsData from '@/data/factions.json';
import { Shield, Edit, ArrowLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isValidRulesVersion, getAllRulesVersions } from '@/lib/rules-registry';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'builder' | 'game'>('builder');
  const [army, setArmy] = useState<Army>({
    name: 'Моя Армия',
    faction: 'polaris',
    units: [],
    totalCost: 0,
    currentStep: 'faction-select',
    isInBattle: false,
  });

  // Rules version state with localStorage persistence
  const [rulesVersion, setRulesVersion] = useState<RulesVersionID>('tehnolog');

  // Load rules version from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('bronepehota_rules_version');
    if (saved && isValidRulesVersion(saved)) {
      setRulesVersion(saved as RulesVersionID);
    }
  }, []);

  // Persist rules version to localStorage on change
  useEffect(() => {
    localStorage.setItem('bronepehota_rules_version', rulesVersion);
  }, [rulesVersion]);

  const activeFaction = factionsData.find(f => f.id === army.faction);

  // Handle entering battle phase
  const handleEnterBattle = () => {
    setArmy({
      ...army,
      isInBattle: true,
      currentStep: 'battle',
    });
    setView('game');
  };

  // Handle ending battle phase (reset to fresh faction selection)
  const handleEndBattle = () => {
    setArmy({
      name: 'Моя Армия',
      faction: 'polaris',
      units: [],
      totalCost: 0,
      pointBudget: undefined,
      currentStep: 'faction-select',
      isInBattle: false,
    });
    setView('builder');
  };

  // Load army from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bronepehota_army');
    if (saved) {
      try {
        const loadedArmy = JSON.parse(saved);
        // Initialize currentStep if not present (for backward compatibility)
        if (!loadedArmy.currentStep) {
          loadedArmy.currentStep = 'faction-select';
        }
        if (loadedArmy.isInBattle === undefined) {
          loadedArmy.isInBattle = false;
        }
        setArmy(loadedArmy);
      } catch (e) {
        console.error('Failed to load army', e);
      }
    }
  }, []);

  // Save army to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('bronepehota_army', JSON.stringify(army));
  }, [army]);

  return (
    <main className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="glass-strong border-b border-slate-700/50 px-2 md:px-4 py-2 md:py-3 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Left section - Faction badge */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div
              className={`p-2 md:p-2.5 rounded-xl shadow-lg transition-all duration-300 ${
                view === 'game' && !army.isInBattle
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : ''
              }`}
              style={{
                backgroundColor: activeFaction?.color || '#ef4444',
                boxShadow: `0 4px 14px 0 ${(activeFaction?.color || '#ef4444')}40`
              }}
              onClick={() => {
                if (view === 'game' && !army.isInBattle) {
                  setView('builder');
                }
              }}
              title={view === 'game' && !army.isInBattle ? 'Вернуться в Штаб' : undefined}
            >
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className={`relative group ${view === 'game' && !army.isInBattle ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (view === 'game' && !army.isInBattle) {
                  setView('builder');
                }
              }}
            >
              <div className="flex items-center gap-1.5">
                {view === 'game' && !army.isInBattle && (
                  <ArrowLeft className="w-3 h-3 text-slate-400" />
                )}
                <h1 className="text-sm md:text-xl font-bold tracking-tight leading-none bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  <span className="hidden md:inline">БРОНЕПЕХОТА</span>
                  <span className="md:hidden">БП</span>
                </h1>
              </div>
              <span
                className="text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
                style={{ color: activeFaction?.color || '#ef4444' }}
              >
                {activeFaction?.name}
              </span>
            </div>
          </div>

          {/* Center section - spacer for balance */}
          <div className="flex-1" />

          {/* Right section - Actions */}
          <nav className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            {view === 'game' && !army.isInBattle && (
              <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 border border-green-600/30">
                Бой
              </span>
            )}
            {view === 'builder' && army.currentStep === 'faction-select' && (
              <button
                onClick={() => router.push('/editor')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Редактор</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === 'builder' ? (
          <ArmyBuilder
            army={army}
            setArmy={setArmy}
            onEnterBattle={handleEnterBattle}
            rulesVersion={rulesVersion}
            onRulesVersionChange={setRulesVersion}
          />
        ) : (
          <GameSession
            army={army}
            setArmy={setArmy}
            isInBattle={army.isInBattle}
            onEndBattle={handleEndBattle}
          />
        )}
      </div>

      {/* Footer - different content based on current step */}
      {view === 'builder' && army.currentStep === 'unit-select' && (
        <footer className="glass-strong border-t border-slate-700/50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="opacity-50 text-[10px] uppercase tracking-wider">Версия правил:</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getAllRulesVersions().find(v => v.id === rulesVersion)?.color }}
              />
              <span className="font-semibold text-sm">{getAllRulesVersions().find(v => v.id === rulesVersion)?.name || ''}</span>
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}

