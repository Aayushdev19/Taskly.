import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, LogOut, User } from 'lucide-react';

export default function NavBar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const formatTime = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + ' • ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      {/* Top Header - Responsive */}
      <nav className="glass-panel sticky top-0 z-50 px-4 sm:px-6 py-3.5 shadow-sm border-b border-slate-200/50 backdrop-blur-md rounded-b-2xl bg-white/75">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-all duration-200" onClick={() => onTabChange('dashboard')}>
            <span className="font-black tracking-tight bg-gradient-to-r from-[#ff9777] to-amber-500 bg-clip-text text-transparent text-xl sm:text-2xl font-sans select-none">
              Taskly.
            </span>
          </div>

          {/* Desktop Navigation Tabs (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                activeTab === 'dashboard'
                  ? 'bg-[#ff9777] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onTabChange('tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                activeTab === 'tasks'
                  ? 'bg-[#ff9777] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
              title="Tasks"
            >
              <CheckSquare className="h-3.5 w-3.5 shrink-0" />
              <span>Tasks</span>
            </button>

          </div>

          {/* Right Section (Clock, User profile & Logout) */}
          <div className="flex items-center gap-3">
            {/* Live Clock (Hidden on Mobile) */}
            <div className="hidden md:block text-[11px] font-bold text-slate-500 bg-white/50 border border-slate-200/40 px-3.5 py-2 rounded-xl shrink-0 shadow-xs">
              {formatTime(currentTime)}
            </div>

            {/* Mobile Clickable Avatar (Hidden on Desktop) */}
            <button
              onClick={() => onTabChange('profile')}
              className={`md:hidden relative h-8.5 w-8.5 rounded-full overflow-hidden border flex items-center justify-center shrink-0 transition-all ${
                activeTab === 'profile'
                  ? 'border-[#ff9777] bg-white ring-2 ring-[#ff9777]/10'
                  : 'border-slate-200/80 bg-red-50 text-[#ff9777] hover:scale-105 active:scale-95'
              }`}
              title="View Profile"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4.5 w-4.5" />
              )}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-white"></span>
            </button>

            {/* Desktop User Card (Hidden on Mobile) */}
            <div 
              onClick={() => onTabChange('profile')}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none ${
                activeTab === 'profile'
                  ? 'border-[#ff9777] bg-white shadow-md shadow-red-500/5'
                  : 'border-slate-200/60 bg-white/80 hover:border-[#ff9777]/55 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="relative shrink-0">
                <div className="h-7.5 w-7.5 rounded-full overflow-hidden border border-slate-200/80 bg-red-50 flex items-center justify-center text-[#ff9777]">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div className="text-left leading-none pr-1">
                <span className="block text-[10px] font-extrabold text-slate-700 max-w-[90px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                <span className="text-[7.5px] uppercase tracking-wider font-bold text-slate-400 mt-0.5 block">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2.5 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar (Visible only on Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200/50 py-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex justify-around items-center rounded-t-2xl">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center gap-1 py-1.5 px-5 rounded-xl transition-all duration-300 ${
            activeTab === 'dashboard'
              ? 'text-[#ff9777] scale-105'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LayoutDashboard className={`h-5 w-5 ${activeTab === 'dashboard' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange('tasks')}
          className={`flex flex-col items-center gap-1 py-1.5 px-5 rounded-xl transition-all duration-300 ${
            activeTab === 'tasks'
              ? 'text-[#ff9777] scale-105'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CheckSquare className={`h-5 w-5 ${activeTab === 'tasks' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Tasks</span>
        </button>

      </nav>
    </>
  );
}
