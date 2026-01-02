'use client';

import { useState } from 'react';
import { calculateHit, calculateDamage } from '@/lib/game-logic';
import { Target, Shield, Crosshair, AlertTriangle } from 'lucide-react';

export default function CombatAssistant() {
  const [distance, setDistance] = useState(5);
  const [rangeType, setRangeType] = useState('D6+2');
  const [powerType, setPowerType] = useState('1D12');
  const [targetArmor, setTargetArmor] = useState(2);
  const [cover, setCover] = useState(0); // 0, 1, or 3

  const [result, setResult] = useState<{
    hit: { success: boolean, total: number, roll: number },
    damage: { damage: number, rolls: number[] }
  } | null>(null);

  const calculate = () => {
    const hit = calculateHit(rangeType, distance);
    let damage = { damage: 0, rolls: [] as number[] };
    if (hit.success) {
      damage = calculateDamage(powerType, targetArmor + cover);
    }
    setResult({ hit, damage });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Crosshair className="w-6 h-6 text-orange-500" />
          Расчет атаки
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Attacker Stats */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Атакующий</h3>
            
            <div className="space-y-1">
              <label className="text-xs opacity-60">Дистанция (шагов)</label>
              <input 
                type="number" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-60">Дальность оружия (напр. D6+2)</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                value={rangeType}
                onChange={(e) => setRangeType(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-60">Мощность оружия (напр. 2D6)</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                value={powerType}
                onChange={(e) => setPowerType(e.target.value)}
              />
            </div>
          </div>

          {/* Target Stats */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Цель</h3>
            
            <div className="space-y-1">
              <label className="text-xs opacity-60">Броня цели (Бр)</label>
              <input 
                type="number" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono"
                value={targetArmor}
                onChange={(e) => setTargetArmor(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-60">Укрытие</label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 3].map(v => (
                  <button
                    key={v}
                    onClick={() => setCover(v)}
                    className={`py-2 text-xs rounded-lg border transition-colors ${
                      cover === v ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {v === 0 ? 'Нет' : `+${v}`}
                  </button>
                ))}
              </div>
              <p className="text-[10px] opacity-40 mt-1">
                +1 (видна &gt; 50%), +3 (видна &lt; 50%)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full mt-8 bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98]"
        >
          Огонь!
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
          {/* Hit Result */}
          <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
            result.hit.success ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'
          }`}>
            <Target className={`w-8 h-8 mb-2 ${result.hit.success ? 'text-green-400' : 'text-red-400'}`} />
            <div className="text-xs opacity-60 uppercase font-bold tracking-widest">Результат</div>
            <div className={`text-2xl font-black ${result.hit.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.hit.success ? 'ПОПАДАНИЕ' : 'ПРОМАХ'}
            </div>
            <div className="text-sm opacity-50 mt-1">
              Бросок: {result.hit.total} vs {distance}
            </div>
          </div>

          {/* Damage Result */}
          <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
            result.hit.success ? (result.damage.damage > 0 ? 'bg-orange-900/20 border-orange-500/50' : 'bg-slate-800 border-slate-700') : 'bg-slate-900/50 border-slate-800 opacity-50'
          }`}>
            <Shield className={`w-8 h-8 mb-2 ${result.damage.damage > 0 ? 'text-orange-400' : 'text-slate-400'}`} />
            <div className="text-xs opacity-60 uppercase font-bold tracking-widest">Урон</div>
            <div className={`text-2xl font-black ${result.damage.damage > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
              {result.hit.success ? `-${result.damage.damage} HP` : '-'}
            </div>
            {result.hit.success && (
              <div className="text-sm opacity-50 mt-1">
                Кубики: {result.damage.rolls.join(', ')} (Бр {targetArmor + cover})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


