import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAppStore } from '../store/useAppStore';
import { Collocation } from '../types';
import { speakCollocation, playChime } from '../utils/audio';
import {
  Puzzle,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Timer,
  Filter,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { MultiUnitModal } from '../components/MultiUnitModal';

interface GameTile {
  id: string;
  pairId: string;
  text: string;
  side: 'left' | 'right';
  isMatched: boolean;
  collocation: Collocation;
}

export const MatchGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const collocations = useAppStore((s) => s.collocations);
  const getUnitSummaries = useAppStore((s) => s.getUnitSummaries);
  const recordReview = useAppStore((s) => s.recordReview);

  const navState = location.state as { unitNumber?: number; unitNumbers?: number[]; level?: string } | undefined;
  const initialUnits = navState?.unitNumbers || (navState?.unitNumber != null ? [navState.unitNumber] : []);

  const [selectedUnits, setSelectedUnits] = useState<number[]>(initialUnits);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  const [leftTiles, setLeftTiles] = useState<GameTile[]>([]);
  const [rightTiles, setRightTiles] = useState<GameTile[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<GameTile | null>(null);
  const [selectedRight, setSelectedRight] = useState<GameTile | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [mismatched, setMismatched] = useState<boolean>(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [mismatchFeedback, setMismatchFeedback] = useState<string | null>(null);

  // Filter pool
  const pool = useMemo(() => {
    let list = collocations;
    if (selectedUnits.length > 0) {
      list = collocations.filter((c) => c.unitNumber && selectedUnits.includes(c.unitNumber));
    }
    return list.filter((c) => {
      const parts = c.chunk.trim().split(/\s+/);
      return parts.length >= 2;
    });
  }, [collocations, selectedUnits]);

  // Start new round
  const startNewGame = () => {
    if (pool.length < 3) return;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const roundItems: Collocation[] = [];
    const usedLeftWords = new Set<string>();
    const usedRightWords = new Set<string>();

    // Pass 1: Prioritize collocations with distinct left and right words to avoid identical tiles
    for (const col of shuffled) {
      if (roundItems.length >= 6) break;
      const parts = col.chunk.trim().split(/\s+/);
      const firstWord = parts[0].toLowerCase();
      const rest = parts.slice(1).join(' ').toLowerCase();

      if (!usedLeftWords.has(firstWord) && !usedRightWords.has(rest)) {
        roundItems.push(col);
        usedLeftWords.add(firstWord);
        usedRightWords.add(rest);
      }
    }

    // Pass 2: Fallback fill for units with limited vocabulary (e.g. Unit 2 'make & do')
    if (roundItems.length < Math.min(6, pool.length)) {
      for (const col of shuffled) {
        if (roundItems.length >= Math.min(6, pool.length)) break;
        if (!roundItems.some((r) => r.id === col.id)) {
          roundItems.push(col);
        }
      }
    }

    const left: GameTile[] = [];
    const right: GameTile[] = [];

    roundItems.forEach((col, idx) => {
      const parts = col.chunk.trim().split(/\s+/);
      const firstWord = parts[0];
      const rest = parts.slice(1).join(' ');

      const pairId = `pair_${idx}_${col.id}`;

      left.push({
        id: `left_${idx}`,
        pairId,
        text: firstWord,
        side: 'left',
        isMatched: false,
        collocation: col,
      });

      right.push({
        id: `right_${idx}`,
        pairId,
        text: rest,
        side: 'right',
        isMatched: false,
        collocation: col,
      });
    });

    setLeftTiles(left.sort(() => Math.random() - 0.5));
    setRightTiles(right.sort(() => Math.random() - 0.5));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setMismatched(false);
    setMoves(0);
    setSeconds(0);
    setTimerActive(true);
    setIsGameOver(false);
    setCombo(0);
    setMismatchFeedback(null);
  };

  useEffect(() => {
    startNewGame();
  }, [pool]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && !isGameOver) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isGameOver]);

  // Handle tile click
  const handleTileClick = (tile: GameTile) => {
    if (tile.isMatched || mismatched) return;

    if (tile.side === 'left') {
      if (selectedLeft?.id === tile.id) {
        setSelectedLeft(null);
      } else {
        setSelectedLeft(tile);
        if (selectedRight) {
          checkMatch(tile, selectedRight);
        }
      }
    } else {
      if (selectedRight?.id === tile.id) {
        setSelectedRight(null);
      } else {
        setSelectedRight(tile);
        if (selectedLeft) {
          checkMatch(selectedLeft, tile);
        }
      }
    }
  };

  const checkMatch = (left: GameTile, right: GameTile) => {
    setMoves((m) => m + 1);

    const combined = `${left.text} ${right.text}`.trim().toLowerCase();

    // Check if directly paired, or if combined forms either tile's collocation,
    // or if combined forms ANY currently active (unmatched) collocation in this round:
    const activeUnmatchedCollocations = leftTiles
      .filter((t) => !t.isMatched)
      .map((t) => t.collocation);

    const matchedCollocation =
      (left.pairId === right.pairId ? left.collocation : null) ||
      (left.collocation.chunk.trim().toLowerCase() === combined ? left.collocation : null) ||
      (right.collocation.chunk.trim().toLowerCase() === combined ? right.collocation : null) ||
      activeUnmatchedCollocations.find((c) => c.chunk.trim().toLowerCase() === combined);

    if (matchedCollocation) {
      // MATCH!
      playChime('success');
      speakCollocation(matchedCollocation.chunk);
      recordReview(matchedCollocation.id, 4, 2500);

      const matchKey = `${left.id}_${right.id}`;
      const newMatched = [...matchedPairs, matchKey];
      setMatchedPairs(newMatched);
      setCombo((c) => c + 1);
      setMismatchFeedback(null);

      setLeftTiles((tiles) =>
        tiles.map((t) => (t.id === left.id ? { ...t, isMatched: true } : t))
      );
      setRightTiles((tiles) =>
        tiles.map((t) => (t.id === right.id ? { ...t, isMatched: true } : t))
      );

      setSelectedLeft(null);
      setSelectedRight(null);

      if (newMatched.length === leftTiles.length) {
        setIsGameOver(true);
        setTimerActive(false);
        playChime('complete');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      // MISMATCH
      playChime('again');
      setCombo(0);
      setMismatched(true);
      const wrongChunk = `${left.text} ${right.text}`;
      setMismatchFeedback(`"${wrongChunk}" is not a natural collocation in this round.`);

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setMismatched(false);
      }, 700);

      setTimeout(() => {
        setMismatchFeedback(null);
      }, 3500);
    }
  };

  const unitSummaries = useMemo(() => getUnitSummaries(), [getUnitSummaries]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 md:pb-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-xl hover:bg-[#131D2E] shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Multi-Unit Selector Button */}
        <button
          onClick={() => setIsUnitModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#131D2E] px-2.5 py-1.5 rounded-xl border border-[#1E2D45] hover:border-amber-500/40 text-[11px] font-bold text-zinc-200 transition-all max-w-[170px] sm:max-w-[240px] truncate shrink-0"
          title="Select one or multiple units"
        >
          <Filter className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">
            {selectedUnits.length === 0
              ? 'All Units'
              : selectedUnits.length === 1
              ? `Unit ${selectedUnits[0]}`
              : `Units (${selectedUnits.length}): ${selectedUnits.sort((a, b) => a - b).join(', ')}`}
          </span>
        </button>
      </div>

      {/* Game Stats Bar */}
      <div className="bg-[#111927] border border-[#1E2D45] p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-bold text-white text-sm">{formatTime(seconds)}</span>
          </div>

          <div className="text-xs text-zinc-400">
            Moves: <strong className="text-white font-mono">{moves}</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {combo > 1 && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {combo} Combo!
            </span>
          )}

          <div className="text-xs font-bold text-emerald-400">
            {matchedPairs.length} / {leftTiles.length} Matched
          </div>

          <button
            onClick={startNewGame}
            className="p-1.5 rounded-xl bg-[#162235] hover:bg-[#1E2D45] text-zinc-400 hover:text-white transition-colors"
            title="Restart round"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error / Educational Feedback */}
      {mismatchFeedback && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-2xl animate-shake">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{mismatchFeedback}</span>
        </div>
      )}

      {/* Matching Grid */}
      {!isGameOver ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 items-stretch">
          {/* Left Column (First Word) */}
          <div className="space-y-2.5 sm:space-y-3 flex flex-col">
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider px-1">
              Part 1 (Verb / Adjective)
            </div>
            {leftTiles.map((tile) => {
              const isSelected = selectedLeft?.id === tile.id;
              const isMatched = tile.isMatched;

              let style = 'bg-[#111927] border-[#1E2D45] text-zinc-200 hover:border-indigo-500/40 hover:bg-[#162235]';

              if (isMatched) {
                style = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400/50 opacity-40 cursor-default line-through';
              } else if (isSelected) {
                style = mismatched
                  ? 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                  : 'bg-indigo-600/25 border-indigo-500 text-white ring-2 ring-indigo-500/30';
              }

              return (
                <button
                  key={tile.id}
                  disabled={isMatched}
                  onClick={() => handleTileClick(tile)}
                  className={`w-full min-h-[58px] sm:min-h-[66px] p-3 sm:p-4 rounded-2xl border text-sm sm:text-base font-extrabold flex items-center justify-center text-center transition-all duration-200 select-none active:scale-[0.98] ${style}`}
                >
                  <span className="truncate max-w-full">{tile.text}</span>
                </button>
              );
            })}
          </div>

          {/* Right Column (Second Word / Rest) */}
          <div className="space-y-2.5 sm:space-y-3 flex flex-col">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider px-1">
              Part 2 (Noun / Phrase)
            </div>
            {rightTiles.map((tile) => {
              const isSelected = selectedRight?.id === tile.id;
              const isMatched = tile.isMatched;

              let style = 'bg-[#111927] border-[#1E2D45] text-zinc-200 hover:border-cyan-500/40 hover:bg-[#162235]';

              if (isMatched) {
                style = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400/50 opacity-40 cursor-default line-through';
              } else if (isSelected) {
                style = mismatched
                  ? 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                  : 'bg-cyan-600/25 border-cyan-500 text-white ring-2 ring-cyan-500/30';
              }

              return (
                <button
                  key={tile.id}
                  disabled={isMatched}
                  onClick={() => handleTileClick(tile)}
                  className={`w-full min-h-[58px] sm:min-h-[66px] p-3 sm:p-4 rounded-2xl border text-sm sm:text-base font-extrabold flex items-center justify-center text-center transition-all duration-200 select-none active:scale-[0.98] ${style}`}
                >
                  <span className="truncate max-w-full">{tile.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Over Screen */
        <div className="bg-[#111927] border border-[#1E2D45] rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Round Cleared! 🎉</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Superb collocation matching speed and accuracy!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto bg-[#0F172A] p-4 rounded-2xl border border-[#1E2D45]">
            <div>
              <div className="text-xs text-zinc-400">Time</div>
              <div className="text-xl font-extrabold font-mono text-cyan-400 mt-0.5">
                {formatTime(seconds)}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Total Moves</div>
              <div className="text-xl font-extrabold font-mono text-white mt-0.5">{moves}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={startNewGame}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white transition-all shadow-md shadow-indigo-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              Play Next Round
            </button>

            <button
              onClick={() => navigate('/units')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#162235] hover:bg-[#1C2C45] text-zinc-200 border border-[#1E2D45] transition-all"
            >
              <Puzzle className="w-4 h-4" />
              Back to Units
            </button>
          </div>
        </div>
      )}

      {/* Multi-Unit Selection Modal */}
      <MultiUnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        selectedUnits={selectedUnits}
        onApply={(units) => {
          setSelectedUnits(units);
        }}
        unitSummaries={unitSummaries}
      />
    </div>
  );
};
export default MatchGame;
