import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../../context/FamilyContext';
import { useAdmin } from '../../context/AdminContext';
import { ChildAvatarButton } from './ChildAvatarButton';
import { ScriptureQuote } from './ScriptureQuote';
import { Modal } from '../ui/Modal';
import { PinInput } from '../ui/PinInput';
import { Button } from '../ui/Button';

export function HomeScreen() {
  const navigate = useNavigate();
  const { children, family, isLoading, rewards } = useFamily();
  const { isAuthenticated, authenticate } = useAdmin();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const nextReward = family
    ? rewards
      .filter(reward => !reward.claimed && reward.pointThreshold >= family.familyPoints)
      .reduce<typeof rewards[number] | null>(
        (closest, reward) =>
          !closest || reward.pointThreshold < closest.pointThreshold ? reward : closest,
        null,
      )
    : null;

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      setShowPinModal(true);
      setPinError(false);
    }
  };

  const handlePinComplete = async (pin: string) => {
    setIsAuthenticating(true);
    const success = await authenticate(pin);
    setIsAuthenticating(false);

    if (success) {
      setShowPinModal(false);
      navigate('/admin');
    } else {
      setPinError(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 via-cyan-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col bg-gradient-to-b from-sky-100 via-cyan-50 to-teal-50 relative overflow-hidden">
      {/* Decorative bubbles/clouds */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/40 rounded-full blur-xl" />
      <div className="absolute top-32 right-8 w-32 h-32 bg-cyan-200/30 rounded-full blur-2xl" />
      <div className="absolute bottom-40 left-5 w-24 h-24 bg-teal-200/30 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-16 w-16 h-16 bg-sky-200/40 rounded-full blur-lg" />

      {/* Header */}
      <header className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-bold text-cyan-800 mb-2">
          ✨ Chore Tracker ✨
        </h1>
        {family && (
          <div className="inline-flex items-center gap-2 text-lg text-cyan-600 font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <span>👨‍👩‍👧‍👦</span>
            <span>Family Points: {family.familyPoints}</span>
            {nextReward ? (
              <span className="text-sm text-cyan-700">
                Next Reward: {nextReward.description} — Target: {nextReward.pointThreshold} points
              </span>
            ) : rewards.length > 0 ? (
              <span className="text-sm text-cyan-700">All rewards claimed 🎉</span>
            ) : null}
          </div>
        )}
      </header>

      {/* Children Grid */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        {children.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mb-8">
            {children.map(child => (
              <ChildAvatarButton key={child.childId} child={child} />
            ))}
          </div>
        ) : (
          <div className="text-center text-cyan-700 bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-8">
            <p className="text-xl mb-4">No children added yet!</p>
            <p className="text-cyan-600">Tap the Admin button to get started.</p>
          </div>
        )}

        {/* Scripture Quote Banner */}
        <div className="w-full max-w-2xl">
          <ScriptureQuote />
        </div>
      </main>

      {/* Admin Button */}
      <footer className="mt-8 flex justify-center relative z-10">
        <Button
          onClick={handleAdminClick}
          variant="secondary"
          size="lg"
          className="gap-2 bg-white/80 hover:bg-white border-cyan-200 text-cyan-700 hover:text-cyan-800 shadow-lg backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin
        </Button>
      </footer>

      {/* PIN Modal */}
      <Modal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Enter Admin PIN"
      >
        <div className="space-y-6">
          <p className="text-gray-600 text-center">
            Enter your 4-digit PIN to access admin settings
          </p>
          <PinInput
            onComplete={handlePinComplete}
            error={pinError}
            disabled={isAuthenticating}
          />
          {pinError && (
            <p className="text-red-500 text-center text-sm">
              Incorrect PIN. Please try again.
            </p>
          )}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowPinModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
