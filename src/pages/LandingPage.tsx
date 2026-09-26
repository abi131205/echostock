import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Cpu, Activity, ArrowRight, ShieldCheck, UserCheck, Layers, MapPin, Zap } from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Header Section */}
      <section className="bg-charcoal text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-charcoal-surface relative overflow-hidden">
        {/* Background Subtle Accent Pattern */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-rust/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-slate-secondary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rust/20 border border-rust/40 text-rust-border text-xs font-semibold uppercase tracking-wider">
            <Zap size={13} className="text-rust" />
            Problem Statement 3 — Smart Health & Supply Chain Resilience
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            A photo becomes real-time stock data.{' '}
            <span className="text-rust">A digital twin predicts the next outbreak.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-sans">
            EchoStock turns every health worker's phone into a sensor for a resilient healthcare network.
            Zero manual typing, proactive outbreak pre-positioning, and instant stock redistribution.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-rust hover:bg-rust-hover text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lg transition-all"
            >
              <Activity size={18} />
              <span>Explore Live Dashboard</span>
            </Link>
            <Link
              to="/report-stock"
              className="inline-flex items-center gap-2 bg-charcoal-card hover:bg-slate-700 text-white border border-slate-600 px-6 py-3 rounded-lg font-semibold text-sm transition-all"
            >
              <Camera size={18} className="text-rust-border" />
              <span>Photo-to-Stock AI Intake</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Picker Selection Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">Select Your Persona to Begin</h2>
          <p className="text-muted text-sm">
            Experience EchoStock through the lens of frontline health workers or district supply chain coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: PHC Health Worker */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-border hover:border-rust/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-rust/10 text-rust flex items-center justify-center font-bold">
                  <UserCheck size={26} />
                </div>
                <span className="text-xs font-bold text-rust uppercase tracking-wider bg-rust-light px-2.5 py-1 rounded-md">
                  Mechanism 1
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal group-hover:text-rust transition-colors">
                  I am a PHC Health Worker
                </h3>
                <p className="text-slate-secondary text-sm mt-2 leading-relaxed">
                  No time to log stock numbers into complex forms. Photograph your medicine shelf; Gemini AI automatically reads stock counts and updates the district network in seconds.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-secondary pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rust" />
                  <span>WhatsApp-styled photo submission flow</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rust" />
                  <span>AI confidence check with human confirmation table</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rust" />
                  <span>Instant live stock update to district dashboard</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 flex items-center gap-3">
              <Link
                to="/report-stock"
                onClick={() => onSelectRole('worker')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-rust hover:bg-rust-hover text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                <Camera size={16} />
                <span>Report Stock via Photo</span>
              </Link>
            </div>
          </div>

          {/* Card 2: District Coordinator */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-border hover:border-rust/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-charcoal text-white flex items-center justify-center font-bold">
                  <ShieldCheck size={26} />
                </div>
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider bg-slate-200 px-2.5 py-1 rounded-md">
                  Mechanism 2
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal group-hover:text-rust transition-colors">
                  I am a District Coordinator
                </h3>
                <p className="text-slate-secondary text-sm mt-2 leading-relaxed">
                  Monitor network stock in real time. Run Digital Twin outbreak scenarios (e.g. Dengue spike) to get pre-positioning plans and Haversine distance-weighted redistribution before shortages occur.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-secondary pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-charcoal" />
                  <span>Live district PHC risk heatmaps & inventory views</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-charcoal" />
                  <span>Simulate epidemic surges (+40% to +80% demand)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-charcoal" />
                  <span>Distance-based surplus-to-deficit transfer plans</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 flex items-center gap-3">
              <Link
                to="/simulate"
                onClick={() => onSelectRole('coordinator')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                <Cpu size={16} />
                <span>Run Outbreak Simulator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Highlights */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-border shadow-sm">
        <h3 className="font-serif text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
          <Layers size={20} className="text-rust" />
          The EchoStock Resilience Advantage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2 border-l-2 border-rust pl-4">
            <h4 className="font-bold text-sm text-charcoal">Zero Manual Form Typing</h4>
            <p className="text-xs text-slate-secondary">
              Frontline workers spend zero time navigating multi-step forms. A quick photo of the medicine shelf generates verified inventory counts.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-rust pl-4">
            <h4 className="font-bold text-sm text-charcoal">Digital Twin Simulation</h4>
            <p className="text-xs text-slate-secondary">
              Predict outbreak demand surges before shelves empty. Shift from reactive crisis response to proactive stock pre-positioning.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-rust pl-4">
            <h4 className="font-bold text-sm text-charcoal">GPS Distance-Optimal Transfers</h4>
            <p className="text-xs text-slate-secondary">
              Transfers are automatically calculated between nearest donor PHCs with verified surplus using Haversine geographical math.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
