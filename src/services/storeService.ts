import { PHC, StockItem, StockReport, Simulation, Redistribution } from '../types';
import { INITIAL_PHCS } from './seedData';
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY_PHCS = 'echostock_phcs_v2';
const LOCAL_STORAGE_KEY_REPORTS = 'echostock_reports_v2';
const LOCAL_STORAGE_KEY_SIMULATIONS = 'echostock_simulations_v2';
const LOCAL_STORAGE_KEY_REDISTRIBUTIONS = 'echostock_redistributions_v2';

type Listener<T> = (data: T) => void;

class StoreService {
  private phcsListeners: Listener<PHC[]>[] = [];
  private cachedPhcs: PHC[] = [];

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PHCS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PHCS, JSON.stringify(INITIAL_PHCS));
      this.cachedPhcs = INITIAL_PHCS;
    } else {
      try {
        this.cachedPhcs = JSON.parse(raw);
      } catch {
        this.cachedPhcs = INITIAL_PHCS;
      }
    }
  }

  // --- PHC CRUD & REAL-TIME LISTENER ---
  public getPHCs(): PHC[] {
    return this.cachedPhcs;
  }

  public getPHCById(id: string): PHC | undefined {
    return this.cachedPhcs.find(p => p.id === id);
  }

  public subscribePHCs(listener: Listener<PHC[]>): () => void {
    this.phcsListeners.push(listener);
    // Initial emit
    listener(this.cachedPhcs);

    // If real Firestore is configured, listen via Firestore onSnapshot
    if (isFirebaseConfigured() && db) {
      const phcsCol = collection(db, 'phcs');
      const unsubscribeFirestore = onSnapshot(phcsCol, async (snapshot) => {
        if (snapshot.empty) {
          // Seed Firestore if empty
          console.log('Seeding Firestore with initial PHC dataset...');
          for (const phc of INITIAL_PHCS) {
            const phcRef = doc(db!, 'phcs', phc.id);
            const { stock, ...phcMeta } = phc;
            await setDoc(phcRef, phcMeta);
            if (stock) {
              for (const [medId, item] of Object.entries(stock)) {
                await setDoc(doc(db!, 'phcs', phc.id, 'stock', medId), item);
              }
            }
          }
          return;
        }

        const phcList: PHC[] = [];
        for (const phcDoc of snapshot.docs) {
          const phcData = phcDoc.data() as PHC;
          // Fetch stock subcollection
          const stockSnap = await getDocs(collection(db!, 'phcs', phcDoc.id, 'stock'));
          const stockMap: Record<string, StockItem> = {};
          stockSnap.forEach(sDoc => {
            stockMap[sDoc.id] = sDoc.data() as StockItem;
          });
          phcData.stock = stockMap;
          phcList.push(phcData);
        }

        this.cachedPhcs = phcList;
        localStorage.setItem(LOCAL_STORAGE_KEY_PHCS, JSON.stringify(phcList));
        this.notifyPHCs();
      }, (err) => {
        console.warn('Firestore subscription warning:', err);
      });

      return () => {
        unsubscribeFirestore();
        this.phcsListeners = this.phcsListeners.filter(l => l !== listener);
      };
    }

    return () => {
      this.phcsListeners = this.phcsListeners.filter(l => l !== listener);
    };
  }

  private notifyPHCs() {
    this.phcsListeners.forEach(listener => listener(this.cachedPhcs));
  }

  public async updatePHCStock(
    phcId: string,
    items: Array<{ medicineName: string; quantity: number; category?: string; unit?: string }>,
    source: 'photo' | 'manual' = 'photo'
  ): Promise<PHC | undefined> {
    const phcs = [...this.cachedPhcs];
    const phcIndex = phcs.findIndex(p => p.id === phcId);
    if (phcIndex === -1) return undefined;

    const targetPHC = { ...phcs[phcIndex] };
    const stockMap: Record<string, StockItem> = { ...(targetPHC.stock || {}) };

    for (const item of items) {
      const existingKey = Object.keys(stockMap).find(
        key => stockMap[key].medicineName.toLowerCase() === item.medicineName.toLowerCase()
      );

      const now = new Date().toISOString();

      let medId: string;
      let updatedItem: StockItem;

      if (existingKey) {
        medId = existingKey;
        updatedItem = {
          ...stockMap[existingKey],
          quantity: Number(item.quantity),
          lastUpdated: now,
          lastUpdatedSource: source,
        };
      } else {
        medId = item.medicineName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        updatedItem = {
          id: medId,
          medicineName: item.medicineName,
          category: (item.category as any) || 'Analgesics',
          quantity: Number(item.quantity),
          unit: (item.unit as any) || 'strips',
          reorderThreshold: Math.max(50, Math.floor(Number(item.quantity) * 0.4)),
          lastUpdated: now,
          lastUpdatedSource: source,
        };
      }

      stockMap[medId] = updatedItem;

      // Sync directly to Firestore if active
      if (isFirebaseConfigured() && db) {
        try {
          const stockRef = doc(db, 'phcs', phcId, 'stock', medId);
          await setDoc(stockRef, updatedItem);
        } catch (e) {
          console.warn('Firestore stock update warning:', e);
        }
      }
    }

    targetPHC.stock = stockMap;
    phcs[phcIndex] = targetPHC;
    this.cachedPhcs = phcs;

    localStorage.setItem(LOCAL_STORAGE_KEY_PHCS, JSON.stringify(phcs));
    this.notifyPHCs();
    return targetPHC;
  }

  public resetToDefault() {
    this.cachedPhcs = INITIAL_PHCS;
    localStorage.setItem(LOCAL_STORAGE_KEY_PHCS, JSON.stringify(INITIAL_PHCS));
    this.notifyPHCs();
  }

  // --- STOCK REPORTS (NO PHOTO STORAGE URL IN FIRESTORE DOCUMENT) ---
  public getReports(): StockReport[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public async saveReport(report: Omit<StockReport, 'id' | 'createdAt'>): Promise<StockReport> {
    const reports = this.getReports();
    const newReport: StockReport = {
      ...report,
      id: 'rep-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(reports));

    if (isFirebaseConfigured() && db) {
      try {
        // Step 2 Rule 4: Drop photoUrl field when persisting to Firestore
        const { photoUrl, ...firestoreReportData } = newReport;
        const reportRef = doc(db, 'stockReports', newReport.id);
        await setDoc(reportRef, firestoreReportData);
      } catch (e) {
        console.warn('Firestore report save warning:', e);
      }
    }

    return newReport;
  }

  // --- SIMULATIONS ---
  public getSimulations(): Simulation[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SIMULATIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public async saveSimulation(simulation: Omit<Simulation, 'id' | 'createdAt'>): Promise<Simulation> {
    const list = this.getSimulations();
    const newSim: Simulation = {
      ...simulation,
      id: 'sim-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(newSim);
    localStorage.setItem(LOCAL_STORAGE_KEY_SIMULATIONS, JSON.stringify(list));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'simulations', newSim.id), newSim);
      } catch (e) {
        console.warn('Firestore simulation save warning:', e);
      }
    }

    return newSim;
  }

  // --- REDISTRIBUTIONS ---
  public getRedistributions(): Redistribution[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_REDISTRIBUTIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public async saveRedistribution(redist: Omit<Redistribution, 'id' | 'createdAt'>): Promise<Redistribution> {
    const list = this.getRedistributions();
    const newRedist: Redistribution = {
      ...redist,
      id: 'red-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(newRedist);
    localStorage.setItem(LOCAL_STORAGE_KEY_REDISTRIBUTIONS, JSON.stringify(list));

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'redistributions', newRedist.id), newRedist);
      } catch (e) {
        console.warn('Firestore redistribution save warning:', e);
      }
    }

    return newRedist;
  }

  public async approveRedistribution(id: string): Promise<Redistribution | undefined> {
    const list = this.getRedistributions();
    const index = list.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    list[index].status = 'approved';
    localStorage.setItem(LOCAL_STORAGE_KEY_REDISTRIBUTIONS, JSON.stringify(list));

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'redistributions', id), { status: 'approved' });
      } catch (e) {
        console.warn('Firestore approve redistribution warning:', e);
      }
    }

    return list[index];
  }

  // --- RISK COMPUTATION UTILS ---
  public calculatePHCRisk(phc: PHC): { risk: 'critical' | 'low' | 'healthy'; lowCount: number; criticalCount: number } {
    if (!phc.stock) return { risk: 'healthy', lowCount: 0, criticalCount: 0 };
    const items = Object.values(phc.stock);
    let lowCount = 0;
    let criticalCount = 0;

    items.forEach(item => {
      if (item.quantity < item.reorderThreshold * 0.5) {
        criticalCount++;
      } else if (item.quantity < item.reorderThreshold) {
        lowCount++;
      }
    });

    if (criticalCount > 0 || lowCount >= 2) {
      return { risk: 'critical', lowCount, criticalCount };
    } else if (lowCount === 1) {
      return { risk: 'low', lowCount, criticalCount };
    }
    return { risk: 'healthy', lowCount: 0, criticalCount: 0 };
  }
}

export const storeService = new StoreService();
