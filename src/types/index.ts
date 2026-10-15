export interface Collocation {
  id: string; // e.g., "col_001"
  chunk: string; // e.g., "cast doubt on"
  type: 'verb-noun' | 'adj-noun' | 'adv-adj' | 'phrase' | string;
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2' | string;
  category: 'academic' | 'business' | 'everyday' | 'literature' | string;
  meaning: string;
  synonyms?: string[]; // e.g. ["raise doubts about", "call into question"]
  collocates: string[]; 
  commonMistakes: string[]; // e.g., "make doubt on"
  examples: {
    sentence: string;
    clozeSentence: string; // "The new evidence ___ the defendant's alibi."
    missingWord: string;
  }[];
  unitNumber?: number;
  unitTitle?: string;
  level?: 'Intermediate' | 'Advanced';
  isCustom?: boolean;
}

export interface UnitSummary {
  unitNumber: number;
  unitTitle: string;
  level: 'Intermediate' | 'Advanced';
  collocations: Collocation[];
  masteredCount: number;
  learningCount: number;
  dueCount: number;
  totalCount: number;
}

export interface QuizQuestion {
  id: string;
  collocation: Collocation;
  sentence: string;
  clozeSentence: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

export interface MatchTile {
  id: string;
  pairId: string;
  text: string;
  side: 'left' | 'right';
  isMatched: boolean;
}

export interface SRSItem {
  collocationId: string;
  repetitionCount: number;
  interval: number; // in days
  easeFactor: number;
  nextReviewDate: number; // Unix timestamp
  history: ReviewLog[]; 
}

export interface ReviewLog {
  timestamp: number;
  grade: 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
  timeSpentMs: number; // Time taken to answer
}

export type Grade = 1 | 2 | 3 | 4;

export interface StudySessionState {
  currentCardIndex: number;
  phase: 'recognition' | 'production' | 'feedback';
  userResponse: string;
  startTime: number;
  sessionCardIds: string[];
  sessionLogs: ReviewLog[];
  completedCount: number;
}

export interface DashboardMetrics {
  currentStreak: number;
  retentionRate: number; // percentage (0-100)
  masteredChunks: number;
  totalCards: number;
  dueTodayCount: number;
  newCardsCount: number;
}
