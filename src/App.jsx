import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage';
import TripDetails from './pages/TripDetails';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminLeads from './pages/AdminLeads';
import WaitingApproval from './pages/WaitingApproval';
import About from './pages/About';
import Contact from './pages/Contact';
import Footer from './components/Footer';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-600 text-lg">Loading...</div>
    </div>
  );
}

function AuthRedirect({ children }) {
  const { user, userProfile, loading } = useAuth();
  if (loading) return <AuthLoadingScreen />;
  if (!user) return children;
  if (!userProfile) return <Navigate to="/" replace />;
  if (userProfile.role === 'admin' && userProfile.status === 'approved') return <Navigate to="/admin" replace />;
  if (userProfile.role === 'admin' && userProfile.status === 'pending') return <Navigate to="/waiting-approval" replace />;
  return <Navigate to="/" replace />;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar is already in each page */}
      {children}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRedirect><AuthPage /></AuthRedirect>} />
            <Route path="/" element={<HomePage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
            <Route path="/admin/leads" element={<AdminRoute><AdminLeads /></AdminRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/waiting-approval" element={<ProtectedRoute><WaitingApproval /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
