import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './views/Dashboard';

// Lazy load non-initial views to split heavy bundle chunks
const UnitsView = lazy(() => import('./views/Units').then(m => ({ default: m.UnitsView })));
const StudySession = lazy(() => import('./views/StudySession').then(m => ({ default: m.StudySession })));
const QuizView = lazy(() => import('./views/QuizView').then(m => ({ default: m.QuizView })));
const MatchGame = lazy(() => import('./views/MatchGame').then(m => ({ default: m.MatchGame })));
const Library = lazy(() => import('./views/Library').then(m => ({ default: m.Library })));
const Settings = lazy(() => import('./views/Settings').then(m => ({ default: m.Settings })));

const RouteFallback: React.FC = () => (
  <div className="max-w-4xl mx-auto py-16 px-4 animate-pulse space-y-6">
    <div className="h-8 bg-slate-800/60 rounded-xl w-1/3" />
    <div className="h-64 bg-slate-800/30 rounded-2xl border border-slate-800/60 w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="h-32 bg-slate-800/30 rounded-xl border border-slate-800/60" />
      <div className="h-32 bg-slate-800/30 rounded-xl border border-slate-800/60" />
    </div>
  </div>
);

import { useAppStore } from './store/useAppStore';

export const App: React.FC = () => {
  const eyeComfort = useAppStore((s) => s.settings.eyeComfort);

  React.useEffect(() => {
    if (eyeComfort) {
      document.body.classList.add('eye-comfort');
    } else {
      document.body.classList.remove('eye-comfort');
    }
  }, [eyeComfort]);

  return (
    <HashRouter>
      <div className={`min-h-screen text-[#F1F5F9] flex flex-col font-sans selection:bg-amber-500/30 selection:text-white transition-colors duration-300 ${eyeComfort ? 'bg-[#12161A]' : 'bg-[#0A0E1A]'}`}>
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-7 pb-24 md:pb-8">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/units"    element={<UnitsView />} />
              <Route path="/study"    element={<StudySession />} />
              <Route path="/quiz"     element={<QuizView />} />
              <Route path="/match"    element={<MatchGame />} />
              <Route path="/library"  element={<Library />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*"         element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="hidden md:block border-t border-[#1E2D45] py-5 text-center text-[11px] text-zinc-600 bg-[#0A0E1A]">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <span>CollocMaster © 2026 — Cambridge English Collocations in Use Study Companion</span>
            <div className="flex items-center gap-4">
              <span>Intermediate & Advanced</span>
              <span>•</span>
              <span>SM-2 Spaced Repetition & Sentence Quizzes & Matching Games</span>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
