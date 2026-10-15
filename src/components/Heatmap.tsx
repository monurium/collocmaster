import React, { useState } from 'react';
import { generate30DayHeatmap } from '../utils/srsEngine';
import { ReviewLog } from '../types';
import { Calendar } from 'lucide-react';

interface HeatmapProps {
  history: ReviewLog[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ history }) => {
  const [hovered, setHovered] = useState<{ date: string; count: number } | null>(null);
  const days = generate30DayHeatmap(history);

  const totalReviews = days.reduce((a, d) => a + d.count, 0);
  const activeDays   = days.filter((d) => d.count > 0).length;

  const getCellColor = (intensity: number) => {
    switch (intensity) {
      case 1: return 'bg-indigo-950 border-indigo-800/50 hover:border-indigo-500';
      case 2: return 'bg-indigo-700 border-indigo-500 hover:border-indigo-300';
      case 3: return 'bg-indigo-500 border-indigo-400 hover:border-indigo-200';
      case 4: return 'bg-cyan-400 border-cyan-300 shadow-sm shadow-cyan-500/30 hover:border-white';
      default: return 'bg-[#131D2E] border-[#1E2D45] hover:border-[#2D3F5A]';
    }
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Son 30 Gün Aktivitesi</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span><span className="font-mono font-bold text-white">{totalReviews}</span> tekrar</span>
          <span>•</span>
          <span><span className="font-mono font-bold text-white">{activeDays}</span>/30 gün aktif</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5 py-1">
        {days.map((day) => (
          <div
            key={day.date}
            onMouseEnter={() => setHovered(day)}
            onMouseLeave={() => setHovered(null)}
            className={`aspect-square w-full rounded-md border transition-all duration-100 cursor-pointer ${getCellColor(day.intensity)}`}
            title={`${formatDate(day.date)}: ${day.count} tekrar`}
          />
        ))}
      </div>

      {/* Tooltip row */}
      <div className="h-6 mt-2 flex items-center justify-between text-xs">
        <span className="text-zinc-500">
          {hovered ? (
            <span className="animate-fadeIn text-zinc-300">
              <strong className="text-white">{formatDate(hovered.date)}</strong>:{' '}
              <span className="text-indigo-400 font-mono">{hovered.count} tekrar</span>
            </span>
          ) : (
            'Bir kare üzerine gelin'
          )}
        </span>

        {/* Legend */}
        <div className="flex items-center gap-1 text-[10px] text-zinc-600">
          <span>Az</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-sm border ${getCellColor(i)}`} />
          ))}
          <span>Çok</span>
        </div>
      </div>
    </div>
  );
};
