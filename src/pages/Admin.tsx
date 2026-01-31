import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useFamily } from '../context/FamilyContext';
import { Button } from '../components/ui/Button';

export function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAdmin();
  const { family, children, chores } = useFamily();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </header>

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
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-gray-500 text-sm">Pending Verifications</div>
        </div>
      </div>

      {/* Admin Sections - Placeholder */}
      <main className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Children', icon: '👦', desc: 'Manage children and avatars' },
          { title: 'Chore Library', icon: '📋', desc: 'Create and edit chores' },
          { title: 'Assignments', icon: '📅', desc: 'Assign chores to children' },
          { title: 'Verification', icon: '✅', desc: 'Verify completed chores' },
          { title: 'Time Periods', icon: '⏰', desc: 'Configure daily schedules' },
          { title: 'Avatar Store', icon: '🛍️', desc: 'Manage store and prices' },
          { title: 'Family Rewards', icon: '🎁', desc: 'Set up family rewards' },
          { title: 'Streak Settings', icon: '🔥', desc: 'Configure streak bonuses' },
          { title: 'Settings', icon: '⚙️', desc: 'App settings and data' },
        ].map(section => (
          <button
            key={section.title}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-3xl mb-2">{section.icon}</div>
            <h3 className="font-semibold text-gray-800">{section.title}</h3>
            <p className="text-sm text-gray-500">{section.desc}</p>
          </button>
        ))}
      </main>
    </div>
  );
}
