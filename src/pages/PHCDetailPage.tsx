import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Phone, MapPin, Bed, Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PHC, StockItem } from '../types';
import { storeService } from '../services/storeService';
import { RiskBadge } from '../components/RiskBadge';

export const PHCDetailPage: React.FC = () => {
  const { phcId } = useParams<{ phcId: string }>();
  const navigate = useNavigate();
  const [phc, setPhc] = useState<PHC | undefined>(undefined);

  useEffect(() => {
    if (!phcId) return;
    const current = storeService.getPHCById(phcId);
    setPhc(current);

    const unsubscribe = storeService.subscribePHCs((allPhcs) => {
      const found = allPhcs.find(p => p.id === phcId);
      if (found) setPhc(found);
    });

    return () => unsubscribe();
  }, [phcId]);

  if (!phc) {
    return (
      <div className="bg-white p-12 rounded-2xl text-center border border-slate-border space-y-4">
        <h2 className="font-serif text-xl font-bold text-charcoal">PHC Not Found</h2>
        <p className="text-slate-secondary text-sm">The requested Primary Health Centre ID does not exist.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 bg-rust text-white px-4 py-2 rounded-lg font-semibold text-xs">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const riskInfo = storeService.calculatePHCRisk(phc);
  const stockItems: StockItem[] = phc.stock ? Object.values(phc.stock) : [];

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-secondary hover:text-rust transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Live Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              {phc.name}
            </h1>
            <RiskBadge risk={riskInfo.risk} lowCount={riskInfo.lowCount} criticalCount={riskInfo.criticalCount} />
          </div>
          <p className="text-slate-secondary text-sm flex items-center gap-2">
            <MapPin size={14} className="text-rust" />
            <span>{phc.district} District, {phc.state} • Coordinates: ({phc.lat}, {phc.lng})</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/report-stock?phcId=${phc.id}`}
            className="inline-flex items-center gap-2 bg-rust hover:bg-rust-hover text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Camera size={16} />
            <span>Report Stock via Photo</span>
          </Link>
        </div>
      </div>

      {/* Info Header Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rust/10 text-rust flex items-center justify-center font-bold">
            <Bed size={20} />
          </div>
          <div>
            <span className="text-slate-subtle text-xs block">Beds & Occupancy</span>
            <span className="font-bold text-charcoal text-sm">{phc.bedsOccupied} / {phc.bedsTotal} Beds</span>
            <span className="text-[11px] text-slate-secondary block">
              {Math.round((phc.bedsOccupied / phc.bedsTotal) * 100)}% Capacity Occupied
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <span className="text-slate-subtle text-xs block">Staff Attendance</span>
            <span className="font-bold text-charcoal text-sm">{phc.staffPresent} / {phc.staffTotal} Staff</span>
            <span className="text-[11px] text-slate-secondary block">
              Duty Doctors & Nurses Present
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Phone size={20} />
          </div>
          <div>
            <span className="text-slate-subtle text-xs block">Direct Contact</span>
            <span className="font-bold text-charcoal text-sm">{phc.contactPhone}</span>
            <span className="text-[11px] text-slate-secondary block">
              Duty In-Charge Desk
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Stock Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-border flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-charcoal">
              Essential Medicine Inventory
            </h2>
            <p className="text-xs text-slate-secondary">
              Real-time stock levels, reorder thresholds, and photo update audit sources.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-subtle bg-offwhite px-3 py-1 rounded-md border border-slate-200">
            {stockItems.length} Essential Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-offwhite text-slate-secondary text-xs font-semibold uppercase tracking-wider border-b border-slate-border">
                <th className="py-3.5 px-6">Medicine Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Min Threshold</th>
                <th className="py-3.5 px-6">Stock Health Bar</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-border text-sm">
              {stockItems.map((item) => {
                const isCritical = item.quantity < item.reorderThreshold * 0.5;
                const isLow = item.quantity < item.reorderThreshold;
                const ratio = Math.min(100, Math.round((item.quantity / (item.reorderThreshold * 2)) * 100));

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-charcoal">
                      {item.medicineName}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-secondary font-medium">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-charcoal">
                      {item.quantity} <span className="text-xs text-slate-subtle font-normal">{item.unit}</span>
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-slate-secondary">
                      {item.reorderThreshold} {item.unit}
                    </td>

                    <td className="py-4 px-6">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden min-w-[100px]">
                        <div
                          className={`h-full ${
                            isCritical ? 'bg-risk-critical' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-risk-critical">
                          <AlertTriangle size={13} /> Critical
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <AlertTriangle size={13} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 size={13} /> Adequate
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-secondary">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400" />
                        <span>{new Date(item.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.lastUpdatedSource === 'photo' ? 'bg-rust/10 text-rust' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.lastUpdatedSource}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
