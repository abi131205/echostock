import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  risk: 'critical' | 'low' | 'healthy';
  lowCount?: number;
  criticalCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, lowCount, criticalCount, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (risk === 'critical') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-risk-criticalBg text-risk-critical ${sizeClasses[size]} ${className}`}>
        <AlertCircle size={iconSizes[size]} className="shrink-0" />
        <span>Critical Risk {criticalCount ? `(${criticalCount} low)` : ''}</span>
      </span>
    );
  }

  if (risk === 'low') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-risk-lowBg text-risk-low ${sizeClasses[size]} ${className}`}>
        <AlertTriangle size={iconSizes[size]} className="shrink-0" />
        <span>Low Stock {lowCount ? `(${lowCount} item)` : ''}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-risk-healthyBg text-risk-healthy ${sizeClasses[size]} ${className}`}>
      <CheckCircle2 size={iconSizes[size]} className="shrink-0" />
      <span>Healthy Stock</span>
    </span>
  );
};
