import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppStore, StudyLevel } from '../store/useAppStore';
import { UnitSummary } from '../types';
import { speakCollocation } from '../utils/audio';
import { renderSentenceWithHighlight, normalizeSearchText } from '../utils/textHighlight';
import {
  BookOpen,
  GraduationCap,
  Search,
  Volume2,
  X,
  Puzzle,
  FileCheck2,
  AlertTriangle,
  Eye,
  Layers,
} from 'lucide-react';

type UnitTheme = 'all' | 'basics' | 'verbs_adverbs' | 'everyday' | 'work_academic' | 'concepts';

const UNIT_THEMES: { id: UnitTheme; label: string; range: string; filter: (u: UnitSummary) => boolean }[] = [
  { id: 'all', label: 'Tüm Konular', range: '1-60+', filter: () => true },
  { id: 'basics', label: 'Temel İlkeler', range: '1–5', filter: (u) => u.level === 'Intermediate' && u.unitNumber >= 1 && u.unitNumber <= 5 },
  { id: 'verbs_adverbs', label: 'Zarflar & Fiiller', range: '6–12', filter: (u) => u.level === 'Intermediate' && u.unitNumber >= 6 && u.unitNumber <= 12 },
  { id: 'everyday', label: 'Günlük Yaşam', range: '13–26', filter: (u) => u.level === 'Intermediate' && u.unitNumber >= 13 && u.unitNumber <= 26 },
  { id: 'work_academic', label: 'İş & Akademi', range: '27–36', filter: (u) => u.level === 'Intermediate' && u.unitNumber >= 27 && u.unitNumber <= 36 },
  { id: 'concepts', label: 'Kavramlar & İletişim', range: '37–60', filter: (u) => u.level === 'Intermediate' && u.unitNumber >= 37 && u.unitNumber <= 60 },
];

export const UnitsView: React.FC = () => {
  const navigate = useNavigate();
  const getUnitSummaries = useAppStore((s) => s.getUnitSummaries);
  const activeLevel = useAppStore((s) => s.activeLevel);
  const setActiveLevel = useAppStore((s) => s.setActiveLevel);

  const [search, setSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<UnitTheme>('all');
  const [selectedUnit, setSelectedUnit] = useState<UnitSummary | null>(null);

  // Close modal on Escape and prevent body scrolling when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedUnit) {
        setSelectedUnit(null);
      }
    };
    if (selectedUnit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedUnit]);

  const summaries = useMemo(() => {
    return getUnitSummaries(activeLevel);
  }, [getUnitSummaries, activeLevel]);

  const filteredSummaries = useMemo(() => {
    const activeThemeObj = UNIT_THEMES.find((t) => t.id === selectedTheme);
    let list = summaries;

    if (activeThemeObj && activeThemeObj.id !== 'all' && activeLevel !== 'Advanced') {
      list = list.filter(activeThemeObj.filter);
    }

    const q = normalizeSearchText(search);
    if (!q) return list;

    return list.filter((u) => {
      const normTitle = normalizeSearchText(u.unitTitle);
      const matchTitle = normTitle.includes(q);
      const matchNum = `unit ${u.unitNumber}`.includes(q) || `${u.unitNumber}` === q;
      const matchCols = u.collocations.some((c) => {
        const normChunk = normalizeSearchText(c.chunk);
        const normMeaning = normalizeSearchText(c.meaning);
        const matchSynonyms = c.synonyms && c.synonyms.some((s) => normalizeSearchText(s).includes(q));
        return normChunk.includes(q) || normMeaning.includes(q) || matchSynonyms;
      });
      return matchTitle || matchNum || matchCols;
    });
  }, [summaries, search, selectedTheme, activeLevel]);

  const totalCollocationsCount = useMemo(() => {
    return summaries.reduce((acc, u) => acc + u.totalCount, 0);
  }, [summaries]);

  const totalMasteredCount = useMemo(() => {
    return summaries.reduce((acc, u) => acc + u.masteredCount, 0);
  }, [summaries]);

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Cambridge English Collocations in Use
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Kitap Üniteleri
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Kitaptaki 60 üniteye göre düzenlenmiş kollokasyonlar. Üniteye tıklayarak tüm kelimeleri inceleyin veya çalışma modunu seçin.
          </p>
        </div>

        {/* Level Toggle Tabs */}
        <div className="flex items-center bg-[#131D2E] p-1 rounded-2xl border border-[#1E2D45] self-start md:self-auto">
          {(['All', 'Intermediate', 'Advanced'] as StudyLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeLevel === lvl
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1A263C]'
              }`}
            >
              {lvl === 'All' ? 'Tüm Seviyeler' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0F172A]/70 border border-[#1E2D45] p-4 rounded-2xl">
        <div>
          <div className="text-xs text-zinc-400">Toplam Ünite</div>
          <div className="text-xl font-extrabold text-white mt-0.5">{summaries.length}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-400">Kollokasyon Sayısı</div>
          <div className="text-xl font-extrabold text-cyan-400 mt-0.5">{totalCollocationsCount}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-400">Öğrenilen (Mastered)</div>
          <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{totalMasteredCount}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-400">Genel İlerleme</div>
          <div className="text-xl font-extrabold text-indigo-400 mt-0.5">
            {totalCollocationsCount > 0
              ? `${Math.round((totalMasteredCount / totalCollocationsCount) * 100)}%`
              : '0%'}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="İngilizce veya Türkçe ara... (örn: 'make an effort', 'soğuk', 'şüphe', 'tat', 'Unit 10')"
          className="w-full bg-[#131D2E] border border-[#1E2D45] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Thematic Chapter Filter Pills (Pedagogical structuring) */}
      {activeLevel !== 'Advanced' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5" /> Konu:
          </span>
          {UNIT_THEMES.map((thm) => (
            <button
              key={thm.id}
              onClick={() => setSelectedTheme(thm.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedTheme === thm.id
                  ? 'bg-indigo-600/30 border border-indigo-500/60 text-indigo-200 shadow-sm'
                  : 'bg-[#111927] border border-[#1E2D45] text-zinc-400 hover:text-white hover:bg-[#162235]'
              }`}
            >
              {thm.label} <span className="text-[10px] opacity-60">({thm.range})</span>
            </button>
          ))}
        </div>
      )}

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSummaries.map((unit) => {
          const pct = unit.totalCount > 0 ? Math.round((unit.masteredCount / unit.totalCount) * 100) : 0;

          return (
            <div
              key={`${unit.level}_${unit.unitNumber}`}
              className="bg-[#111927] border border-[#1E2D45] hover:border-indigo-500/50 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group flex flex-col justify-between"
            >
              {/* Clickable Card Body */}
              <div
                onClick={() => setSelectedUnit(unit)}
                className="cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      Unit {unit.unitNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        unit.level === 'Advanced'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {unit.level}
                    </span>
                  </div>

                  <span className="text-xs text-zinc-400 font-medium">
                    {unit.totalCount} kollokasyon
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {unit.unitTitle}
                  </h3>
                  <span className="text-[11px] text-indigo-400 font-semibold shrink-0 flex items-center gap-1 group-hover:text-indigo-300">
                    <Eye className="w-3.5 h-3.5" /> İncele
                  </span>
                </div>

                {/* Sample chunks preview */}
                <div className="flex flex-wrap gap-1.5">
                  {unit.collocations.slice(0, 5).map((c) => (
                    <span
                      key={c.id}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-[#162235] text-zinc-300 border border-[#23334d]"
                    >
                      {c.chunk}
                    </span>
                  ))}
                  {unit.collocations.length > 5 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-zinc-500">
                      +{unit.collocations.length - 5} daha
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Öğrenilme Durumu</span>
                    <span className="font-semibold text-white">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#162235] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2 pt-4 mt-3 border-t border-[#1E2D45]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/study', { state: { unitNumber: unit.unitNumber, level: unit.level } });
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-[1.02]"
                  title="Bu üniteyi akıllı kartlarla çalış"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Kartlar</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/quiz', { state: { unitNumber: unit.unitNumber, level: unit.level } });
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-300 border border-cyan-500/30 transition-all hover:scale-[1.02]"
                  title="Cümle tamamlama ve çoktan seçmeli test çöz"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Test</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/match', { state: { unitNumber: unit.unitNumber, level: unit.level } });
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold bg-amber-600/15 hover:bg-amber-600/25 text-amber-300 border border-amber-500/30 transition-all hover:scale-[1.02]"
                  title="Kollokasyonları eşleştir"
                >
                  <Puzzle className="w-3.5 h-3.5" />
                  <span>Eşleştir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSummaries.length === 0 && (
        <div className="text-center py-16 bg-[#111927] border border-[#1E2D45] rounded-2xl">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Ünite bulunamadı</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Arama kriterinize uygun bir ünite çıkmadı. Aramayı temizlemeyi veya seviyeyi değiştirmeyi deneyebilirsiniz.
          </p>
        </div>
      )}

      {/* ── Unit Detail Drawer / Modal rendered directly in document.body via Portal ── */}
      {selectedUnit && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUnit(null);
          }}
        >
          <div className="bg-[#111927] border-t sm:border border-[#1E2D45] rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1E2D45] flex items-center justify-between bg-[#0F172A] shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-400">
                    Unit {selectedUnit.unitNumber} • {selectedUnit.level}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({selectedUnit.collocations.length} kollokasyon)
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">{selectedUnit.unitTitle}</h2>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="w-9 h-9 rounded-full bg-[#162235] hover:bg-[#1F2E45] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 divide-y divide-[#1E2D45]/50">
              {selectedUnit.collocations.map((col) => (
                <div key={col.id} className="pt-3.5 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-extrabold text-white">{col.chunk}</span>
                      <button
                        onClick={() => speakCollocation(col.chunk)}
                        className="text-zinc-400 hover:text-cyan-400 transition-colors p-1.5 rounded-lg hover:bg-[#162235]"
                        title="Sesli telaffuz et"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#162235] text-zinc-400 border border-[#23334d]">
                      {col.type}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-medium">{col.meaning}</p>

                  {col.synonyms && col.synonyms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">Eş Anlamlılar:</span>
                      {col.synonyms.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {col.examples && col.examples.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Örnek Cümleler ({col.examples.length})
                      </div>
                      <div className="space-y-1.5">
                        {col.examples.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="text-xs text-zinc-300 italic bg-[#0F172A] p-2.5 rounded-xl border border-[#1E2D45]/60 flex items-start gap-2"
                          >
                            <span className="text-[10px] font-bold text-indigo-400 select-none not-italic shrink-0 mt-0.5">
                              {exIdx + 1}.
                            </span>
                            <span className="leading-relaxed">
                              "{renderSentenceWithHighlight(ex.sentence, col.chunk)}"
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {col.commonMistakes && col.commonMistakes.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Kaçınılacak Hata: <strong className="line-through">{col.commonMistakes.join(', ')}</strong>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1E2D45] bg-[#0C121E] flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Kapat
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const u = selectedUnit;
                    setSelectedUnit(null);
                    navigate('/quiz', { state: { unitNumber: u.unitNumber, level: u.level } });
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#162235] hover:bg-[#1C2C45] text-cyan-300 border border-cyan-500/30 transition-all"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Test Çöz
                </button>
                <button
                  onClick={() => {
                    const u = selectedUnit;
                    setSelectedUnit(null);
                    navigate('/study', { state: { unitNumber: u.unitNumber, level: u.level } });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
                >
                  <GraduationCap className="w-4 h-4" />
                  Kartlarla Çalış
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default UnitsView;
