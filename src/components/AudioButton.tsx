import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakCollocation } from '../utils/audio';

interface AudioButtonProps {
  text: string;
  rate?: number;
  className?: string;
  showLabel?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  rate = 0.95,
  className = '',
  showLabel = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isPlaying) return;

    setIsPlaying(true);
    await speakCollocation(text, rate);
    setIsPlaying(false);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title="Telaffuzu dinle (Klavye: R)"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-white transition-all active:scale-95 group ${
        isPlaying ? 'ring-2 ring-indigo-400' : ''
      } ${className}`}
    >
      {isPlaying ? (
        <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
      ) : (
        <Volume2 className="w-4 h-4 text-indigo-400 group-hover:text-cyan-300" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">Dinle</span>
      )}
      <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono bg-indigo-900/40 text-indigo-300 rounded border border-indigo-700/50">
        R
      </kbd>
    </button>
  );
};
