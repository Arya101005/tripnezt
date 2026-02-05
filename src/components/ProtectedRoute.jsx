import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, userProfile, loading, refreshProfile } = useAuth();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (user && !userProfile && retryCount < 5) {
      const timer = setTimeout(() => {
        refreshProfile();
        setRetryCount((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, userProfile, retryCount, refreshProfile]);

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

  // Auto-redirect if still loading profile
  if (!userProfile) {
    if (retryCount < 5) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#000080]">
          <div className="text-white text-lg">Setting up your profile...</div>
        </div>
      );
    }
    // After max retries, create a fallback profile
    return <Navigate to="/" replace />;
  }

  return children;
}
