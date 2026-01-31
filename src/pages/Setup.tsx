import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';
import { Button } from '../components/ui/Button';
import { PinInput } from '../components/ui/PinInput';
import { AvatarDisplay } from '../components/avatar/AvatarDisplay';
import { avatarService } from '../services/avatar';
import { hashPin } from '../utils/pin';
import { generateId } from '../utils/id';
import type { Child, TimePeriod, Family } from '../types';
import { DEFAULT_TIME_PERIODS } from '../types';

type SetupStep = 'welcome' | 'pin' | 'children' | 'complete';

export function Setup() {
  const navigate = useNavigate();
  const { initializeFamily, addChild } = useFamily();

  const [step, setStep] = useState<SetupStep>('welcome');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [newChildName, setNewChildName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePinSet = (enteredPin: string) => {
    if (!pin) {
      setPin(enteredPin);
      setPinError('');
    } else {
      if (enteredPin === pin) {
        setStep('children');
      } else {
        setPinError('PINs do not match. Please try again.');
        setPin('');
      }
    }
  };

  const handleAddChild = () => {
    if (!newChildName.trim()) return;

    const familyId = 'default';
    const newChild: Child = {
      childId: generateId(),
      familyId,
      name: newChildName.trim(),
      avatarConfig: avatarService.generateRandomConfig(),
      individualPoints: 0,
      totalPointsEarned: 0,
      currentStreak: 0,
      lastStreakDate: null,
      createdAt: new Date().toISOString(),
    };

    setChildren(prev => [...prev, newChild]);
    setNewChildName('');
  };

  const handleRemoveChild = (childId: string) => {
    setChildren(prev => prev.filter(c => c.childId !== childId));
  };

  const handleComplete = async () => {
    if (children.length === 0) return;

    setIsLoading(true);

    try {
      const familyId = 'default';

      // Create family with hashed PIN
      const hashedPin = await hashPin(pin);
      const family: Family = {
        familyId,
        adminPin: hashedPin,
        familyPoints: 0,
        streakBonusPoints: 50, // Default from PRD
        createdAt: new Date().toISOString(),
      };

      // Create time periods
      const timePeriods: TimePeriod[] = DEFAULT_TIME_PERIODS.map(p => ({
        ...p,
        familyId,
      }));

      // Initialize family and save time periods
      await initializeFamily(family, timePeriods);

      // Add all children
      for (const child of children) {
        await addChild(child);
      }

      setStep('complete');
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🏠</div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Chore Tracker!</h1>
            <p className="text-gray-600">
              Let's set up your family's chore tracking system. It only takes a few minutes!
            </p>
            <Button size="lg" onClick={() => setStep('pin')} className="w-full">
              Get Started
            </Button>
          </div>
        )}

        {/* PIN Setup Step */}
        {step === 'pin' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {!pin ? 'Create Admin PIN' : 'Confirm Your PIN'}
              </h2>
              <p className="text-gray-600">
                {!pin
                  ? 'This PIN protects parent settings.'
                  : 'Enter the same PIN again to confirm.'}
              </p>
            </div>

            <PinInput
              key={pin ? 'confirm' : 'create'}
              onComplete={handlePinSet}
              error={!!pinError}
            />

            {pinError && (
              <p className="text-red-500 text-center text-sm">{pinError}</p>
            )}

            <Button variant="ghost" onClick={() => setStep('welcome')} className="w-full">
              Back
            </Button>
          </div>
        )}

        {/* Children Setup Step */}
        {step === 'children' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">👦👧</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Your Children</h2>
              <p className="text-gray-600">Add at least one child to get started.</p>
            </div>

            {/* Child list */}
            {children.length > 0 && (
              <div className="space-y-3">
                {children.map(child => (
                  <div
                    key={child.childId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <AvatarDisplay config={child.avatarConfig} size="md" />
                    <span className="flex-1 font-medium text-gray-800">{child.name}</span>
                    <button
                      onClick={() => handleRemoveChild(child.childId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Remove ${child.name}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add child form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newChildName}
                onChange={e => setNewChildName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddChild()}
                placeholder="Enter child's name"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
              <Button onClick={handleAddChild} disabled={!newChildName.trim()}>
                Add
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep('pin')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={children.length === 0 || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800">You're All Set!</h2>
            <p className="text-gray-600">
              Your family chore tracker is ready to go. You can add chores and customize settings in the Admin section.
            </p>
            <Button size="lg" onClick={handleFinish} className="w-full">
              Start Using Chore Tracker
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
