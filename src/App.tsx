import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './views/Dashboard';
import { UnitsView } from './views/Units';
import { StudySession } from './views/StudySession';
import { QuizView } from './views/QuizView';
import { MatchGame } from './views/MatchGame';
import { Library } from './views/Library';
import { Settings } from './views/Settings';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0A0E1A] text-[#F1F5F9] flex flex-col font-sans selection:bg-indigo-500/40 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-7 pb-24 md:pb-8">
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
        </main>

        {/* Footer */}
        <footer className="hidden md:block border-t border-[#1E2D45] py-5 text-center text-[11px] text-zinc-600 bg-[#0A0E1A]">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <span>CollocMaster © 2026 — Cambridge English Collocations in Use Çalışma Asistanı</span>
            <div className="flex items-center gap-4">
              <span>Intermediate & Advanced</span>
              <span>•</span>
              <span>SM-2 Aralıklı Tekrar & Test & Eşleştirme</span>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
