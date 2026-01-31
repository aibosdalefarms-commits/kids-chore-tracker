import { useState } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

// Emoji categories from PRD Appendix 12.2
const EMOJI_CATEGORIES = {
  'Household': ['🧹', '🧽', '🧴', '🧺', '🪣', '🧯', '🛋️', '🚪', '🪟', '🗑️'],
  'Food': ['🍽️', '🥘', '🍳', '🥗', '🍞', '🧊', '🥛', '🍎', '🥕', '🧁'],
  'Pets': ['🐕', '🐈', '🐦', '🐠', '🐹', '🐰', '🦎', '🐢', '🐾', '🦴'],
  'Nature': ['🌱', '🌿', '🌻', '🌳', '💐', '🪴', '🌸', '🍂', '☀️', '💧'],
  'Personal Care': ['🦷', '🛁', '🚿', '🧴', '💇', '💅', '🧼', '🪥', '👕', '👟'],
  'School': ['📚', '✏️', '📝', '🎒', '📖', '🖍️', '✂️', '📐', '🎨', '💻'],
  'Activities': ['🎨', '🎵', '⚽', '🏀', '🎯', '🎮', '🚴', '🏊', '🎭', '🎪'],
  'Bedroom': ['🛏️', '🧸', '🛌', '💤', '🪫', '📱', '🔌', '💡', '🪞', '🧳'],
};

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Household');

  const categories = Object.keys(EMOJI_CATEGORIES);

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-72">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              activeCategory === category
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-5 gap-1">
        {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-10 h-10 text-xl hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Close Button */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
