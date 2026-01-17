'use client';

import { CombatParameters, CombatActionType } from '@/lib/combat-types';
import { FortificationType } from '@/lib/types';
import { NumberStepper } from '@/components/ui/NumberStepper';
import { FortificationSelector } from '@/components/FortificationSelector';
import { RulesVersionID } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ParameterInputsProps {
  actionType: CombatActionType;
  parameters: CombatParameters;
  onChange: (params: Partial<CombatParameters>) => void;
  rulesVersion: RulesVersionID;
  className?: string;
}

export function ParameterInputs({
  actionType,
  parameters,
  onChange,
  rulesVersion,
  className,
}: ParameterInputsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="text-xs opacity-50 uppercase font-bold mb-4 tracking-wider">Параметры атаки</div>

        <div className="grid grid-cols-1 gap-4">
          {/* Distance Input */}
          {(actionType === 'shot' || actionType === 'grenade') && (
            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
              <label className="text-xs opacity-50 uppercase font-bold whitespace-nowrap">
                {actionType === 'shot' ? 'Дистанция' : 'Цель (шагов)'}
              </label>
              <NumberStepper
                value={parameters.distance}
                onChange={(value) => onChange({ distance: value })}
                min={1}
                max={20}
                step={1}
                size="lg"
                className="justify-start"
              />
            </div>
          )}

          {/* Target Armor Input */}
          {(actionType === 'shot' || actionType === 'grenade') && (
            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
              <label className="text-xs opacity-50 uppercase font-bold whitespace-nowrap">
                Броня цели
              </label>
              <NumberStepper
                value={parameters.targetArmor}
                onChange={(value) => onChange({ targetArmor: value })}
                min={0}
                max={10}
                step={1}
                size="lg"
                className="justify-start"
              />
            </div>
          )}

          {/* Target Melee Input (for melee attacks) */}
          {actionType === 'melee' && (
            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
              <label className="text-xs opacity-50 uppercase font-bold whitespace-nowrap">
                ББ цели
              </label>
              <NumberStepper
                value={parameters.targetMelee}
                onChange={(value) => onChange({ targetMelee: value })}
                min={0}
                max={10}
                step={1}
                size="lg"
                className="justify-start"
              />
            </div>
          )}

          {/* Fortification Selector */}
          {(actionType === 'shot' || actionType === 'grenade') && (
            <div className="grid grid-cols-[100px_1fr] gap-3 items-start">
              <label className="text-xs opacity-50 uppercase font-bold whitespace-nowrap pt-2">
                Укрытие
              </label>
              <FortificationSelector
                value={parameters.fortification}
                onChange={(value) => onChange({ fortification: value })}
                rulesVersion={rulesVersion}
                className="flex-1"
              />
            </div>
          )}
        </div>
      </div>

      {/* Rules hint based on version */}
      {rulesVersion === 'fan' && (actionType === 'shot' || actionType === 'grenade') && parameters.fortification !== 'none' && (
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="text-xs text-orange-400 font-medium">
            Правила Фана: укрытие добавляет {parameters.fortification === 'light' ? '+1' : '+2'} к дистанции цели
          </div>
        </div>
      )}

      {rulesVersion === 'tehnolog' && (actionType === 'shot' || actionType === 'grenade') && parameters.fortification !== 'none' && (
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="text-xs text-orange-400 font-medium">
            Официальные правила: укрытие добавляет {parameters.fortification === 'light' ? '+1' : '+2'} к броне цели
          </div>
        </div>
      )}
    </div>
  );
}
