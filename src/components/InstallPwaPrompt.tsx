import React, { useState, useEffect } from 'react';
import { Smartphone, X, Share, PlusSquare, Check } from 'lucide-react';

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome/Android install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-[#131D2E] to-cyan-900/40 border border-indigo-500/30 p-4 sm:p-5 shadow-xl transition-all">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start sm:items-center gap-3.5 pr-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            Telefonda Mobil Uygulama Olarak Kullanın
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
              PWA
            </span>
          </h4>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            {isIOS ? (
              <span className="flex items-center flex-wrap gap-1">
                Safari'de alttaki <Share className="w-3.5 h-3.5 inline text-cyan-400" /> <b>Paylaş</b> butonuna basıp ardından <PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" /> <b>"Ana Ekrana Ekle"</b> seçeneğini seçin.
              </span>
            ) : (
              'Tarayıcı çubuğundan bağımsız, tam ekran ve kesintisiz mobil deneyim için ana ekrana ekleyin.'
            )}
          </p>
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0 active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Yükle</span>
          </button>
        )}
      </div>

      {deferredPrompt && (
        <div className="mt-3 sm:hidden">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Ana Ekrana Ekle</span>
          </button>
        </div>
      )}
    </div>
  );
};
