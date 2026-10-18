import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAppStore } from '../store/useAppStore';
import { Flashcard } from '../components/Flashcard';
import { Collocation, Grade } from '../types';
import { playChime } from '../utils/audio';
import { ArrowLeft, Trophy, RotateCcw, Zap, Link2 } from 'lucide-react';

export const StudySession: React.FC = () => {
  const navigate   = useNavigate();
  const location   = useLocation();

  const getDueCards   = useAppStore((s) => s.getDueCards);
  const getNewCards   = useAppStore((s) => s.getNewCards);
  const collocations  = useAppStore((s) => s.collocations);
  const getSRSItem    = useAppStore((s) => s.getSRSItem);
  const recordReview  = useAppStore((s) => s.recordReview);
  const settings      = useAppStore((s) => s.settings);

  const stateObj = location.state as { targetId?: string; unitNumber?: number; level?: string } | undefined;
  const targetId = stateObj?.targetId;
  const unitNumber = stateObj?.unitNumber;

  const queue = useMemo<Collocation[]>(() => {
    if (targetId) {
      const single = collocations.find((c) => c.id === targetId);
      if (single) return [single];
    }
    if (unitNumber != null) {
      const unitCards = collocations.filter((c) => c.unitNumber === unitNumber);
      if (unitCards.length > 0) return unitCards;
    }
    const due = getDueCards();
    if (due.length > 0) return due;
    const newItems = getNewCards(settings.dailyGoal || 10);
    if (newItems.length > 0) return newItems;
    return collocations.slice(0, 5);
  }, [targetId, unitNumber, collocations, getDueCards, getNewCards, settings.dailyGoal]);

  const [index, setIndex] = useState(0);
  const [done, setDone]   = useState(false);
  const [stats, setStats] = useState<{ grades: Grade[]; totalMs: number }>({ grades: [], totalMs: 0 });
  const [relatedChunk, setRelatedChunk] = useState<string | null>(null);

  const current = relatedChunk
    ? collocations.find((c) => c.chunk.toLowerCase() === relatedChunk.toLowerCase()) || queue[index]
    : queue[index];

  // Navigate to a related collocate — study it right now
  const handleStudyRelated = useCallback((chunk: string) => {
    setRelatedChunk(chunk);
  }, []);

  const handleClearRelated = () => {
    setRelatedChunk(null);
  };

  const handleGrade = (grade: Grade, timeMs: number) => {
    if (!current) return;
    recordReview(current.id, grade, timeMs);
    setStats((s) => ({ grades: [...s.grades, grade], totalMs: s.totalMs + timeMs }));

    // If we were studying a related card, go back to the queue
    if (relatedChunk) {
      setRelatedChunk(null);
      return;
    }

    if (index + 1 < queue.length) {
      setIndex((i) => i + 1);
    } else {
      setDone(true);
      playChime('complete');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 } });
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setDone(false);
    setStats({ grades: [], totalMs: 0 });
  };

  const accuracy = stats.grades.length > 0
    ? Math.round((stats.grades.filter((g) => g >= 3).length / stats.grades.length) * 100)
    : 100;

  const avgSec = stats.grades.length > 0
    ? (stats.totalMs / stats.grades.length / 1000).toFixed(1)
    : '0';

  return (
    <div className="max-w-2xl mx-auto py-2 pb-24 md:pb-6 space-y-5 animate-fadeIn">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          id="exit-session-btn"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-[#131D2E]"
        >
          <ArrowLeft className="w-4 h-4" />
          Çık
        </button>

        {!done && queue.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">
              {index + 1} / {queue.length}
            </span>
            <div className="w-32 sm:w-48 h-2 bg-[#131D2E] rounded-full overflow-hidden border border-[#1E2D45]">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-400"
                style={{ width: `${((index + 1) / queue.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      {!done && current ? (
        <div className="space-y-4">
          <Flashcard
            key={current.id + (relatedChunk || '')}
            collocation={current}
            srsItem={getSRSItem(current.id)}
            speechRate={settings.speechRate}
            autoAudio={settings.autoAudio}
            recognitionFirst={true}
            onStudyRelated={handleStudyRelated}
            onGrade={handleGrade}
          />
          {relatedChunk && (
            <button
              onClick={handleClearRelated}
              className="w-full py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" />
              İlgili kart — tamamla ve sıradaki karta dön
            </button>
          )}

          {/* Keyboard hints */}
          <div className="hidden sm:flex items-center justify-center gap-6 text-[11px] text-zinc-600">
            {[
              { key: 'Enter', desc: 'Kontrol et' },
              { key: '1–4', desc: 'Puan ver' },
              { key: 'R', desc: 'Sesli dinle' },
            ].map(({ key, desc }) => (
              <div key={key} className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-[#0F1829] border border-[#1E2D45] rounded font-mono text-zinc-400">{key}</kbd>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ─── SESSION COMPLETE ─── */
        <div className="card p-8 sm:p-12 text-center max-w-md mx-auto animate-fadeInScale">
          {/* Trophy */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-indigo-500 p-[1.5px] mb-6">
            <div className="w-full h-full bg-[#0F1829] rounded-[23px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Seans Tamamlandı! 🎉
          </h2>
          <p className="text-sm text-zinc-400 mb-8">
            Harika iş! SM-2 algoritması bir sonraki tekrar tarihlerini güncelledi.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 rounded-2xl bg-[#131D2E] border border-[#1E2D45]">
              <div className="text-2xl font-black font-mono text-white">{stats.grades.length}</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Kart</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#131D2E] border border-[#1E2D45]">
              <div className="text-2xl font-black font-mono text-emerald-400">{accuracy}%</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Doğruluk</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#131D2E] border border-[#1E2D45]">
              <div className="text-2xl font-black font-mono text-cyan-400">{avgSec}s</div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Ort. Süre</div>
            </div>
          </div>

          {/* Motivational message based on accuracy */}
          {accuracy >= 80 && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-200">
              <Zap className="w-4 h-4 inline mr-2 text-emerald-400" />
              Mükemmel performans! Uzun vadeli bellek güçleniyor.
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="return-dashboard-btn"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/30"
            >
              Ana Sayfaya Dön
            </button>
            <button
              id="practice-again-btn"
              onClick={handleRestart}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#1E2D45] bg-[#131D2E] hover:bg-[#1A2539] text-zinc-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Tekrar Çalış
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
