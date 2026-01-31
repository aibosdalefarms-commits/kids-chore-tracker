import type {
  Family,
  Child,
  Chore,
  ChoreAssignment,
  Completion,
  TimePeriod,
  FamilyReward,
  StoreSchedule,
  PurchasedAccessory,
  AppState,
} from '../../types';
import type { DataService } from './DataService';
import { getTodayDateString } from '../../utils/time';

// Storage keys - prefixed for future multi-family support
const KEYS = {
  APP_STATE: 'chore_app_state',
  FAMILY: 'chore_family',
  CHILDREN: 'chore_children',
  CHORES: 'chore_chores',
  ASSIGNMENTS: 'chore_assignments',
  COMPLETIONS: 'chore_completions',
  TIME_PERIODS: 'chore_time_periods',
  FAMILY_REWARDS: 'chore_family_rewards',
  STORE_SCHEDULE: 'chore_store_schedule',
  PURCHASED_ACCESSORIES: 'chore_purchased_accessories',
} as const;

/**
 * localStorage implementation of DataService
 */
export class LocalStorageProvider implements DataService {
  private getItem<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // App State
  async getAppState(): Promise<AppState> {
    return this.getItem<AppState>(KEYS.APP_STATE) || {
      initialized: false,
      setupCompletedAt: null,
    };
  }

  async setAppState(state: AppState): Promise<void> {
    this.setItem(KEYS.APP_STATE, state);
  }

  // Family
  async getFamily(): Promise<Family | null> {
    return this.getItem<Family>(KEYS.FAMILY);
  }

  async saveFamily(family: Family): Promise<void> {
    this.setItem(KEYS.FAMILY, family);
  }

  async updateFamily(updates: Partial<Family>): Promise<void> {
    const family = await this.getFamily();
    if (family) {
      this.setItem(KEYS.FAMILY, { ...family, ...updates });
    }
  }

  // Children
  async getChildren(): Promise<Child[]> {
    return this.getItem<Child[]>(KEYS.CHILDREN) || [];
  }

  async getChild(childId: string): Promise<Child | null> {
    const children = await this.getChildren();
    return children.find(c => c.childId === childId) || null;
  }

  async saveChild(child: Child): Promise<void> {
    const children = await this.getChildren();
    const index = children.findIndex(c => c.childId === child.childId);
    if (index >= 0) {
      children[index] = child;
    } else {
      children.push(child);
    }
    this.setItem(KEYS.CHILDREN, children);
  }

  async updateChild(childId: string, updates: Partial<Child>): Promise<void> {
    const children = await this.getChildren();
    const index = children.findIndex(c => c.childId === childId);
    if (index >= 0) {
      children[index] = { ...children[index], ...updates };
      this.setItem(KEYS.CHILDREN, children);
    }
  }

  async deleteChild(childId: string): Promise<void> {
    const children = await this.getChildren();
    this.setItem(KEYS.CHILDREN, children.filter(c => c.childId !== childId));

    // Also delete related data
    const assignments = await this.getAssignments();
    this.setItem(KEYS.ASSIGNMENTS, assignments.filter(a => a.childId !== childId));

    const completions = await this.getCompletions();
    this.setItem(KEYS.COMPLETIONS, completions.filter(c => c.childId !== childId));
  }

  // Chores
  async getChores(): Promise<Chore[]> {
    return this.getItem<Chore[]>(KEYS.CHORES) || [];
  }

  async getChore(choreId: string): Promise<Chore | null> {
    const chores = await this.getChores();
    return chores.find(c => c.choreId === choreId) || null;
  }

  async saveChore(chore: Chore): Promise<void> {
    const chores = await this.getChores();
    const index = chores.findIndex(c => c.choreId === chore.choreId);
    if (index >= 0) {
      chores[index] = chore;
    } else {
      chores.push(chore);
    }
    this.setItem(KEYS.CHORES, chores);
  }

  async updateChore(choreId: string, updates: Partial<Chore>): Promise<void> {
    const chores = await this.getChores();
    const index = chores.findIndex(c => c.choreId === choreId);
    if (index >= 0) {
      chores[index] = { ...chores[index], ...updates };
      this.setItem(KEYS.CHORES, chores);
    }
  }

  async deleteChore(choreId: string): Promise<void> {
    const chores = await this.getChores();
    this.setItem(KEYS.CHORES, chores.filter(c => c.choreId !== choreId));
    await this.deleteAssignmentsByChore(choreId);
  }

  // Assignments
  async getAssignments(): Promise<ChoreAssignment[]> {
    return this.getItem<ChoreAssignment[]>(KEYS.ASSIGNMENTS) || [];
  }

  async getAssignmentsByChild(childId: string): Promise<ChoreAssignment[]> {
    const assignments = await this.getAssignments();
    return assignments.filter(a => a.childId === childId);
  }

  async saveAssignment(assignment: ChoreAssignment): Promise<void> {
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.assignmentId === assignment.assignmentId);
    if (index >= 0) {
      assignments[index] = assignment;
    } else {
      assignments.push(assignment);
    }
    this.setItem(KEYS.ASSIGNMENTS, assignments);
  }

  async updateAssignment(assignmentId: string, updates: Partial<ChoreAssignment>): Promise<void> {
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.assignmentId === assignmentId);
    if (index >= 0) {
      assignments[index] = { ...assignments[index], ...updates };
      this.setItem(KEYS.ASSIGNMENTS, assignments);
    }
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    const assignments = await this.getAssignments();
    this.setItem(KEYS.ASSIGNMENTS, assignments.filter(a => a.assignmentId !== assignmentId));
  }

  async deleteAssignmentsByChore(choreId: string): Promise<void> {
    const assignments = await this.getAssignments();
    this.setItem(KEYS.ASSIGNMENTS, assignments.filter(a => a.choreId !== choreId));
  }

  // Completions
  async getCompletions(): Promise<Completion[]> {
    return this.getItem<Completion[]>(KEYS.COMPLETIONS) || [];
  }

  async getCompletionsByChild(childId: string): Promise<Completion[]> {
    const completions = await this.getCompletions();
    return completions.filter(c => c.childId === childId);
  }

  async getCompletionsByDate(date: string): Promise<Completion[]> {
    const completions = await this.getCompletions();
    return completions.filter(c => c.completedAt.startsWith(date));
  }

  async getTodayCompletions(): Promise<Completion[]> {
    return this.getCompletionsByDate(getTodayDateString());
  }

  async getPendingCompletions(): Promise<Completion[]> {
    const completions = await this.getCompletions();
    return completions.filter(c => c.status === 'pending');
  }

  async saveCompletion(completion: Completion): Promise<void> {
    const completions = await this.getCompletions();
    const index = completions.findIndex(c => c.completionId === completion.completionId);
    if (index >= 0) {
      completions[index] = completion;
    } else {
      completions.push(completion);
    }
    this.setItem(KEYS.COMPLETIONS, completions);
  }

  async updateCompletion(completionId: string, updates: Partial<Completion>): Promise<void> {
    const completions = await this.getCompletions();
    const index = completions.findIndex(c => c.completionId === completionId);
    if (index >= 0) {
      completions[index] = { ...completions[index], ...updates };
      this.setItem(KEYS.COMPLETIONS, completions);
    }
  }

  async deleteCompletion(completionId: string): Promise<void> {
    const completions = await this.getCompletions();
    this.setItem(KEYS.COMPLETIONS, completions.filter(c => c.completionId !== completionId));
  }

  async archiveOldCompletions(beforeDate: string): Promise<void> {
    const completions = await this.getCompletions();
    const updated = completions.map(c => {
      if (c.completedAt < beforeDate && !c.archivedAt) {
        return { ...c, archivedAt: new Date().toISOString() };
      }
      return c;
    });
    this.setItem(KEYS.COMPLETIONS, updated);
  }

  // Time Periods
  async getTimePeriods(): Promise<TimePeriod[]> {
    return this.getItem<TimePeriod[]>(KEYS.TIME_PERIODS) || [];
  }

  async saveTimePeriod(period: TimePeriod): Promise<void> {
    const periods = await this.getTimePeriods();
    const index = periods.findIndex(p => p.periodId === period.periodId);
    if (index >= 0) {
      periods[index] = period;
    } else {
      periods.push(period);
    }
    this.setItem(KEYS.TIME_PERIODS, periods);
  }

  async saveTimePeriods(periods: TimePeriod[]): Promise<void> {
    this.setItem(KEYS.TIME_PERIODS, periods);
  }

  // Family Rewards
  async getFamilyRewards(): Promise<FamilyReward[]> {
    return this.getItem<FamilyReward[]>(KEYS.FAMILY_REWARDS) || [];
  }

  async saveFamilyReward(reward: FamilyReward): Promise<void> {
    const rewards = await this.getFamilyRewards();
    const index = rewards.findIndex(r => r.rewardId === reward.rewardId);
    if (index >= 0) {
      rewards[index] = reward;
    } else {
      rewards.push(reward);
    }
    this.setItem(KEYS.FAMILY_REWARDS, rewards);
  }

  async updateFamilyReward(rewardId: string, updates: Partial<FamilyReward>): Promise<void> {
    const rewards = await this.getFamilyRewards();
    const index = rewards.findIndex(r => r.rewardId === rewardId);
    if (index >= 0) {
      rewards[index] = { ...rewards[index], ...updates };
      this.setItem(KEYS.FAMILY_REWARDS, rewards);
    }
  }

  async deleteFamilyReward(rewardId: string): Promise<void> {
    const rewards = await this.getFamilyRewards();
    this.setItem(KEYS.FAMILY_REWARDS, rewards.filter(r => r.rewardId !== rewardId));
  }

  // Store Schedule
  async getStoreSchedule(): Promise<StoreSchedule | null> {
    return this.getItem<StoreSchedule>(KEYS.STORE_SCHEDULE);
  }

  async saveStoreSchedule(schedule: StoreSchedule): Promise<void> {
    this.setItem(KEYS.STORE_SCHEDULE, schedule);
  }

  // Purchased Accessories
  async getPurchasedAccessories(childId: string): Promise<PurchasedAccessory[]> {
    const all = this.getItem<PurchasedAccessory[]>(KEYS.PURCHASED_ACCESSORIES) || [];
    return all.filter(p => p.childId === childId);
  }

  async savePurchasedAccessory(purchase: PurchasedAccessory): Promise<void> {
    const purchases = this.getItem<PurchasedAccessory[]>(KEYS.PURCHASED_ACCESSORIES) || [];
    purchases.push(purchase);
    this.setItem(KEYS.PURCHASED_ACCESSORIES, purchases);
  }

  // Data Export/Import
  async exportAllData(): Promise<string> {
    const data = {
      appState: await this.getAppState(),
      family: await this.getFamily(),
      children: await this.getChildren(),
      chores: await this.getChores(),
      assignments: await this.getAssignments(),
      completions: await this.getCompletions(),
      timePeriods: await this.getTimePeriods(),
      familyRewards: await this.getFamilyRewards(),
      storeSchedule: await this.getStoreSchedule(),
      purchasedAccessories: this.getItem<PurchasedAccessory[]>(KEYS.PURCHASED_ACCESSORIES) || [],
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  async importAllData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    if (data.appState) await this.setAppState(data.appState);
    if (data.family) await this.saveFamily(data.family);
    if (data.children) this.setItem(KEYS.CHILDREN, data.children);
    if (data.chores) this.setItem(KEYS.CHORES, data.chores);
    if (data.assignments) this.setItem(KEYS.ASSIGNMENTS, data.assignments);
    if (data.completions) this.setItem(KEYS.COMPLETIONS, data.completions);
    if (data.timePeriods) this.setItem(KEYS.TIME_PERIODS, data.timePeriods);
    if (data.familyRewards) this.setItem(KEYS.FAMILY_REWARDS, data.familyRewards);
    if (data.storeSchedule) this.setItem(KEYS.STORE_SCHEDULE, data.storeSchedule);
    if (data.purchasedAccessories) this.setItem(KEYS.PURCHASED_ACCESSORIES, data.purchasedAccessories);
  }

  async clearAllData(): Promise<void> {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }
}
