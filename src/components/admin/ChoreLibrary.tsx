import { useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmojiPicker } from '../ui/EmojiPicker';
import { generateId } from '../../utils/id';
import type { Chore } from '../../types';

export function ChoreLibrary() {
  const { chores, addChore, updateChore, removeChore, family } = useFamily();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [pointValue, setPointValue] = useState(5);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const openCreateModal = () => {
    setEditingChore(null);
    setName('');
    setEmoji('✨');
    setPointValue(5);
    setIsModalOpen(true);
  };

  const openEditModal = (chore: Chore) => {
    setEditingChore(chore);
    setName(chore.name);
    setEmoji(chore.emoji);
    setPointValue(chore.pointValue);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingChore) {
      await updateChore(editingChore.choreId, {
        name: name.trim(),
        emoji,
        pointValue,
      });
    } else {
      const newChore: Chore = {
        choreId: generateId(),
        familyId: family?.familyId || 'default',
        name: name.trim(),
        emoji,
        pointValue,
        createdAt: new Date().toISOString(),
      };
      await addChore(newChore);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (choreId: string) => {
    if (confirm('Delete this chore? Any assignments will also be removed.')) {
      await removeChore(choreId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Chore Library</h2>
          <p className="text-gray-500">Create chores to assign to children</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Chore
        </Button>
      </div>

      {/* Chore List */}
      {chores.length > 0 ? (
        <div className="grid gap-3">
          {chores.map(chore => (
            <div
              key={chore.choreId}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{chore.emoji}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{chore.name}</h3>
                  <p className="text-sm text-indigo-600">⭐ {chore.pointValue} points</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(chore)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(chore.choreId)}>
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
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 mb-4">No chores yet. Create your first chore!</p>
          <Button onClick={openCreateModal}>Add Chore</Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingChore ? 'Edit Chore' : 'Create Chore'}
      >
        <div className="space-y-4">
          {/* Emoji Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 text-3xl bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                {emoji}
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

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chore Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Brush teeth"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Point Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Point Value</label>
            <input
              type="number"
              value={pointValue}
              onChange={(e) => setPointValue(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="flex-1">
              {editingChore ? 'Save Changes' : 'Create Chore'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
