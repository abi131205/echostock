import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeftRight, CheckCircle2, Navigation, MapPin, Truck, ShieldCheck, ArrowRight, RefreshCw, Cpu, AlertCircle, ShoppingCart } from 'lucide-react';
import { PHC, Simulation, Redistribution, Transfer } from '../types';
import { storeService } from '../services/storeService';
import { generateRedistributionPlan } from '../services/redistributionEngine';

export const RedistributePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const simId = searchParams.get('simId');

  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [redistribution, setRedistribution] = useState<Redistribution | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const phcList = storeService.getPHCs();
      setPhcs(phcList);

      const sims = storeService.getSimulations();
      let currentSim: Simulation | undefined;

      if (simId) {
        currentSim = sims.find(s => s.id === simId);
      }

      if (!currentSim && sims.length > 0) {
        currentSim = sims[0];
      }

      if (!currentSim) {
        currentSim = await storeService.saveSimulation({
          district: 'Coimbatore',
          scenarioLabel: 'Dengue Spike',
          demandMultiplier: 1.6,
          durationDays: 14,
          results: [
            { phcId: 'phc-peelamedu', phcName: 'PHC Peelamedu', medicineName: 'Paracetamol 500mg', currentStock: 140, projectedDemand: 320, shortfall: 180, status: 'critical' },
            { phcId: 'phc-peelamedu', phcName: 'PHC Peelamedu', medicineName: 'Oral Rehydration Salts (ORS)', currentStock: 80, projectedDemand: 220, shortfall: 140, status: 'critical' },
            { phcId: 'phc-peelamedu', phcName: 'PHC Peelamedu', medicineName: 'Normal Saline (NS) 500ml', currentStock: 40, projectedDemand: 160, shortfall: 120, status: 'critical' },
            { phcId: 'phc-guindy', phcName: 'PHC Guindy Urban', medicineName: 'Oral Rehydration Salts (ORS)', currentStock: 120, projectedDemand: 190, shortfall: 70, status: 'low' },
          ]
        });
      }

      if (currentSim) {
        setSimulation(currentSim);
        const plan = generateRedistributionPlan(currentSim, phcList);
        setRedistribution(plan);
        setIsApproved(plan.status === 'approved');
      }
    };

    loadData();
  }, [simId]);

  const handleApprovePlan = async () => {
    if (!redistribution) return;
    await storeService.approveRedistribution(redistribution.id);
    setIsApproved(true);
  };

  const transfers = redistribution ? redistribution.transfers : [];
  
  // Step 3 Reconciliation Metrics
  const totalShortfallUnits = simulation ? simulation.results.reduce((sum, r) => sum + r.shortfall, 0) : 0;
  const totalCoveredUnits = transfers.reduce((sum, t) => sum + t.quantity, 0);
  const unaddressedUnits = Math.max(0, totalShortfallUnits - totalCoveredUnits);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            <ArrowLeftRight size={26} className="text-rust" />
            <span>Smart Stock Redistribution Plan</span>
          </h1>
          <p className="text-slate-secondary text-sm">
            Haversine distance-weighted transfer recommendations matching surplus PHCs to deficit PHCs.
          </p>
        </div>

        {redistribution && transfers.length > 0 && !isApproved && (
          <button
            onClick={handleApprovePlan}
            className="inline-flex items-center gap-2 bg-rust hover:bg-rust-hover text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
          >
            <ShieldCheck size={18} />
            <span>Approve & Issue Transfer Orders</span>
          </button>
        )}
      </div>

      {/* Step 3 Requirement 1: Reconciliation Coverage Summary Banner */}
      <div className="bg-white p-5 rounded-2xl border-2 border-rust/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
            <ShoppingCart size={18} className="text-rust" />
            <span>Redistribution Shortfall Coverage Reconciliation</span>
          </h3>
          <p className="text-xs text-slate-secondary">
            Redistribution covers <strong className="text-emerald-700 font-bold">{totalCoveredUnits} units</strong> of <strong className="text-charcoal font-bold">{totalShortfallUnits} total units</strong> in projected shortfall.{' '}
            {unaddressedUnits > 0 ? (
              <span className="text-risk-critical font-bold">{unaddressedUnits} units remain unaddressed — flagged for external procurement.</span>
            ) : (
              <span className="text-emerald-700 font-bold">100% of network shortfall fully resolved internally!</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold">
            Covered: {totalCoveredUnits}
          </div>
          {unaddressedUnits > 0 && (
            <div className="bg-red-50 text-risk-critical px-3 py-1.5 rounded-lg border border-red-200 font-bold">
              Procurement Flagged: {unaddressedUnits}
            </div>
          )}
        </div>
      </div>

      {/* Scenario Context Banner */}
      {simulation && (
        <div className="bg-charcoal text-white p-6 rounded-2xl border border-charcoal-surface shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-rust text-white px-2.5 py-0.5 rounded">
                Active Simulation
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Run ID: #{simulation.id.slice(-6)}
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-white">
              {simulation.scenarioLabel} Scenario ({simulation.demandMultiplier}x surge over {simulation.durationDays} days)
            </h3>
            <p className="text-xs text-slate-300">
              Target District: <strong className="text-rust-border">{simulation.district}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="bg-charcoal-card px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Transfers Proposed</span>
              <span className="font-serif font-bold text-xl text-white">{transfers.length} routes</span>
            </div>

            <div className="bg-charcoal-card px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Units Moving</span>
              <span className="font-serif font-bold text-xl text-rust-border">{totalCoveredUnits} units</span>
            </div>
          </div>
        </div>
      )}

      {/* Approval Banner */}
      {isApproved && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center justify-between text-emerald-900 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span>Redistribution Plan Approved & Dispatched to District Logistics!</span>
          </div>
          <Link to="/dashboard" className="text-xs text-emerald-800 underline hover:text-emerald-950 font-bold">
            View Live Dashboard Status
          </Link>
        </div>
      )}

      {/* Transfer Recommendation Route Cards */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-xl text-charcoal flex items-center gap-2">
          <Truck size={20} className="text-rust" />
          <span>Recommended Pre-Positioning Transfers (Prioritized by Shortfall Urgency)</span>
        </h3>

        {transfers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transfers.map((transfer, idx) => (
              <div
                key={transfer.id}
                className="bg-white rounded-2xl border border-slate-border p-6 shadow-sm hover:shadow-md hover:border-rust/40 transition-all space-y-4"
              >
                {/* Route Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-secondary">
                    <span className="w-6 h-6 rounded-full bg-rust text-white flex items-center justify-center text-xs font-serif">
                      #{idx + 1}
                    </span>
                    <span>Route Transfer Order</span>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200">
                    <Navigation size={12} className="text-rust" />
                    <span>{transfer.distanceKm} km Transit</span>
                  </span>
                </div>

                {/* Donor vs Recipient Nodes */}
                <div className="grid grid-cols-5 items-center gap-2 text-center py-2">
                  {/* From Donor PHC */}
                  <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Surplus Donor</span>
                    <h4 className="font-bold text-sm text-charcoal truncate">{transfer.fromPhcName}</h4>
                    <span className="text-[11px] text-slate-secondary">Verified Surplus Available</span>
                  </div>

                  {/* Arrow Icon */}
                  <div className="col-span-1 flex flex-col items-center justify-center text-rust">
                    <ArrowRight size={22} className="animate-pulse" />
                    <span className="text-[10px] font-bold mt-1 text-charcoal">{transfer.quantity} units</span>
                  </div>

                  {/* To Recipient PHC */}
                  <div className="col-span-2 bg-red-50/50 p-3 rounded-xl border border-red-200 text-left">
                    <span className="text-[10px] font-bold text-risk-critical uppercase block">Deficit Recipient</span>
                    <h4 className="font-bold text-sm text-charcoal truncate">{transfer.toPhcName}</h4>
                    <span className="text-[11px] text-risk-critical font-medium">Shortfall Covered</span>
                  </div>
                </div>

                {/* Transfer Payload Spec */}
                <div className="bg-offwhite p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-subtle block text-[10px] uppercase font-semibold">Medicine Payload</span>
                    <span className="font-bold text-charcoal text-sm">{transfer.medicineName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-subtle block text-[10px] uppercase font-semibold">Transfer Volume</span>
                    <span className="font-bold text-rust text-sm">{transfer.quantity} Units</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-secondary italic">
                  Rationale: {transfer.reason}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-border space-y-3">
            <p className="text-slate-secondary text-sm">No transfers required for this scenario run.</p>
            <Link to="/simulate" className="inline-flex items-center gap-1.5 text-rust font-semibold text-xs hover:underline">
              <Cpu size={14} />
              <span>Run a different outbreak simulation</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
