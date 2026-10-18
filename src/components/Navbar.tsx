import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  BookOpen,
  LayoutDashboard,
  Settings,
  GraduationCap,
  FileCheck2,
  Puzzle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Navbar: React.FC = () => {
  const getMetrics = useAppStore((state) => state.getMetrics);
  const metrics = getMetrics();

  const navItems = [
    { to: '/', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', exact: true },
    { to: '/units', icon: <BookOpen className="w-4 h-4" />, label: 'Units' },
    { to: '/study', icon: <GraduationCap className="w-4 h-4" />, label: 'Cards', badge: metrics.dueTodayCount },
    { to: '/quiz', icon: <FileCheck2 className="w-4 h-4" />, label: 'Quiz' },
    { to: '/match', icon: <Puzzle className="w-4 h-4" />, label: 'Match' },
    { to: '/library', icon: <Sparkles className="w-4 h-4" />, label: 'Library' },
    { to: '/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
  ];

  return (
    <>
      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1E2D45] bg-[#0A0E1A]/95 backdrop-blur-lg">
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
              <div className="text-[10px] text-zinc-500 leading-none hidden sm:block">Collocations in Use</div>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#131D2E]'
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
          </nav>

          {/* Right actions: Eye Comfort toggle + Streak pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const current = useAppStore.getState().settings.eyeComfort;
                useAppStore.getState().updateSettings({ eyeComfort: !current });
              }}
              title={useAppStore((s) => s.settings.eyeComfort) ? 'Eye-Comfort Mode Active (Click to switch to Standard Dark)' : 'Switch to Eye-Comfort Soft Mode'}
              className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                useAppStore((s) => s.settings.eyeComfort)
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-[#131D2E] text-zinc-400 hover:text-zinc-200 border-[#1E2D45]'
              }`}
              aria-label="Toggle Eye Comfort Study Mode"
            >
              <span className="text-sm leading-none">🌿</span>
            </button>

            {/* Streak pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                metrics.currentStreak > 0
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                  : 'bg-[#131D2E] text-zinc-500 border border-[#1E2D45]'
              }`}
            >
              <Flame
                className={`w-4 h-4 ${metrics.currentStreak > 0 ? 'text-amber-400' : 'text-zinc-600'}`}
              />
              <span>{metrics.currentStreak} {metrics.currentStreak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Bottom Nav (App Bar) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0E1A]/95 border-t border-[#1E2D45]/80 backdrop-blur-xl px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map(({ to, icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all duration-200 active:scale-90 ${
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
        </div>
      </nav>
    </>
  );
};
export default Navbar;
