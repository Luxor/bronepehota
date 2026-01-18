'use client';

import { parseRoll } from '@/lib/game-logic';
import { cn } from '@/lib/utils';

interface StaticDiceDisplayProps {
  rollStr: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'orange' | 'red' | 'green';
  showBonus?: boolean;
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { box: 'w-8 h-8 text-xs', bonus: 'text-[10px] px-1.5 py-0.5', container: 'gap-1' },
  md: { box: 'w-12 h-12 text-base', bonus: 'text-sm px-2 py-1', container: 'gap-2' },
  lg: { box: 'w-16 h-16 text-xl', bonus: 'text-base px-3 py-1.5', container: 'gap-3' },
};

const colorConfig = {
  blue: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-600/20',
    text: 'text-blue-400',
  },
  orange: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-600/20',
    text: 'text-orange-400',
  },
  red: {
    border: 'border-red-500/50',
    bg: 'bg-red-600/20',
    text: 'text-red-400',
  },
  green: {
    border: 'border-green-500/50',
    bg: 'bg-green-600/20',
    text: 'text-green-400',
  },
};

const diceSymbols: Record<number, string> = {
  6: '\u2685',  // ⚅
  12: '\u246B', // ⑫
  20: '\u2473', // ⑳
};

export function StaticDiceDisplay({
  rollStr,
  size = 'md',
  color = 'blue',
  showBonus = true,
  showLabel = false,
  className,
}: StaticDiceDisplayProps) {
  const { dice, sides, bonus } = parseRoll(rollStr);
  const sizeClasses = sizeConfig[size];
  const colorClasses = colorConfig[color];

  if (dice === 0) {
    // Handle special cases like "ББ" for melee
    return (
      <div className={cn(
        "flex flex-col items-center justify-center",
        className
      )}>
        <span className={cn(
          "font-black",
          sizeClasses.box,
          colorClasses.text
        )}>
          {rollStr}
        </span>
        {showLabel && (
          <span className="text-[10px] opacity-50 uppercase font-bold mt-1">
            Ближний бой
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", sizeClasses.container, className)}>
      {/* Dice boxes */}
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(dice, 3) }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-slate-900 rounded-lg flex items-center justify-center font-black border-2",
              sizeClasses.box,
              colorClasses.border,
              colorClasses.text
            )}
          >
            {diceSymbols[sides] || `D${sides}`}
          </div>
        ))}
        {dice > 3 && (
          <div className={cn(
            "bg-slate-900 rounded-lg flex items-center justify-center font-black border-2",
            sizeClasses.box,
            colorClasses.border,
            colorClasses.text
          )}>
            +{dice - 3}
          </div>
        )}
      </div>

      {/* Bonus indicator */}
      {showBonus && bonus > 0 && (
        <div className={cn(
          "rounded font-bold border",
          sizeClasses.bonus,
          colorClasses.bg,
          colorClasses.border,
          colorClasses.text
        )}>
          +{bonus}
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <span className="text-[10px] opacity-50 uppercase font-bold">
          {rollStr}
        </span>
      )}
    </div>
  );
}
