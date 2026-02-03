import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { AdminProvider } from './context/AdminContext';
import { useAutoReturn } from './hooks/useAutoReturn';
import { Home } from './pages/Home';
import { ChildView } from './pages/ChildView';
import { AvatarStore } from './pages/AvatarStore';
import { Admin } from './pages/Admin';
import { Setup } from './pages/Setup';

function AppRoutes() {
  const { isLoading, isInitialized } = useFamily();

  // Auto-return to home after 3 minutes of inactivity
  useAutoReturn();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if not initialized
  if (!isInitialized) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/child/:childId" element={<ChildView />} />
      <Route path="/child/:childId/store" element={<AvatarStore />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/setup" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <FamilyProvider>
        <AdminProvider>
          <AppRoutes />
        </AdminProvider>
      </FamilyProvider>
    </BrowserRouter>
  );
}

export default App;
