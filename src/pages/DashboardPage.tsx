import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Search, Filter, Camera, ArrowUpRight, Users, Bed, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { PHC } from '../types';
import { storeService } from '../services/storeService';
import { RiskBadge } from '../components/RiskBadge';

export const DashboardPage: React.FC = () => {
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unsubscribe = storeService.subscribePHCs((updatedPhcs) => {
      setPhcs(updatedPhcs);
    });
    return () => unsubscribe();
  }, []);

  // Compute metric summaries
  const totalPhcs = phcs.length;
  
  let criticalRiskCount = 0;
  let lowRiskCount = 0;
  let healthyCount = 0;
  let totalBeds = 0;
  let occupiedBeds = 0;
  let presentStaff = 0;
  let totalStaff = 0;

  phcs.forEach(phc => {
    const riskInfo = storeService.calculatePHCRisk(phc);
    if (riskInfo.risk === 'critical') criticalRiskCount++;
    else if (riskInfo.risk === 'low') lowRiskCount++;
    else healthyCount++;

    totalBeds += phc.bedsTotal;
    occupiedBeds += phc.bedsOccupied;
    presentStaff += phc.staffPresent;
    totalStaff += phc.staffTotal;
  });

  const avgBedOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const avgStaffRate = totalStaff > 0 ? Math.round((presentStaff / totalStaff) * 100) : 0;

  // Available districts
  const districts = ['All Districts', ...Array.from(new Set(phcs.map(p => p.district)))];

  // Filtering
  const filteredPHCs = phcs.filter(phc => {
    if (selectedDistrict !== 'All Districts' && phc.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    const riskInfo = storeService.calculatePHCRisk(phc);
    if (selectedRisk === 'Critical' && riskInfo.risk !== 'critical') return false;
    if (selectedRisk === 'Low' && riskInfo.risk !== 'low') return false;
    if (selectedRisk === 'Healthy' && riskInfo.risk !== 'healthy') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return phc.name.toLowerCase().includes(q) || phc.district.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Real-time Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            <span>Primary Health Centre Network</span>
          </h1>
          <p className="text-slate-secondary text-sm">
            Live stock status, bed capacity, and staffing across district PHC nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active</span>
          </div>

          <Link
            to="/report-stock"
            className="inline-flex items-center gap-1.5 bg-rust hover:bg-rust-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Camera size={14} />
            <span>Report Stock</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-sm">
          <div className="flex items-center justify-between text-slate-secondary text-xs font-semibold">
            <span>Total PHCs Monitored</span>
            <Activity size={16} className="text-rust" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-charcoal">{totalPhcs}</span>
            <span className="text-xs text-slate-subtle">centres</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-secondary flex items-center gap-1">
            <span>{healthyCount} healthy</span> • <span className="text-amber-700 font-semibold">{lowRiskCount} low</span> • <span className="text-red-700 font-semibold">{criticalRiskCount} critical</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-sm">
          <div className="flex items-center justify-between text-slate-secondary text-xs font-semibold">
            <span>Critical Risk Outlets</span>
            <AlertCircle size={16} className="text-risk-critical" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-serif text-3xl font-bold ${criticalRiskCount > 0 ? 'text-risk-critical' : 'text-charcoal'}`}>
              {criticalRiskCount}
            </span>
            <span className="text-xs text-slate-subtle">at risk</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-secondary">
            Shortfall projected within 7 days
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-sm">
          <div className="flex items-center justify-between text-slate-secondary text-xs font-semibold">
            <span>Avg Bed Occupancy</span>
            <Bed size={16} className="text-slate-secondary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-charcoal">{avgBedOccupancy}%</span>
            <span className="text-xs text-slate-subtle">({occupiedBeds}/{totalBeds})</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${avgBedOccupancy > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${avgBedOccupancy}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-sm">
          <div className="flex items-center justify-between text-slate-secondary text-xs font-semibold">
            <span>Staff Attendance</span>
            <Users size={16} className="text-slate-secondary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-charcoal">{avgStaffRate}%</span>
            <span className="text-xs text-slate-subtle">({presentStaff}/{totalStaff})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-secondary">
            Duty medical staff present
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search PHC name or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-offwhite border border-slate-border rounded-lg text-sm focus:outline-none focus:border-rust"
          />
        </div>

        {/* District & Risk Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-offwhite border border-slate-border text-charcoal text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-rust"
            >
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {['All', 'Critical', 'Low', 'Healthy'].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  selectedRisk === r
                    ? 'bg-white text-charcoal shadow-sm'
                    : 'text-slate-600 hover:text-charcoal'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PHC Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPHCs.map(phc => {
          const riskInfo = storeService.calculatePHCRisk(phc);
          const stockItems = phc.stock ? Object.values(phc.stock) : [];
          const lowStockItems = stockItems.filter(item => item.quantity < item.reorderThreshold);

          return (
            <div
              key={phc.id}
              className="bg-white rounded-2xl border border-slate-border p-6 shadow-sm hover:shadow-md hover:border-rust/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Name & Risk Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-charcoal leading-snug">
                      {phc.name}
                    </h3>
                    <p className="text-xs text-slate-secondary font-medium">
                      {phc.district}, {phc.state}
                    </p>
                  </div>
                  <RiskBadge
                    risk={riskInfo.risk}
                    lowCount={riskInfo.lowCount}
                    criticalCount={riskInfo.criticalCount}
                    size="sm"
                  />
                </div>

                {/* Capacity Metrics */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-subtle block">Bed Capacity</span>
                    <span className="font-bold text-charcoal">{phc.bedsOccupied} / {phc.bedsTotal} occupied</span>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-rust h-full"
                        style={{ width: `${(phc.bedsOccupied / phc.bedsTotal) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-subtle block">Staff Present</span>
                    <span className="font-bold text-charcoal">{phc.staffPresent} / {phc.staffTotal} present</span>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(phc.staffPresent / phc.staffTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Alerts Preview */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-secondary block">
                    Essential Stock Alert
                  </span>
                  {lowStockItems.length > 0 ? (
                    <div className="space-y-1">
                      {lowStockItems.slice(0, 2).map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded border border-amber-200/60">
                          <span className="font-medium truncate max-w-[160px]">{item.medicineName}</span>
                          <span className="font-bold">{item.quantity} {item.unit} (min: {item.reorderThreshold})</span>
                        </div>
                      ))}
                      {lowStockItems.length > 2 && (
                        <span className="text-[11px] text-amber-800 font-semibold block text-right">
                          +{lowStockItems.length - 2} more medicines low
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>All 8 essential medicines stocked above minimum</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/dashboard/${phc.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-charcoal text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <span>View Stock Detail</span>
                  <ArrowUpRight size={14} />
                </Link>

                <Link
                  to={`/report-stock?phcId=${phc.id}`}
                  className="inline-flex items-center justify-center gap-1 bg-rust/10 hover:bg-rust/20 text-rust text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  title="Upload photo report for this PHC"
                >
                  <Camera size={14} />
                  <span>Report</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPHCs.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-border">
          <p className="text-slate-secondary text-sm">No Primary Health Centres found matching criteria.</p>
        </div>
      )}
    </div>
  );
};
