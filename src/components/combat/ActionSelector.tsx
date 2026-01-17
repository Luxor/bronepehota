'use client';

import { CombatActionType } from '@/lib/combat-types';
import { Target, Sword, Bomb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionSelectorProps {
  onSelect: (action: CombatActionType) => void;
  grenadesAvailable?: boolean;
  className?: string;
}

export function ActionSelector({ onSelect, grenadesAvailable = true, className }: ActionSelectorProps) {
  const actions: Array<{
    type: CombatActionType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    disabled?: boolean;
  }> = [
    {
      type: 'shot',
      label: 'Выстрел',
      description: 'Дистанция, броня, укрытие',
      icon: <Target className="w-5 h-5" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600/20 hover:bg-orange-900/30',
    },
    {
      type: 'melee',
      label: 'Ближний бой',
      description: 'Кубики против кубиков',
      icon: <Sword className="w-5 h-5" />,
      color: 'text-red-400',
      bgColor: 'bg-red-600/20 hover:bg-red-900/30',
    },
    {
      type: 'grenade',
      label: 'Граната',
      description: '1D20 на площадь, D6 дистанция',
      icon: <Bomb className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20 hover:bg-green-900/30',
      disabled: !grenadesAvailable,
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      {actions.map((action) => (
        <button
          key={action.type}
          onClick={() => onSelect(action.type)}
          disabled={action.disabled}
          className={cn(
            "w-full p-4 min-h-[60px] bg-slate-800 border-2 border-slate-700 rounded-xl",
            "flex items-center gap-4 transition-all group active:scale-[0.98]",
            action.bgColor,
            action.disabled && "opacity-50 cursor-not-allowed bg-slate-800"
          )}
        >
          <div className={cn(
            "p-3 rounded-lg",
            action.disabled ? "bg-slate-700" : action.bgColor.split(' ')[0]
          )}>
            <div className={cn(action.color, action.disabled && "text-slate-500")}>
              {action.icon}
            </div>
          </div>
          <div className="text-left flex-1">
            <div className={cn("font-bold text-base", action.color, action.disabled && "text-slate-500")}>
              {action.disabled ? 'Гранаты израсходованы' : action.label}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{action.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
