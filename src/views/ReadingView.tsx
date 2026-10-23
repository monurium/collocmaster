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
  Search,
} from 'lucide-react';

const GENRES: { id: ReadingGenre; label: string; icon: string }[] = [
  { id: 'story', label: 'Story', icon: '📖' },
  { id: 'workplace', label: 'Workplace', icon: '💼' },
  { id: 'academic', label: 'Academic', icon: '🎓' },
  { id: 'dialogue', label: 'Dialogue', icon: '☕' },
  { id: 'news', label: 'News', icon: '📰' },
];

export const ReadingView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getUnitSummaries = useAppStore((s) => s.getUnitSummaries);
  const settings = useAppStore((s) => s.settings);
  const savedPassages = useAppStore((s) => s.savedPassages);
  const savePassage = useAppStore((s) => s.savePassage);
  const deletePassage = useAppStore((s) => s.deletePassage);

  const summaries = useMemo(() => getUnitSummaries('All'), [getUnitSummaries]);

  // Route state preselection
  const navState = location.state as { unitNumber?: number; level?: 'Intermediate' | 'Advanced'; unitNumbers?: number[] } | null;

  // Selected multi-unit state
  const [selectedUnitNumbers, setSelectedUnitNumbers] = useState<number[]>(() => {
    if (navState?.unitNumbers && navState.unitNumbers.length > 0) return navState.unitNumbers;
    if (navState?.unitNumber) return [navState.unitNumber];
    return [summaries[0]?.unitNumber || 1];
  });

  const [selectedGenre, setSelectedGenre] = useState<ReadingGenre>('story');

  // Multi-unit modal state
  const [showUnitPickerModal, setShowUnitPickerModal] = useState<boolean>(false);
  const [unitSearch, setUnitSearch] = useState<string>('');
  const [unitFilterLevel, setUnitFilterLevel] = useState<'All' | 'Intermediate' | 'Advanced'>('All');

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

  // Selected units data
  const selectedUnits = useMemo(() => {
    return summaries.filter((u) => selectedUnitNumbers.includes(u.unitNumber));
  }, [summaries, selectedUnitNumbers]);

  const combinedCollocations = useMemo(() => {
    return selectedUnits.flatMap((u) => u.collocations);
  }, [selectedUnits]);

  const combinedTitle = useMemo(() => {
    if (selectedUnits.length === 0) return 'Selected Units';
    if (selectedUnits.length === 1) return `Unit ${selectedUnits[0].unitNumber}: ${selectedUnits[0].unitTitle}`;
    const nums = [...selectedUnits].map((u) => u.unitNumber).sort((a, b) => a - b).join(', ');
    return `Units ${nums} (${selectedUnits.length} Units)`;
  }, [selectedUnits]);

  const primaryLevel = useMemo(() => {
    const hasAdv = selectedUnits.some((u) => u.level === 'Advanced');
    return hasAdv ? 'Advanced' : 'Intermediate';
  }, [selectedUnits]);

  const hasApiKey = Boolean(getActiveApiKey());

  // Check if current passage is saved
  const isCurrentSaved = useMemo(() => {
    if (!passage) return false;
    return savedPassages.some((p) => p.id === passage.id);
  }, [savedPassages, passage]);

  // Handle generation (always 5 collocations)
  const handleGenerate = async () => {
    if (combinedCollocations.length === 0) {
      setErrorMsg('Please select at least one unit with collocations.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setUserAnswers({});
    setQuizSubmitted(false);
    setRevealedChunks({});
    handleStopAudio();

    const phases = [
      'Scanning selected units corpus...',
      'DeepSeek AI is weaving 5 target collocations into an authentic story...',
      'Validating CEFR level and natural idiomatic flow...',
      'Formulating reading comprehension and cloze challenge...',
    ];

    let pIdx = 0;
    setLoadingPhase(phases[0]);
    const interval = setInterval(() => {
      pIdx = (pIdx + 1) % phases.length;
      setLoadingPhase(phases[pIdx]);
    }, 1800);

    try {
      const generated = await generateReadingPassage({
        unitNumbers: selectedUnitNumbers,
        unitNumber: selectedUnitNumbers[0] || 1,
        unitTitle: combinedTitle,
        level: primaryLevel,
        collocations: combinedCollocations,
        genre: selectedGenre,
        numCollocations: 5, // FIXED TO 5 COLLOCATIONS
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

  // Initial auto-generate on first visit
  useEffect(() => {
    if (!passage && combinedCollocations.length > 0) {
      handleGenerate();
    }
  }, [selectedUnitNumbers]);

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

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

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
    const text =
      `${passage.title}\n${passage.unitTitle}\n\n` +
      passage.paragraphs.join('\n\n') +
      `\n\nTarget Collocations:\n` +
      passage.vocabularyList.map((v) => `- ${v.chunk}: ${v.meaning} (${v.meaningTr || ''})`).join('\n');

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // Toggle unit selection
  const toggleUnit = (unitNum: number) => {
    setSelectedUnitNumbers((prev) => {
      if (prev.includes(unitNum)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((n) => n !== unitNum);
      }
      return [...prev, unitNum];
    });
  };

  // Filtered units for picker modal
  const filteredUnitsForModal = useMemo(() => {
    let list = summaries;
    if (unitFilterLevel !== 'All') {
      list = list.filter((u) => u.level === unitFilterLevel);
    }
    if (!unitSearch.trim()) return list;
    const q = unitSearch.toLowerCase().trim();
    return list.filter((u) => u.unitTitle.toLowerCase().includes(q) || `unit ${u.unitNumber}`.includes(q));
  }, [summaries, unitFilterLevel, unitSearch]);

  // Render paragraph with clickable or cloze-blank collocations
  const renderParagraphContent = (paragraph: string) => {
    if (!passage) return paragraph;

    const targets = passage.targetCollocations.filter(Boolean);
    if (targets.length === 0) return paragraph;

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
    <div className="space-y-5 pb-28 md:pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* ─── Compact Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            AI Reading Lab & Storyteller
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Contextual Passage Generator
          </h1>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#131D2E] border border-[#1E2D45] text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-all shadow-sm"
          >
            <BookMarked className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved Stories ({savedPassages.length})</span>
          </button>

          <button
            onClick={() => navigate('/settings')}
            title="Manage DeepSeek API Key"
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
              hasApiKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Streamlined & Compact Generator Control Card ─── */}
      <div className="card p-4 sm:p-5 space-y-3.5 bg-gradient-to-br from-[#111927] via-[#111927] to-[#0D1522] border-[#1E2D45] shadow-xl">
        {/* Row 1: Multi-Unit Selection Header & Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Units ({selectedUnitNumbers.length})</span>
              <span className="text-[10px] text-zinc-500 font-normal lowercase">• {combinedCollocations.length} collocations pool</span>
            </label>

            <button
              onClick={() => setShowUnitPickerModal(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition-all flex items-center gap-1"
            >
              <span>+ Select Units</span>
              <span className="text-[10px] bg-indigo-500 text-white px-1.5 rounded-full font-mono">{selectedUnitNumbers.length}</span>
            </button>
          </div>

          {/* Selected unit chips pill bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#0F172A] border border-[#1E2D45]">
            {selectedUnits.map((u) => (
              <span
                key={`${u.level}_${u.unitNumber}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#162235] text-zinc-200 border border-[#23334d]"
              >
                <span className="text-indigo-400 font-bold">U{u.unitNumber}</span>
                <span className="text-zinc-300 max-w-[140px] truncate">{u.unitTitle}</span>
                {selectedUnitNumbers.length > 1 && (
                  <button
                    onClick={() => toggleUnit(u.unitNumber)}
                    className="hover:text-rose-400 text-zinc-500 ml-0.5"
                    title="Remove unit"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2: Compact Genre Selector (Sleek Horizontal Segmented Bar) */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Story Genre</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedGenre === g.id
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                    : 'bg-[#131D2E] text-zinc-400 hover:text-zinc-200 border border-[#1E2D45]'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom bar: Status info + Fixed 5 Collocations Badge + Generate Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-[#1E2D45]">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-bold font-mono text-[11px] border border-cyan-500/25">
              5 Collocations
            </span>
            <span className="text-zinc-500 text-[11px]">woven into narrative</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating Story...' : 'Generate AI Story'}</span>
          </button>
        </div>
      </div>

      {/* ─── Loading State Card ─── */}
      {loading && (
        <div className="card p-8 text-center space-y-3 border-indigo-500/40 bg-gradient-to-b from-[#131D2E] to-[#0F172A] animate-pulse">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Crafting Reading Passage</h3>
            <p className="text-xs text-indigo-300 font-mono mt-1">{loadingPhase}</p>
          </div>
          <div className="max-w-xs mx-auto w-full bg-[#1A263C] h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && !loading && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Generated Story Display ─── */}
      {passage && !loading && (
        <div className="space-y-4 animate-fadeIn">
          {/* Main Story Canvas */}
          <div className="card p-5 sm:p-7 bg-[#0F172A] border-[#1E2D45] rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-[#1E2D45] gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {passage.unitNumbers && passage.unitNumbers.length > 1
                      ? `Units ${passage.unitNumbers.sort((a,b)=>a-b).join(', ')}`
                      : `Unit ${passage.unitNumber}`} • {passage.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {passage.genre}
                  </span>
                  <span className="text-xs text-zinc-500">• 5 collocations</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {passage.title}
                </h2>
              </div>

              {/* Utility actions: Audio, Bookmark, Copy */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayAudio}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isPlayingAudio
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 animate-pulse'
                      : 'bg-[#162235] border-[#23334d] text-zinc-300 hover:text-white hover:border-indigo-500/40'
                  }`}
                  title={isPlayingAudio ? 'Stop Narration' : 'Read Story Aloud'}
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`p-1.5 rounded-xl text-xs font-bold transition-all border ${
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
                  className="p-1.5 rounded-xl bg-[#162235] border border-[#23334d] text-zinc-400 hover:text-white transition-all"
                  title="Copy story & collocations to clipboard"
                >
                  {copyFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#131D2E] p-1 rounded-2xl border border-[#1E2D45] mb-5 max-w-md">
              <button
                onClick={() => setActiveTab('read')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'read' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read</span>
              </button>

              <button
                onClick={() => setActiveTab('cloze')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'cloze' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Cloze Test</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'quiz' ? 'bg-cyan-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Quiz ({passage.comprehensionQuestions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('vocab')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'vocab' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
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
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center justify-between mb-3">
                    <span>💡 Challenge: Click any blank <strong>[ ? ? ? ? ]</strong> to reveal the collocation!</span>
                    <button
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        passage.targetCollocations.forEach((c) => (all[c.toLowerCase()] = true));
                        setRevealedChunks(all);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold shrink-0 ml-2"
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
              <div className="space-y-5 animate-fadeIn">
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Answer the reading comprehension questions below to verify your understanding.</span>
                </div>

                {passage.comprehensionQuestions.map((q, qIndex) => {
                  const selected = userAnswers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-[#131D2E] border border-[#1E2D45] space-y-2.5"
                    >
                      <h4 className="text-sm font-bold text-white flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <span>{q.question}</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-1.5 pt-1">
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
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnClasses}`}
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

                <div className="flex items-center justify-between pt-1">
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
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/25 disabled:opacity-50"
                    >
                      Submit Quiz
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
              <div className="space-y-2.5 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {passage.vocabularyList.map((v, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-[#131D2E] border border-[#1E2D45] hover:border-indigo-500/40 transition-all space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-indigo-300 group-hover:text-white transition-colors">
                          {v.chunk}
                        </span>
                        <button
                          onClick={() => speakCollocation(v.chunk, settings.speechRate)}
                          className="p-1 rounded-lg bg-[#162235] text-zinc-400 hover:text-indigo-300"
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
              <div className="mt-6 pt-4 border-t border-[#1E2D45]">
                <button
                  onClick={() => setShowTurkishSummary(!showTurkishSummary)}
                  className="w-full flex items-center justify-between text-xs font-bold text-zinc-400 hover:text-zinc-200 py-1"
                >
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Languages className="w-3.5 h-3.5" />
                    <span>Türkçe Özet & Ana Fikir</span>
                  </span>
                  {showTurkishSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showTurkishSummary && (
                  <div className="p-3.5 mt-2 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 text-emerald-200 text-xs leading-relaxed animate-fadeIn">
                    {passage.turkishSummary}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MULTI-UNIT SELECTION MODAL ─── */}
      {showUnitPickerModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowUnitPickerModal(false)}
        >
          <div
            className="w-full max-w-xl max-h-[85vh] bg-[#111927] border border-[#1E2D45] rounded-3xl p-5 shadow-2xl flex flex-col space-y-3.5 animate-scaleUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2D45]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-white">Select Units for Story ({selectedUnitNumbers.length})</h3>
              </div>
              <button
                onClick={() => setShowUnitPickerModal(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Level Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  placeholder="Search units..."
                  className="w-full bg-[#162235] border border-[#23334d] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#162235] p-1 rounded-xl shrink-0">
                {(['All', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setUnitFilterLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      unitFilterLevel === lvl
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Bulk Selection Buttons */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>{filteredUnitsForModal.length} units listed</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allFiltered = filteredUnitsForModal.map((u) => u.unitNumber);
                    setSelectedUnitNumbers(Array.from(new Set([...selectedUnitNumbers, ...allFiltered])));
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold text-[11px]"
                >
                  Select All Visible
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    if (filteredUnitsForModal.length > 0) {
                      setSelectedUnitNumbers([filteredUnitsForModal[0].unitNumber]);
                    }
                  }}
                  className="text-zinc-500 hover:text-zinc-300 text-[11px]"
                >
                  Reset to First
                </button>
              </div>
            </div>

            {/* Scrollable Unit Grid */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin max-h-72">
              {filteredUnitsForModal.map((u) => {
                const isSelected = selectedUnitNumbers.includes(u.unitNumber);
                return (
                  <div
                    key={`${u.level}_${u.unitNumber}`}
                    onClick={() => toggleUnit(u.unitNumber)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-[#131D2E] border-[#1E2D45] text-zinc-300 hover:bg-[#162235]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 text-xs ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'border-[#23334d] text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span className="text-indigo-400">Unit {u.unitNumber}</span>
                          <span className="truncate">{u.unitTitle}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {u.level} • {u.totalCount} collocations
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[#1E2D45] flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                {selectedUnitNumbers.length} units selected ({combinedCollocations.length} collocations)
              </span>
              <button
                onClick={() => setShowUnitPickerModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VOCABULARY DETAIL MODAL ─── */}
      {activeVocabItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveVocabItem(null)}
        >
          <div
            className="w-full max-w-md bg-[#111927] border border-indigo-500/40 rounded-3xl p-5 shadow-2xl space-y-3.5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  {activeVocabItem.type || 'Collocation'}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {activeVocabItem.chunk}
                </h3>
              </div>
              <button
                onClick={() => setActiveVocabItem(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-500">Definition</div>
                <div className="text-xs text-zinc-200 mt-0.5 leading-relaxed">{activeVocabItem.meaning}</div>
              </div>

              {activeVocabItem.meaningTr && (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
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
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen Audio</span>
              </button>
              <button
                onClick={() => setActiveVocabItem(null)}
                className="px-4 py-2 rounded-xl bg-[#162235] text-zinc-300 font-bold text-xs hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SAVED STORIES MODAL ─── */}
      {showSavedModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowSavedModal(false)}
        >
          <div
            className="w-full max-w-xl max-h-[85vh] bg-[#111927] border border-[#1E2D45] rounded-3xl p-5 shadow-2xl flex flex-col space-y-3.5 animate-scaleUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2D45]">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">Saved Reading Stories</h3>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {savedPassages.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  No stories saved yet. Click the bookmark icon on any story to save it here!
                </div>
              ) : (
                savedPassages.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-[#131D2E] border border-[#1E2D45] hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        setPassage(p);
                        if (p.unitNumbers && p.unitNumbers.length > 0) {
                          setSelectedUnitNumbers(p.unitNumbers);
                        } else {
                          setSelectedUnitNumbers([p.unitNumber]);
                        }
                        setSelectedGenre(p.genre);
                        setShowSavedModal(false);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase text-indigo-400">
                          {p.unitNumbers && p.unitNumbers.length > 1
                            ? `Units ${p.unitNumbers.sort((a,b)=>a-b).join(', ')}`
                            : `Unit ${p.unitNumber}`}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">• {p.genre}</span>
                        <span className="text-[10px] text-zinc-600">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {p.paragraphs[0]}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setPassage(p);
                          if (p.unitNumbers && p.unitNumbers.length > 0) {
                            setSelectedUnitNumbers(p.unitNumbers);
                          } else {
                            setSelectedUnitNumbers([p.unitNumber]);
                          }
                          setSelectedGenre(p.genre);
                          setShowSavedModal(false);
                        }}
                        className="p-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 text-xs font-bold"
                        title="Read this story"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePassage(p.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold"
                        title="Delete saved story"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#1E2D45] text-right">
              <button
                onClick={() => setShowSavedModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#162235] text-zinc-300 font-bold text-xs hover:text-white"
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
