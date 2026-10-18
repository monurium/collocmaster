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
  Eye,
  BookOpen,
  AlertCircle,
  Lightbulb,
  Link2,
} from 'lucide-react';

interface FlashcardProps {
  collocation: Collocation;
  srsItem: SRSItem;
  speechRate?: number;
  autoAudio?: boolean;
  onGrade: (grade: Grade, timeSpentMs: number) => void;
  /** If true, show the card in read-only Recognition mode first before production */ 
  recognitionFirst?: boolean;
  /** Called when user clicks a related collocate to navigate to it */
  onStudyRelated?: (chunk: string) => void;
}

// Maps grammatical type codes to human-readable explanations
const TYPE_EXPLANATIONS: Record<string, { label: string; tip: string; color: string }> = {
  'verb-noun':  { label: 'Fiil + İsim',   tip: 'Fiil ve nesnesini birlikte ezberle — bunlar ayrılmaz ikilidir.',           color: 'text-violet-300 bg-violet-500/10 border-violet-500/25' },
  'adj-noun':   { label: 'Sıfat + İsim',  tip: "Sıfat her zaman isimden önce gelir; Türkçe'den farklı eşleşmeler olabilir.", color: 'text-sky-300 bg-sky-500/10 border-sky-500/25' },
  'adv-adj':    { label: 'Zarf + Sıfat',  tip: 'Zarf, sıfatın derecesini güçlendirir. Örn: "deeply concerned".',             color: 'text-teal-300 bg-teal-500/10 border-teal-500/25' },
  'phrase':     { label: 'Deyimsel İfade', tip: 'Bu ifadeyi kelime kelime çevirme; bir bütün olarak anla ve kullan.',          color: 'text-amber-300 bg-amber-500/10 border-amber-500/25' },
};

const getTypeInfo = (type: string) =>
  TYPE_EXPLANATIONS[type] ?? { label: type, tip: 'Bu kollokasyon tipini bir bütün olarak öğren.', color: 'text-zinc-300 bg-zinc-500/10 border-zinc-500/25' };

/** Extracts the core wrong usage from a commonMistake string like "make research (açıklama)" */
const extractMistakeCore = (m: string): string => m.split('(')[0].trim();

/** Parses the parenthetical explanation from a commonMistake string */
const extractMistakeExplanation = (m: string): string => {
  const match = m.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
};

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
  recognitionFirst = false,
  onStudyRelated,
}) => {
  // Recognition mode: show the card fully before asking for production
  const isNew = srsItem.repetitionCount === 0;
  const [phase, setPhase] = useState<'recognition' | 'production' | 'feedback'>(
    recognitionFirst && isNew ? 'recognition' : 'production'
  );
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showTypeInfo, setShowTypeInfo] = useState(false);
  // 2B: Register awareness state
  const [registerChoice, setRegisterChoice] = useState<string | null>(null);
  const [showRegisterQ, setShowRegisterQ] = useState(false);
  // 3A: Sentence production state
  const [ownSentence, setOwnSentence] = useState('');
  const [ownSentenceResult, setOwnSentenceResult] = useState<'ok' | 'missing' | null>(null);
  const [showSentenceBox, setShowSentenceBox] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const typeInfo = getTypeInfo(collocation.type);

  const REGISTER_OPTIONS = [
    { id: 'daily',    label: 'Günlük Konuşma',  emoji: '💬' },
    { id: 'work',     label: 'İş / Akademi',      emoji: '💼' },
    { id: 'writing',  label: 'Yazılı İfade',     emoji: '✍️' },
  ];

  const handleCheckOwnSentence = () => {
    const ok = ownSentence.toLowerCase().includes(collocation.chunk.toLowerCase());
    setOwnSentenceResult(ok ? 'ok' : 'missing');
  };

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
    const isNewCard = srsItem.repetitionCount === 0;
    setPhase(recognitionFirst && isNewCard ? 'recognition' : 'production');
    setUserInput('');
    setIsCorrect(null);
    setShowHint(false);
    setShowTypeInfo(false);
    setRegisterChoice(null);
    setShowRegisterQ(false);
    setOwnSentence('');
    setOwnSentenceResult(null);
    setShowSentenceBox(false);
    startTimeRef.current = Date.now();
    const t = setTimeout(() => {
      if (!(recognitionFirst && isNewCard)) inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(t);
  }, [collocation.id]);

  // Auto-speak on recognition or feedback
  useEffect(() => {
    if ((phase === 'feedback' || phase === 'recognition') && autoAudio) {
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
      if (phase === 'recognition' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        setPhase('production');
        startTimeRef.current = Date.now();
        setTimeout(() => inputRef.current?.focus(), 150);
      } else if (phase === 'production' && e.key === 'Enter') {
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
    <div className="w-full max-w-2xl mx-auto" aria-live="polite">
      <AnimatePresence mode="wait">
        {phase === 'recognition' ? (
          /* ─── PHASE 0: RECOGNITION (new cards only) ─── */
          <motion.div
            key="recognition"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="card p-5 sm:p-7"
          >
            {/* New card badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Yeni Kelime
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  {collocation.cefrLevel}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Adım 1 / 2: Tanıma</span>
            </div>

            {/* Instruction */}
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              👁️ Bu kollokasyonu incele ve seslendir
            </p>

            {/* The collocation chunk — large, prominent */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border border-indigo-500/20 mb-4 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                {collocation.chunk}
              </div>
              <div className="text-sm text-zinc-300">{collocation.meaning}</div>
            </div>

            {/* Type explanation */}
            <div
              className={`mb-4 p-3 rounded-xl border flex items-start gap-2 cursor-pointer ${typeInfo.color}`}
              onClick={() => setShowTypeInfo(!showTypeInfo)}
            >
              <Link2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider">Tip: {typeInfo.label}</span>
                {showTypeInfo && (
                  <p className="text-xs mt-1 opacity-90">{typeInfo.tip}</p>
                )}
              </div>
            </div>

            {/* Example sentence */}
            <div className="mb-5 p-3.5 rounded-xl bg-[#070B14] border border-[#1E2D45]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Örnek Kullanım</p>
              <p className="text-sm text-zinc-200 leading-relaxed italic">
                "{renderSentenceWithHighlight(primaryExample.sentence, collocation.chunk)}"
              </p>
            </div>

            {/* Common mistakes preview */}
            {collocation.commonMistakes?.length > 0 && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/15">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Dikkat: Sık Yapılan Hatalar
                </p>
                <div className="space-y-1.5">
                  {collocation.commonMistakes.slice(0, 2).map((m, i) => {
                    const core = extractMistakeCore(m);
                    const expl = extractMistakeExplanation(m);
                    return (
                      <div key={i} className="text-xs">
                        <span className="text-rose-300 line-through decoration-rose-500 mr-2">{core}</span>
                        {expl && <span className="text-zinc-400 italic">{expl}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setPhase('production');
                startTimeRef.current = Date.now();
                setTimeout(() => inputRef.current?.focus(), 150);
              }}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              Anladım, Şimdi Uygula
              <span className="text-[11px] font-mono opacity-70">(Enter)</span>
            </button>
          </motion.div>
        ) : phase === 'production' ? (
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
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  {collocation.cefrLevel}
                </span>
                <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#131D2E] text-zinc-400 border border-[#1E2D45] capitalize">
                  {collocation.category}
                </span>
                <button
                  onClick={() => setShowTypeInfo(!showTypeInfo)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border capitalize flex items-center gap-1 transition-all ${typeInfo.color} hover:opacity-80`}
                  title="Kollokasyon tipi hakkında bilgi al"
                >
                  <Link2 className="w-3 h-3" />
                  {typeInfo.label}
                </button>
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

            {/* Type info panel */}
            <AnimatePresence>
              {showTypeInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2 ${typeInfo.color}`}
                >
                  <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">{typeInfo.label}:</span>{' '}
                    <span className="opacity-90">{typeInfo.tip}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
              <div className="flex flex-col sm:relative gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (userInput.trim()) handleCheck(); else handleReveal(); } }}
                  placeholder="Kollokasyonu yazın..."
                  className="input-base sm:pr-28 text-sm sm:text-base py-3 sm:py-3.5"
                />
                <button
                  onClick={() => userInput.trim() ? handleCheck() : handleReveal()}
                  className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 px-4 py-3 sm:py-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95"
                >
                  Kontrol Et
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                <button
                  onClick={handleReveal}
                  className="flex items-center gap-1.5 hover:text-zinc-200 text-zinc-400 transition-colors py-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Bilmiyorum, cevabı göster
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

            {/* Teaching: Why Wrong panel — richer when user made an error */}
            {collocation.commonMistakes?.length > 0 && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/15">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {isCorrect === false && userInput
                    ? '📚 Neden Yanlış? — Öğretici Not'
                    : 'Sık yapılan hatalar (bunlardan kaçın)'}
                </p>

                {/* If user was wrong, show a personalized "why" explanation */}
                {isCorrect === false && userInput && (
                  <div className="mb-3 p-2.5 rounded-lg bg-[#0F1829] border border-rose-500/20 text-xs text-zinc-200">
                    <span className="font-bold text-rose-300">Yazdığın:</span>{' '}
                    <span className="text-rose-200">"{userInput}"</span>
                    <span className="mx-2 text-zinc-500">→</span>
                    <span className="font-bold text-emerald-300">Doğrusu:</span>{' '}
                    <span className="text-emerald-200">"{collocation.chunk}"</span>
                    {(() => {
                      // Try to find a matching mistake explanation for what the user typed
                      const match = collocation.commonMistakes.find((m) =>
                        extractMistakeCore(m).toLowerCase() === userInput.trim().toLowerCase()
                      );
                      const expl = match ? extractMistakeExplanation(match) : null;
                      return expl ? (
                        <p className="mt-1.5 text-amber-200 italic">💡 {expl}</p>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="space-y-1.5">
                  {collocation.commonMistakes.map((m, i) => {
                    const core = extractMistakeCore(m);
                    const expl = extractMistakeExplanation(m);
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <span className="shrink-0 px-2 py-0.5 rounded-md bg-rose-950/40 border border-rose-800/30 text-xs text-rose-300 line-through decoration-rose-500 font-mono">
                          {core}
                        </span>
                        {expl && (
                          <span className="text-[11px] text-zinc-400 italic pt-0.5">{expl}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2A: Collocates — now navigable */}
            {collocation.collocates?.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  🔗 İlgili Kollokasyonlar
                  {onStudyRelated && <span className="ml-1 text-indigo-400">(Çalışmak için tıkla)</span>}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {collocation.collocates.map((c, i) =>
                    onStudyRelated ? (
                      <button
                        key={i}
                        onClick={() => onStudyRelated(c)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/40 transition-all active:scale-95 cursor-pointer"
                      >
                        {c} →
                      </button>
                    ) : (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">{c}</span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* 3A: Write Your Own Sentence — Output Hypothesis */}
            <AnimatePresence>
              {!showSentenceBox ? (
                <button
                  onClick={() => setShowSentenceBox(true)}
                  className="w-full mb-4 py-2.5 rounded-xl border border-dashed border-indigo-500/30 text-xs text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-400/50 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Kendi cümlenle kullan (isteğe bağlı)
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="p-3.5 rounded-xl bg-[#0D1525] border border-indigo-500/20">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Kendi Cümlen — Üretim Pratiği
                    </p>
                    <p className="text-[11px] text-zinc-400 mb-2">
                      <strong className="text-indigo-300">"{collocation.chunk}"</strong> ifadesini kullanarak anlamlı bir cümle yaz:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ownSentence}
                        onChange={(e) => { setOwnSentence(e.target.value); setOwnSentenceResult(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCheckOwnSentence(); }}
                        placeholder={`... ${collocation.chunk} ...`}
                        className="flex-1 input-base text-xs py-2"
                        aria-label="Kendi cümleni yaz"
                      />
                      <button
                        onClick={handleCheckOwnSentence}
                        disabled={!ownSentence.trim()}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all active:scale-95 shrink-0"
                      >
                        Kontrol
                      </button>
                    </div>
                    <AnimatePresence>
                      {ownSentenceResult === 'ok' && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-xs text-emerald-300 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Harika! Kollokasyonu cümleye başarıyla dahil ettin. 🎉
                        </motion.p>
                      )}
                      {ownSentenceResult === 'missing' && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-xs text-amber-300 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> Cümlende <strong className="text-white">"{collocation.chunk}"</strong> tam olarak geçmiyor. Tekrar dene!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── GRADE BUTTONS ─── */}
            <div>
              {/* 2B: Register Awareness Question */}
              <AnimatePresence>
                {!showRegisterQ ? (
                  <button
                    onClick={() => setShowRegisterQ(true)}
                    className="w-full mb-3 py-2 rounded-xl border border-dashed border-zinc-700 text-[11px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Lightbulb className="w-3 h-3" />
                    Bu kollokasyonu nerede kullanırsın? (bağlam farkındalığı)
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-3 rounded-xl bg-[#0D1525] border border-amber-500/20"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Register Farkındalığı — Bu kolokasyonu nerede kullanırsın?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {REGISTER_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setRegisterChoice(opt.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                            registerChoice === opt.id
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                              : 'bg-[#162235] border-[#1E2D45] text-zinc-300 hover:border-amber-500/30'
                          }`}
                        >
                          <span>{opt.emoji}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {registerChoice && (
                      <p className="mt-2 text-[11px] text-zinc-400 italic">
                        {registerChoice === 'daily' && `"${collocation.chunk}" günlük konuşmada doğal bir ifadedir.`}
                        {registerChoice === 'work' && `"${collocation.chunk}" iş ve akademik bağlamlarda sık kullanılır.`}
                        {registerChoice === 'writing' && `"${collocation.chunk}" yazılı ifadelerde güçlü bir seçimdir.`}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-zinc-300">
                  Ne kadar iyi hatırladın?
                </p>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  Klavye: 1, 2, 3, 4
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {GRADE_CONFIG.map(({ grade, label, sublabel, emoji, colorClass, hotkey }) => {
                  const preview = intervalPreviews[grade];
                  return (
                    <button
                      key={grade}
                      id={`grade-btn-${grade}`}
                      onClick={() => submitGrade(grade)}
                      className={`grade-btn py-3 px-2 sm:py-3.5 border ${colorClass} select-none active:scale-95`}
                    >
                      <span className="text-xl sm:text-2xl mb-1">{emoji}</span>
                      <span className="text-xs sm:text-sm font-extrabold">{label}</span>
                      <span className="text-[10px] opacity-80 mt-0.5 font-mono">
                        {sublabel || preview}
                      </span>
                      <kbd className="hidden sm:inline-block mt-1.5 px-1.5 py-0.5 text-[9px] bg-black/20 border border-white/10 rounded font-mono opacity-50">
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
