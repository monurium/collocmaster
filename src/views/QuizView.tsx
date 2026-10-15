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
} from 'lucide-react';

export const QuizView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const collocations = useAppStore((s) => s.collocations);
  const recordReview = useAppStore((s) => s.recordReview);
  const getUnitSummaries = useAppStore((s) => s.getUnitSummaries);

  const navState = location.state as { unitNumber?: number; level?: string } | undefined;
  const initialUnit = navState?.unitNumber;

  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>(initialUnit ?? 'all');
  const [quizMode, setQuizMode] = useState<'cloze' | 'recall'>('cloze');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<Array<{ q: QuizQuestion; chosen: string }>>([]);

  // Filter pool of collocations
  const pool = useMemo(() => {
    if (selectedUnit === 'all') {
      return collocations;
    }
    return collocations.filter((c) => c.unitNumber === selectedUnit);
  }, [collocations, selectedUnit]);

  // Generate quiz questions
  const questions = useMemo<QuizQuestion[]>(() => {
    if (pool.length === 0) return [];

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, pool.length));

    return selected.map((col, idx) => {
      // Pick a random example from the available examples so questions vary every time
      const exampleList = col.examples && col.examples.length > 0 ? col.examples : [];
      const randomExample = exampleList.length > 0
        ? exampleList[Math.floor(Math.random() * exampleList.length)]
        : null;

      const example = randomExample || {
        sentence: col.chunk,
        clozeSentence: '___',
        missingWord: col.chunk,
      };

      // Correct answer is the chunk
      const correct = col.chunk;

      // Smart distractors:
      // 1. From commonMistakes if available
      // 2. From other collocations in same category or type
      const distractors = new Set<string>();

      if (col.commonMistakes && col.commonMistakes.length > 0) {
        for (const mistake of col.commonMistakes) {
          // clean up mistake string e.g. "do a mistake"
          const clean = mistake.split('(')[0].trim();
          if (clean && clean.toLowerCase() !== correct.toLowerCase()) {
            distractors.add(clean);
          }
        }
      }

      // Fill remaining distractors from other collocations in the pool
      const otherCols = pool.filter((c) => c.id !== col.id);
      const shuffledOthers = [...otherCols].sort(() => Math.random() - 0.5);

      for (const other of shuffledOthers) {
        if (distractors.size >= 3) break;
        if (other.chunk.toLowerCase() !== correct.toLowerCase()) {
          distractors.add(other.chunk);
        }
      }

      // Fallback distractors if pool is small
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

      const explanation = col.commonMistakes.length > 0
        ? `İpucu (${col.unitTitle || 'Kitap Notu'}): Doğru kullanım "${correct}" şeklindedir. "${col.commonMistakes.join(', ')}" demek doğallıktan uzaktır veya yanlıştır.`
        : `İpucu (${col.unitTitle || 'Kitap Notu'}): Doğru kollokasyon "${correct}" - Anlamı: ${col.meaning}`;

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
      // Record SRS review (Grade 3 - Good)
      recordReview(currentQ.collocation.id, 3, 3000);
    } else {
      setStreak(0);
      playChime('again');
      setWrongAnswers((prev) => [...prev, { q: currentQ, chosen: opt }]);
      // Record SRS review (Grade 1 - Again)
      recordReview(currentQ.collocation.id, 1, 3000);
    }
  };

  const handleNext = () => {
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

  // Keyboard navigation for Quiz (1-4 / A-D to select, Enter to proceed)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input or select
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
    setScore(0);
    setStreak(0);
    setIsComplete(false);
    setWrongAnswers([]);
  };

  const unitSummaries = useMemo(() => getUnitSummaries(), [getUnitSummaries]);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 md:pb-10 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-[#131D2E] self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>

        {/* Controls: Mode Switcher & Unit Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#131D2E] p-1 rounded-xl border border-[#1E2D45]">
            <button
              onClick={() => {
                setQuizMode('cloze');
                handleRestart();
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                quizMode === 'cloze'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Boşluk Doldurma</span>
            </button>
            <button
              onClick={() => {
                setQuizMode('recall');
                handleRestart();
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                quizMode === 'recall'
                  ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Hatırlama</span>
            </button>
          </div>

          {/* Unit Selector dropdown */}
          <div className="flex items-center gap-1.5 bg-[#131D2E] px-3 py-2 sm:py-1.5 rounded-xl border border-[#1E2D45]">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <select
              value={selectedUnit}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedUnit(val === 'all' ? 'all' : Number(val));
                handleRestart();
              }}
              className="w-full bg-transparent text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Tüm Ünitelerden Karışık</option>
              {unitSummaries.map((u) => (
                <option key={`${u.level}_${u.unitNumber}`} value={u.unitNumber} className="bg-[#111927]">
                  Unit {u.unitNumber}: {u.unitTitle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!isComplete && currentQ ? (
        <div className="space-y-4">
          {/* Progress and Streak */}
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span>
              Soru <strong className="text-white">{currentIndex + 1}</strong> / {questions.length}
            </span>
            <div className="flex items-center gap-3">
              {streak > 1 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black animate-pulse">
                  🔥 {streak} Seri!
                </span>
              )}
              <span className="text-emerald-400">Puan: {score}</span>
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
                title="Cümleyi seslendir"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Sesli Dinle</span>
              </button>
            </div>

            {/* Question Display based on Mode */}
            <div className="text-center py-2 space-y-3">
              {quizMode === 'recall' ? (
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Brain className="w-3.5 h-3.5" />
                    Bu Türkçe anlama gelen İngilizce kollokasyon hangisidir?
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white leading-snug max-w-xl mx-auto">
                    "{currentQ.collocation.meaning}"
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-300 italic bg-[#0F172A] p-3.5 rounded-2xl border border-[#1E2D45]/70 max-w-xl mx-auto">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase not-italic block mb-1">Cümle İpucu:</span>
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
                    Boşluğa en doğal ve doğru uyan İngilizce kollokasyonu seçin
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

            {/* Feedback & Explanation */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E2D45] space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300 leading-relaxed font-medium">
                    {currentQ.explanation}
                  </div>
                </div>

                <div className="p-3 bg-[#0B101C] rounded-xl border border-[#1E2D45] text-xs text-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Tam Cümle & Kalıp:</span>
                  "{renderSentenceWithHighlight(currentQ.sentence, currentQ.correctAnswer)}"
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#1E2D45]">
                  <button
                    onClick={() => speakCollocation(currentQ.correctAnswer)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#162235] sm:bg-transparent text-xs text-indigo-400 hover:text-indigo-300 font-bold active:scale-95"
                  >
                    <Volume2 className="w-4 h-4" />
                    Kollokasyonu Dinle
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Sonraki Soru' : 'Sonuçları Gör'}</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-black/25 text-[10px] font-mono">
                      Enter ↵
                    </kbd>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : isComplete ? (
        /* Completion Screen */
        <div className="bg-[#111927] border border-[#1E2D45] rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Test Tamamlandı!</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Harika pratik! Kitaptaki kollokasyonları pekiştirdiniz.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto bg-[#0F172A] p-4 rounded-2xl border border-[#1E2D45]">
            <div>
              <div className="text-xs text-zinc-400">Doğru</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{score}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Toplam</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{questions.length}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Başarı</div>
              <div className="text-xl font-extrabold text-cyan-400 mt-0.5">
                {questions.length > 0 ? `${Math.round((score / questions.length) * 100)}%` : '100%'}
              </div>
            </div>
          </div>

          {/* Review wrong answers if any */}
          {wrongAnswers.length > 0 && (
            <div className="text-left space-y-3 bg-[#0F172A]/70 p-4 rounded-2xl border border-[#1E2D45]">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Gözden Geçirilecekler ({wrongAnswers.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {wrongAnswers.map(({ q, chosen }) => (
                  <div key={q.id} className="text-xs text-zinc-300 p-2 rounded-xl bg-[#162235]">
                    <div>
                      Doğru: <strong className="text-emerald-300">{q.correctAnswer}</strong> (Seçilen:{' '}
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
              Yeniden Çöz
            </button>

            <button
              onClick={() => navigate('/units')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
            >
              <FileCheck2 className="w-4 h-4" />
              Diğer Ünitelere Git
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default QuizView;
