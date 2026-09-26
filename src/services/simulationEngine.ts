import { PHC, SimulationResultItem, Simulation } from '../types';

export interface ScenarioPreset {
  label: 'Dengue Spike' | 'Flu Season' | 'Monsoon / Floods' | 'Custom';
  description: string;
  defaultMultiplier: number;
  defaultDurationDays: number;
  relevantMedicines: string[];
}

export const SCENARIO_PRESETS: Record<string, ScenarioPreset> = {
  'Dengue Spike': {
    label: 'Dengue Spike',
    description: 'Surge in high-fever, severe dehydration, and low platelet cases across urban/rural wards.',
    defaultMultiplier: 1.6,
    defaultDurationDays: 14,
    relevantMedicines: ['Paracetamol 500mg', 'Oral Rehydration Salts (ORS)', 'Normal Saline (NS) 500ml', 'Platelet Buffer Kits'],
  },
  'Flu Season': {
    label: 'Flu Season',
    description: 'Respiratory viral outbreak triggering spike in antipyretic & antibiotic demands.',
    defaultMultiplier: 1.4,
    defaultDurationDays: 10,
    relevantMedicines: ['Paracetamol 500mg', 'Amoxicillin 500mg', 'Dextrose 5% 500ml'],
  },
  'Monsoon / Floods': {
    label: 'Monsoon / Floods',
    description: 'Flood displacement leading to water-borne disease outbreaks & acute GI infections.',
    defaultMultiplier: 1.8,
    defaultDurationDays: 21,
    relevantMedicines: ['Oral Rehydration Salts (ORS)', 'Normal Saline (NS) 500ml', 'Amoxicillin 500mg', 'Dextrose 5% 500ml'],
  },
  'Custom': {
    label: 'Custom',
    description: 'User-configurable custom demand multiplier across all network medicines.',
    defaultMultiplier: 1.5,
    defaultDurationDays: 14,
    relevantMedicines: [], // Empty means all medicines
  }
};

export function runDigitalTwinSimulation(
  phcs: PHC[],
  district: string,
  scenarioLabel: 'Dengue Spike' | 'Flu Season' | 'Monsoon / Floods' | 'Custom',
  demandMultiplier: number,
  durationDays: number
): Simulation {
  const targetPHCs = district === 'All Districts' 
    ? phcs 
    : phcs.filter(p => p.district.toLowerCase() === district.toLowerCase());

  const preset = SCENARIO_PRESETS[scenarioLabel] || SCENARIO_PRESETS['Custom'];
  const relevantList = preset.relevantMedicines;

  const results: SimulationResultItem[] = [];

  targetPHCs.forEach(phc => {
    if (!phc.stock) return;

    Object.values(phc.stock).forEach(stockItem => {
      // Filter if scenario specifies relevant medicines
      if (relevantList.length > 0 && !relevantList.some(name => stockItem.medicineName.toLowerCase().includes(name.toLowerCase()))) {
        return;
      }

      const currentStock = stockItem.quantity;
      // Standard baseline assumption: current stock covers 14 days of normal consumption
      const assumedDaysOfSupply = 14;
      const dailyBaseline = Math.max(1, currentStock / assumedDaysOfSupply);
      
      const projectedDemand = Math.round(dailyBaseline * demandMultiplier * durationDays);
      const shortfall = Math.max(0, projectedDemand - currentStock);

      let status: 'critical' | 'low' | 'healthy' = 'healthy';
      if (shortfall > currentStock * 0.5 || shortfall > 150) {
        status = 'critical';
      } else if (shortfall > 0) {
        status = 'low';
      }

      results.push({
        phcId: phc.id,
        phcName: phc.name,
        medicineName: stockItem.medicineName,
        currentStock,
        projectedDemand,
        shortfall,
        status,
      });
    });
  });

  // Sort by shortfall severity descending
  results.sort((a, b) => b.shortfall - a.shortfall);

  return {
    id: 'sim-' + Date.now(),
    district,
    scenarioLabel,
    demandMultiplier,
    durationDays,
    results,
    createdAt: new Date().toISOString(),
  };
}
