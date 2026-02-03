import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useFamily } from '../context/FamilyContext';
import { AvatarDisplay } from '../components/avatar/AvatarDisplay';
import { Button } from '../components/ui/Button';
import { dataService } from '../services/data';
import { generateId } from '../utils/id';
import { getCurrentDayOfWeek, getCurrentTimePeriod, getTodayDateString } from '../utils/time';
import type { ChoreWithAssignment, Completion, TimePeriodId, SideQuest } from '../types';
import { TIME_PERIOD_NAMES } from '../types';

export function ChildView() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { children, chores, assignments, timePeriods, family, sideQuests, updateSideQuest } = useFamily();
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const child = children.find(c => c.childId === childId);
  const currentDay = getCurrentDayOfWeek();
  const currentPeriod = getCurrentTimePeriod(timePeriods);

  // Load today's completions for this child
  useEffect(() => {
    const loadCompletions = async () => {
      if (!childId) return;
      const todayCompletions = await dataService.getTodayCompletions();
      setCompletions(todayCompletions.filter(c => c.childId === childId));
      setIsLoading(false);
    };
    loadCompletions();
  }, [childId]);

  // Get chores for current day and time period
  const currentChores: ChoreWithAssignment[] = useMemo(() => {
    if (!childId || !currentPeriod) return [];

    return assignments
      .filter(assignment => {
        // Filter by child
        if (assignment.childId !== childId) return false;
        // Filter by day
        if (!assignment.daysOfWeek.includes(currentDay)) return false;
        // Filter by time period
        if (!assignment.timePeriods.includes(currentPeriod.periodId)) return false;
        return true;
      })
      .map(assignment => {
        const chore = chores.find(c => c.choreId === assignment.choreId);
        if (!chore) return null;

        const completion = completions.find(
          c => c.assignmentId === assignment.assignmentId && c.completedAt.startsWith(getTodayDateString())
        );

        return { chore, assignment, completion: completion || null };
      })
      .filter((item): item is ChoreWithAssignment => item !== null);
  }, [assignments, chores, childId, currentDay, currentPeriod, completions]);

  // Get all chores for today (all time periods)
  const allTodayChores: ChoreWithAssignment[] = useMemo(() => {
    if (!childId) return [];

    return assignments
      .filter(assignment => {
        if (assignment.childId !== childId) return false;
        if (!assignment.daysOfWeek.includes(currentDay)) return false;
        return true;
      })
      .map(assignment => {
        const chore = chores.find(c => c.choreId === assignment.choreId);
        if (!chore) return null;

        const completion = completions.find(
          c => c.assignmentId === assignment.assignmentId && c.completedAt.startsWith(getTodayDateString())
        );

        return { chore, assignment, completion: completion || null };
      })
      .filter((item): item is ChoreWithAssignment => item !== null);
  }, [assignments, chores, childId, currentDay, completions]);

  const completedCount = currentChores.filter(c => c.completion).length;
  const allCurrentCompleted = currentChores.length > 0 && completedCount === currentChores.length;

  // Get active side quests for this child
  const childSideQuests = useMemo(() => {
    if (!childId) return [];
    return sideQuests.filter(q => q.childId === childId && q.status !== 'completed');
  }, [sideQuests, childId]);

  const handleToggleSideQuest = async (quest: SideQuest) => {
    if (quest.status === 'active') {
      // Mark as pending verification
      await updateSideQuest(quest.questId, {
        status: 'pending_verification',
        completedAt: new Date().toISOString(),
      });
      // Fire confetti for completing a side quest
      triggerConfetti();
    } else if (quest.status === 'pending_verification') {
      // Allow unchecking - back to active
      await updateSideQuest(quest.questId, {
        status: 'active',
        completedAt: null,
      });
    }
  };

  const handleToggleChore = async (item: ChoreWithAssignment) => {
    if (!childId || !family) return;

    if (item.completion) {
      // Uncomplete - delete the completion
      await dataService.deleteCompletion(item.completion.completionId);
      setCompletions(prev => prev.filter(c => c.completionId !== item.completion!.completionId));
    } else {
      // Complete - create new completion
      const newCompletion: Completion = {
        completionId: generateId(),
        familyId: family.familyId,
        assignmentId: item.assignment.assignmentId,
        childId,
        choreId: item.chore.choreId,
        completedAt: new Date().toISOString(),
        verifiedAt: null,
        pointsAwarded: null,
        status: 'pending',
        archivedAt: null,
      };

      await dataService.saveCompletion(newCompletion);
      setCompletions(prev => [...prev, newCompletion]);

      // Check if all current period chores are done
      const newCompletedCount = currentChores.filter(c => c.completion || c.assignment.assignmentId === item.assignment.assignmentId).length;
      if (newCompletedCount === currentChores.length && currentChores.length > 0) {
        // Celebration!
        triggerConfetti();
      }
    }
  };

  const triggerConfetti = () => {
    // Fire confetti from both sides
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
    });

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  if (!child) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-xl text-gray-600 mb-4">Child not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 touch-target">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/child/${childId}/store`)}
            className="relative"
          >
            <AvatarDisplay config={child.avatarConfig} size="md" />
            <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-md">
              🛍️
            </span>
          </button>
          <div className="text-right">
            <h1 className="text-xl font-bold text-gray-800">{child.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => navigate(`/child/${childId}/store`)}
                className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
              >
                ⭐ {child.individualPoints}
              </button>
              {child.currentStreak > 0 && (
                <span className="text-orange-500 font-medium">🔥 {child.currentStreak}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Current Time Period */}
      {currentPeriod && (
        <div className="bg-indigo-100 text-indigo-800 rounded-xl px-4 py-3 mb-6 text-center">
          <span className="font-semibold">{TIME_PERIOD_NAMES[currentPeriod.periodId as TimePeriodId]}</span>
          <span className="text-indigo-600 ml-2">
            {completedCount}/{currentChores.length} done
          </span>
        </div>
      )}

      {/* Celebration Banner */}
      {allCurrentCompleted && currentChores.length > 0 && (
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl p-6 mb-6 text-center animate-pulse">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold">Amazing job!</h2>
          <p>You finished all your {TIME_PERIOD_NAMES[currentPeriod?.periodId as TimePeriodId] || ''} chores!</p>
        </div>
      )}

      {/* Chore List */}
      {currentChores.length > 0 ? (
        <div className="space-y-3">
          {currentChores.map(item => (
            <button
              key={item.assignment.assignmentId}
              onClick={() => handleToggleChore(item)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all touch-target ${
                item.completion
                  ? 'bg-green-100 border-2 border-green-300'
                  : 'bg-white border-2 border-gray-100 hover:border-indigo-200 shadow-sm'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.completion
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {item.completion && (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Chore Info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.chore.emoji}</span>
                  <span className={`text-lg font-medium ${item.completion ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    {item.chore.name}
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className={`text-lg font-semibold ${item.completion ? 'text-green-600' : 'text-indigo-600'}`}>
                +{item.chore.pointValue}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          {!currentPeriod ? (
            <>
              <div className="text-5xl mb-4">😴</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No chores right now!</h2>
              <p className="text-gray-500">Enjoy your free time!</p>
            </>
          ) : allTodayChores.length === 0 ? (
            <>
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No chores assigned for today</h2>
              <p className="text-gray-500">Ask a parent to assign some chores!</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No chores for this time</h2>
              <p className="text-gray-500">Check back later or enjoy your break!</p>
            </>
          )}
        </div>
      )}

      {/* Side Quests */}
      {childSideQuests.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🎯</span> Side Quests
          </h3>
          <div className="space-y-3">
            {childSideQuests.map(quest => (
              <button
                key={quest.questId}
                onClick={() => handleToggleSideQuest(quest)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all touch-target ${
                  quest.status === 'pending_verification'
                    ? 'bg-yellow-100 border-2 border-yellow-300'
                    : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 hover:border-purple-300 shadow-sm'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    quest.status === 'pending_verification'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-purple-200'
                  }`}
                >
                  {quest.status === 'pending_verification' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Quest Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{quest.emoji}</span>
                    <span className={`text-lg font-medium ${quest.status === 'pending_verification' ? 'text-yellow-700' : 'text-gray-800'}`}>
                      {quest.name}
                    </span>
                  </div>
                  {quest.description && (
                    <p className="text-sm text-gray-500 mt-1">{quest.description}</p>
                  )}
                  {quest.status === 'pending_verification' && (
                    <p className="text-xs text-yellow-600 mt-1">Waiting for verification...</p>
                  )}
                </div>

                {/* Points */}
                <div className={`text-lg font-semibold ${quest.status === 'pending_verification' ? 'text-yellow-600' : 'text-purple-600'}`}>
                  +{quest.pointValue}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Today's Progress */}
      {allTodayChores.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Today's Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(allTodayChores.filter(c => c.completion).length / allTodayChores.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {allTodayChores.filter(c => c.completion).length} of {allTodayChores.length} chores completed today
          </p>
        </div>
      )}
    </div>
  );
}
