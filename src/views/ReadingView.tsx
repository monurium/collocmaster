import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  GeneratedReadingPassage,
  ReadingGenre,
  PassageVocabularyItem,
} from '../types';
import {
  generateReadingPassage,
  getActiveApiKey,
} from '../services/deepseekReadingService';
import { speakCollocation, playChime } from '../utils/audio';
import {
  Sparkles,
  BookOpen,
  Volume2,
  Play,
  Pause,
  Languages,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  HelpCircle,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  BookMarked,
  Settings as SettingsIcon,
  Check,
  X,
  Lightbulb,
} from 'lucide-react';

const GENRES: { id: ReadingGenre; label: string; icon: string; desc: string }[] = [
  { id: 'story', label: 'Story', icon: '📖', desc: 'Narrative & Creative' },
  { id: 'workplace', label: 'Workplace', icon: '💼', desc: 'Business & Office Case' },
  { id: 'academic', label: 'Academic', icon: '🎓', desc: 'Essay & Science Article' },
  { id: 'dialogue', label: 'Dialogue', icon: '☕', desc: 'Conversational Native English' },
  { id: 'news', label: 'News', icon: '📰', desc: 'Journalistic & Magazine Feature' },
];

export const ReadingView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getUnitSummaries = useAppStore((s) => s.getUnitSummaries);
  const activeLevel = useAppStore((s) => s.activeLevel);
  const settings = useAppStore((s) => s.settings);
  const savedPassages = useAppStore((s) => s.savedPassages);
  const savePassage = useAppStore((s) => s.savePassage);
  const deletePassage = useAppStore((s) => s.deletePassage);

  const summaries = useMemo(() => getUnitSummaries(activeLevel), [getUnitSummaries, activeLevel]);

  // Route state preselection
  const navState = location.state as { unitNumber?: number; level?: 'Intermediate' | 'Advanced'; unitNumbers?: number[] } | null;

  // Selected unit selection state
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number>(() => {
    if (navState?.unitNumber) return navState.unitNumber;
    if (navState?.unitNumbers && navState.unitNumbers.length > 0) return navState.unitNumbers[0];
    return summaries[0]?.unitNumber || 1;
  });

  const [selectedGenre, setSelectedGenre] = useState<ReadingGenre>('story');
  const [targetCount, setTargetCount] = useState<number>(7);

  // Active Passage State
  const [passage, setPassage] = useState<GeneratedReadingPassage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reading Modes: 'read' (Standard) | 'cloze' (Fill in the blanks) | 'quiz' (Comprehension) | 'vocab' (Glossary)
  const [activeTab, setActiveTab] = useState<'read' | 'cloze' | 'quiz' | 'vocab'>('read');

  // Cloze Mode state: map of chunk -> revealed boolean
  const [revealedChunks, setRevealedChunks] = useState<Record<string, boolean>>({});

  // Quiz state: map of questionId -> selectedOptionIndex
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Interactive Collocation Modal / Popover
  const [activeVocabItem, setActiveVocabItem] = useState<PassageVocabularyItem | null>(null);

  // Audio Reading state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Turkish translation / summary accordion
  const [showTurkishSummary, setShowTurkishSummary] = useState<boolean>(false);

  // Saved stories drawer state
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  const activeUnit = useMemo(() => {
    return summaries.find((u) => u.unitNumber === selectedUnitNumber) || summaries[0];
  }, [summaries, selectedUnitNumber]);

  const hasApiKey = Boolean(getActiveApiKey());

  // Check if current passage is saved
  const isCurrentSaved = useMemo(() => {
    if (!passage) return false;
    return savedPassages.some((p) => p.id === passage.id);
  }, [savedPassages, passage]);

  // Handle generation
  const handleGenerate = async () => {
    if (!activeUnit || activeUnit.collocations.length === 0) {
      setErrorMsg('No collocations found in this unit.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setUserAnswers({});
    setQuizSubmitted(false);
    setRevealedChunks({});
    handleStopAudio();

    const phases = [
      'Scanning Cambridge corpus collocations...',
      'DeepSeek AI is weaving an authentic context narrative...',
      'Validating CEFR level and natural idiomatic flow...',
      'Formulating reading comprehension and cloze tasks...',
    ];

    let pIdx = 0;
    setLoadingPhase(phases[0]);
    const interval = setInterval(() => {
      pIdx = (pIdx + 1) % phases.length;
      setLoadingPhase(phases[pIdx]);
    }, 1800);

    try {
      const generated = await generateReadingPassage({
        unitNumber: activeUnit.unitNumber,
        unitTitle: activeUnit.unitTitle,
        level: activeUnit.level,
        collocations: activeUnit.collocations,
        genre: selectedGenre,
        numCollocations: targetCount,
      });

      setPassage(generated);
      if (settings.soundEffects) playChime('complete');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate passage.');
      if (settings.soundEffects) playChime('again');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // Initial auto-generate if none exists or coming with route state
  useEffect(() => {
    if (!passage && activeUnit) {
      handleGenerate();
    }
  }, [selectedUnitNumber]);

  // Audio Playback
  const handlePlayAudio = () => {
    if (!passage) return;
    if (isPlayingAudio) {
      handleStopAudio();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const fullText = passage.paragraphs.join(' ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = settings.speechRate || 0.95;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          (v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    synthRef.current = utterance;
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Toggle bookmark / saved
  const handleToggleSave = () => {
    if (!passage) return;
    if (isCurrentSaved) {
      deletePassage(passage.id);
    } else {
      savePassage(passage);
      if (settings.soundEffects) playChime('success');
    }
  };

  // Copy text to clipboard
  const handleCopyPassage = () => {
    if (!passage) return;
    const text = `${passage.title}\nUnit ${passage.unitNumber}: ${passage.unitTitle}\n\n` +
      passage.paragraphs.join('\n\n') +
      `\n\nTarget Collocations:\n` +
      passage.vocabularyList.map((v) => `- ${v.chunk}: ${v.meaning} (${v.meaningTr || ''})`).join('\n');

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // Render paragraph with clickable or cloze-blank collocations
  const renderParagraphContent = (paragraph: string) => {
    if (!passage) return paragraph;

    // Build regex of target collocations
    const targets = passage.targetCollocations.filter(Boolean);
    if (targets.length === 0) return paragraph;

    // Sort by length descending to match longest phrases first
    const sortedTargets = [...targets].sort((a, b) => b.length - a.length);
    const escaped = sortedTargets.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');

    const parts = paragraph.split(regex);

    return parts.map((part, index) => {
      const matchChunk = sortedTargets.find((t) => t.toLowerCase() === part.toLowerCase());

      if (matchChunk) {
        const vocabItem = passage.vocabularyList.find(
          (v) => v.chunk.toLowerCase() === matchChunk.toLowerCase()
        ) || {
          chunk: matchChunk,
          meaning: 'Cambridge Collocation in Use',
          meaningTr: 'Kollokasyon',
        };

        const isCloze = activeTab === 'cloze';
        const isRevealed = revealedChunks[matchChunk.toLowerCase()];

        if (isCloze && !isRevealed) {
          return (
            <button
              key={index}
              onClick={() => {
                setRevealedChunks((prev) => ({ ...prev, [matchChunk.toLowerCase()]: true }));
                if (settings.soundEffects) playChime('flip');
              }}
              title="Click to reveal collocation"
              className="inline-flex items-center px-2 py-0.5 mx-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer animate-pulse"
            >
              [ ? ? ? ? ]
            </button>
          );
        }

        return (
          <button
            key={index}
            onClick={() => {
              setActiveVocabItem(vocabItem);
              if (settings.autoAudio) speakCollocation(matchChunk, settings.speechRate);
            }}
            className={`inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-lg text-sm font-bold transition-all ${
              isCloze
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ring-1 ring-emerald-500/20'
                : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 hover:text-white hover:scale-105'
            }`}
          >
            <span>{part}</span>
            <span className="text-[10px] opacity-60">✦</span>
          </button>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            AI Reading Lab & Storyteller
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Contextual Passage Generator
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Transform Cambridge collocations into engaging, natural stories, workplace cases, and dialogues with DeepSeek AI.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Saved Stories Button */}
          <button
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#131D2E] border border-[#1E2D45] text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-all shadow-sm"
          >
            <BookMarked className="w-4 h-4 text-amber-400" />
            <span>Saved Stories ({savedPassages.length})</span>
          </button>

          {/* Settings link for API key */}
          <button
            onClick={() => navigate('/settings')}
            title="Manage DeepSeek API Key"
            className={`p-2 rounded-xl border text-xs font-bold transition-all ${
              hasApiKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Generator Control Card ─── */}
      <div className="card p-5 sm:p-6 space-y-5 bg-gradient-to-br from-[#111927] via-[#111927] to-[#0D1522] border-[#1E2D45] shadow-xl">
        {/* Row 1: Unit Selector & Collocation Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Target Cambridge Unit
            </label>
            <select
              value={selectedUnitNumber}
              onChange={(e) => setSelectedUnitNumber(Number(e.target.value))}
              className="w-full bg-[#162235] border border-[#23334d] rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              {summaries.map((u) => (
                <option key={`${u.level}_${u.unitNumber}`} value={u.unitNumber}>
                  Unit {u.unitNumber} ({u.level}): {u.unitTitle} ({u.totalCount} collocations)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
              <span>Collocations to Weave</span>
              <span className="font-mono text-cyan-400 font-extrabold">{targetCount}</span>
            </label>
            <div className="flex items-center gap-1 bg-[#162235] border border-[#23334d] p-1 rounded-xl">
              {[5, 7, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setTargetCount(n)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    targetCount === n
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Genre Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Story Genre & Tone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedGenre === g.id
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-white ring-1 ring-indigo-500/30 shadow-md shadow-indigo-500/10'
                    : 'bg-[#131D2E] border-[#1E2D45] text-zinc-400 hover:text-zinc-200 hover:bg-[#182438]'
                }`}
              >
                <span className="text-xl mb-1">{g.icon}</span>
                <span className="text-xs font-bold">{g.label}</span>
                <span className="text-[10px] text-zinc-500 leading-tight mt-0.5 hidden sm:block">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Collocations in this unit Preview Tags */}
        {activeUnit && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Available in Unit {activeUnit.unitNumber}:</span>
              <span className="text-zinc-500">{activeUnit.collocations.length} total</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto scrollbar-thin">
              {activeUnit.collocations.slice(0, 12).map((c) => (
                <span
                  key={c.id}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-[#162235] text-zinc-300 border border-[#23334d]"
                >
                  {c.chunk}
                </span>
              ))}
              {activeUnit.collocations.length > 12 && (
                <span className="text-[10px] px-1.5 py-0.5 text-zinc-500 self-center">
                  +{activeUnit.collocations.length - 12} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#1E2D45]">
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{hasApiKey ? 'DeepSeek AI Ready' : 'Offline Smart Mode (Add key in Settings for live AI)'}</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating Story...' : 'Generate AI Story'}</span>
          </button>
        </div>
      </div>

      {/* ─── Loading State Card ─── */}
      {loading && (
        <div className="card p-10 text-center space-y-4 border-indigo-500/40 bg-gradient-to-b from-[#131D2E] to-[#0F172A] animate-pulse">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-indigo-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Crafting Reading Passage</h3>
            <p className="text-xs text-indigo-300 font-mono mt-1.5">{loadingPhase}</p>
          </div>
          <div className="max-w-xs mx-auto w-full bg-[#1A263C] h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && !loading && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Generated Story Display ─── */}
      {passage && !loading && (
        <div className="space-y-5 animate-fadeIn">
          {/* Main Story Canvas */}
          <div className="card p-6 sm:p-8 bg-[#0F172A] border-[#1E2D45] rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 mb-5 border-b border-[#1E2D45] gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Unit {passage.unitNumber} • {passage.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {passage.genre}
                  </span>
                  <span className="text-xs text-zinc-500">• {passage.targetCollocations.length} collocations woven</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {passage.title}
                </h2>
              </div>

              {/* Utility actions: Audio, Bookmark, Copy */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayAudio}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isPlayingAudio
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse'
                      : 'bg-[#162235] border-[#23334d] text-zinc-300 hover:text-white hover:border-indigo-500/40'
                  }`}
                  title={isPlayingAudio ? 'Stop Narration' : 'Read Full Story Aloud'}
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  <span>{isPlayingAudio ? 'Stop Audio' : 'Listen TTS'}</span>
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                    isCurrentSaved
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-[#162235] border-[#23334d] text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={isCurrentSaved ? 'Remove from Saved' : 'Save this story'}
                >
                  {isCurrentSaved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleCopyPassage}
                  className="p-2 rounded-xl bg-[#162235] border border-[#23334d] text-zinc-400 hover:text-white transition-all"
                  title="Copy story & collocations to clipboard"
                >
                  {copyFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#131D2E] p-1 rounded-2xl border border-[#1E2D45] mb-6 max-w-md">
              <button
                onClick={() => setActiveTab('read')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'read'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read Story</span>
              </button>

              <button
                onClick={() => setActiveTab('cloze')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'cloze'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Cloze Challenge</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz ({passage.comprehensionQuestions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('vocab')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'vocab'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Glossary</span>
              </button>
            </div>

            {/* TAB 1 & 2: Passage Text (Read & Cloze) */}
            {(activeTab === 'read' || activeTab === 'cloze') && (
              <div className="space-y-4 text-base sm:text-lg leading-relaxed text-zinc-200">
                {activeTab === 'cloze' && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center justify-between mb-4">
                    <span>💡 Challenge: Test your recall! The collocations are blanked out. Click on any blank <strong>[ ? ? ? ? ]</strong> to reveal it.</span>
                    <button
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        passage.targetCollocations.forEach((c) => (all[c.toLowerCase()] = true));
                        setRevealedChunks(all);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold shrink-0 ml-2"
                    >
                      Reveal All
                    </button>
                  </div>
                )}

                {passage.paragraphs.map((p, idx) => (
                  <p key={idx} className="indent-2 sm:indent-4 font-normal">
                    {renderParagraphContent(p)}
                  </p>
                ))}
              </div>
            )}

            {/* TAB 3: Comprehension Quiz */}
            {activeTab === 'quiz' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Answer the reading comprehension questions below to verify your contextual understanding.</span>
                </div>

                {passage.comprehensionQuestions.map((q, qIndex) => {
                  const selected = userAnswers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-[#131D2E] border border-[#1E2D45] space-y-3"
                    >
                      <h4 className="text-sm sm:text-base font-bold text-white flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <span>{q.question}</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = selected === optIndex;
                          const isCorrectOption = optIndex === q.correctAnswer;

                          let btnClasses = 'border-[#23334d] bg-[#162235] text-zinc-300 hover:bg-[#1C2B42]';

                          if (quizSubmitted) {
                            if (isCorrectOption) {
                              btnClasses = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
                            } else if (isOptionSelected && !isCorrectOption) {
                              btnClasses = 'border-rose-500 bg-rose-500/20 text-rose-200';
                            }
                          } else if (isOptionSelected) {
                            btnClasses = 'border-indigo-500 bg-indigo-600/30 text-white font-bold ring-1 ring-indigo-500/40';
                          }

                          return (
                            <button
                              key={optIndex}
                              disabled={quizSubmitted}
                              onClick={() => {
                                setUserAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
                                if (settings.soundEffects) playChime('flip');
                              }}
                              className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnClasses}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrectOption && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="pt-2 text-xs text-zinc-400 border-t border-[#1E2D45] leading-relaxed">
                          <strong className="text-indigo-300">Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-zinc-400">
                    {Object.keys(userAnswers).length} of {passage.comprehensionQuestions.length} answered
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={() => {
                        setQuizSubmitted(true);
                        if (settings.soundEffects) playChime('complete');
                      }}
                      disabled={Object.keys(userAnswers).length === 0}
                      className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/25 disabled:opacity-50"
                    >
                      Submit Quiz & Check Answers
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setUserAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#162235] text-zinc-300 font-bold text-xs hover:text-white"
                    >
                      Retry Quiz
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Vocabulary Glossary */}
            {activeTab === 'vocab' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {passage.vocabularyList.map((v, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[#131D2E] border border-[#1E2D45] hover:border-indigo-500/40 transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-indigo-300 group-hover:text-white transition-colors">
                          {v.chunk}
                        </span>
                        <button
                          onClick={() => speakCollocation(v.chunk, settings.speechRate)}
                          className="p-1.5 rounded-lg bg-[#162235] text-zinc-400 hover:text-indigo-300"
                          title="Listen pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{v.meaning}</p>

                      {v.meaningTr && (
                        <p className="text-xs font-medium text-emerald-400/90 pt-1 border-t border-[#1E2D45]/60 flex items-center gap-1">
                          <Languages className="w-3 h-3 shrink-0" />
                          <span>{v.meaningTr}</span>
                        </p>
                      )}

                      {v.contextSentence && (
                        <p className="text-[11px] italic text-zinc-500 border-l-2 border-indigo-500/40 pl-2 mt-1">
                          "{v.contextSentence}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Turkish Summary Accordion */}
            {passage.turkishSummary && (
              <div className="mt-8 pt-5 border-t border-[#1E2D45]">
                <button
                  onClick={() => setShowTurkishSummary(!showTurkishSummary)}
                  className="w-full flex items-center justify-between text-xs font-bold text-zinc-400 hover:text-zinc-200 py-1"
                >
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Languages className="w-4 h-4" />
                    <span>Türkçe Özet & Ana Fikir</span>
                  </span>
                  {showTurkishSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTurkishSummary && (
                  <div className="p-4 mt-2 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 text-emerald-200 text-xs leading-relaxed animate-fadeIn">
                    {passage.turkishSummary}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick study action */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111927] border border-[#1E2D45]">
            <div className="text-xs text-zinc-400">
              Ready to test these collocations in flashcards?
            </div>
            <button
              onClick={() => navigate('/study', { state: { unitNumber: passage.unitNumber, level: passage.level } })}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              Study Unit {passage.unitNumber} Flashcards →
            </button>
          </div>
        </div>
      )}

      {/* ─── VOCABULARY DETAIL MODAL (Pop-up on clicking highlighted collocation) ─── */}
      {activeVocabItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveVocabItem(null)}
        >
          <div
            className="w-full max-w-md bg-[#111927] border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  {activeVocabItem.type || 'Collocation'}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {activeVocabItem.chunk}
                </h3>
              </div>
              <button
                onClick={() => setActiveVocabItem(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-500">Definition</div>
                <div className="text-sm text-zinc-200 mt-0.5">{activeVocabItem.meaning}</div>
              </div>

              {activeVocabItem.meaningTr && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Türkçe Anlam</div>
                  <div className="text-xs font-semibold text-emerald-200 mt-0.5">{activeVocabItem.meaningTr}</div>
                </div>
              )}

              {activeVocabItem.contextSentence && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Context in Story</div>
                  <div className="text-xs italic text-zinc-400 mt-0.5 border-l-2 border-indigo-500/40 pl-2">
                    "{activeVocabItem.contextSentence}"
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#1E2D45]">
              <button
                onClick={() => speakCollocation(activeVocabItem.chunk, settings.speechRate)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Audio</span>
              </button>
              <button
                onClick={() => setActiveVocabItem(null)}
                className="px-4 py-2.5 rounded-xl bg-[#162235] text-zinc-300 font-bold text-xs hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SAVED STORIES DRAWER / MODAL ─── */}
      {showSavedModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowSavedModal(false)}
        >
          <div
            className="w-full max-w-xl max-h-[85vh] bg-[#111927] border border-[#1E2D45] rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 animate-scaleUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2D45]">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Saved Reading Stories</h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {savedPassages.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  No stories saved yet. Click the bookmark icon on any generated story to save it here!
                </div>
              ) : (
                savedPassages.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-[#131D2E] border border-[#1E2D45] hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        setPassage(p);
                        setSelectedUnitNumber(p.unitNumber);
                        setSelectedGenre(p.genre);
                        setShowSavedModal(false);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase text-indigo-400">
                          Unit {p.unitNumber}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">• {p.genre}</span>
                        <span className="text-[10px] text-zinc-600">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {p.paragraphs[0]}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setPassage(p);
                          setSelectedUnitNumber(p.unitNumber);
                          setSelectedGenre(p.genre);
                          setShowSavedModal(false);
                        }}
                        className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 text-xs font-bold"
                        title="Read this story"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePassage(p.id)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold"
                        title="Delete saved story"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#1E2D45] text-right">
              <button
                onClick={() => setShowSavedModal(false)}
                className="px-4 py-2 rounded-xl bg-[#162235] text-zinc-300 font-bold text-xs hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingView;
