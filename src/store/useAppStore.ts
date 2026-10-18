import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Collocation, SRSItem, ReviewLog, Grade, DashboardMetrics, UnitSummary } from '../types';
import { SEED_COLLOCATIONS } from '../data/seedData';
import { 
  calculateSM2, 
  createDefaultSRSItem, 
  calculateStreak, 
  calculateRetentionRate, 
  isMastered, 
  isDue 
} from '../utils/srsEngine';

export interface UserSettings {
  dailyGoal: number;
  speechRate: number;
  autoAudio: boolean;
  haptics: boolean;
  soundEffects: boolean;
}

export type StudyLevel = 'All' | 'Intermediate' | 'Advanced';

export interface AppState {
  collocations: Collocation[];
  customCollocations: Collocation[];
  srsItems: Record<string, SRSItem>;
  reviewLogs: ReviewLog[];
  settings: UserSettings;
  activeLevel: StudyLevel;

  // Actions
  setActiveLevel: (level: StudyLevel) => void;
  recordReview: (collocationId: string, grade: Grade, timeSpentMs: number) => void;
  getSRSItem: (collocationId: string) => SRSItem;
  getDueCards: (unitNumber?: number, level?: StudyLevel) => Collocation[];
  getNewCards: (limit?: number, unitNumber?: number, level?: StudyLevel) => Collocation[];
  getAllCollocations: (level?: StudyLevel) => Collocation[];
  getMetrics: () => DashboardMetrics;
  getUnitSummaries: (level?: StudyLevel) => UnitSummary[];
  getCardsForUnit: (unitNumber: number, level?: 'Intermediate' | 'Advanced') => Collocation[];
  addCustomCollocation: (col: Omit<Collocation, 'id'>) => Collocation;
  deleteCollocation: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; error?: string };
  resetProgress: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 10,
  speechRate: 0.95,
  autoAudio: true,
  haptics: true,
  soundEffects: true,
};

// Initialize default SRS map for seed data
const buildInitialSRSMap = (items: Collocation[]): Record<string, SRSItem> => {
  const map: Record<string, SRSItem> = {};
  for (const col of items) {
    map[col.id] = createDefaultSRSItem(col.id);
  }
  return map;
};

const initialSRSMap = buildInitialSRSMap(SEED_COLLOCATIONS);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      collocations: SEED_COLLOCATIONS,
      customCollocations: [],
      srsItems: initialSRSMap,
      reviewLogs: [],
      settings: DEFAULT_SETTINGS,
      activeLevel: 'All',

      setActiveLevel: (level: StudyLevel) => {
        set({ activeLevel: level });
      },

      getSRSItem: (collocationId: string): SRSItem => {
        const item = get().srsItems[collocationId];
        if (item) return item;
        return createDefaultSRSItem(collocationId);
      },

      recordReview: (collocationId: string, grade: Grade, timeSpentMs: number) => {
        const currentItem = get().getSRSItem(collocationId);
        const { updatedItem, log } = calculateSM2(currentItem, grade, timeSpentMs);

        set((state) => ({
          srsItems: {
            ...state.srsItems,
            [collocationId]: updatedItem,
          },
          reviewLogs: [...state.reviewLogs, log],
        }));
      },

      getDueCards: (unitNumber?: number, level?: StudyLevel): Collocation[] => {
        const { collocations, srsItems, activeLevel } = get();
        const effectiveLevel = level || activeLevel;
        const now = Date.now();

        return collocations.filter((col) => {
          if (unitNumber != null && col.unitNumber !== unitNumber) return false;
          if (effectiveLevel !== 'All' && col.level !== effectiveLevel) return false;

          const item = srsItems[col.id];
          if (!item) return false;
          return item.history.length > 0 && isDue(item, now);
        });
      },

      getNewCards: (limit: number = 10, unitNumber?: number, level?: StudyLevel): Collocation[] => {
        const { collocations, srsItems, activeLevel } = get();
        const effectiveLevel = level || activeLevel;

        const unstudied = collocations.filter((col) => {
          if (unitNumber != null && col.unitNumber !== unitNumber) return false;
          if (effectiveLevel !== 'All' && col.level !== effectiveLevel) return false;

          const item = srsItems[col.id];
          return !item || item.history.length === 0;
        });
        return unstudied.slice(0, limit);
      },

      getAllCollocations: (level?: StudyLevel): Collocation[] => {
        const { collocations, activeLevel } = get();
        const effectiveLevel = level || activeLevel;
        if (effectiveLevel === 'All') return collocations;
        return collocations.filter((c) => c.level === effectiveLevel);
      },

      getCardsForUnit: (unitNumber: number, level?: 'Intermediate' | 'Advanced'): Collocation[] => {
        const { collocations } = get();
        return collocations.filter((c) => {
          if (c.unitNumber !== unitNumber) return false;
          if (level && c.level !== level) return false;
          return true;
        });
      },

      getUnitSummaries: (level?: StudyLevel): UnitSummary[] => {
        const { collocations, srsItems, activeLevel } = get();
        const effectiveLevel = level || activeLevel;
        const now = Date.now();

        const unitMap: Record<string, UnitSummary> = {};

        for (const col of collocations) {
          if (effectiveLevel !== 'All' && col.level !== effectiveLevel) continue;

          const uNum = col.unitNumber || 1;
          const uLevel = col.level || 'Intermediate';
          const key = `${uLevel}_${uNum}`;

          if (!unitMap[key]) {
            unitMap[key] = {
              unitNumber: uNum,
              unitTitle: col.unitTitle || `Unit ${uNum}`,
              level: uLevel,
              collocations: [],
              masteredCount: 0,
              learningCount: 0,
              dueCount: 0,
              totalCount: 0,
            };
          }

          const summary = unitMap[key];
          summary.collocations.push(col);
          summary.totalCount += 1;

          const item = srsItems[col.id];
          if (item && item.history.length > 0) {
            if (isMastered(item)) {
              summary.masteredCount += 1;
            } else if (isDue(item, now)) {
              summary.dueCount += 1;
            } else {
              summary.learningCount += 1;
            }
          }
        }

        return Object.values(unitMap).sort((a, b) => {
          if (a.level !== b.level) {
            return a.level === 'Intermediate' ? -1 : 1;
          }
          return a.unitNumber - b.unitNumber;
        });
      },

      addCustomCollocation: (colData: Omit<Collocation, 'id'>): Collocation => {
        const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newCol: Collocation = {
          ...colData,
          id: newId,
          isCustom: true,
        };

        const defaultSRS = createDefaultSRSItem(newId);

        set((state) => ({
          collocations: [newCol, ...state.collocations],
          customCollocations: [newCol, ...state.customCollocations],
          srsItems: {
            ...state.srsItems,
            [newId]: defaultSRS,
          },
        }));

        return newCol;
      },

      deleteCollocation: (id: string) => {
        set((state) => ({
          collocations: state.collocations.filter((c) => c.id !== id),
          customCollocations: state.customCollocations.filter((c) => c.id !== id),
        }));
      },

      getMetrics: (): DashboardMetrics => {
        const { collocations, srsItems, reviewLogs } = get();
        const now = Date.now();

        const currentStreak = calculateStreak(reviewLogs);
        const retentionRate = calculateRetentionRate(reviewLogs, now);

        let masteredChunks = 0;
        let dueTodayCount = 0;
        let newCardsCount = 0;

        for (const col of collocations) {
          const item = srsItems[col.id];
          if (!item || item.history.length === 0) {
            newCardsCount++;
          } else {
            if (isMastered(item)) {
              masteredChunks++;
            }
            if (isDue(item, now)) {
              dueTodayCount++;
            }
          }
        }

        return {
          currentStreak,
          retentionRate,
          masteredChunks,
          totalCards: collocations.length,
          dueTodayCount,
          newCardsCount,
        };
      },

      updateSettings: (newSettings: Partial<UserSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      exportDataJSON: (): string => {
        const state = get();
        const exportPayload = {
          version: '2.0',
          exportedAt: new Date().toISOString(),
          customCollocations: state.customCollocations,
          srsItems: state.srsItems,
          reviewLogs: state.reviewLogs,
          settings: state.settings,
          activeLevel: state.activeLevel,
        };
        return JSON.stringify(exportPayload, null, 2);
      },

      importDataJSON: (jsonString: string): { success: boolean; error?: string } => {
        try {
          const parsed = JSON.parse(jsonString);
          if (!parsed || typeof parsed !== 'object') {
            return { success: false, error: 'Invalid JSON format' };
          }

          if (!parsed.srsItems || typeof parsed.srsItems !== 'object') {
            return { success: false, error: 'No SRS data found in backup file' };
          }

          const custom = Array.isArray(parsed.customCollocations) ? parsed.customCollocations : [];
          const mergedCollocations = [...custom, ...SEED_COLLOCATIONS];
          const mergedSrs: Record<string, SRSItem> = {
            ...buildInitialSRSMap(mergedCollocations),
            ...parsed.srsItems,
          };

          set((state) => ({
            collocations: mergedCollocations,
            customCollocations: custom,
            srsItems: mergedSrs,
            reviewLogs: Array.isArray(parsed.reviewLogs) ? parsed.reviewLogs : state.reviewLogs,
            settings: parsed.settings ? { ...state.settings, ...parsed.settings } : state.settings,
            activeLevel: parsed.activeLevel || state.activeLevel,
          }));

          return { success: true };
        } catch (err: unknown) {
          return {
            success: false,
            error: err instanceof Error ? err.message : 'Parsing error',
          };
        }
      },

      resetProgress: () => {
        const { collocations } = get();
        set({
          srsItems: buildInitialSRSMap(collocations),
          reviewLogs: [],
        });
      },
    }),
    {
      name: 'collocmaster_storage_v6',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customCollocations: state.customCollocations,
        srsItems: state.srsItems,
        reviewLogs: state.reviewLogs,
        settings: state.settings,
        activeLevel: state.activeLevel,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const custom = state.customCollocations || [];
          const combined = [...custom, ...SEED_COLLOCATIONS];
          const updatedSrs = { ...state.srsItems };

          for (const col of combined) {
            if (!updatedSrs[col.id]) {
              updatedSrs[col.id] = createDefaultSRSItem(col.id);
            }
          }

          useAppStore.setState({
            collocations: combined,
            srsItems: updatedSrs,
          });
        }
      },
    }
  )
);
