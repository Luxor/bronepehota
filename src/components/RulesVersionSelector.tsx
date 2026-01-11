'use client';

import { RulesVersionID } from '@/lib/types';
import { getAllRulesVersions } from '@/lib/rules-registry';

interface RulesVersionSelectorProps {
  selectedVersion: RulesVersionID;
  onVersionChange: (id: RulesVersionID) => void;
}

export default function RulesVersionSelector({
  selectedVersion,
  onVersionChange
}: RulesVersionSelectorProps) {
  const versions = getAllRulesVersions();

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <span className="text-[10px] md:text-xs opacity-60 uppercase tracking-wider hidden md:inline">
        Версия:
      </span>
      <select
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value as RulesVersionID)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs md:text-sm font-medium min-h-[36px] md:min-h-[40px] min-w-[90px] md:min-w-[120px]"
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            {version.name}
          </option>
        ))}
      </select>
    </div>
  );
}
