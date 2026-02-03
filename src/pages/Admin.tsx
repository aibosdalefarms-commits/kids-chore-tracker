import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useFamily } from '../context/FamilyContext';
import { Button } from '../components/ui/Button';
import { ChoreLibrary } from '../components/admin/ChoreLibrary';
import { ChoreAssignments } from '../components/admin/ChoreAssignments';
import { VerificationCenter } from '../components/admin/VerificationCenter';
import { ChildrenManager } from '../components/admin/ChildrenManager';
import { TimePeriodSettings } from '../components/admin/TimePeriodSettings';
import { FamilyRewards } from '../components/admin/FamilyRewards';
import { AvatarStoreAdmin } from '../components/admin/AvatarStoreAdmin';
import { SideQuests } from '../components/admin/SideQuests';
import { Settings } from '../components/admin/Settings';
import { dataService } from '../services/data';

type AdminSection = 'dashboard' | 'chores' | 'assignments' | 'children' | 'verification' | 'time-periods' | 'store' | 'rewards' | 'side-quests' | 'settings';

export function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAdmin();
  const { family, children, chores } = useFamily();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const loadPendingCount = async () => {
      const pending = await dataService.getPendingCompletions();
      setPendingCount(pending.length);
    };
    loadPendingCount();
  }, [activeSection]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sections = [
    { id: 'verification' as const, title: 'Verification', icon: '✅', desc: 'Verify completed chores', badge: pendingCount },
    { id: 'chores' as const, title: 'Chore Library', icon: '📋', desc: 'Create and edit chores' },
    { id: 'assignments' as const, title: 'Assignments', icon: '📅', desc: 'Assign chores to children' },
    { id: 'side-quests' as const, title: 'Side Quests', icon: '🎯', desc: 'One-off tasks for children' },
    { id: 'children' as const, title: 'Children', icon: '👦', desc: 'Manage children and avatars' },
    { id: 'time-periods' as const, title: 'Time Periods', icon: '⏰', desc: 'Configure daily schedules' },
    { id: 'store' as const, title: 'Avatar Store', icon: '🛍️', desc: 'Manage store and prices' },
    { id: 'rewards' as const, title: 'Family Rewards', icon: '🎁', desc: 'Set up family rewards' },
    { id: 'settings' as const, title: 'Settings', icon: '⚙️', desc: 'App settings and data' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'chores':
        return <ChoreLibrary />;
      case 'assignments':
        return <ChoreAssignments />;
      case 'side-quests':
        return <SideQuests />;
      case 'verification':
        return <VerificationCenter />;
      case 'children':
        return <ChildrenManager />;
      case 'time-periods':
        return <TimePeriodSettings />;
      case 'rewards':
        return <FamilyRewards />;
      case 'store':
        return <AvatarStoreAdmin />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-3xl font-bold text-indigo-600">{children.length}</div>
                <div className="text-gray-500 text-sm">Children</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-3xl font-bold text-green-600">{chores.length}</div>
                <div className="text-gray-500 text-sm">Chores</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-3xl font-bold text-orange-600">{family?.familyPoints || 0}</div>
                <div className="text-gray-500 text-sm">Family Points</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-3xl font-bold text-purple-600">{pendingCount}</div>
                <div className="text-gray-500 text-sm">Pending Verifications</div>
              </div>
            </div>

            {/* Section Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="bg-white rounded-xl p-6 shadow-md text-left transition-all relative hover:shadow-lg hover:scale-[1.02]"
                >
                  {section.badge !== undefined && section.badge > 0 && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {section.badge}
                    </span>
                  )}
                  <div className="text-3xl mb-2">{section.icon}</div>
                  <h3 className="font-semibold text-gray-800">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.desc}</p>
                </button>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        {activeSection === 'dashboard' ? (
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setActiveSection('dashboard')} className="gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        )}

        <h1 className="text-2xl font-bold text-gray-800">
          {activeSection === 'dashboard' ? 'Admin Dashboard' : sections.find(s => s.id === activeSection)?.title || 'Admin'}
        </h1>

        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      {/* Content */}
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
