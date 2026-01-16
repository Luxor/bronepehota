'use client';

import React, { useState, KeyboardEvent } from 'react';

interface PointBudgetInputProps {
  presets: number[];
  value?: number;
  onChange: (value: number) => void;
  onNext?: () => void;
  disabled?: boolean;
}

/**
 * PointBudgetInput - Configure army point budget with presets and custom input
 *
 * Accessibility (FR-022, FR-023, FR-028):
 * - Keyboard: Tab to navigate, Enter to select preset, Escape to clear input
 * - ARIA: aria-pressed for presets, aria-invalid, aria-describedby for input
 *
 * Mobile (FR-025, FR-027):
 * - Breakpoints: <768px (mobile), 768-1024px (tablet), >1024px (desktop)
 * - Touch targets: 44x44px minimum, 48px height for buttons
 * - Numeric keyboard: type="number"
 */
export function PointBudgetInput({
  presets,
  value,
  onChange,
  onNext,
  disabled = false,
}: PointBudgetInputProps) {
  const [customValue, setCustomValue] = useState('');
  const [error, setError] = useState('');

  const validateInput = (input: string): number | null => {
    if (!input) {
      setError('Введите количество очков');
      return null;
    }

    const num = parseInt(input, 10);

    if (isNaN(num)) {
      setError('Введите число');
      return null;
    }

    if (num <= 0) {
      setError('Введите положительное число');
      return null;
    }

    if (num > 10000) {
      setError('Максимум 10000 очков');
      return null;
    }

    setError('');
    return num;
  };

  const handlePresetClick = (preset: number) => {
    setCustomValue('');
    setError('');
    onChange(preset);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomValue(inputValue);

    const validated = validateInput(inputValue);
    if (validated !== null) {
      onChange(validated);
    }
  };

  const handleCustomBlur = () => {
    const validated = validateInput(customValue);
    if (validated !== null) {
      onChange(validated);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setCustomValue('');
      setError('');
    }
  };

  const isPresetSelected = (preset: number) => value === preset && !customValue;

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-200">Очки армии</h3>
      <p className="text-sm text-slate-400 -mt-3">Выберите лимит очков для вашей армии</p>
      <p className="text-xs text-slate-500 -mt-2">Чем больше очков, тем больше юнитов вы можете добавить</p>

      {/* Preset buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {presets.map((preset) => (
          <button
            key={preset}
            role="button"
            aria-pressed={isPresetSelected(preset)}
            aria-label={`${preset} очков`}
            onClick={() => handlePresetClick(preset)}
            disabled={disabled}
            className={`
              relative px-4 py-3 rounded-lg font-semibold transition-all min-h-[48px] min-w-[44px] touch-manipulation
              ${disabled
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                : isPresetSelected(preset)
                  ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:scale-102 active:scale-95'
              }
            `}
          >
            {preset === 350 && !value && !customValue && (
              <div className="absolute -top-1 -right-1 bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded">
                ⭐ Рекомендовано
              </div>
            )}
            {preset}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="space-y-2">
        <label htmlFor="custom-budget" className="block text-sm text-slate-400">
          Или введите свое значение:
        </label>
        <input
          id="custom-budget"
          type="number"
          value={customValue}
          onChange={handleCustomChange}
          onBlur={handleCustomBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? 'budget-error' : undefined}
          placeholder="Введите количество очков"
          className={`
            w-full px-4 py-3 bg-slate-800 border-2 rounded-lg text-slate-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]
            ${error ? 'border-red-500' : 'border-slate-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        {error && (
          <p id="budget-error" role="alert" aria-live="assertive" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Next button */}
      {onNext && (
        <div className="pt-2">
          <button
            onClick={onNext}
            disabled={disabled || !value || !!error}
            aria-disabled={!value || !!error}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors min-h-[48px] min-w-[44px]"
          >
            Начать сбор армии
          </button>
        </div>
      )}
    </div>
  );
}
