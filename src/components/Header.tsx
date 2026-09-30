import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, UserCheck, ShieldCheck, Camera, ChevronRight } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route label mapping for Breadcrumbs
  const getBreadcrumbLabel = () => {
    const path = location.pathname;
    if (path === '/') return 'Launchpad Overview';
    if (path === '/dashboard') return 'Live PHC Network Dashboard';
    if (path.startsWith('/dashboard/')) return 'PHC Inventory Detail';
    if (path === '/report-stock') return 'Photo-to-Stock AI Intake';
    if (path === '/simulate') return 'Digital Twin Outbreak Simulator';
    if (path === '/redistribute') return 'Smart Stock Redistribution Plan';
    return 'Workspace';
  };

  return (
    <header className="bg-white border-b border-slate-border sticky top-0 z-20 shadow-sm px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-secondary w-full md:w-auto">
        <Link to="/" className="text-slate-400 hover:text-rust transition-colors">
          EchoStock Workspace
        </Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-charcoal font-bold">{getBreadcrumbLabel()}</span>
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        {/* Search Bar */}
        <div className="relative w-48 sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search PHCs, medicines..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-offwhite border border-slate-border rounded-xl text-xs font-medium focus:outline-none focus:border-rust"
          />
        </div>

        {/* Role Toggle Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onRoleChange('worker')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              currentRole === 'worker'
                ? 'bg-rust text-white shadow-sm'
                : 'text-slate-600 hover:text-charcoal'
            }`}
            title="Switch persona to PHC Health Worker"
          >
            <UserCheck size={13} />
            <span className="hidden sm:inline">PHC Worker</span>
          </button>
          <button
            onClick={() => onRoleChange('coordinator')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              currentRole === 'coordinator'
                ? 'bg-charcoal text-white shadow-sm'
                : 'text-slate-600 hover:text-charcoal'
            }`}
            title="Switch persona to District Coordinator"
          >
            <ShieldCheck size={13} />
            <span className="hidden sm:inline">District Coordinator</span>
          </button>
        </div>

        {/* Direct CTA Action */}
        <button
          onClick={() => navigate('/report-stock')}
          className="inline-flex items-center gap-1.5 bg-rust hover:bg-rust-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all shrink-0"
        >
          <Camera size={14} />
          <span className="hidden sm:inline">+ Report Stock</span>
        </button>
      </div>
    </header>
  );
};
