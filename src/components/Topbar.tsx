import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Sparkles, Trophy, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    
    // Parse path segments
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'EcoSphere';
    
    // Format segment names
    const section = segments[0];
    const sub = segments[1] || '';
    
    const formatSegment = (str: string) => {
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    if (sub) {
      return `${formatSegment(section)} — ${formatSegment(sub)}`;
    }
    return formatSegment(section);
  };

  // XP Progress Calculation
  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const nextLevelXp = level * 500;
  const prevLevelXp = (level - 1) * 500;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100)
  );

  return (
    <header className="h-16 border-b border-border bg-base flex items-center justify-between px-8 select-none fixed top-0 right-0 left-64 z-10">
      {/* Page Title */}
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold text-text-primary m-0 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center/Right stats & profile details */}
      <div className="flex items-center space-x-6">
        {/* XP and Level progress bar (shown for employees and department heads) */}
        {profile && profile.role !== 'admin' && (
          <div className="flex items-center space-x-4 bg-surface/50 border border-border/60 py-1.5 px-4 rounded-xl shadow-xs">
            <div className="flex items-center space-x-1.5 text-[#f08c00]">
              <Trophy className="h-4 w-4 fill-[#f08c00]/10" />
              <span className="text-xs font-black uppercase tracking-wider">Lvl {level}</span>
            </div>
            
            <div className="w-32 bg-border h-2.5 rounded-full overflow-hidden relative" title={`${xp} XP / ${nextLevelXp} XP`}>
              <div 
                className="bg-gradient-to-r from-[#f08c00] to-[#6741d9] h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            
            <span className="text-xs font-bold text-text-secondary">
              {xp} <span className="text-[10px] text-text-secondary/50 font-normal">XP</span>
            </span>
          </div>
        )}

        {/* Notifications and profile quick info */}
        <div className="flex items-center space-x-4 border-l border-border pl-6">
          {/* Notifications bell */}
          <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface border border-transparent hover:border-border transition-all relative active:scale-95">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger rounded-full border border-base animate-pulse"></span>
          </button>

          {/* Quick Profile Badge */}
          <div className="flex items-center space-x-2 bg-surface/40 px-3 py-1 rounded-lg border border-border/30">
            <span className="text-xs text-text-secondary">Balance:</span>
            <span className="text-sm font-black text-[#6741d9] flex items-center space-x-0.5">
              <span>{profile?.points_balance || 0}</span>
              <Sparkles className="h-3 w-3 fill-[#6741d9]/25 text-[#6741d9]" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
