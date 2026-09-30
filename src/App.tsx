import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PHCDetailPage } from './pages/PHCDetailPage';
import { ReportStockPage } from './pages/ReportStockPage';
import { SimulatePage } from './pages/SimulatePage';
import { RedistributePage } from './pages/RedistributePage';
import { UserRole } from './types';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('coordinator');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-offwhite flex font-sans antialiased text-charcoal">
        {/* Left Collapsible App Sidebar */}
        <Sidebar currentRole={currentRole} onRoleChange={setCurrentRole} />

        {/* Right App Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Command Header */}
          <Header
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            onSearch={setGlobalSearchQuery}
          />

          {/* Main Fluid Content Canvas */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<LandingPage onSelectRole={setCurrentRole} />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/:phcId" element={<PHCDetailPage />} />
              <Route path="/report-stock" element={<ReportStockPage />} />
              <Route path="/simulate" element={<SimulatePage />} />
              <Route path="/redistribute" element={<RedistributePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Persistent Footer */}
          <footer className="bg-white text-slate-500 py-4 border-t border-slate-200 text-xs px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-charcoal text-sm">EchoStock</span>
                <span>• Team Kryxen</span>
                <span className="text-slate-400">| Build With AI: Code for Communities 2nd Edition</span>
              </div>

              <div className="text-slate-400 text-center sm:text-right">
                Problem Statement 3 — Smart Health & Supply Chain Resilience
              </div>
            </div>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
