import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { UnitSummary } from '../types';
import { Search, X, Check, Layers } from 'lucide-react';

interface MultiUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnits: number[];
  onApply: (units: number[]) => void;
  unitSummaries: UnitSummary[];
}

export const MultiUnitModal: React.FC<MultiUnitModalProps> = ({
  isOpen,
  onClose,
  selectedUnits,
  onApply,
  unitSummaries,
}) => {
  const [tempSelected, setTempSelected] = useState<number[]>(selectedUnits);
  const [search, setSearch] = useState('');

  // Keep temp in sync when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedUnits);
      setSearch('');
    }
  }, [isOpen, selectedUnits]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return unitSummaries;
    return unitSummaries.filter((u) => {
      return (
        u.unitTitle.toLowerCase().includes(q) ||
        `unit ${u.unitNumber}`.includes(q) ||
        `${u.unitNumber}` === q
      );
    });
  }, [unitSummaries, search]);

  if (!isOpen) return null;

  const toggleUnit = (unitNumber: number) => {
    setTempSelected((prev) =>
      prev.includes(unitNumber)
        ? prev.filter((n) => n !== unitNumber)
        : [...prev, unitNumber]
    );
  };

  const handleSelectAll = () => {
    setTempSelected(unitSummaries.map((u) => u.unitNumber));
  };

  const handleClearAll = () => {
    setTempSelected([]);
  };

  const totalColsSelected = unitSummaries
    .filter((u) => tempSelected.includes(u.unitNumber))
    .reduce((sum, u) => sum + u.totalCount, 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#111927] border-t sm:border border-[#1E2D45] rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2D45] bg-[#0F172A] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-0.5">
              <Layers className="w-3.5 h-3.5" />
              Multi-Unit Study Selection
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Select Units to Practice</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#162235] hover:bg-[#1F2E45] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Bulk Select Toolbar */}
        <div className="p-3.5 border-b border-[#1E2D45] bg-[#0D1424] space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search units (e.g. '5', 'business', 'weather')..."
              className="w-full bg-[#131D2E] border border-[#1E2D45] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 text-[11px]">
              {tempSelected.length === 0 ? (
                <strong className="text-zinc-300">All Units</strong>
              ) : (
                <>
                  <strong className="text-indigo-300">{tempSelected.length}</strong> units selected ({totalColsSelected} collocations)
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Select All
              </button>
              <span className="text-zinc-600">•</span>
              <button
                onClick={handleClearAll}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear (All)
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Unit Grid */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map((u) => {
            const isSelected = tempSelected.includes(u.unitNumber);
            return (
              <button
                key={`${u.level}_${u.unitNumber}`}
                onClick={() => toggleUnit(u.unitNumber)}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-[#131D2E] border-[#1E2D45] text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'bg-[#162235] border-[#1E2D45] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#0B101C] text-indigo-300">
                      U{u.unitNumber}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate">{u.totalCount} cards</span>
                  </div>
                  <p className="text-xs font-semibold truncate leading-tight">{u.unitTitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2D45] bg-[#0C121E] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApply(tempSelected);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>
              {tempSelected.length === 0
                ? 'Practice All Units'
                : `Apply Selection (${tempSelected.length} ${tempSelected.length === 1 ? 'Unit' : 'Units'})`}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
