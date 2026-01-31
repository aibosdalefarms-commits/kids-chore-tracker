import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../../context/FamilyContext';
import { useAdmin } from '../../context/AdminContext';
import { ChildAvatarButton } from './ChildAvatarButton';
import { Modal } from '../ui/Modal';
import { PinInput } from '../ui/PinInput';
import { Button } from '../ui/Button';

export function HomeScreen() {
  const navigate = useNavigate();
  const { children, family, isLoading } = useFamily();
  const { isAuthenticated, authenticate } = useAdmin();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ✨ Chore Tracker ✨
        </h1>
        {family && (
          <div className="flex items-center justify-center gap-2 text-lg text-indigo-600 font-medium">
            <span>👨‍👩‍👧‍👦</span>
            <span>Family Points: {family.familyPoints}</span>
          </div>
        )}
      </header>

      {/* Children Grid */}
      <main className="flex-1 flex items-center justify-center">
        {children.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl">
            {children.map(child => (
              <ChildAvatarButton key={child.childId} child={child} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-xl mb-4">No children added yet!</p>
            <p>Tap the Admin button to get started.</p>
          </div>
        )}
      </main>

      {/* Admin Button */}
      <footer className="mt-8 flex justify-center">
        <Button
          onClick={handleAdminClick}
          variant="secondary"
          size="lg"
          className="gap-2"
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
