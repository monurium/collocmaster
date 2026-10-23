import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  BookOpen,
  LayoutDashboard,
  Settings,
  GraduationCap,
  FileCheck2,
  Puzzle,
  BookMarked,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const getMetrics = useAppStore((state) => state.getMetrics);
  const metrics = getMetrics();

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMoreOpen(false);
    setMobileMoreOpen(false);
  }, [location.pathname]);

  // Primary navigation items (focused, decluttered)
  const primaryNavItems = [
    { to: '/', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', exact: true },
    { to: '/units', icon: <BookOpen className="w-4 h-4" />, label: 'Units' },
    { to: '/reading', icon: <BookMarked className="w-4 h-4 text-cyan-400" />, label: 'Reading' },
    { to: '/study', icon: <GraduationCap className="w-4 h-4" />, label: 'Cards', badge: metrics.dueTodayCount },
    { to: '/quiz', icon: <FileCheck2 className="w-4 h-4" />, label: 'Quiz' },
  ];

  // Secondary items tucked neatly inside "More"
  const secondaryItems = [
    { to: '/match', icon: <Puzzle className="w-4 h-4 text-amber-400" />, label: 'Match Game', desc: 'Fast-paced collocation pairs' },
    { to: '/library', icon: <Sparkles className="w-4 h-4 text-indigo-400" />, label: 'Custom Library', desc: 'Personal collocation bank' },
    { to: '/settings', icon: <Settings className="w-4 h-4 text-zinc-400" />, label: 'Settings', desc: 'DeepSeek key, audio & goals' },
  ];

  const isSecondaryActive = ['/match', '/library'].includes(location.pathname);

  return (
    <>
      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1E2D45] bg-[#0A0E1A]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[62px] flex items-center justify-between">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-[15px] tracking-tight text-white">
                Colloc<span className="text-indigo-400">Master</span>
              </span>
              <div className="text-[10px] text-zinc-500 leading-none hidden sm:block">Cambridge Collocations</div>
            </div>
          </NavLink>

          {/* Desktop Nav (Clean 5 items + More dropdown) */}
          <nav className="hidden md:flex items-center gap-1">
            {primaryNavItems.map(({ to, icon, label, badge, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#131D2E] border border-transparent'
                  }`
                }
              >
                {icon}
                <span>{label}</span>
                {badge != null && badge > 0 && (
                  <span className="min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[9px] font-black rounded-full bg-rose-500 text-white ml-0.5">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}

            {/* Desktop "More" Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSecondaryActive || moreOpen
                    ? 'bg-indigo-600/25 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-[#131D2E] border-transparent'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#111927] border border-[#1E2D45] rounded-2xl p-2 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-1">
                  {secondaryItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-all ${
                          isActive
                            ? 'bg-indigo-600/25 text-indigo-200'
                            : 'text-zinc-300 hover:bg-[#162235] hover:text-white'
                        }`
                      }
                    >
                      <div className="p-1 rounded-lg bg-[#162235] shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-zinc-500">{item.desc}</div>
                      </div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right actions: Eye Comfort + Streak + Settings icon */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const current = useAppStore.getState().settings.eyeComfort;
                useAppStore.getState().updateSettings({ eyeComfort: !current });
              }}
              title={useAppStore((s) => s.settings.eyeComfort) ? 'Eye-Comfort Active' : 'Switch to Eye-Comfort Soft Mode'}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                useAppStore((s) => s.settings.eyeComfort)
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-[#131D2E] text-zinc-400 hover:text-zinc-200 border-[#1E2D45]'
              }`}
              aria-label="Toggle Eye Comfort"
            >
              <span className="text-sm leading-none">🌿</span>
            </button>

            {/* Streak pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                metrics.currentStreak > 0
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                  : 'bg-[#131D2E] text-zinc-500 border border-[#1E2D45]'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${metrics.currentStreak > 0 ? 'text-amber-400' : 'text-zinc-600'}`} />
              <span className="text-[11px] font-mono">{metrics.currentStreak}d</span>
            </div>

            {/* Settings button */}
            <NavLink
              to="/settings"
              title="Settings & DeepSeek Key"
              className={({ isActive }) =>
                `p-2 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-[#131D2E] text-zinc-400 hover:text-zinc-200 border-[#1E2D45]'
                }`
              }
            >
              <Settings className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* ─── Mobile Bottom Nav (Clean, roomy 5 items) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0E1A]/95 border-t border-[#1E2D45]/80 backdrop-blur-xl px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryNavItems.slice(0, 4).map(({ to, icon, label, badge, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-indigo-400 font-bold'
                    : 'text-zinc-500 font-medium hover:text-zinc-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {icon}
                    {badge != null && badge > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 flex items-center justify-center text-[9px] font-black rounded-full bg-rose-500 text-white shadow-sm ring-1 ring-[#0A0E1A]">
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-1 tracking-tight">{label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-0.5 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* 5th Mobile Tab: More button (Quiz, Match, Library, Settings) */}
          <button
            onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-200 active:scale-95 ${
              isSecondaryActive || location.pathname === '/quiz' || mobileMoreOpen
                ? 'text-indigo-400 font-bold'
                : 'text-zinc-500 font-medium hover:text-zinc-300'
            }`}
          >
            <Menu className="w-4 h-4" />
            <span className="text-[10px] mt-1 tracking-tight">More</span>
            {(isSecondaryActive || location.pathname === '/quiz') && (
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-0.5 animate-pulse" />
            )}
          </button>
        </div>
      </nav>

      {/* ─── Mobile More Drawer / Bottom Sheet ─── */}
      {mobileMoreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end animate-fadeIn"
          onClick={() => setMobileMoreOpen(false)}
        >
          <div
            className="w-full bg-[#111927] border-t border-[#1E2D45] rounded-t-3xl p-5 pb-8 space-y-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2D45]">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Additional Activities & Settings
              </span>
              <button onClick={() => setMobileMoreOpen(false)} className="p-1 rounded-lg text-zinc-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <NavLink
                to="/quiz"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#162235] border border-[#23334d] text-white"
              >
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Sentence Quiz</div>
                  <div className="text-[10px] text-zinc-400">Cloze Practice</div>
                </div>
              </NavLink>

              <NavLink
                to="/match"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#162235] border border-[#23334d] text-white"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <Puzzle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Match Game</div>
                  <div className="text-[10px] text-zinc-400">Speed Matching</div>
                </div>
              </NavLink>

              <NavLink
                to="/library"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#162235] border border-[#23334d] text-white"
              >
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Library</div>
                  <div className="text-[10px] text-zinc-400">Custom Chunks</div>
                </div>
              </NavLink>

              <NavLink
                to="/settings"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#162235] border border-[#23334d] text-white"
              >
                <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Settings</div>
                  <div className="text-[10px] text-zinc-400">DeepSeek & Audio</div>
                </div>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
