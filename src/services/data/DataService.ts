import type {
  Family,
  Child,
  Chore,
  ChoreAssignment,
  Completion,
  TimePeriod,
  FamilyReward,
  SideQuest,
  StoreSchedule,
  PurchasedAccessory,
  AppState,
} from '../../types';

/**
 * Abstract interface for data operations.
 * Phase 1: LocalStorageProvider
 * Phase 2: CloudProvider (Firebase/Supabase)
 */
export interface DataService {
  // App State
  getAppState(): Promise<AppState>;
  setAppState(state: AppState): Promise<void>;

  // Family
  getFamily(): Promise<Family | null>;
  saveFamily(family: Family): Promise<void>;
  updateFamily(updates: Partial<Family>): Promise<void>;

  // Children
  getChildren(): Promise<Child[]>;
  getChild(childId: string): Promise<Child | null>;
  saveChild(child: Child): Promise<void>;
  updateChild(childId: string, updates: Partial<Child>): Promise<void>;
  deleteChild(childId: string): Promise<void>;

  // Chores
  getChores(): Promise<Chore[]>;
  getChore(choreId: string): Promise<Chore | null>;
  saveChore(chore: Chore): Promise<void>;
  updateChore(choreId: string, updates: Partial<Chore>): Promise<void>;
  deleteChore(choreId: string): Promise<void>;

  // Assignments
  getAssignments(): Promise<ChoreAssignment[]>;
  getAssignmentsByChild(childId: string): Promise<ChoreAssignment[]>;
  saveAssignment(assignment: ChoreAssignment): Promise<void>;
  updateAssignment(assignmentId: string, updates: Partial<ChoreAssignment>): Promise<void>;
  deleteAssignment(assignmentId: string): Promise<void>;
  deleteAssignmentsByChore(choreId: string): Promise<void>;

  // Completions
  getCompletions(): Promise<Completion[]>;
  getCompletionsByChild(childId: string): Promise<Completion[]>;
  getCompletionsByDate(date: string): Promise<Completion[]>;
  getTodayCompletions(): Promise<Completion[]>;
  getPendingCompletions(): Promise<Completion[]>;
  saveCompletion(completion: Completion): Promise<void>;
  updateCompletion(completionId: string, updates: Partial<Completion>): Promise<void>;
  deleteCompletion(completionId: string): Promise<void>;
  archiveOldCompletions(beforeDate: string): Promise<void>;

  // Time Periods
  getTimePeriods(): Promise<TimePeriod[]>;
  saveTimePeriod(period: TimePeriod): Promise<void>;
  saveTimePeriods(periods: TimePeriod[]): Promise<void>;

  // Family Rewards
  getFamilyRewards(): Promise<FamilyReward[]>;
  saveFamilyReward(reward: FamilyReward): Promise<void>;
  updateFamilyReward(rewardId: string, updates: Partial<FamilyReward>): Promise<void>;
  deleteFamilyReward(rewardId: string): Promise<void>;

  // Side Quests
  getSideQuests(): Promise<SideQuest[]>;
  getSideQuestsByChild(childId: string): Promise<SideQuest[]>;
  getPendingSideQuests(): Promise<SideQuest[]>;
  saveSideQuest(quest: SideQuest): Promise<void>;
  updateSideQuest(questId: string, updates: Partial<SideQuest>): Promise<void>;
  deleteSideQuest(questId: string): Promise<void>;

  // Store Schedule
  getStoreSchedule(): Promise<StoreSchedule | null>;
  saveStoreSchedule(schedule: StoreSchedule): Promise<void>;

  // Purchased Accessories
  getPurchasedAccessories(childId: string): Promise<PurchasedAccessory[]>;
  savePurchasedAccessory(purchase: PurchasedAccessory): Promise<void>;

  // Data Export/Import (for backup)
  exportAllData(): Promise<string>;
  importAllData(jsonData: string): Promise<void>;
  clearAllData(): Promise<void>;
}
