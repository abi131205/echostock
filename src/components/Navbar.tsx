import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Camera, Cpu, ArrowLeftRight, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';
import { storeService } from '../services/storeService';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Live Dashboard', path: '/dashboard', icon: Activity, role: 'all' },
    { label: 'Report Stock', path: '/report-stock', icon: Camera, role: 'worker', badge: 'Photo AI' },
    { label: 'Outbreak Twin', path: '/simulate', icon: Cpu, role: 'coordinator', badge: 'Sim Engine' },
    { label: 'Redistribution', path: '/redistribute', icon: ArrowLeftRight, role: 'coordinator' },
  ];

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleResetData = () => {
    if (window.confirm('Reset all PHC stock data back to initial seed state?')) {
      storeService.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <header className="bg-charcoal text-white border-b border-charcoal-surface sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-rust flex items-center justify-center text-white font-serif font-bold text-xl shadow-inner group-hover:bg-rust-hover transition-colors">
                E
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-white leading-tight tracking-tight">
                  EchoStock
                </span>
                <span className="text-[10px] text-slate-subtle font-medium tracking-wider uppercase">
                  Health Supply Resilience
                </span>
              </div>
            </Link>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    active
                      ? 'bg-rust text-white font-semibold shadow'
                      : 'text-slate-300 hover:text-white hover:bg-charcoal-card'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      active ? 'bg-white text-rust' : 'bg-rust/20 text-rust-border'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Role Switcher & Dev Reset */}
          <div className="flex items-center gap-3">
            {/* Role Switcher */}
            <div className="flex items-center bg-charcoal-card p-1 rounded-lg border border-slate-700/50">
              <button
                onClick={() => onRoleChange('worker')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'worker'
                    ? 'bg-rust text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch view to PHC Health Worker"
              >
                <UserCheck size={13} />
                <span className="hidden sm:inline">PHC Worker</span>
              </button>
              <button
                onClick={() => onRoleChange('coordinator')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'coordinator'
                    ? 'bg-rust text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch view to District Coordinator"
              >
                <ShieldCheck size={13} />
                <span className="hidden sm:inline">District Coordinator</span>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetData}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-charcoal-card rounded-md transition-colors"
              title="Reset Demo Data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-700/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium rounded ${
                  active ? 'text-rust font-bold' : 'text-slate-400'
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
