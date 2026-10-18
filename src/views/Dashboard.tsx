import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Heatmap } from '../components/Heatmap';
import { AddCollocationModal } from '../components/AddCollocationModal';
import { InstallPwaPrompt } from '../components/InstallPwaPrompt';
import { speakCollocation } from '../utils/audio';
import {
  Flame,
  Target,
  Award,
  Zap,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Lightbulb,
  FileCheck2,
  Puzzle,
  GraduationCap,
  Plus,
  Volume2,
  Calendar,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const BOOK_TIPS = [
  {
    tip: 'Say "make a mistake" in English. "Do a mistake" is INCORRECT!',
    chunk: 'make a mistake',
    category: 'Everyday verbs: make and do',
  },
  {
    tip: 'For heavy precipitation, use "heavy rain" or "torrential rain", never "strong rain".',
    chunk: 'heavy rain',
    category: 'Weather Collocations',
  },
  {
    tip: 'We say "do business" with companies, but "make a deal" when finalizing an agreement.',
    chunk: 'do business',
    category: 'Business Collocations',
  },
  {
    tip: 'Acquiring collocations as single multi-word chunks makes your English fluent and natural.',
    chunk: 'highly unlikely',
    category: 'Intensifying adverbs',
  },
  {
    tip: 'To praise someone, say "pay a compliment", not "give a compliment".',
    chunk: 'pay a compliment',
    category: 'Everyday verbs',
  },
  {
    tip: 'To maintain confidentiality say "keep a secret", and to attract attention say "catch someone\'s eye".',
    chunk: 'keep a secret',
    category: 'Everyday verbs',
  },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const getMetrics = useAppStore((s) => s.getMetrics);
  const getDueCards = useAppStore((s) => s.getDueCards);
  const reviewLogs = useAppStore((s) => s.reviewLogs);
  const settings = useAppStore((s) => s.settings);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const metrics = getMetrics();
  const dueCards = getDueCards();

  // Daily progress
  const dailyGoal = settings.dailyGoal || 10;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayReviews = reviewLogs.filter((l) => l.timestamp >= todayStart.getTime()).length;
  const todayPct = Math.min(100, Math.round((todayReviews / dailyGoal) * 100));
  const goalReached = todayPct >= 100;

  // Book tip of the day
  const dailyTip = useMemo(() => {
    const day = new Date().getDate();
    return BOOK_TIPS[day % BOOK_TIPS.length];
  }, []);

  // 3B: Weekly learned collocations
  const [showWeekly, setShowWeekly] = useState(true);
  const collocations = useAppStore((s) => s.collocations);
  const srsItems = useAppStore((s) => s.srsItems);

  const weeklyLearned = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlyStarted = Object.entries(srsItems).filter(([, item]) => {
      if (!item || item.repetitionCount === 0 || !item.history || item.history.length === 0) return false;
      const firstReview = Math.min(...item.history.map((h) => h.timestamp));
      return firstReview >= sevenDaysAgo;
    }).map(([id]) => id);

    return collocations
      .filter((c) => recentlyStarted.includes(c.id))
      .slice(0, 20);
  }, [collocations, srsItems, reviewLogs]);

  return (
    <div className="space-y-6 pb-24 md:pb-10 animate-fadeIn">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121B2F] via-[#0D1525] to-[#0A0E1A] border border-indigo-500/25 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                English Collocations in Use
              </span>
              {goalReached && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Daily Goal Completed!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Master Collocations Effortlessly
            </h1>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Acquire natural English through Cambridge curriculum units, intelligent spaced repetition (SM-2), cloze quizzes, and engaging matching games.
            </p>

            {/* Daily Goal bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>Daily Practice Goal</span>
                <span className="font-mono font-bold text-white">
                  {todayReviews} / {dailyGoal} cards ({todayPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#162235] rounded-full overflow-hidden border border-[#1E2D45]">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${todayPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action in Hero */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/study')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-95 group"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{dueCards.length > 0 ? `Review ${dueCards.length} Due Cards` : 'Start Smart Session'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/quiz')}
              className="px-5 py-3 rounded-2xl bg-[#162235] hover:bg-[#1F2E45] text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>Take Quick 10-Question Quiz</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl text-zinc-400 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>+ Add Custom Collocation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile PWA Banner ── */}
      <InstallPwaPrompt />

      {/* ── 4 Main Study Modes Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mode 1: Units */}
        <div
          onClick={() => navigate('/units')}
          className="bg-[#111927] border border-[#1E2D45] hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/10 group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              Curriculum Units
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Explore Intermediate & Advanced units and practice unit by unit.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-indigo-400 pt-4 mt-2 border-t border-[#1E2D45]">
            <span>Explore Units</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Mode 2: Flashcards */}
        <div
          onClick={() => navigate('/study')}
          className="bg-[#111927] border border-[#1E2D45] hover:border-cyan-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/10 group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              Smart Cards (SRS)
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              SM-2 Leitner spaced repetition with natural audio for permanent memory.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400 pt-4 mt-2 border-t border-[#1E2D45]">
            <span>{dueCards.length} Cards in Queue</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Mode 3: Quiz */}
        <div
          onClick={() => navigate('/quiz')}
          className="bg-[#111927] border border-[#1E2D45] hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/10 group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Sentence Quiz
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Cloze tests and multiple choice questions to reinforce natural chunks.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-4 mt-2 border-t border-[#1E2D45]">
            <span>Start Quiz</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Mode 4: Match Game */}
        <div
          onClick={() => navigate('/match')}
          className="bg-[#111927] border border-[#1E2D45] hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-lg hover:shadow-amber-500/10 group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <Puzzle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Collocation Match
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Match verb + noun, adverb + adjective halves with speed and combos.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 pt-4 mt-2 border-t border-[#1E2D45]">
            <span>Play Match</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* ── Daily Collocation Tip Box ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#162235] to-[#121B2F] border border-amber-500/25">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Book Tip of the Day
              </span>
              <span className="text-[10px] text-zinc-500">• {dailyTip.category}</span>
            </div>
            <p className="text-sm text-zinc-200 mt-1 font-medium">{dailyTip.tip}</p>
          </div>
        </div>

        <button
          onClick={() => speakCollocation(dailyTip.chunk)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E2D45] hover:bg-[#253754] text-xs font-bold text-cyan-300 transition-colors self-start sm:self-center shrink-0"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen "{dailyTip.chunk}"</span>
        </button>
      </div>

      {/* ── 4 Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Streak */}
        <div className="bg-[#111927] border border-[#1E2D45] rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">Streak</p>
              <p className="text-3xl font-extrabold font-mono text-white">{metrics.currentStreak}</p>
              <p className="text-xs text-zinc-500 mt-0.5">days in a row</p>
            </div>
            <div className={`p-2.5 rounded-xl ${metrics.currentStreak > 0 ? 'bg-amber-500/15 border border-amber-500/25' : 'bg-zinc-800'}`}>
              <Flame className={`w-5 h-5 ${metrics.currentStreak > 0 ? 'text-amber-400' : 'text-zinc-600'}`} />
            </div>
          </div>
        </div>

        {/* Retention */}
        <div className="bg-[#111927] border border-[#1E2D45] rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">Retention Rate</p>
              <p className="text-3xl font-extrabold font-mono text-emerald-400">{metrics.retentionRate}%</p>
              <p className="text-xs text-zinc-500 mt-0.5">long-term memory</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Mastered */}
        <div className="bg-[#111927] border border-[#1E2D45] rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">Mastered Chunks</p>
              <p className="text-3xl font-extrabold font-mono text-cyan-400">{metrics.masteredChunks}</p>
              <p className="text-xs text-zinc-500 mt-0.5">collocations</p>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Award className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Total Pool */}
        <div className="bg-[#111927] border border-[#1E2D45] rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 mb-1">Total Pool</p>
              <p className="text-3xl font-extrabold font-mono text-indigo-400">{metrics.totalCards}</p>
              <p className="text-xs text-zinc-500 mt-0.5">available cards</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3B: Learned This Week ─── */}
      {weeklyLearned.length > 0 && (
        <div className="bg-[#111927] border border-[#1E2D45] rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowWeekly(!showWeekly)}
            className="w-full flex items-center justify-between p-5 hover:bg-[#131D2E] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25">
                <Calendar className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Learned This Week</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
                  {weeklyLearned.length} collocations acquired
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${showWeekly ? 'rotate-180' : ''}`}
            />
          </button>

          {showWeekly && (
            <div className="px-5 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {weeklyLearned.map((col) => {
                  const item = srsItems[col.id];
                  const repetitions = item?.repetitionCount || 0;
                  return (
                    <div
                      key={col.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#0D1525] border border-[#1E2D45] hover:border-indigo-500/30 transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">{col.chunk}</span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                            col.type === 'verb-noun' ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' :
                            col.type === 'adj-noun'  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20' :
                            col.type === 'adv-adj'   ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' :
                            'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                          }`}>{col.type}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">{col.meaning}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {[...Array(Math.min(repetitions, 5))].map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          ))}
                          {repetitions === 0 && <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />}
                          <span className="text-[10px] text-zinc-600">{repetitions}x reviewed</span>
                        </div>
                      </div>
                      <button
                        onClick={() => speakCollocation(col.chunk)}
                        className="shrink-0 p-2 rounded-xl text-zinc-500 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Listen"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">
                  💡 Collocations started this week. The SM-2 spaced repetition algorithm will resurface them at the ideal retention threshold.
                </p>
                <button
                  onClick={() => navigate('/study')}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Review Queue <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Heatmap & Activity ── */}
      <div className="bg-[#111927] border border-[#1E2D45] rounded-2xl p-5">
        <Heatmap history={reviewLogs} />
      </div>

      {/* Add Collocation Modal */}
      <AddCollocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
export default Dashboard;
