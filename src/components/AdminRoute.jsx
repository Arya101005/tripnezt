import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000080]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000080]">
        <div className="text-white text-lg">Setting up your profile...</div>
      </div>
    );
  }

  if (userProfile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (userProfile.status === 'pending') {
    return <Navigate to="/waiting-approval" replace />;
  }

  return children;
}
