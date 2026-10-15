import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collocation, SRSItem, Grade } from '../types';
import { getIntervalPreviews } from '../utils/srsEngine';
import { speakCollocation, playChime } from '../utils/audio';
import { renderSentenceWithHighlight } from '../utils/textHighlight';
import {
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  X,
  Volume2,
} from 'lucide-react';

interface FlashcardProps {
  collocation: Collocation;
  srsItem: SRSItem;
  speechRate?: number;
  autoAudio?: boolean;
  onGrade: (grade: Grade, timeSpentMs: number) => void;
}

// Grade button configs — plain language labels
const GRADE_CONFIG: {
  grade: Grade;
  label: string;
  sublabel: string;
  emoji: string;
  colorClass: string;
  hotkey: string;
}[] = [
  {
    grade: 1,
    label: 'Bilmedim',
    sublabel: '10 dk sonra tekrar',
    emoji: '😣',
    colorClass: 'border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200',
    hotkey: '1',
  },
  {
    grade: 2,
    label: 'Zor geldi',
    sublabel: '',
    emoji: '😓',
    colorClass: 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200',
    hotkey: '2',
  },
  {
    grade: 3,
    label: 'Hallettim',
    sublabel: '',
    emoji: '😊',
    colorClass: 'border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/25',
    hotkey: '3',
  },
  {
    grade: 4,
    label: 'Çok kolay!',
    sublabel: '',
    emoji: '🚀',
    colorClass: 'border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200',
    hotkey: '4',
  },
];

export const Flashcard: React.FC<FlashcardProps> = ({
  collocation,
  srsItem,
  speechRate = 0.95,
  autoAudio = true,
  onGrade,
}) => {
  const [phase, setPhase] = useState<'production' | 'feedback'>('production');
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const primaryExample = useMemo(() => {
    const list = collocation.examples && collocation.examples.length > 0 ? collocation.examples : [];
    if (list.length === 0) {
      return {
        sentence: collocation.chunk,
        clozeSentence: '___',
        missingWord: collocation.chunk,
      };
    }
    return list[Math.floor(Math.random() * list.length)];
  }, [collocation.id, collocation.examples]);

  const intervalPreviews = getIntervalPreviews(srsItem);

  // Reset on new card
  useEffect(() => {
    setPhase('production');
    setUserInput('');
    setIsCorrect(null);
    setShowHint(false);
    startTimeRef.current = Date.now();
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [collocation.id]);

  // Auto-speak on feedback
  useEffect(() => {
    if (phase === 'feedback' && autoAudio) {
      setTimeout(() => speakCollocation(collocation.chunk, speechRate), 300);
    }
  }, [phase, autoAudio, collocation.chunk, speechRate]);

  const handleCheck = () => {
    const clean = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const ok =
      clean(userInput) === clean(collocation.chunk) ||
      clean(userInput) === clean(primaryExample.missingWord);
    setIsCorrect(ok);
    setPhase('feedback');
    playChime(ok ? 'success' : 'flip');
  };

  const handleReveal = () => {
    setIsCorrect(false);
    setPhase('feedback');
    playChime('flip');
  };

  const submitGrade = (grade: Grade) => {
    const elapsed = Date.now() - startTimeRef.current;
    if (grade === 1) playChime('again');
    else playChime('flip');
    onGrade(grade, elapsed);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (!(e.target instanceof HTMLInputElement)) {
          e.preventDefault();
          speakCollocation(collocation.chunk, speechRate);
        }
        return;
      }
      if (phase === 'production' && e.key === 'Enter') {
        e.preventDefault();
        if (userInput.trim()) handleCheck();
        else handleReveal();
      } else if (phase === 'feedback') {
        if (e.key === '1') { e.preventDefault(); submitGrade(1); }
        else if (e.key === '2') { e.preventDefault(); submitGrade(2); }
        else if (e.key === '3') { e.preventDefault(); submitGrade(3); }
        else if (e.key === '4') { e.preventDefault(); submitGrade(4); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); submitGrade(3); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, userInput, collocation, speechRate]);

  // Render cloze sentence with the blank highlighted
  const renderCloze = () => {
    const parts = primaryExample.clozeSentence.split('___');
    return parts.map((part: string, i: number, arr: string[]) => (
      <React.Fragment key={i}>
        <span>{part}</span>
        {i < arr.length - 1 && (
          <span className="inline-flex items-center mx-1 px-3 py-0.5 rounded-lg font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 animate-pulse">
            _____
          </span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {phase === 'production' ? (
          /* ─── PHASE 1: PRODUCTION ─── */
          <motion.div
            key="prod"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="card p-5 sm:p-7"
          >
            {/* Meta badges */}
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  {collocation.cefrLevel}
                </span>
                <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#131D2E] text-zinc-400 border border-[#1E2D45] capitalize">
                  {collocation.category}
                </span>
                <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-800/30 capitalize">
                  {collocation.type}
                </span>
              </div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded-lg hover:bg-[#131D2E]"
                title="İpucu göster"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'İpucu gizle' : 'İpucu'}
              </button>
            </div>

            {/* Task label */}
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              📝 Boşluğu doğru kollokasyonla doldurun
            </p>

            {/* Cloze sentence */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070B14] border border-[#1E2D45] mb-5">
              <p className="text-lg sm:text-xl font-medium text-zinc-100 leading-relaxed">
                {renderCloze()}
              </p>
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200"
                >
                  <span className="font-bold text-amber-400">💡 Anlam: </span>
                  {collocation.meaning}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (userInput.trim()) handleCheck(); else handleReveal(); } }}
                  placeholder="Kollokasyonu yazın..."
                  className="input-base pr-28"
                />
                <button
                  onClick={() => userInput.trim() ? handleCheck() : handleReveal()}
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
                >
                  Kontrol Et
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500">
                <button
                  onClick={handleReveal}
                  className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Bilmiyorum, göster
                </button>
                <span className="hidden sm:flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-[#131D2E] border border-[#1E2D45] rounded text-[10px] font-mono">Enter</kbd>
                  kontrol eder
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ─── PHASE 2: FEEDBACK ─── */
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="card p-5 sm:p-7"
          >
            {/* Result banner */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-xl mb-5 ${
                isCorrect
                  ? 'bg-emerald-500/12 border border-emerald-500/30'
                  : 'bg-rose-500/10 border border-rose-500/25'
              }`}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span className={`text-sm font-bold ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {isCorrect
                    ? '✨ Harika! Tam doğru yazdın.'
                    : userInput
                    ? `Senin cevabın: "${userInput}"`
                    : '🔎 Doğru cevabı gör ve sor'}
                </span>
              </div>
              <span className="text-xs text-zinc-500 font-mono shrink-0">{collocation.cefrLevel}</span>
            </div>

            {/* Answer reveal */}
            <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-[#1E2D45]">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Doğru Kollokasyon
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {collocation.chunk}
                </h2>
                <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                  {collocation.meaning}
                </p>
                {collocation.synonyms && collocation.synonyms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Eş Anlamlılar:</span>
                    {collocation.synonyms.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => speakCollocation(collocation.chunk, speechRate)}
                className="shrink-0 p-3 rounded-xl bg-[#131D2E] border border-[#1E2D45] hover:border-indigo-500/40 text-zinc-300 hover:text-indigo-300 transition-all"
                title="Telaffuzu duy (R)"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Context sentence */}
            <div className="mb-4 p-3.5 rounded-xl bg-[#070B14] border border-[#1E2D45]">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Örnek Cümle {collocation.examples.length > 1 && `(1 / ${collocation.examples.length})`}
                </p>
              </div>
              <p className="text-base text-zinc-200 leading-relaxed font-medium">
                "{renderSentenceWithHighlight(primaryExample.sentence, collocation.chunk)}"
              </p>

              {collocation.examples.length > 1 && (
                <div className="mt-3 pt-3 border-t border-[#1E2D45]/60 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Alternatif Kullanımlar ({collocation.examples.length - 1}):
                  </p>
                  {collocation.examples
                    .filter((ex) => ex.sentence !== primaryExample.sentence)
                    .map((ex, i) => (
                      <p key={i} className="text-xs text-zinc-300 italic pl-2 border-l-2 border-indigo-500/40">
                        "{renderSentenceWithHighlight(ex.sentence, collocation.chunk)}"
                      </p>
                    ))}
                </div>
              )}
            </div>

            {/* Common mistakes */}
            {collocation.commonMistakes?.length > 0 && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/15">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2">
                  ❌ Sık yapılan hatalar (bunlardan kaçın)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {collocation.commonMistakes.map((m, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/30 text-xs text-rose-200 line-through decoration-rose-500"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collocates */}
            {collocation.collocates?.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  🔗 İlişkili Kollokasyonlar
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {collocation.collocates.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ─── GRADE BUTTONS ─── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-zinc-300">
                  Ne kadar iyi hatırladın?
                </p>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  Klavye: 1, 2, 3, 4
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {GRADE_CONFIG.map(({ grade, label, sublabel, emoji, colorClass, hotkey }) => {
                  const preview = intervalPreviews[grade];
                  return (
                    <button
                      key={grade}
                      id={`grade-btn-${grade}`}
                      onClick={() => submitGrade(grade)}
                      className={`grade-btn border ${colorClass} select-none`}
                    >
                      <span className="text-xl mb-1">{emoji}</span>
                      <span className="text-xs font-extrabold">{label}</span>
                      <span className="text-[10px] opacity-70 mt-0.5 font-mono">
                        {sublabel || preview}
                      </span>
                      <kbd className="mt-1.5 px-1.5 py-0.5 text-[9px] bg-black/20 border border-white/10 rounded font-mono opacity-50">
                        {hotkey}
                      </kbd>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-[11px] text-zinc-600 mt-3">
                💡 <strong className="text-zinc-500">Hallettim</strong> seçersen algoritma optimum aralıkla geri getirecek.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
