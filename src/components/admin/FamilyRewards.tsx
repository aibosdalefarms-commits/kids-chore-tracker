import { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { dataService } from '../../services/data';
import { generateId } from '../../utils/id';
import type { FamilyReward } from '../../types';

export function FamilyRewards() {
  const { family, updateFamily } = useFamily();
  const [rewards, setRewards] = useState<FamilyReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<FamilyReward | null>(null);
  const [description, setDescription] = useState('');
  const [pointThreshold, setPointThreshold] = useState(100);

  // Load rewards on mount
  useState(() => {
    const load = async () => {
      const data = await dataService.getFamilyRewards();
      setRewards(data.sort((a, b) => a.pointThreshold - b.pointThreshold));
      setIsLoading(false);
    };
    load();
  });

  const openCreateModal = () => {
    setEditingReward(null);
    setDescription('');
    setPointThreshold(100);
    setIsModalOpen(true);
  };

  const openEditModal = (reward: FamilyReward) => {
    setEditingReward(reward);
    setDescription(reward.description);
    setPointThreshold(reward.pointThreshold);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!description.trim() || !family) return;

    if (editingReward) {
      await dataService.updateFamilyReward(editingReward.rewardId, {
        description: description.trim(),
        pointThreshold,
      });
      setRewards(prev =>
        prev.map(r => r.rewardId === editingReward.rewardId
          ? { ...r, description: description.trim(), pointThreshold }
          : r
        ).sort((a, b) => a.pointThreshold - b.pointThreshold)
      );
    } else {
      const newReward: FamilyReward = {
        rewardId: generateId(),
        familyId: family.familyId,
        description: description.trim(),
        pointThreshold,
        claimed: false,
        claimedAt: null,
        createdAt: new Date().toISOString(),
      };
      await dataService.saveFamilyReward(newReward);
      setRewards(prev => [...prev, newReward].sort((a, b) => a.pointThreshold - b.pointThreshold));
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm('Delete this reward?')) return;
    await dataService.deleteFamilyReward(rewardId);
    setRewards(prev => prev.filter(r => r.rewardId !== rewardId));
  };

  const handleClaim = async (reward: FamilyReward) => {
    if (!family || family.familyPoints < reward.pointThreshold) return;

    if (!confirm(`Claim "${reward.description}"? This will deduct ${reward.pointThreshold} family points.`)) {
      return;
    }

    // Deduct points from family
    await updateFamily({
      familyPoints: family.familyPoints - reward.pointThreshold,
    });

    // Mark reward as claimed
    await dataService.updateFamilyReward(reward.rewardId, {
      claimed: true,
      claimedAt: new Date().toISOString(),
    });

    setRewards(prev =>
      prev.map(r => r.rewardId === reward.rewardId
        ? { ...r, claimed: true, claimedAt: new Date().toISOString() }
        : r
      )
    );
  };

  const handleReset = async (reward: FamilyReward) => {
    if (!confirm('Reset this reward so it can be earned again?')) return;

    await dataService.updateFamilyReward(reward.rewardId, {
      claimed: false,
      claimedAt: null,
    });

    setRewards(prev =>
      prev.map(r => r.rewardId === reward.rewardId
        ? { ...r, claimed: false, claimedAt: null }
        : r
      )
    );
  };

  const familyPoints = family?.familyPoints || 0;
  const unclaimedRewards = rewards.filter(r => !r.claimed);
  const claimedRewards = rewards.filter(r => r.claimed);
  const nextReward = unclaimedRewards[0];

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
          <h2 className="text-2xl font-bold text-gray-800">Family Rewards</h2>
          <p className="text-gray-500">Set goals for the whole family to work toward</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Reward
        </Button>
      </div>

      {/* Family Points Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm">Family Points</p>
            <p className="text-4xl font-bold">⭐ {familyPoints}</p>
          </div>
          {nextReward && (
            <div className="text-right">
              <p className="text-indigo-100 text-sm">Next Reward</p>
              <p className="font-semibold">{nextReward.description}</p>
              <p className="text-sm text-indigo-200">
                {nextReward.pointThreshold - familyPoints > 0
                  ? `${nextReward.pointThreshold - familyPoints} more points needed`
                  : 'Ready to claim!'}
              </p>
            </div>
          )}
        </div>

        {/* Progress to next reward */}
        {nextReward && (
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (familyPoints / nextReward.pointThreshold) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-indigo-200 mt-1 text-right">
              {familyPoints} / {nextReward.pointThreshold}
            </p>
          </div>
        )}
      </div>

      {/* Unclaimed Rewards */}
      {unclaimedRewards.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Available Rewards</h3>
          <div className="space-y-3">
            {unclaimedRewards.map(reward => {
              const canClaim = familyPoints >= reward.pointThreshold;
              const progress = Math.min(100, (familyPoints / reward.pointThreshold) * 100);

              return (
                <div
                  key={reward.rewardId}
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all ${
                    canClaim ? 'border-green-300 bg-green-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🎁</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{reward.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${canClaim ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {familyPoints} / {reward.pointThreshold}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canClaim ? (
                        <Button size="sm" onClick={() => handleClaim(reward)} className="gap-1">
                          🎉 Claim
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium">
                          {reward.pointThreshold - familyPoints} to go
                        </span>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(reward)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(reward.rewardId)}>
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claimed Rewards */}
      {claimedRewards.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Claimed Rewards</h3>
          <div className="space-y-2">
            {claimedRewards.map(reward => (
              <div
                key={reward.rewardId}
                className="bg-gray-50 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="text-2xl opacity-50">🎁</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-500 line-through">{reward.description}</p>
                  <p className="text-xs text-gray-400">
                    Claimed {reward.claimedAt ? new Date(reward.claimedAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleReset(reward)}>
                  Reset
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(reward.rewardId)}>
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rewards.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No rewards yet</h3>
          <p className="text-gray-500 mb-4">Create rewards for your family to work toward!</p>
          <Button onClick={openCreateModal}>Add First Reward</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReward ? 'Edit Reward' : 'Create Reward'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reward Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Pizza night, Trip to the zoo"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
            <input
              type="number"
              value={pointThreshold}
              onChange={(e) => setPointThreshold(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              Current family points: {familyPoints}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!description.trim()} className="flex-1">
              {editingReward ? 'Save Changes' : 'Create Reward'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
