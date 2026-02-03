import { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmojiPicker } from '../ui/EmojiPicker';
import { generateId } from '../../utils/id';
import type { SideQuest } from '../../types';

export function SideQuests() {
  const { family, children, sideQuests, addSideQuest, updateSideQuest, removeSideQuest } = useFamily();
  const [showModal, setShowModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState<SideQuest | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('');
  const [pointValue, setPointValue] = useState(10);
  const [childId, setChildId] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setEmoji('');
    setPointValue(10);
    setChildId('');
    setEditingQuest(null);
  };

  const handleOpenModal = (quest?: SideQuest) => {
    if (quest) {
      setEditingQuest(quest);
      setName(quest.name);
      setDescription(quest.description || '');
      setEmoji(quest.emoji);
      setPointValue(quest.pointValue);
      setChildId(quest.childId);
    } else {
      resetForm();
      if (children.length > 0) {
        setChildId(children[0].childId);
      }
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !emoji || !childId || !family) return;

    if (editingQuest) {
      await updateSideQuest(editingQuest.questId, {
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
        pointValue,
        childId,
      });
    } else {
      const newQuest: SideQuest = {
        questId: generateId(),
        familyId: family.familyId,
        childId,
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
        pointValue,
        status: 'active',
        completedAt: null,
        verifiedAt: null,
        createdAt: new Date().toISOString(),
      };
      await addSideQuest(newQuest);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (questId: string) => {
    if (confirm('Delete this side quest?')) {
      await removeSideQuest(questId);
    }
  };

  const getChildName = (cId: string) => {
    return children.find(c => c.childId === cId)?.name || 'Unknown';
  };

  const getStatusBadge = (status: SideQuest['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Active</span>;
      case 'pending_verification':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>;
    }
  };

  // Group quests by status
  const activeQuests = sideQuests.filter(q => q.status === 'active');
  const pendingQuests = sideQuests.filter(q => q.status === 'pending_verification');
  const completedQuests = sideQuests.filter(q => q.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Side Quests</h2>
          <p className="text-sm text-gray-500">One-off tasks for individual children</p>
        </div>
        <Button onClick={() => handleOpenModal()} disabled={children.length === 0}>
          + New Side Quest
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">Add children first before creating side quests.</p>
        </div>
      ) : sideQuests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <span className="text-4xl mb-4 block">🎯</span>
          <p className="text-gray-600">No side quests yet.</p>
          <p className="text-gray-500 text-sm mt-1">Create special one-off tasks for your children!</p>
        </div>
      ) : (
        <>
          {/* Active Quests */}
          {activeQuests.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-blue-50">
                <h3 className="font-semibold text-blue-800">Active ({activeQuests.length})</h3>
              </div>
              <div className="divide-y">
                {activeQuests.map(quest => (
                  <div key={quest.questId} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{quest.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800">{quest.name}</p>
                        <p className="text-sm text-gray-500">
                          {getChildName(quest.childId)} • {quest.pointValue} pts
                        </p>
                        {quest.description && (
                          <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(quest.status)}
                      <button
                        onClick={() => handleOpenModal(quest)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(quest.questId)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Verification */}
          {pendingQuests.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-yellow-50">
                <h3 className="font-semibold text-yellow-800">Pending Verification ({pendingQuests.length})</h3>
              </div>
              <div className="divide-y">
                {pendingQuests.map(quest => (
                  <div key={quest.questId} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{quest.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800">{quest.name}</p>
                        <p className="text-sm text-gray-500">
                          {getChildName(quest.childId)} • {quest.pointValue} pts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(quest.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedQuests.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-green-50">
                <h3 className="font-semibold text-green-800">Completed ({completedQuests.length})</h3>
              </div>
              <div className="divide-y">
                {completedQuests.map(quest => (
                  <div key={quest.questId} className="p-4 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{quest.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800 line-through">{quest.name}</p>
                        <p className="text-sm text-gray-500">
                          {getChildName(quest.childId)} • {quest.pointValue} pts awarded
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(quest.status)}
                      <button
                        onClick={() => handleDelete(quest.questId)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
        <h4 className="font-medium text-indigo-800 mb-1">How Side Quests Work</h4>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• Side quests appear separately from regular chores in the child's view</li>
          <li>• They're visible at any time until completed and verified</li>
          <li>• Great for special tasks, one-time projects, or bonus opportunities</li>
          <li>• Points are awarded after you verify completion</li>
        </ul>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingQuest ? 'Edit Side Quest' : 'New Side Quest'}
      >
        <div className="space-y-4">
          {/* Child Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to
            </label>
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {children.map(child => (
                <option key={child.childId} value={child.childId}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 text-3xl bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                {emoji || '❓'}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 z-10">
                  <EmojiPicker
                    onSelect={(e) => {
                      setEmoji(e);
                      setShowEmojiPicker(false);
                    }}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quest Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Clean the garage"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Point Value
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={pointValue}
              onChange={(e) => setPointValue(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !emoji || !childId}
              className="flex-1"
            >
              {editingQuest ? 'Save Changes' : 'Create Quest'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
