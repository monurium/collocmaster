import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Collocation, SRSItem } from '../types';
import { isMastered, isDue } from '../utils/srsEngine';
import { AudioButton } from '../components/AudioButton';
import { AddCollocationModal } from '../components/AddCollocationModal';
import { renderSentenceWithHighlight, normalizeSearchText } from '../utils/textHighlight';
import {
  Search,
  BookOpen,
  Play,
  X,
  ChevronRight,
  ChevronLeft,
  Filter,
  Plus,
  Trash2,
} from 'lucide-react';

type FilterKey = 'cefr' | 'category' | 'type' | 'status';

const FILTER_OPTIONS: Record<FilterKey, { label: string; values: string[] }> = {
  cefr:     { label: 'Seviye', values: ['Tümü', 'B1', 'B2', 'C1', 'C2'] },
  category: { label: 'Alan', values: ['Tümü', 'academic', 'business', 'everyday', 'literature'] },
  type:     { label: 'Tür', values: ['Tümü', 'verb-noun', 'adj-noun', 'adv-adj', 'phrase'] },
  status:   { label: 'Durum', values: ['Tümü', 'Sırada', 'Öğreniliyor', 'Öğrenildi', 'Görülmedi'] },
};

const CATEGORY_TR: Record<string, string> = {
  academic: 'Akademik', business: 'İş', everyday: 'Günlük', literature: 'Edebiyat', Tümü: 'Tümü',
};
const TYPE_TR: Record<string, string> = {
  'verb-noun': 'Fiil+İsim', 'adj-noun': 'Sıfat+İsim', 'adv-adj': 'Zarf+Sıfat', phrase: 'Deyim', Tümü: 'Tümü',
};

const ITEMS_PER_PAGE = 24;

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const collocations = useAppStore((s) => s.collocations);
  const getSRSItem = useAppStore((s) => s.getSRSItem);
  const srsItems = useAppStore((s) => s.srsItems);
  const deleteCollocation = useAppStore((s) => s.deleteCollocation);

  const [q, setQ] = useState('');
  const [cefr, setCefr] = useState('Tümü');
  const [cat, setCat] = useState('Tümü');
  const [type, setType] = useState('Tümü');
  const [status, setStatus] = useState('Tümü');
  const [modal, setModal] = useState<Collocation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Close modal on Escape and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modal) {
        setModal(null);
      }
    };
    if (modal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modal]);

  const filtered = useMemo(() => {
    const query = normalizeSearchText(q);
    const now = Date.now();

    return collocations.filter((col) => {
      const item = srsItems[col.id] || getSRSItem(col.id);

      if (query) {
        const hit =
          normalizeSearchText(col.chunk).includes(query) ||
          normalizeSearchText(col.meaning).includes(query) ||
          (col.unitTitle && normalizeSearchText(col.unitTitle).includes(query)) ||
          (col.synonyms && col.synonyms.some((s) => normalizeSearchText(s).includes(query))) ||
          col.collocates.some((c) => normalizeSearchText(c).includes(query)) ||
          col.examples.some((e) => normalizeSearchText(e.sentence).includes(query));
        if (!hit) return false;
      }

      if (cefr !== 'Tümü' && col.cefrLevel !== cefr) return false;
      if (cat !== 'Tümü' && col.category !== cat) return false;
      if (type !== 'Tümü' && col.type !== type) return false;

      if (status !== 'Tümü') {
        const seen = item.history.length > 0;
        if (status === 'Görülmedi' && seen) return false;
        if (status === 'Öğrenildi' && !isMastered(item)) return false;
        if (status === 'Sırada' && (!seen || !isDue(item, now))) return false;
        if (status === 'Öğreniliyor' && (!seen || isMastered(item))) return false;
      }

      return true;
    });
  }, [collocations, srsItems, q, cefr, cat, type, status, getSRSItem]);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [q, cefr, cat, type, status]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const hasActiveFilters = cefr !== 'Tümü' || cat !== 'Tümü' || type !== 'Tümü' || status !== 'Tümü';

  const getStatusBadge = (item: SRSItem) => {
    if (item.history.length === 0)
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400">Görülmedi</span>;
    if (isMastered(item))
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/50 text-cyan-300 border border-cyan-800/30">✅ Öğrenildi</span>;
    if (isDue(item))
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/50 text-rose-300 border border-rose-800/30">⏰ Sırada</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/50 text-indigo-300 border border-indigo-800/30">{item.interval}g aralık</span>;
  };

  const clearFilters = () => {
    setCefr('Tümü');
    setCat('Tümü');
    setType('Tümü');
    setStatus('Tümü');
  };

  return (
    <div className="space-y-5 pb-24 md:pb-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Kollokasyon Kütüphanesi
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {collocations.length} adet Cambridge İngilizce kollokasyon
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs font-mono text-zinc-400 bg-[#0F1829] px-3 py-2 rounded-xl border border-[#1E2D45]">
            <span className="text-white font-bold">{filtered.length}</span> sonuç (Sayfa {currentPage}/{totalPages})
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ekle</span>
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kollokasyon, anlam, ünite adı veya örnek cümle ara..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#070B14] border border-[#1E2D45] text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              hasActiveFilters
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-[#070B14] border-[#1E2D45] text-zinc-400 hover:text-white hover:border-[#2D3F5A]'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtrele</span>
            {hasActiveFilters && (
              <span className="text-xs bg-white/20 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filter panels */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t border-[#1E2D45]">
            {/* CEFR */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-zinc-500 w-16 shrink-0">Seviye:</span>
              {FILTER_OPTIONS.cefr.values.map((v) => (
                <button
                  key={v}
                  onClick={() => setCefr(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    cefr === v
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#131D2E] text-zinc-400 hover:text-white hover:bg-[#1A263C]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-zinc-500 w-16 shrink-0">Tür:</span>
              {FILTER_OPTIONS.type.values.map((v) => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    type === v
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#131D2E] text-zinc-400 hover:text-white hover:bg-[#1A263C]'
                  }`}
                >
                  {TYPE_TR[v] || v}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-zinc-500 w-16 shrink-0">Durum:</span>
              {FILTER_OPTIONS.status.values.map((v) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    status === v
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#131D2E] text-zinc-400 hover:text-white hover:bg-[#1A263C]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Filtreleri temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Paginated Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginatedItems.map((col) => {
          const item = srsItems[col.id] || getSRSItem(col.id);
          return (
            <div
              key={col.id}
              onClick={() => setModal(col)}
              className="card card-hover p-4 flex flex-col gap-3 cursor-pointer group hover:border-indigo-500/50 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {col.unitNumber && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                      U{col.unitNumber}
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                    {col.cefrLevel}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#131D2E] text-zinc-500">
                    {TYPE_TR[col.type] || col.type}
                  </span>
                  {col.isCustom && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      Özel
                    </span>
                  )}
                </div>
                {getStatusBadge(item)}
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {col.chunk}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {col.meaning}
                </p>
              </div>

              {col.examples[0] && (
                <p className="text-xs text-zinc-300 italic line-clamp-2 bg-[#070B14] rounded-lg px-2.5 py-2 border border-[#1E2D45]">
                  "{renderSentenceWithHighlight(col.examples[0].sentence, col.chunk)}"
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-[#1E2D45] mt-auto">
                <span className="capitalize text-[11px] truncate max-w-[150px]">
                  {col.unitTitle || CATEGORY_TR[col.category] || col.category}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal(col);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold text-[11px]"
                >
                  Detayları Gör <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#111927] border border-[#1E2D45] rounded-2xl p-3 px-4 mt-4">
          <button
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#162235] text-zinc-300 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Önceki
          </button>

          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <span>Sayfa <strong className="text-white">{currentPage}</strong> / {totalPages}</span>
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#162235] text-zinc-300 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-300 transition-all"
          >
            Sonraki <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 card">
          <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-300">Sonuç bulunamadı</h3>
          <p className="text-sm text-zinc-500 mt-1">Filtre veya arama terimini değiştirmeyi deneyin.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Tüm filtreleri kaldır
            </button>
          )}
        </div>
      )}

      {/* ── Detail Modal rendered directly in document.body via Portal ── */}
      {modal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0F1829] border border-[#1E2D45] p-5 sm:p-7 shadow-2xl animate-slideUp">
            <button
              onClick={() => setModal(null)}
              className="absolute right-4 top-4 p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-[#131D2E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges */}
            <div className="flex items-center gap-1.5 mb-3">
              {modal.unitNumber && (
                <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  Unit {modal.unitNumber}
                </span>
              )}
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                {modal.cefrLevel}
              </span>
              <span className="px-2.5 py-1 text-xs rounded-lg bg-cyan-950/40 text-cyan-300 capitalize">
                {TYPE_TR[modal.type] || modal.type}
              </span>
              {modal.level && (
                <span className="px-2.5 py-1 text-xs rounded-lg bg-[#162235] text-zinc-400">
                  {modal.level}
                </span>
              )}
            </div>

            {/* Title */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-white">{modal.chunk}</h2>
                <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{modal.meaning}</p>
                {modal.unitTitle && (
                  <p className="text-xs text-indigo-400 font-semibold mt-1">
                    Konu: {modal.unitTitle}
                  </p>
                )}
                {modal.synonyms && modal.synonyms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Eş Anlamlılar:</span>
                    {modal.synonyms.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <AudioButton text={modal.chunk} showLabel />
            </div>

            {/* Examples */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Örnek Cümleler</p>
              {modal.examples.map((ex, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#070B14] border border-[#1E2D45]">
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    "{renderSentenceWithHighlight(ex.sentence, modal.chunk)}"
                  </p>
                </div>
              ))}
            </div>

            {/* Mistakes */}
            {modal.commonMistakes && modal.commonMistakes.length > 0 && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/15">
                <p className="text-xs font-bold text-rose-400 mb-2">❌ Kaçınılacak Hatalar</p>
                <div className="flex flex-wrap gap-1.5">
                  {modal.commonMistakes.map((m, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs bg-rose-950/40 text-rose-200 rounded border border-rose-800/30 line-through"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#1E2D45]">
              {modal.isCustom ? (
                <button
                  onClick={() => {
                    deleteCollocation(modal.id);
                    setModal(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kollokasyonu Sil</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white font-semibold"
                >
                  Kapat
                </button>
                <button
                  id={`practice-${modal.id}-btn`}
                  onClick={() => {
                    const id = modal.id;
                    setModal(null);
                    navigate('/study', { state: { targetId: id } });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/25"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Kartla Çalış
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Collocation Modal */}
      <AddCollocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
export default Library;
