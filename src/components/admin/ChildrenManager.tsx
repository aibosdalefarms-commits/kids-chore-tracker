import { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AvatarDisplay } from '../avatar/AvatarDisplay';
import { avatarService } from '../../services/avatar';
import { generateId } from '../../utils/id';
import type { Child } from '../../types';

export function ChildrenManager() {
  const { children, addChild, updateChild, removeChild, family } = useFamily();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [name, setName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');

  const openCreateModal = () => {
    setEditingChild(null);
    setName('');
    setAvatarSeed(generateId());
    setIsModalOpen(true);
  };

  const openEditModal = (child: Child) => {
    setEditingChild(child);
    setName(child.name);
    setAvatarSeed(child.avatarConfig.seed);
    setIsModalOpen(true);
  };

  const handleRandomizeAvatar = () => {
    setAvatarSeed(generateId());
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingChild) {
      await updateChild(editingChild.childId, {
        name: name.trim(),
        avatarConfig: { ...editingChild.avatarConfig, seed: avatarSeed },
      });
    } else {
      const newChild: Child = {
        childId: generateId(),
        familyId: family?.familyId || 'default',
        name: name.trim(),
        avatarConfig: avatarService.generateRandomConfig(avatarSeed),
        individualPoints: 0,
        totalPointsEarned: 0,
        currentStreak: 0,
        lastStreakDate: null,
        createdAt: new Date().toISOString(),
      };
      await addChild(newChild);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (child: Child) => {
    if (!confirm(`Remove ${child.name}? This will also delete their assignments and completion history.`)) {
      return;
    }
    await removeChild(child.childId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Children</h2>
          <p className="text-gray-500">Manage children and their avatars</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Child
        </Button>
      </div>

      {/* Children List */}
      {children.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map(child => (
            <div
              key={child.childId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start gap-4">
                <AvatarDisplay config={child.avatarConfig} size="lg" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{child.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">
                      <span className="text-indigo-600 font-medium">⭐ {child.individualPoints}</span> available points
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="text-green-600 font-medium">{child.totalPointsEarned}</span> total earned
                    </p>
                    {child.currentStreak > 0 && (
                      <p className="text-sm text-orange-500 font-medium">
                        🔥 {child.currentStreak} day streak
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button variant="secondary" size="sm" onClick={() => openEditModal(child)} className="flex-1">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(child)}>
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-5xl mb-4">👶</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No children yet</h3>
          <p className="text-gray-500 mb-4">Add your first child to get started!</p>
          <Button onClick={openCreateModal}>Add Child</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingChild ? 'Edit Child' : 'Add Child'}
      >
        <div className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-4">
            <AvatarDisplay
              config={avatarService.generateRandomConfig(avatarSeed)}
              size="xl"
            />
            <Button variant="secondary" size="sm" onClick={handleRandomizeAvatar}>
              🎲 Randomize Avatar
            </Button>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter child's name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="flex-1">
              {editingChild ? 'Save Changes' : 'Add Child'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
