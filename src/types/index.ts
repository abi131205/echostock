export type MedicineCategory = 'Analgesics' | 'Antibiotics' | 'IV Fluids' | 'Rehydration' | 'Supplies' | 'Chronic Care';

export interface StockItem {
  id: string;
  medicineName: string;
  category: MedicineCategory;
  quantity: number;
  unit: 'strips' | 'vials' | 'bottles' | 'kits' | 'doses';
  reorderThreshold: number;
  lastUpdated: string;
  lastUpdatedSource: 'photo' | 'manual';
}

export interface PHC {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  bedsTotal: number;
  bedsOccupied: number;
  staffPresent: number;
  staffTotal: number;
  contactPhone: string;
  stock?: Record<string, StockItem>;
}

export interface StockReportItem {
  medicineName: string;
  quantity: number;
  confidence: 'high' | 'medium' | 'low';
  category?: MedicineCategory;
  unit?: string;
}

export interface StockReport {
  id: string;
  phcId: string;
  phcName: string;
  photoUrl: string;
  rawModelResponse: string;
  parsedItems: StockReportItem[];
  createdAt: string;
}

export interface SimulationResultItem {
  phcId: string;
  phcName: string;
  medicineName: string;
  currentStock: number;
  projectedDemand: number;
  shortfall: number;
  status: 'critical' | 'low' | 'healthy';
}

export interface Simulation {
  id: string;
  district: string;
  scenarioLabel: 'Dengue Spike' | 'Flu Season' | 'Monsoon / Floods' | 'Custom';
  demandMultiplier: number;
  durationDays: number;
  results: SimulationResultItem[];
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromPhcId: string;
  fromPhcName: string;
  toPhcId: string;
  toPhcName: string;
  medicineName: string;
  quantity: number;
  distanceKm: number;
  reason: string;
}

export interface Redistribution {
  id: string;
  simulationId: string;
  transfers: Transfer[];
  status: 'recommended' | 'approved';
  createdAt: string;
}

export type UserRole = 'worker' | 'coordinator';
