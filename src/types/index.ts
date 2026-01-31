// Core data types based on PRD Section 6

export type TimePeriodId = 'morning' | 'daytime' | 'afterSchool' | 'evening';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0
export type CompletionStatus = 'pending' | 'verified' | 'adjusted';
export type AccessoryCategory = 'eyewear' | 'accessories' | 'clothing' | 'footwear' | 'hair';

// 6.1 Family
export interface Family {
  familyId: string;
  adminPin: string; // Hashed 4-digit PIN
  familyPoints: number;
  streakBonusPoints: number;
  createdAt: string;
}

// 6.2 Child
export interface Child {
  childId: string;
  familyId: string;
  name: string;
  avatarConfig: AvatarConfig;
  individualPoints: number;
  totalPointsEarned: number;
  currentStreak: number;
  lastStreakDate: string | null;
  createdAt: string;
}

// Avatar configuration for DiceBear
export interface AvatarConfig {
  seed: string;
  backgroundColor?: string;
  // Customizable accessory properties
  accessories?: string[];
  accessoriesColor?: string[];
  clothing?: string[];
  clothingColor?: string[];
  eyebrows?: string[];
  eyes?: string[];
  facialHair?: string[];
  facialHairColor?: string[];
  hairColor?: string[];
  hatColor?: string[];
  mouth?: string[];
  nose?: string[];
  skinColor?: string[];
  top?: string[];
}

// 6.3 Chore
export interface Chore {
  choreId: string;
  familyId: string;
  name: string;
  emoji: string;
  pointValue: number;
  createdAt: string;
}

// 6.4 Chore Assignment
export interface ChoreAssignment {
  assignmentId: string;
  familyId: string;
  choreId: string;
  childId: string;
  daysOfWeek: DayOfWeek[];
  timePeriods: TimePeriodId[];
  createdAt: string;
}

// 6.5 Completion
export interface Completion {
  completionId: string;
  familyId: string;
  assignmentId: string;
  childId: string;
  choreId: string;
  completedAt: string;
  verifiedAt: string | null;
  pointsAwarded: number | null;
  status: CompletionStatus;
  archivedAt: string | null;
}

// 6.6 Time Period
export interface TimePeriod {
  periodId: TimePeriodId;
  familyId: string;
  displayName: string;
  startTime: string; // 24-hour format "HH:MM"
  endTime: string;
}

// 6.7 Avatar Accessory
export interface AvatarAccessory {
  accessoryId: string;
  name: string;
  category: AccessoryCategory;
  avatarProperty: string;
  avatarValue: string;
  pointCost: number;
  available: boolean;
}

// 6.8 Store Schedule
export interface StoreSchedule {
  familyId: string;
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
}

// 6.9 Family Reward
export interface FamilyReward {
  rewardId: string;
  familyId: string;
  description: string;
  pointThreshold: number;
  claimed: boolean;
  claimedAt: string | null;
  createdAt: string;
}

// Purchased accessory record
export interface PurchasedAccessory {
  purchaseId: string;
  childId: string;
  accessoryId: string;
  purchasedAt: string;
}

// App state for first-run detection
export interface AppState {
  initialized: boolean;
  setupCompletedAt: string | null;
}

// Chore with assignment info for display
export interface ChoreWithAssignment {
  chore: Chore;
  assignment: ChoreAssignment;
  completion: Completion | null;
}

// Default time periods
export const DEFAULT_TIME_PERIODS: Omit<TimePeriod, 'familyId'>[] = [
  { periodId: 'morning', displayName: 'Morning', startTime: '06:00', endTime: '09:00' },
  { periodId: 'daytime', displayName: 'Daytime', startTime: '09:00', endTime: '15:00' },
  { periodId: 'afterSchool', displayName: 'After School', startTime: '15:00', endTime: '18:00' },
  { periodId: 'evening', displayName: 'Evening', startTime: '18:00', endTime: '21:00' },
];

// Helper type for time period display names
export const TIME_PERIOD_NAMES: Record<TimePeriodId, string> = {
  morning: 'Morning',
  daytime: 'Daytime',
  afterSchool: 'After School',
  evening: 'Evening',
};

// Helper for day names
export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
