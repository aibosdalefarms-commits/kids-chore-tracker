import { useState, useEffect } from 'react';

const SCRIPTURE_QUOTES = [
  {
    text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters, since you know that you will receive an inheritance from the Lord as a reward. It is the Lord Christ you are serving.",
    reference: "Colossians 3:23-24"
  },
  {
    text: "All hard work brings a profit, but mere talk leads only to poverty.",
    reference: "Proverbs 14:23"
  },
  {
    text: "Those who work their land will have abundant food, but those who chase fantasies have no sense.",
    reference: "Proverbs 12:11"
  },
  {
    text: "The one who is unwilling to work shall not eat.",
    reference: "2 Thessalonians 3:10"
  },
  {
    text: "Whatever your hand finds to do, do it with all your might.",
    reference: "Ecclesiastes 9:10"
  },
  {
    text: "Go to the ant, you sluggard; consider its ways and be wise! It has no commander, no overseer or ruler, yet it stores its provisions in summer and gathers its food at harvest.",
    reference: "Proverbs 6:6-8"
  },
  {
    text: "Do you see someone skilled in their work? They will serve before kings; they will not serve before officials of low rank.",
    reference: "Proverbs 22:29"
  },
  {
    text: "Whoever can be trusted with very little can also be trusted with much, and whoever is dishonest with very little will also be dishonest with much.",
    reference: "Luke 16:10"
  },
  {
    text: "A sluggard's appetite is never filled, but the desires of the diligent are fully satisfied.",
    reference: "Proverbs 13:4"
  },
  {
    text: "Serve wholeheartedly, as if you were serving the Lord, not people, because you know that the Lord will reward each one for whatever good they do.",
    reference: "Ephesians 6:7-8"
  },
  {
    text: "Even children are known by the way they act, whether their conduct is pure and whether it is right.",
    reference: "Proverbs 20:11"
  },
  {
    text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    reference: "Galatians 6:9"
  }
];

const STORAGE_KEY = 'scripture_quote_state';
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

interface StoredState {
  index: number;
  lastRotation: number;
}

function getStoredState(): StoredState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return { index: 0, lastRotation: Date.now() };
}

function saveState(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ScriptureQuote() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const state = getStoredState();
    const now = Date.now();
    const timeSinceRotation = now - state.lastRotation;

    // Check if 8 hours have passed
    if (timeSinceRotation >= EIGHT_HOURS_MS) {
      const rotations = Math.floor(timeSinceRotation / EIGHT_HOURS_MS);
      const newIndex = (state.index + rotations) % SCRIPTURE_QUOTES.length;
      const newState = { index: newIndex, lastRotation: now };
      saveState(newState);
      return newIndex;
    }

    return state.index;
  });

  useEffect(() => {
    // Check every minute if we need to rotate
    const interval = setInterval(() => {
      const state = getStoredState();
      const now = Date.now();
      const timeSinceRotation = now - state.lastRotation;

      if (timeSinceRotation >= EIGHT_HOURS_MS) {
        const newIndex = (state.index + 1) % SCRIPTURE_QUOTES.length;
        const newState = { index: newIndex, lastRotation: now };
        saveState(newState);
        setCurrentIndex(newIndex);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const quote = SCRIPTURE_QUOTES[currentIndex];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-cyan-100">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📖</span>
        <div>
          <p className="text-gray-700 text-sm leading-relaxed italic">
            "{quote.text}"
          </p>
          <p className="text-cyan-600 font-semibold text-sm mt-2">
            — {quote.reference}
          </p>
        </div>
      </div>
    </div>
  );
}
