import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Camera, Cpu, ArrowLeftRight, ChevronLeft, ChevronRight, RefreshCw, Home } from 'lucide-react';
import { UserRole } from '../types';
import { storeService } from '../services/storeService';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, onRoleChange }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const location = useLocation();

  const navItems = [
    { label: 'Home Launchpad', path: '/', icon: Home, role: 'all' },
    { label: 'Live Dashboard', path: '/dashboard', icon: Activity, role: 'all' },
    { label: 'Report Stock', path: '/report-stock', icon: Camera, role: 'worker', badge: 'PHOTO AI' },
    { label: 'Outbreak Twin', path: '/simulate', icon: Cpu, role: 'coordinator', badge: 'SIM ENGINE' },
    { label: 'Redistribution', path: '/redistribute', icon: ArrowLeftRight, role: 'coordinator' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all PHC stock data back to initial seed state?')) {
      storeService.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <aside
      className={`bg-charcoal text-white flex flex-col justify-between border-r border-charcoal-surface transition-all duration-300 z-30 sticky top-0 h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-charcoal-surface">
          <Link to="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-rust flex items-center justify-center text-white font-serif font-bold text-xl shrink-0 shadow-inner group-hover:bg-rust-hover transition-colors">
              E
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-serif font-bold text-lg text-white leading-tight tracking-tight">
                  EchoStock
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Team Kryxen
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Sidebar Width */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-card transition-colors hidden md:block"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Links Group */}
        <div className="p-3 space-y-6">
          <div>
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2">
                Workspace Navigation
              </span>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      active
                        ? 'bg-rust text-white shadow-md font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-charcoal-card'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                              active ? 'bg-white text-rust' : 'bg-rust/20 text-rust-border'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer System Status & Controls */}
      <div className="p-3 border-t border-charcoal-surface space-y-3">
        {/* Live Sync Badge */}
        {!isCollapsed ? (
          <div className="bg-charcoal-card p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400">Live Network Sync</span>
            </div>
            <button
              onClick={handleResetData}
              className="p-1 text-slate-400 hover:text-white hover:bg-charcoal rounded transition-colors"
              title="Reset Demo Seed Data"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <button
              onClick={handleResetData}
              className="p-2 text-slate-400 hover:text-white hover:bg-charcoal-card rounded-xl transition-colors"
              title="Reset Demo Seed Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
