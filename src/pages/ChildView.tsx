import { useParams, useNavigate } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';
import { AvatarDisplay } from '../components/avatar/AvatarDisplay';
import { Button } from '../components/ui/Button';

export function ChildView() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { children } = useFamily();

  const child = children.find(c => c.childId === childId);

  if (!child) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-xl text-gray-600 mb-4">Child not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Button>

        <div className="flex items-center gap-3">
          <AvatarDisplay config={child.avatarConfig} size="md" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">{child.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-indigo-600">⭐ {child.individualPoints} points</span>
              {child.currentStreak > 0 && (
                <span className="text-orange-500">🔥 {child.currentStreak} day streak</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Placeholder for chore list - will be implemented in next phase */}
      <main className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-500 text-lg mb-4">
          🏗️ Chore list coming soon!
        </p>
        <p className="text-gray-400">
          This is where {child.name}'s chores will appear based on the current time period.
        </p>
      </main>
    </div>
  );
}
