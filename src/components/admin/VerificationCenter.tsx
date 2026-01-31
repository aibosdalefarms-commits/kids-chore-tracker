import { useState, useEffect } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import { AvatarDisplay } from '../avatar/AvatarDisplay';
import { dataService } from '../../services/data';
import type { Completion, Child, Chore } from '../../types';

interface CompletionWithDetails extends Completion {
  child: Child;
  chore: Chore;
}

export function VerificationCenter() {
  const { children, chores, updateChild, updateFamily, family } = useFamily();
  const [completions, setCompletions] = useState<CompletionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPendingCompletions();
  }, []);

  const loadPendingCompletions = async () => {
    const pending = await dataService.getPendingCompletions();

    const withDetails = pending
      .map(completion => {
        const child = children.find(c => c.childId === completion.childId);
        const chore = chores.find(c => c.choreId === completion.choreId);
        if (!child || !chore) return null;
        return { ...completion, child, chore };
      })
      .filter((c): c is CompletionWithDetails => c !== null)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    setCompletions(withDetails);
    setIsLoading(false);
  };

  const handleVerify = async (completion: CompletionWithDetails, adjustedPoints?: number) => {
    const pointsToAward = adjustedPoints ?? completion.chore.pointValue;

    // Update completion status
    await dataService.updateCompletion(completion.completionId, {
      status: adjustedPoints !== undefined ? 'adjusted' : 'verified',
      verifiedAt: new Date().toISOString(),
      pointsAwarded: pointsToAward,
    });

    // Award points to child
    await updateChild(completion.childId, {
      individualPoints: completion.child.individualPoints + pointsToAward,
      totalPointsEarned: completion.child.totalPointsEarned + pointsToAward,
    });

    // Award points to family total
    if (family) {
      await updateFamily({
        familyPoints: family.familyPoints + pointsToAward,
      });
    }

    // Remove from list
    setCompletions(prev => prev.filter(c => c.completionId !== completion.completionId));
  };

  const handleVerifyAll = async () => {
    for (const completion of completions) {
      await handleVerify(completion);
    }
  };

  const handleReject = async (completionId: string) => {
    if (!confirm('Reject this completion? The chore will be unmarked.')) return;

    await dataService.deleteCompletion(completionId);
    setCompletions(prev => prev.filter(c => c.completionId !== completionId));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Group completions by child
  const completionsByChild = children
    .map(child => ({
      child,
      completions: completions.filter(c => c.childId === child.childId),
    }))
    .filter(group => group.completions.length > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Verification Center</h2>
          <p className="text-gray-500">
            {completions.length} pending verification{completions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {completions.length > 0 && (
          <Button onClick={handleVerifyAll} className="gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Verify All ({completions.length})
          </Button>
        )}
      </div>

      {/* Completions by Child */}
      {completionsByChild.length > 0 ? (
        <div className="space-y-6">
          {completionsByChild.map(({ child, completions: childCompletions }) => (
            <div key={child.childId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Child Header */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
                <AvatarDisplay config={child.avatarConfig} size="sm" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{child.name}</h3>
                  <p className="text-sm text-gray-500">
                    {childCompletions.length} chore{childCompletions.length !== 1 ? 's' : ''} to verify
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Points</p>
                  <p className="font-semibold text-indigo-600">⭐ {child.individualPoints}</p>
                </div>
              </div>

              {/* Completions List */}
              <div className="divide-y divide-gray-100">
                {childCompletions.map(completion => (
                  <div key={completion.completionId} className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Chore Info */}
                      <span className="text-2xl">{completion.chore.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{completion.chore.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(completion.completedAt)} at {formatTime(completion.completedAt)}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">+{completion.chore.pointValue}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerify(completion)}
                          className="gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verify
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(completion.completionId)}
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">All caught up!</h3>
          <p className="text-gray-500">No chores waiting for verification.</p>
        </div>
      )}

      {/* Family Points Summary */}
      {family && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Family Points Total</p>
              <p className="text-3xl font-bold">⭐ {family.familyPoints}</p>
            </div>
            <div className="text-6xl opacity-20">👨‍👩‍👧‍👦</div>
          </div>
        </div>
      )}
    </div>
  );
}
