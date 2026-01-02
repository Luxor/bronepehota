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
      <header className="bg-slate-800 border-b border-slate-700 p-2 md:p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="p-1.5 md:p-2 rounded-lg transition-colors" style={{ backgroundColor: activeFaction?.color || '#ef4444' }}>
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none">БРОНЕПЕХОТА</h1>
            <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">{activeFaction?.name}</span>
          </div>
        </div>
        
        <nav className="flex gap-1 md:gap-2">
          <button
            onClick={() => setView('builder')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-md transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 ${
              view === 'builder' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title="Штаб"
          >
            <Users className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Штаб</span>
          </button>
          <button
            onClick={() => setView('game')}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-md transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 ${
              view === 'game' ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600'
            }`}
            disabled={army.units.length === 0}
            title="В Бой!"
          >
            <Play className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">В Бой!</span>
          </button>
          <button
            onClick={() => router.push('/editor')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md transition-colors bg-slate-700 hover:bg-slate-600"
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

      {/* Footer / Stats Bar */}
      <footer className="bg-slate-800 border-t border-slate-700 p-2 text-xs md:text-sm flex flex-col md:flex-row justify-around gap-2 md:gap-0">
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <span className="hidden md:inline opacity-50">Армия:</span>
          <span className="font-semibold truncate">{army.name}</span>
        </div>
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <span className="hidden md:inline opacity-50">Стоимость:</span>
          <span className={`font-semibold ${army.totalCost > 1000 ? 'text-orange-400' : 'text-green-400'}`}>
            {army.totalCost}
          </span>
        </div>
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <span className="hidden md:inline opacity-50">Юнитов:</span>
          <span className="font-semibold">{army.units.length}</span>
        </div>
      </footer>
    </main>
  );
}

