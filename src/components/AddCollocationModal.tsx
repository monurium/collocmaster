import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../store/useAppStore';
import { playChime } from '../utils/audio';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddCollocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUnitNumber?: number;
  defaultUnitTitle?: string;
}

export const AddCollocationModal: React.FC<AddCollocationModalProps> = ({
  isOpen,
  onClose,
  defaultUnitNumber,
  defaultUnitTitle,
}) => {
  const addCustomCollocation = useAppStore((s) => s.addCustomCollocation);

  const [chunk, setChunk] = useState('');
  const [type, setType] = useState<'verb-noun' | 'adj-noun' | 'adv-adj' | 'phrase'>('verb-noun');
  const [level, setLevel] = useState<'Intermediate' | 'Advanced'>('Intermediate');
  const [cefrLevel, setCefrLevel] = useState<'B1' | 'B2' | 'C1' | 'C2'>('B2');
  const [unitNumber, setUnitNumber] = useState<number>(defaultUnitNumber ?? 1);
  const [unitTitle, setUnitTitle] = useState<string>(defaultUnitTitle ?? 'Kişisel Notlar');
  const [meaning, setMeaning] = useState('');
  const [sentence, setSentence] = useState('');
  const [commonMistake, setCommonMistake] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chunk.trim()) {
      setError('Lütfen bir kollokasyon ifadesi girin (Örn: make an effort).');
      return;
    }

    const exSentence = sentence.trim() || `Remember the phrase: ${chunk}.`;
    let clozeSentence = exSentence;
    if (clozeSentence.toLowerCase().includes(chunk.toLowerCase())) {
      const reg = new RegExp(chunk, 'gi');
      clozeSentence = clozeSentence.replace(reg, '___');
    } else {
      clozeSentence = `It is important to ___ .`;
    }

    addCustomCollocation({
      chunk: chunk.trim(),
      type,
      level,
      cefrLevel,
      category: 'everyday',
      unitNumber,
      unitTitle: unitTitle.trim() || `Unit ${unitNumber}`,
      meaning: meaning.trim() || `[Unit ${unitNumber}: ${unitTitle}] ${chunk}`,
      collocates: [],
      commonMistakes: commonMistake.trim() ? [commonMistake.trim()] : [],
      examples: [
        {
          sentence: exSentence,
          clozeSentence,
          missingWord: chunk.trim(),
        },
      ],
    });

    playChime('success');
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#111927] border-t sm:border border-[#1E2D45] rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2D45] flex items-center justify-between bg-[#0F172A] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Yeni Kollokasyon Ekle</h2>
              <p className="text-[11px] text-zinc-400">Kitaptan çalıştığınız yeni kalıbı defterinize ekleyin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#162235] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Collocation chunk */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Kollokasyon İfadesi <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={chunk}
              onChange={(e) => setChunk(e.target.value)}
              placeholder="Örn: make an effort, bitterly cold, cast doubt"
              className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type & Level row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Kalıp Türü</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="verb-noun">Fiil + İsim</option>
                <option value="adv-adj">Zarf + Sıfat</option>
                <option value="adj-noun">Sıfat + İsim</option>
                <option value="phrase">Deyim / Kalıp</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Kitap Seviyesi</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">CEFR</label>
              <select
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value as any)}
                className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          {/* Unit mapping */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-zinc-300">Ünite No</label>
              <input
                type="number"
                min="1"
                max="60"
                value={unitNumber}
                onChange={(e) => setUnitNumber(Number(e.target.value))}
                className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-zinc-300">Ünite Başlığı</label>
              <input
                type="text"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                placeholder="Örn: Everyday verbs 1"
                className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Turkish Meaning */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Türkçe Anlamı / Açıklama</label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Örn: Çaba sarf etmek, gayret göstermek"
              className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Example sentence */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Örnek Cümle</label>
            <textarea
              rows={2}
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="Örn: You should make an effort to arrive early."
              className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Common mistake */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Sık Yapılan Hata (Kitaptaki Yanlış Kullanım Uyarısı)
            </label>
            <input
              type="text"
              value={commonMistake}
              onChange={(e) => setCommonMistake(e.target.value)}
              placeholder="Örn: do an effort, make a homework"
              className="w-full bg-[#162235] border border-[#1E2D45] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2D45]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#162235]"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Kollokasyonu Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
export default AddCollocationModal;
