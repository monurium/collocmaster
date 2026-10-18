import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAppStore } from '../store/useAppStore';
import { QuizQuestion } from '../types';
import { speakCollocation, playChime } from '../utils/audio';
import { renderSentenceWithHighlight } from '../utils/textHighlight';
import {
  FileCheck2,
  ArrowLeft,
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
  Brain,
  AlertCircle,
  Link2,
  Lightbulb,
  Languages,
} from 'lucide-react';
import { MultiUnitModal } from '../components/MultiUnitModal';
import {
  extractMistakeCore,
  extractMistakeExplanation,
  isCleanEnglishDistractor,
} from '../utils/mistakeParser';

export const QuizView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const collocations = useAppStore((s) => s.collocations);
  const recordReview = useAppStore((s) => s.recordReview);
  const getUnitSummaries = useAppStore((s) => s.getUnitSummaries);

  const navState = location.state as { unitNumber?: number; unitNumbers?: number[]; level?: string } | undefined;
  const initialUnits = navState?.unitNumbers || (navState?.unitNumber != null ? [navState.unitNumber] : []);

  const TYPE_LABELS: Record<string, string> = {
    'verb-noun': 'Verb + Noun',
    'adj-noun': 'Adjective + Noun',
    'adv-adj': 'Adverb + Adjective',
    'phrase': 'Idiomatic Phrase',
  };

  const parseCommonMistakes = (mistakes: string[], targetChunk?: string) =>
    mistakes.map((m) => ({
      core: extractMistakeCore(m, targetChunk),
      explanation: extractMistakeExplanation(m, targetChunk),
    }));

  const [selectedUnits, setSelectedUnits] = useState<number[]>(initialUnits);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [quizMode, setQuizMode] = useState<'cloze' | 'recall'>('cloze');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<Array<{ q: QuizQuestion; chosen: string }>>([]);
  const [showTurkish, setShowTurkish] = useState(false);

  // Filter pool of collocations
  const pool = useMemo(() => {
    if (selectedUnits.length === 0) {
      return collocations;
    }
    return collocations.filter((c) => c.unitNumber && selectedUnits.includes(c.unitNumber));
  }, [collocations, selectedUnits]);

  // Generate quiz questions
  const questions = useMemo<QuizQuestion[]>(() => {
    if (pool.length === 0) return [];

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, pool.length));

    return selected.map((col, idx) => {
      const exampleList = col.examples && col.examples.length > 0 ? col.examples : [];
      const randomExample = exampleList.length > 0
        ? exampleList[Math.floor(Math.random() * exampleList.length)]
        : null;

      const example = randomExample || {
        sentence: col.chunk,
        clozeSentence: '___',
        missingWord: col.chunk,
      };

      const correct = col.chunk;
      const distractors = new Set<string>();

      if (col.commonMistakes && col.commonMistakes.length > 0) {
        for (const mistake of col.commonMistakes) {
          const clean = extractMistakeCore(mistake, correct);
          if (isCleanEnglishDistractor(clean, correct)) {
            distractors.add(clean);
          }
        }
      }

      const otherCols = pool.filter((c) => c.id !== col.id);
      const shuffledOthers = [...otherCols].sort(() => Math.random() - 0.5);

      for (const other of shuffledOthers) {
        if (distractors.size >= 3) break;
        if (other.chunk.toLowerCase() !== correct.toLowerCase()) {
          distractors.add(other.chunk);
        }
      }

      const fallbackChoices = ['make an effort', 'do your best', 'take a look', 'pay attention', 'keep in touch', 'cast doubt'];
      for (const fb of fallbackChoices) {
        if (distractors.size >= 3) break;
        if (fb.toLowerCase() !== correct.toLowerCase()) {
          distractors.add(fb);
        }
      }

      const options = [correct, ...Array.from(distractors).slice(0, 3)].sort(
        () => Math.random() - 0.5
      );

      const explanation = col.commonMistakes && col.commonMistakes.length > 0
        ? `Note (${col.unitTitle || 'Curriculum'}): The natural collocation is "${correct}". Avoid non-standard forms like "${col.commonMistakes.join(', ')}".`
        : `Note (${col.unitTitle || 'Curriculum'}): Correct collocation is "${correct}" — Meaning: ${col.meaning}`;

      return {
        id: `quiz_${idx}_${col.id}`,
        collocation: col,
        sentence: example.sentence,
        clozeSentence: example.clozeSentence,
        correctAnswer: correct,
        options,
        explanation,
      };
    });
  }, [pool]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt.toLowerCase() === currentQ.correctAnswer.toLowerCase();

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      playChime('success');
      recordReview(currentQ.collocation.id, 3, 3000);
    } else {
      setStreak(0);
      playChime('again');
      setWrongAnswers((prev) => [...prev, { q: currentQ, chosen: opt }]);
      recordReview(currentQ.collocation.id, 1, 3000);
    }
  };

  const handleNext = () => {
    setShowTurkish(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
      playChime('complete');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!isAnswered && currentQ && currentQ.options.length > 0) {
        const keyMap: Record<string, number> = {
          '1': 0, 'a': 0, 'A': 0,
          '2': 1, 'b': 1, 'B': 1,
          '3': 2, 'c': 2, 'C': 2,
          '4': 3, 'd': 3, 'D': 3,
        };
        if (keyMap[e.key] !== undefined) {
          const idx = keyMap[e.key];
          if (idx < currentQ.options.length) {
            e.preventDefault();
            handleSelectOption(currentQ.options[idx]);
          }
        }
      } else if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          setShowTurkish((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentQ, currentIndex, questions.length]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowTurkish(false);
    setScore(0);
    setStreak(0);
    setIsComplete(false);
    setWrongAnswers([]);
  };

  const unitSummaries = useMemo(() => getUnitSummaries(), [getUnitSummaries]);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 md:pb-10 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-xl hover:bg-[#131D2E] shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Unified Mobile-friendly Controls */}
        <div className="flex items-center gap-1.5 max-w-[calc(100%-48px)] overflow-x-auto scrollbar-none py-0.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#131D2E] p-1 rounded-xl border border-[#1E2D45] shrink-0">
            <button
              onClick={() => {
                setQuizMode('cloze');
                handleRestart();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                quizMode === 'cloze'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Cloze sentence completion quiz"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Cloze</span>
            </button>
            <button
              onClick={() => {
                setQuizMode('recall');
                handleRestart();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                quizMode === 'recall'
                  ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Meaning to collocation recall test"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Recall</span>
            </button>
          </div>

          {/* Unit Selector Button (Multi-Unit Picker) */}
          <button
            onClick={() => setIsUnitModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#131D2E] px-2.5 py-1.5 rounded-xl border border-[#1E2D45] hover:border-indigo-500/40 text-[11px] font-bold text-zinc-200 transition-all max-w-[150px] sm:max-w-[220px] shrink-0"
            title="Choose one or multiple units to practice"
          >
            <Filter className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate">
              {selectedUnits.length === 0
                ? 'All Units'
                : selectedUnits.length === 1
                ? `Unit ${selectedUnits[0]}`
                : `Units (${selectedUnits.length}): ${selectedUnits.sort((a, b) => a - b).join(', ')}`}
            </span>
          </button>
        </div>
      </div>

      {!isComplete && currentQ ? (
        <div className="space-y-4">
          {/* Progress and Streak */}
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span>
              Question <strong className="text-white">{currentIndex + 1}</strong> / {questions.length}
            </span>
            <div className="flex items-center gap-3">
              {streak > 1 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black animate-pulse">
                  🔥 {streak} Streak!
                </span>
              )}
              <span className="text-emerald-400">Score: {score}</span>
            </div>
          </div>

          <div className="w-full h-2 bg-[#131D2E] rounded-full overflow-hidden border border-[#1E2D45]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-[#111927] border border-[#1E2D45] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            {/* Unit Tag */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Unit {currentQ.collocation.unitNumber || 1}: {currentQ.collocation.unitTitle}
              </span>
              <button
                onClick={() => speakCollocation(currentQ.sentence)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-cyan-400 transition-colors p-1.5 rounded-xl hover:bg-[#162235]"
                title="Pronounce sentence"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Listen</span>
              </button>
            </div>

            {/* Question Display based on Mode */}
            <div className="text-center py-2 space-y-3">
              {quizMode === 'recall' ? (
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Brain className="w-3.5 h-3.5" />
                    Which English collocation matches this meaning?
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white leading-snug max-w-xl mx-auto">
                    "{currentQ.collocation.meaning}"
                  </div>
                  {/* Optional Turkish in Recall mode */}
                  {currentQ.collocation.meaningTr && (
                    <button
                      onClick={() => setShowTurkish(!showTurkish)}
                      className="text-xs text-zinc-400 hover:text-cyan-300 underline"
                    >
                      {showTurkish ? 'Hide TR' : '🇹🇷 Show TR'}
                    </button>
                  )}
                  {showTurkish && currentQ.collocation.meaningTr && (
                    <div className="text-xs text-indigo-300 bg-indigo-500/10 p-2 rounded-xl max-w-md mx-auto">
                      <strong>TR:</strong> {currentQ.collocation.meaningTr}
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-zinc-300 italic bg-[#0F172A] p-3.5 rounded-2xl border border-[#1E2D45]/70 max-w-xl mx-auto">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase not-italic block mb-1">Sentence Context:</span>
                    {currentQ.clozeSentence.split('___').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        <span>{part}</span>
                        {i < arr.length - 1 && (
                          <span className="inline-block px-2.5 py-0.5 mx-1 rounded-lg border-b-2 border-indigo-400 font-extrabold text-indigo-300 bg-indigo-500/10">
                            {isAnswered ? currentQ.correctAnswer : '.......'}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg sm:text-2xl font-semibold text-white leading-relaxed">
                    {currentQ.clozeSentence.split('___').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        <span>{part}</span>
                        {i < arr.length - 1 && (
                          <span className="inline-block px-3 py-1 mx-1.5 rounded-xl border-b-2 border-indigo-400 font-extrabold text-indigo-300 bg-indigo-500/10 min-w-[100px] text-center">
                            {isAnswered ? currentQ.correctAnswer : '.......'}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-3 font-medium">
                    Choose the natural collocation that fits the blank
                  </p>
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option.toLowerCase() === currentQ.correctAnswer.toLowerCase();
                const keyLabel = (optIdx + 1).toString();

                let style = 'bg-[#162235] border-[#1E2D45] text-zinc-200 hover:bg-[#1C2C45] hover:border-indigo-500/40 active:scale-[0.98]';

                if (isAnswered) {
                  if (isCorrect) {
                    style = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                  } else if (isSelected) {
                    style = 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
                  } else {
                    style = 'bg-[#162235]/50 border-transparent text-zinc-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={option}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-sm sm:text-base font-bold text-left transition-all duration-200 flex items-center justify-between group ${style}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <kbd className="hidden sm:inline-flex w-5 h-5 items-center justify-center text-[10px] font-mono rounded-md bg-[#0F172A] border border-[#1E2D45] text-zinc-400 group-hover:text-indigo-300">
                        {keyLabel}
                      </kbd>
                      <span>{option}</span>
                    </div>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Pedagogical Teaching Panel */}
            {isAnswered && (() => {
              const isRight = selectedOption?.toLowerCase() === currentQ.correctAnswer.toLowerCase();
              const col = currentQ.collocation;
              const parsed = parseCommonMistakes(col.commonMistakes || []);
              const typeLabel = TYPE_LABELS[col.type] || col.type;
              const trMeaning = col.meaningTr || (col.meaning.match(/[çğıöşüÇĞİÖŞÜ]/) ? col.meaning : null);

              return (
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E2D45] space-y-3 animate-fadeIn">
                  {/* Result + meaning */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {isRight
                        ? <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold mb-0.5 ${isRight ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {isRight ? '✅ Correct!' : '❌ Incorrect — Explanatory Insight:'}
                        </p>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          <strong className="text-white">{col.chunk}</strong>{' '}
                          <span className="text-zinc-400">—</span>{' '}
                          {col.meaning}
                        </p>
                      </div>
                    </div>

                    {/* Show TR Button */}
                    {trMeaning && (
                      <button
                        onClick={() => setShowTurkish(!showTurkish)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-[#162235] text-zinc-400 hover:text-cyan-300 border border-[#1E2D45] shrink-0"
                      >
                        <Languages className="w-3 h-3" />
                        <span>{showTurkish ? 'Hide TR' : '🇹🇷 Show TR'}</span>
                      </button>
                    )}
                  </div>

                  {/* Show Turkish Translation */}
                  {showTurkish && trMeaning && (
                    <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/25 text-xs text-indigo-200">
                      <span className="font-bold text-indigo-400 mr-1.5 uppercase text-[10px]">TR:</span>
                      {trMeaning}
                    </div>
                  )}

                  {/* Collocation type tip */}
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                    <Link2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-indigo-200">
                      <span className="font-bold text-indigo-300">{typeLabel}: </span>
                      {col.type === 'verb-noun' && 'Always memorize the verb and its noun as a cohesive pair.'}
                      {col.type === 'adj-noun' && 'The adjective always precedes the noun; native pairs often differ from literal translations.'}
                      {col.type === 'adv-adj' && 'The adverb intensifies the adjective. Acquire them as a single expression.'}
                      {col.type === 'phrase' && 'Do not translate word-for-word; use this as a full idiomatic expression.'}
                      {!['verb-noun','adj-noun','adv-adj','phrase'].includes(col.type) && 'Acquire this collocation pattern as an indivisible unit.'}
                    </div>
                  </div>

                  {/* Why wrong — only when incorrect AND there are common mistakes */}
                  {!isRight && parsed.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Why is this wrong? — Common Learner Pitfalls
                      </p>
                      {parsed.map((m, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="shrink-0 px-1.5 py-0.5 rounded bg-rose-950/50 border border-rose-800/30 text-rose-300 line-through decoration-rose-500 font-mono">
                            {m.core}
                          </span>
                          {m.explanation && (
                            <span className="text-zinc-400 italic pt-0.5">{m.explanation}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Full sentence context */}
                  <div className="p-3 bg-[#0B101C] rounded-xl border border-[#1E2D45] text-xs text-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Full Sentence &amp; Pattern:</span>
                    "{renderSentenceWithHighlight(currentQ.sentence, currentQ.correctAnswer)}"
                  </div>

                  {/* Synonyms if any */}
                  {col.synonyms && col.synonyms.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Alternatives:
                      </span>
                      {col.synonyms.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#1E2D45]">
                    <button
                      onClick={() => speakCollocation(currentQ.correctAnswer)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#162235] sm:bg-transparent text-xs text-indigo-400 hover:text-indigo-300 font-bold active:scale-95"
                    >
                      <Volume2 className="w-4 h-4" />
                      Listen to Collocation
                    </button>

                    <button
                      onClick={handleNext}
                      className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                    >
                      <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-black/25 text-[10px] font-mono">
                        Enter ↵
                      </kbd>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : isComplete ? (
        /* Completion Screen */
        <div className="bg-[#111927] border border-[#1E2D45] rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Quiz Completed! 🎉</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Outstanding practice! You've strengthened your collocation fluency.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto bg-[#0F172A] p-4 rounded-2xl border border-[#1E2D45]">
            <div>
              <div className="text-xs text-zinc-400">Score</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{score}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Total</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{questions.length}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Accuracy</div>
              <div className="text-xl font-extrabold text-cyan-400 mt-0.5">
                {questions.length > 0 ? `${Math.round((score / questions.length) * 100)}%` : '100%'}
              </div>
            </div>
          </div>

          {/* Review wrong answers if any */}
          {wrongAnswers.length > 0 && (
            <div className="text-left space-y-3 bg-[#0F172A]/70 p-4 rounded-2xl border border-[#1E2D45]">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Items to Review ({wrongAnswers.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {wrongAnswers.map(({ q, chosen }) => (
                  <div key={q.id} className="text-xs text-zinc-300 p-2 rounded-xl bg-[#162235]">
                    <div>
                      Target: <strong className="text-emerald-300">{q.correctAnswer}</strong> (Chosen:{' '}
                      <span className="line-through text-rose-400">{chosen}</span>)
                    </div>
                    <div className="text-[11px] text-zinc-400 italic mt-0.5">"{q.sentence}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#162235] hover:bg-[#1C2C45] text-zinc-200 border border-[#1E2D45] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>

            <button
              onClick={() => navigate('/units')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
            >
              <FileCheck2 className="w-4 h-4" />
              Explore Units
            </button>
          </div>
        </div>
      ) : null}

      {/* Multi-Unit Selection Modal */}
      <MultiUnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        selectedUnits={selectedUnits}
        onApply={(units) => {
          setSelectedUnits(units);
          handleRestart();
        }}
        unitSummaries={unitSummaries}
      />
    </div>
  );
};
export default QuizView;
