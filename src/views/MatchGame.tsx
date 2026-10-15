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

interface GameTile {
  id: string; // unique tile id
  pairId: string; // matches partner
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

  const navState = location.state as { unitNumber?: number; level?: string } | undefined;
  const initialUnit = navState?.unitNumber;

  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>(initialUnit ?? 'all');
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
    if (selectedUnit !== 'all') {
      list = collocations.filter((c) => c.unitNumber === selectedUnit);
    }
    // Only items that can be neatly split into two parts (e.g. 2 or 3 words)
    return list.filter((c) => {
      const parts = c.chunk.trim().split(/\s+/);
      return parts.length >= 2;
    });
  }, [collocations, selectedUnit]);

  // Start new round
  const startNewGame = () => {
    if (pool.length < 3) return;

    // Pick 6 random collocations
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const roundItems = shuffled.slice(0, Math.min(6, pool.length));

    const left: GameTile[] = [];
    const right: GameTile[] = [];

    roundItems.forEach((col, idx) => {
      const parts = col.chunk.trim().split(/\s+/);
      // first word is left (verb/adverb/adjective), rest is right
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

    // Shuffle left and right independently
    setLeftTiles(left.sort(() => Math.random() - 0.5));
    setRightTiles(right.sort(() => Math.random() - 0.5));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setMismatched(false);
    setMoves(0);
    setSeconds(0);
    setCombo(0);
    setIsGameOver(false);
    setTimerActive(true);
  };

  useEffect(() => {
    startNewGame();
  }, [pool]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive && !isGameOver) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, isGameOver]);

  // Tile Selection Logic
  const handleSelectTile = (tile: GameTile) => {
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

    if (left.pairId === right.pairId) {
      // MATCH!
      playChime('success');
      setCombo((c) => c + 1);
      speakCollocation(left.collocation.chunk);

      // Record SRS review
      recordReview(left.collocation.id, 4, 2500);

      const newMatched = [...matchedPairs, left.pairId];
      setMatchedPairs(newMatched);

      setLeftTiles((prev) =>
        prev.map((t) => (t.pairId === left.pairId ? { ...t, isMatched: true } : t))
      );
      setRightTiles((prev) =>
        prev.map((t) => (t.pairId === right.pairId ? { ...t, isMatched: true } : t))
      );

      setSelectedLeft(null);
      setSelectedRight(null);

      // Check if all matched
      if (newMatched.length === leftTiles.length) {
        setIsGameOver(true);
        setTimerActive(false);
        playChime('complete');
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      }
    } else {
      // MISMATCH
      playChime('again');
      setCombo(0);
      setMismatched(true);
      const wrongChunk = `${left.text} ${right.text}`;
      setMismatchFeedback(`"${wrongChunk}" doğal bir kalıp değildir. Doğrusu: "${left.collocation.chunk}"!`);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-[#131D2E] self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>

        {/* Unit Selector */}
        <div className="flex items-center gap-2 bg-[#131D2E] px-3 py-2 sm:py-1.5 rounded-xl border border-[#1E2D45]">
          <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <select
            value={selectedUnit}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedUnit(val === 'all' ? 'all' : Number(val));
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

      {/* Top Game Bar */}
      <div className="flex items-center justify-between bg-[#0F172A] border border-[#1E2D45] p-3.5 rounded-2xl">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
          <Timer className="w-4 h-4 text-cyan-400" />
          <span>Süre: <strong className="text-white font-mono">{formatTime(seconds)}</strong></span>
        </div>

        {combo > 1 && (
          <div className="flex items-center gap-1 text-xs font-black text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 animate-pulse">
            <Flame className="w-3.5 h-3.5" />
            <span>{combo}x Kombo!</span>
          </div>
        )}

        <div className="text-xs font-semibold text-zinc-400">
          Hamle: <strong className="text-white">{moves}</strong>
        </div>
      </div>

      {/* Main Board */}
      {!isGameOver ? (
        <div className="bg-[#111927] border border-[#1E2D45] rounded-3xl p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-xl">
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold text-white">Doğru Kollokasyon Çiftlerini Eşleştirin</h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
              Sol taraftan bir kelime, sağ taraftan onunla doğal olarak birleşen kelimeyi seçin.
            </p>
          </div>

          {mismatchFeedback && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs sm:text-sm text-rose-300 flex items-center gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-medium">{mismatchFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-2 sm:space-y-3">
              <div className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-400">
                Fiil / Zarf / Sıfat
              </div>
              {leftTiles.map((tile) => {
                const isSelected = selectedLeft?.id === tile.id;
                const isMatched = tile.isMatched;

                let style =
                  'bg-[#162235] border-[#1E2D45] text-zinc-100 hover:border-indigo-500/50 hover:bg-[#1C2C45] active:scale-95';

                if (isMatched) {
                  style = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 opacity-40 cursor-default';
                } else if (isSelected && mismatched) {
                  style = 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/30 animate-shake';
                } else if (isSelected) {
                  style = 'bg-indigo-600/30 border-indigo-500 text-white ring-2 ring-indigo-500/40 scale-[1.02] shadow-lg shadow-indigo-500/20';
                }

                return (
                  <button
                    key={tile.id}
                    disabled={isMatched}
                    onClick={() => handleSelectTile(tile)}
                    className={`w-full py-3 px-2 sm:py-4 sm:px-3 rounded-xl sm:rounded-2xl border text-xs sm:text-base font-bold text-center transition-all duration-150 flex items-center justify-center ${style}`}
                  >
                    <span>{tile.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-2 sm:space-y-3">
              <div className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400">
                Tamamlayıcı İsim / Kelime
              </div>
              {rightTiles.map((tile) => {
                const isSelected = selectedRight?.id === tile.id;
                const isMatched = tile.isMatched;

                let style =
                  'bg-[#162235] border-[#1E2D45] text-zinc-100 hover:border-cyan-500/50 hover:bg-[#1C2C45] active:scale-95';

                if (isMatched) {
                  style = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 opacity-40 cursor-default';
                } else if (isSelected && mismatched) {
                  style = 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/30 animate-shake';
                } else if (isSelected) {
                  style = 'bg-cyan-600/30 border-cyan-500 text-white ring-2 ring-cyan-500/40 scale-[1.02] shadow-lg shadow-cyan-500/20';
                }

                return (
                  <button
                    key={tile.id}
                    disabled={isMatched}
                    onClick={() => handleSelectTile(tile)}
                    className={`w-full py-3 px-2 sm:py-4 sm:px-3 rounded-xl sm:rounded-2xl border text-xs sm:text-base font-bold text-center transition-all duration-150 flex items-center justify-center ${style}`}
                  >
                    <span>{tile.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-[#111927] border border-[#1E2D45] rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Muazzam Eşleştirme!</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Tüm kollokasyonları başarıyla doğru kalıplarla eşleştirdiniz.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto bg-[#0F172A] p-4 rounded-2xl border border-[#1E2D45]">
            <div>
              <div className="text-xs text-zinc-400">Toplam Süre</div>
              <div className="text-xl font-extrabold text-cyan-400 mt-0.5">{formatTime(seconds)}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Hamle Sayısı</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{moves}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={startNewGame}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white transition-all shadow-md shadow-indigo-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              Yeni Tur Oyna
            </button>

            <button
              onClick={() => navigate('/units')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#162235] hover:bg-[#1C2C45] text-zinc-200 border border-[#1E2D45] transition-all"
            >
              <Puzzle className="w-4 h-4" />
              Ünitelere Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default MatchGame;
