import { PHC, Simulation, Redistribution, Transfer } from '../types';

export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function generateRedistributionPlan(simulation: Simulation, phcs: PHC[]): Redistribution {
  const transfers: Transfer[] = [];
  const phcMap = new Map<string, PHC>(phcs.map(p => [p.id, p]));

  // Clone available surplus tracking pool
  const phcSurplusPool = new Map<string, Record<string, number>>();
  phcs.forEach(phc => {
    if (!phc.stock) return;
    const itemSurplus: Record<string, number> = {};
    Object.values(phc.stock).forEach(stockItem => {
      const surplus = Math.max(0, stockItem.quantity - stockItem.reorderThreshold);
      itemSurplus[stockItem.medicineName.toLowerCase()] = surplus;
    });
    phcSurplusPool.set(phc.id, itemSurplus);
  });

  // Step 3 Requirement 2: Prioritize PHCs with largest/most urgent shortfalls first!
  const deficits = [...simulation.results]
    .filter(r => r.shortfall > 0)
    .sort((a, b) => b.shortfall - a.shortfall);

  deficits.forEach(deficit => {
    const toPhc = phcMap.get(deficit.phcId);
    if (!toPhc) return;

    let remainingShortfall = deficit.shortfall;
    const medicineKey = deficit.medicineName.toLowerCase();

    // Find all other PHCs with available surplus for this medicine
    const candidates: Array<{ phc: PHC; distanceKm: number; availableSurplus: number }> = [];

    phcs.forEach(fromPhc => {
      if (fromPhc.id === deficit.phcId) return;

      const surplusObj = phcSurplusPool.get(fromPhc.id);
      const available = surplusObj ? surplusObj[medicineKey] || 0 : 0;

      if (available > 0) {
        const dist = calculateHaversineDistanceKm(fromPhc.lat, fromPhc.lng, toPhc.lat, toPhc.lng);
        candidates.push({ phc: fromPhc, distanceKm: dist, availableSurplus: available });
      }
    });

    // Sort candidate donor PHCs by shortest transport distance first
    candidates.sort((a, b) => a.distanceKm - b.distanceKm);

    for (const candidate of candidates) {
      if (remainingShortfall <= 0) break;

      const transferQty = Math.min(remainingShortfall, candidate.availableSurplus);
      if (transferQty <= 0) continue;

      // Deduct from pool
      const poolObj = phcSurplusPool.get(candidate.phc.id)!;
      poolObj[medicineKey] -= transferQty;
      remainingShortfall -= transferQty;

      transfers.push({
        id: 'tr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        fromPhcId: candidate.phc.id,
        fromPhcName: candidate.phc.name,
        toPhcId: toPhc.id,
        toPhcName: toPhc.name,
        medicineName: deficit.medicineName,
        quantity: transferQty,
        distanceKm: candidate.distanceKm,
        reason: `Urgent pre-positioning for ${simulation.scenarioLabel} (${candidate.distanceKm} km distance)`,
      });
    }
  });

  return {
    id: 'red-' + Date.now(),
    simulationId: simulation.id,
    transfers,
    status: 'recommended',
    createdAt: new Date().toISOString(),
  };
}
