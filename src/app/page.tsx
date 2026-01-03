'use client';

import { useState, useEffect } from 'react';
import { Army, ArmyUnit, FactionID } from '@/lib/types';
import ArmyBuilder from '@/components/ArmyBuilder';
import GameSession from '@/components/GameSession';
import factionsData from '@/data/factions.json';
import { Shield, Sword, Users, Play, Settings, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'builder' | 'game'>('builder');
  const [army, setArmy] = useState<Army>({
    name: 'Моя Армия',
    faction: 'polaris',
    units: [],
    totalCost: 0
  });

  const activeFaction = factionsData.find(f => f.id === army.faction);

  // Load army from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bronepehota_army');
    if (saved) {
      try {
        setArmy(JSON.parse(saved));
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
      <header className="glass-strong border-b border-slate-700/50 px-2 md:px-4 py-2 md:py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className="p-2 md:p-2.5 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: activeFaction?.color || '#ef4444',
              boxShadow: `0 4px 14px 0 ${(activeFaction?.color || '#ef4444')}40`
            }}
          >
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">БРОНЕПЕХОТА</h1>
            <span
              className="text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
              style={{ color: activeFaction?.color || '#ef4444' }}
            >
              {activeFaction?.name}
            </span>
          </div>
        </div>

        <nav className="flex gap-1.5 md:gap-2">
          <button
            onClick={() => setView('builder')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 font-medium ${
              view === 'builder'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105'
                : 'bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white'
            }`}
            title="Штаб"
          >
            <Users className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Штаб</span>
          </button>
          <button
            onClick={() => setView('game')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 font-medium ${
              view === 'game'
                ? 'bg-green-600 text-white shadow-lg shadow-green-900/50 scale-105'
                : 'bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white'
            }`}
            disabled={army.units.length === 0}
            title="В Бой!"
          >
            <Play className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">В Бой!</span>
          </button>
          <button
            onClick={() => router.push('/editor')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white font-medium"
          >
            <Edit className="w-4 h-4" />
            <span>Редактор</span>
          </button>
        </nav>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === 'builder' ? (
          <ArmyBuilder army={army} setArmy={setArmy} />
        ) : (
          <GameSession army={army} setArmy={setArmy} />
        )}
      </div>

      {/* Footer / Stats Bar - only show in builder mode */}
      {view === 'builder' && (
        <footer className="glass-strong border-t border-slate-700/50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm flex flex-col md:flex-row justify-around gap-2 md:gap-0 shadow-lg">
          <div className="flex items-center justify-center gap-2 md:gap-3 px-2 md:px-4 py-1 rounded-lg hover:bg-slate-800/30 transition-colors">
            <span className="hidden md:inline opacity-50 text-[10px] uppercase tracking-wider">Армия:</span>
            <span className="font-semibold truncate text-sm md:text-base">{army.name}</span>
          </div>
          <div className="flex items-center justify-center gap-2 md:gap-3 px-2 md:px-4 py-1 rounded-lg hover:bg-slate-800/30 transition-colors">
            <span className="hidden md:inline opacity-50 text-[10px] uppercase tracking-wider">Стоимость:</span>
            <span className={`font-bold text-base md:text-lg px-2 py-0.5 rounded-md ${
              army.totalCost > 1000
                ? 'text-orange-400 bg-orange-950/30 border border-orange-900/30'
                : 'text-green-400 bg-green-950/30 border border-green-900/30'
            }`}>
              {army.totalCost}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 md:gap-3 px-2 md:px-4 py-1 rounded-lg hover:bg-slate-800/30 transition-colors">
            <span className="hidden md:inline opacity-50 text-[10px] uppercase tracking-wider">Юнитов:</span>
            <span className="font-bold text-base md:text-lg px-2 py-0.5 rounded-md bg-blue-950/30 border border-blue-900/30 text-blue-400">
              {army.units.length}
            </span>
          </div>
        </footer>
      )}
    </main>
  );
}

