import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, AlertTriangle, Play, ArrowRight, BarChart2, Layers, Filter, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { PHC, Simulation } from '../types';
import { storeService } from '../services/storeService';
import { SCENARIO_PRESETS, runDigitalTwinSimulation, ScenarioPreset } from '../services/simulationEngine';

export const SimulatePage: React.FC = () => {
  const navigate = useNavigate();
  const [phcs, setPhcs] = useState<PHC[]>([]);
  
  const [district, setDistrict] = useState<string>('Chennai');
  const [scenarioLabel, setScenarioLabel] = useState<'Dengue Spike' | 'Flu Season' | 'Monsoon / Floods' | 'Custom'>('Dengue Spike');
  const [multiplier, setMultiplier] = useState<number>(1.6);
  const [durationDays, setDurationDays] = useState<number>(14);

  const [activeSimulation, setActiveSimulation] = useState<Simulation | null>(null);

  useEffect(() => {
    const data = storeService.getPHCs();
    setPhcs(data);

    // Initial run
    const sim = runDigitalTwinSimulation(data, 'Chennai', 'Dengue Spike', 1.6, 14);
    setActiveSimulation(sim);
  }, []);

  const handleScenarioPresetChange = (label: string) => {
    const key = label as 'Dengue Spike' | 'Flu Season' | 'Monsoon / Floods' | 'Custom';
    setScenarioLabel(key);
    const preset = SCENARIO_PRESETS[key];
    if (preset) {
      setMultiplier(preset.defaultMultiplier);
      setDurationDays(preset.defaultDurationDays);
    }
  };

  const handleRunSimulation = () => {
    const sim = runDigitalTwinSimulation(phcs, district, scenarioLabel, multiplier, durationDays);
    storeService.saveSimulation(sim);
    setActiveSimulation(sim);
  };

  const handleProceedToRedistribution = () => {
    if (!activeSimulation) return;
    navigate(`/redistribute?simId=${activeSimulation.id}`);
  };

  // Recharts data preparation: group demand vs current stock by PHC
  const chartData = activeSimulation ? (() => {
    const phcGroupMap = new Map<string, { name: string; currentStock: number; projectedDemand: number }>();
    activeSimulation.results.forEach(r => {
      const existing = phcGroupMap.get(r.phcName) || { name: r.phcName, currentStock: 0, projectedDemand: 0 };
      existing.currentStock += r.currentStock;
      existing.projectedDemand += r.projectedDemand;
      phcGroupMap.set(r.phcName, existing);
    });
    return Array.from(phcGroupMap.values());
  })() : [];

  const flaggedShortfalls = activeSimulation ? activeSimulation.results.filter(r => r.shortfall > 0) : [];
  const totalShortfallUnits = flaggedShortfalls.reduce((sum, r) => sum + r.shortfall, 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            <Cpu size={26} className="text-rust" />
            <span>Digital Twin Outbreak Simulator</span>
          </h1>
          <p className="text-slate-secondary text-sm">
            Mechanism 2: Proactive epidemic demand forecasting and network shortfall pre-positioning.
          </p>
        </div>

        {activeSimulation && flaggedShortfalls.length > 0 && (
          <button
            onClick={handleProceedToRedistribution}
            className="inline-flex items-center gap-2 bg-rust hover:bg-rust-hover text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition-colors"
          >
            <span>Recommend Redistribution</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive Simulation Inputs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-border shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
            <Layers size={18} className="text-rust" />
            <span>Scenario Controls</span>
          </h3>

          {/* District Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-secondary block">Select Target District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-offwhite border border-slate-border text-charcoal text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-rust"
            >
              <option value="All Districts">All Network Districts</option>
              {Array.from(new Set(phcs.map(p => p.district))).map(d => (
                <option key={d} value={d}>{d} District</option>
              ))}
            </select>
          </div>

          {/* Scenario Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-secondary block">Outbreak Scenario Preset</label>
            <select
              value={scenarioLabel}
              onChange={(e) => handleScenarioPresetChange(e.target.value)}
              className="w-full bg-offwhite border border-slate-border text-charcoal text-sm font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-rust"
            >
              {Object.keys(SCENARIO_PRESETS).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-subtle mt-1">
              {SCENARIO_PRESETS[scenarioLabel]?.description}
            </p>
          </div>

          {/* Multiplier Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-secondary">Demand Surge Multiplier</span>
              <span className="font-bold text-rust bg-rust-light px-2 py-0.5 rounded">{multiplier}x (+{Math.round((multiplier - 1) * 100)}%)</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              className="w-full accent-rust cursor-pointer"
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-secondary">Simulation Horizon</span>
              <span className="font-bold text-charcoal bg-slate-100 px-2 py-0.5 rounded">{durationDays} Days</span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value))}
              className="w-full accent-rust cursor-pointer"
            />
          </div>

          {/* Execute Button */}
          <button
            onClick={handleRunSimulation}
            className="w-full bg-charcoal hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <Play size={16} className="text-rust" />
            <span>Run Digital Twin Simulation</span>
          </button>
        </div>

        {/* Right Recharts Visual Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-border shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
                  <BarChart2 size={18} className="text-rust" />
                  <span>Projected Demand vs. Current Stock</span>
                </h3>
                <p className="text-xs text-slate-secondary">
                  Comparison per PHC under {scenarioLabel} scenario ({multiplier}x surge over {durationDays} days).
                </p>
              </div>

              <span className="text-xs font-semibold text-rust bg-rust-light px-3 py-1 rounded-full">
                {district} Network
              </span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4A5568' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#4A5568' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#252A33', borderColor: '#4A5568', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="currentStock" name="Current Available Stock" fill="#4A5568" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projectedDemand" name="Projected Outbreak Demand" fill="#B7410E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="bg-offwhite p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-subtle block font-semibold">Total Projected Shortfall</span>
              <span className="font-serif font-bold text-lg text-risk-critical">{totalShortfallUnits} units</span>
            </div>
            <div className="bg-offwhite p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-subtle block font-semibold">Flagged Deficit PHCs</span>
              <span className="font-serif font-bold text-lg text-charcoal">
                {new Set(flaggedShortfalls.map(f => f.phcId)).size} PHCs
              </span>
            </div>
            <div className="bg-offwhite p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-subtle block font-semibold">Scenario Severity</span>
              <span className="font-serif font-bold text-lg text-rust">High Surge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Shortfalls Table */}
      <div className="bg-white rounded-2xl border border-slate-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-border flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
              <AlertTriangle size={18} className="text-risk-critical" />
              <span>Flagged Deficit PHCs (Shortfall Urgency List)</span>
            </h3>
            <p className="text-xs text-slate-secondary">
              PHCs projected to experience stock exhaustion during outbreak window.
            </p>
          </div>

          {flaggedShortfalls.length > 0 && (
            <button
              onClick={handleProceedToRedistribution}
              className="inline-flex items-center gap-2 bg-rust hover:bg-rust-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <span>Recommend Redistribution Plan</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {flaggedShortfalls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-offwhite text-slate-secondary text-xs font-semibold uppercase tracking-wider border-b border-slate-border">
                  <th className="py-3.5 px-6">PHC Outlet</th>
                  <th className="py-3.5 px-4">Medicine Item</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Projected Demand</th>
                  <th className="py-3.5 px-4">Projected Shortfall</th>
                  <th className="py-3.5 px-4">Urgency Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-border">
                {flaggedShortfalls.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-semibold text-charcoal">
                      {item.phcName}
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-700">
                      {item.medicineName}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-600">
                      {item.currentStock} units
                    </td>

                    <td className="py-4 px-4 font-bold text-rust">
                      {item.projectedDemand} units
                    </td>

                    <td className="py-4 px-4 font-bold text-risk-critical bg-red-50/60">
                      -{item.shortfall} units
                    </td>

                    <td className="py-4 px-4 text-xs font-bold">
                      <span className={`px-2.5 py-1 rounded-full ${
                        item.status === 'critical'
                          ? 'bg-risk-criticalBg text-risk-critical'
                          : 'bg-risk-lowBg text-risk-low'
                      }`}>
                        {item.status.toUpperCase()} SHORTFALL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-emerald-700 bg-emerald-50/40 flex items-center justify-center gap-2 text-sm font-semibold">
            <CheckCircle2 size={18} />
            <span>No shortfalls projected! Network stock is resilient for this scenario.</span>
          </div>
        )}
      </div>
    </div>
  );
};
