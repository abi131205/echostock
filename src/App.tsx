import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PHCDetailPage } from './pages/PHCDetailPage';
import { ReportStockPage } from './pages/ReportStockPage';
import { SimulatePage } from './pages/SimulatePage';
import { RedistributePage } from './pages/RedistributePage';
import { UserRole } from './types';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('coordinator');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-offwhite flex flex-col font-sans antialiased text-charcoal">
        {/* Top Navbar */}
        <Navbar currentRole={currentRole} onRoleChange={setCurrentRole} />

        {/* Main Content Area */}
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

        {/* Footer with Pitch Deck Attribution */}
        <footer className="bg-charcoal text-slate-400 py-6 border-t border-charcoal-surface text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-white text-sm">EchoStock</span>
              <span>• Team Kryxen</span>
              <span className="text-slate-500">| Build With AI: Code for Communities 2nd Edition</span>
            </div>

            <div className="text-slate-500 text-center sm:text-right">
              Problem Statement 3 — Smart Health & Supply Chain Resilience
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
