'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import type { RulesVersion, RulesVersionID } from '@/lib/types';

interface RulesSelectorProps {
  versions: RulesVersion[];
  selectedVersion: RulesVersionID;
  onVersionChange: (id: RulesVersionID) => void;
  onConfirm?: () => void;
}

export function RulesSelector({
  versions,
  selectedVersion,
  onVersionChange,
  onConfirm,
}: RulesSelectorProps) {
  const [expandedRulesId, setExpandedRulesId] = useState<RulesVersionID | null>(null);
  const debouncedSaveRef = useRef<NodeJS.Timeout>();

  // Auto-expand selected version on mount
  useEffect(() => {
    if (selectedVersion && expandedRulesId !== selectedVersion) {
      setExpandedRulesId(selectedVersion);
    }
  }, [selectedVersion, expandedRulesId]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current);
      }
    };
  }, []);

  const handleRulesClick = (rulesId: RulesVersionID) => {
    // Immediate UI update
    onVersionChange(rulesId);
    setExpandedRulesId(rulesId === expandedRulesId ? null : rulesId);

    // Debounced localStorage write
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }
    debouncedSaveRef.current = setTimeout(() => {
      localStorage.setItem('bronepehota_rules_version', rulesId);
    }, 300);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, rulesId: RulesVersionID) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRulesClick(rulesId);
    } else if (e.key === 'Escape' && expandedRulesId === rulesId) {
      setExpandedRulesId(null);
    }
  };

  return (
    <div id="rules-selector" className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-200">Подтвердите выбор правил</h2>
      <p className="text-sm text-slate-400 -mt-4">Вы можете изменить версию правил в любой момент</p>

      {/* Responsive grid: single column mobile, 2-3 columns desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {versions.map((version) => {
          const isSelected = selectedVersion === version.id;
          const isExpanded = expandedRulesId === version.id;

          return (
            <div
              key={version.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-expanded={isExpanded}
              aria-label={`Версия правил ${version.name}, ${isSelected ? 'выбрана' : 'не выбрана'}`}
              onKeyDown={(e) => handleKeyDown(e, version.id)}
              onClick={() => handleRulesClick(version.id)}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all
                min-h-[80px] min-w-[44px] min-h-[44px] touch-manipulation
                ${isSelected
                  ? `scale-105`
                  : 'hover:scale-102'
                }
                active:scale-95
              `}
              style={{
                borderColor: isSelected ? version.color : '#334155', // slate-700
                backgroundColor: isSelected ? `${version.color}10` : 'rgba(51, 65, 85, 0.4)', // slate-700/40
              }}
            >
              {/* Name and checkmark */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-200 truncate">
                  {version.name}
                </h3>
                {isSelected && (
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Description (always shown briefly) */}
              <p className="text-sm italic text-slate-400 mb-2" style={{ color: isSelected ? version.color : undefined }}>
                {version.description || 'Описание недоступно'}
              </p>

              {/* Color indicator bar */}
              <div className="h-1 rounded" style={{ backgroundColor: version.color || '#94a3b8' }}></div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-4 space-y-2 text-sm text-slate-400">
                  {version.description && (
                    <p>{version.description}</p>
                  )}
                  {version.features && version.features.length > 0 && (
                    <ul className="list-disc list-inside space-y-1">
                      {version.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      {onConfirm && (
        <div className="pt-4">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all min-h-[48px]"
          >
            Начать игру
          </button>
        </div>
      )}
    </div>
  );
}
