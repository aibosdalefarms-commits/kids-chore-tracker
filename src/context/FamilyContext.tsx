import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Family, Child, Chore, ChoreAssignment, TimePeriod } from '../types';
import { dataService } from '../services/data';

interface FamilyContextType {
  // State
  isLoading: boolean;
  isInitialized: boolean;
  family: Family | null;
  children: Child[];
  chores: Chore[];
  assignments: ChoreAssignment[];
  timePeriods: TimePeriod[];

  // Actions
  refreshData: () => Promise<void>;
  updateFamily: (updates: Partial<Family>) => Promise<void>;
  addChild: (child: Child) => Promise<void>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<void>;
  removeChild: (childId: string) => Promise<void>;
  addChore: (chore: Chore) => Promise<void>;
  updateChore: (choreId: string, updates: Partial<Chore>) => Promise<void>;
  removeChore: (choreId: string) => Promise<void>;
  addAssignment: (assignment: ChoreAssignment) => Promise<void>;
  updateAssignment: (assignmentId: string, updates: Partial<ChoreAssignment>) => Promise<void>;
  removeAssignment: (assignmentId: string) => Promise<void>;
  saveTimePeriods: (periods: TimePeriod[]) => Promise<void>;
  initializeFamily: (family: Family, periods: TimePeriod[]) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export function FamilyProvider({ children: childrenNodes }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([]);
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);

  const refreshData = useCallback(async () => {
    try {
      const [appState, familyData, childrenData, choresData, assignmentsData, periodsData] = await Promise.all([
        dataService.getAppState(),
        dataService.getFamily(),
        dataService.getChildren(),
        dataService.getChores(),
        dataService.getAssignments(),
        dataService.getTimePeriods(),
      ]);

      setIsInitialized(appState.initialized);
      setFamily(familyData);
      setChildren(childrenData);
      setChores(choresData);
      setAssignments(assignmentsData);
      setTimePeriods(periodsData);
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const initializeFamily = async (newFamily: Family, periods: TimePeriod[]) => {
    await dataService.saveFamily(newFamily);
    await dataService.saveTimePeriods(periods);
    await dataService.setAppState({ initialized: true, setupCompletedAt: new Date().toISOString() });
    setFamily(newFamily);
    setTimePeriods(periods);
    setIsInitialized(true);
  };

  const updateFamily = async (updates: Partial<Family>) => {
    if (!family) return;
    await dataService.updateFamily(updates);
    setFamily({ ...family, ...updates });
  };

  const addChild = async (child: Child) => {
    await dataService.saveChild(child);
    setChildren(prev => [...prev, child]);
  };

  const updateChild = async (childId: string, updates: Partial<Child>) => {
    await dataService.updateChild(childId, updates);
    setChildren(prev => prev.map(c => c.childId === childId ? { ...c, ...updates } : c));
  };

  const removeChild = async (childId: string) => {
    await dataService.deleteChild(childId);
    setChildren(prev => prev.filter(c => c.childId !== childId));
    setAssignments(prev => prev.filter(a => a.childId !== childId));
  };

  const addChore = async (chore: Chore) => {
    await dataService.saveChore(chore);
    setChores(prev => [...prev, chore]);
  };

  const updateChore = async (choreId: string, updates: Partial<Chore>) => {
    await dataService.updateChore(choreId, updates);
    setChores(prev => prev.map(c => c.choreId === choreId ? { ...c, ...updates } : c));
  };

  const removeChore = async (choreId: string) => {
    await dataService.deleteChore(choreId);
    setChores(prev => prev.filter(c => c.choreId !== choreId));
    setAssignments(prev => prev.filter(a => a.choreId !== choreId));
  };

  const addAssignment = async (assignment: ChoreAssignment) => {
    await dataService.saveAssignment(assignment);
    setAssignments(prev => [...prev, assignment]);
  };

  const updateAssignment = async (assignmentId: string, updates: Partial<ChoreAssignment>) => {
    await dataService.updateAssignment(assignmentId, updates);
    setAssignments(prev => prev.map(a => a.assignmentId === assignmentId ? { ...a, ...updates } : a));
  };

  const removeAssignment = async (assignmentId: string) => {
    await dataService.deleteAssignment(assignmentId);
    setAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId));
  };

  const saveTimePeriods = async (periods: TimePeriod[]) => {
    await dataService.saveTimePeriods(periods);
    setTimePeriods(periods);
  };

  return (
    <FamilyContext.Provider
      value={{
        isLoading,
        isInitialized,
        family,
        children,
        chores,
        assignments,
        timePeriods,
        refreshData,
        updateFamily,
        addChild,
        updateChild,
        removeChild,
        addChore,
        updateChore,
        removeChore,
        addAssignment,
        updateAssignment,
        removeAssignment,
        saveTimePeriods,
        initializeFamily,
      }}
    >
      {childrenNodes}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
