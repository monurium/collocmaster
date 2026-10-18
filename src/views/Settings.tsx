import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Download,
  Upload,
  Settings as SettingsIcon,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  Target,
  Trash2,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const settings       = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const exportDataJSON = useAppStore((s) => s.exportDataJSON);
  const importDataJSON = useAppStore((s) => s.importDataJSON);
  const resetProgress  = useAppStore((s) => s.resetProgress);
  const reviewLogs     = useAppStore((s) => s.reviewLogs);
  const srsItems       = useAppStore((s) => s.srsItems);

  const [msg, setMsg]                   = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showReset, setShowReset]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const notify = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4500);
  };

  const handleExport = () => {
    try {
      const str  = exportDataJSON();
      const blob = new Blob([str], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `collocmaster_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notify('ok', 'Data exported successfully! ✅');
    } catch {
      notify('err', 'Export failed.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = importDataJSON(ev.target?.result as string);
      if (res.success) notify('ok', 'Data imported successfully! ✅');
      else notify('err', `Import failed: ${res.error}`);
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetProgress();
    setShowReset(false);
    notify('ok', 'All study progress has been reset.');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-10 animate-fadeIn">

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Study preferences and data management
        </p>
      </div>

      {/* Notification */}
      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-semibold animate-fadeIn ${
          msg.type === 'ok'
            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/25 text-rose-300'
        }`}>
          {msg.type === 'ok'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          }
          {msg.text}
        </div>
      )}

      {/* ── Study Preferences ── */}
      <div className="card p-5 sm:p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          Study Preferences
        </h2>

        {/* Daily goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-zinc-200">Daily Card Goal</p>
              <p className="text-xs text-zinc-500">How many cards do you want to learn each day?</p>
            </div>
            <span className="text-lg font-black font-mono text-indigo-400">{settings.dailyGoal}</span>
          </div>
          <div className="flex gap-2">
            {[5, 10, 15, 20, 30].map((n) => (
              <button
                key={n}
                id={`goal-${n}-btn`}
                onClick={() => updateSettings({ dailyGoal: n })}
                className={`flex-1 py-2 rounded-xl text-sm font-bold font-mono transition-all ${
                  settings.dailyGoal === n
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-[#131D2E] text-zinc-400 hover:text-white border border-[#1E2D45]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-1.5">
            Recommended: <strong className="text-zinc-400">10</strong> for steady pace, <strong className="text-zinc-400">20+</strong> for intensive practice.
          </p>
        </div>

        <div className="h-px bg-[#1E2D45]" />

        {/* Speech rate */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-zinc-400" />
                Speech Rate (TTS)
              </p>
              <p className="text-xs text-zinc-500">Adjust English pronunciation speed</p>
            </div>
            <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
              {settings.speechRate.toFixed(2)}×
            </span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.2"
            step="0.05"
            value={settings.speechRate}
            onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
            className="w-full h-2 accent-indigo-500 cursor-pointer rounded-full"
          />
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
            <span>Slow (0.6×)</span>
            <span>Normal (0.95×)</span>
            <span>Fast (1.2×)</span>
          </div>
        </div>

        <div className="h-px bg-[#1E2D45]" />

        {/* Auto audio */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-200">Auto Audio</p>
            <p className="text-xs text-zinc-500">Automatically play pronunciation when answer is revealed</p>
          </div>
          <input
            type="checkbox"
            id="auto-audio-toggle"
            checked={settings.autoAudio}
            onChange={(e) => updateSettings({ autoAudio: e.target.checked })}
            className="toggle-switch"
          />
        </div>

        <div className="h-px bg-[#1E2D45]" />

        {/* Sound effects */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-200">Sound Effects</p>
            <p className="text-xs text-zinc-500">Audio cues for correct/incorrect answers</p>
          </div>
          <input
            type="checkbox"
            id="sound-effects-toggle"
            checked={settings.soundEffects}
            onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
            className="toggle-switch"
          />
        </div>
      </div>

      {/* ── Data Backup ── */}
      <div className="card p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <FileJson className="w-5 h-5 text-indigo-400" />
            Data Backup
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            All progress and SM-2 intervals are stored in your browser's <code className="text-indigo-300 bg-indigo-500/10 px-1 rounded">localStorage</code>.
            Export your data before switching devices!
          </p>
        </div>

        {/* Storage stats */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#070B14] border border-[#1E2D45]">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Total Reviews</p>
            <p className="text-xl font-bold font-mono text-white">{reviewLogs.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Active Cards</p>
            <p className="text-xl font-bold font-mono text-indigo-400">{Object.keys(srsItems).length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Storage</p>
            <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Active
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="export-btn"
            onClick={handleExport}
            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
          >
            <Download className="w-4 h-4" />
            Export (JSON)
          </button>

          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            id="import-btn"
            onClick={() => fileRef.current?.click()}
            className="flex-1 px-4 py-3 rounded-xl border border-[#1E2D45] bg-[#131D2E] hover:bg-[#1A2539] text-zinc-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import (JSON)
          </button>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="rounded-2xl border border-rose-900/40 bg-rose-950/15 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <Trash2 className="w-5 h-5" />
          <h2 className="text-base font-bold">Reset Progress</h2>
        </div>
        <p className="text-xs text-rose-200/70 leading-relaxed">
          All SM-2 review history, intervals, and streaks will be cleared.
          Collocations will remain intact. This action cannot be undone!
        </p>

        {!showReset ? (
          <button
            id="reset-btn"
            onClick={() => setShowReset(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-800/50 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-sm font-bold transition-all"
          >
            Reset Progress...
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-700/50 space-y-3">
            <p className="text-sm font-bold text-rose-200">
              ⚠️ Are you sure? If you don't have a JSON backup, this cannot be reversed!
            </p>
            <div className="flex gap-2">
              <button
                id="confirm-reset-btn"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="px-4 py-2 rounded-lg bg-[#131D2E] hover:bg-[#1A2539] text-zinc-300 font-bold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
