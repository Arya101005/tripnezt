import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function WaitingApproval() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000080] via-[#000060] to-[#000040] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">TripNezt</h1>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition text-sm"
        >
          Sign out
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className="max-w-lg w-full rounded-2xl p-8 sm:p-10 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#FF9933]/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Waiting for Approval</h2>
          <p className="text-white/80 mb-6">
            Your Travel Partner (Admin) account is under review. Our primary admin will verify your application and approve access to the Admin Dashboard soon.
          </p>
          <p className="text-white/60 text-sm">
            Logged in as <span className="text-white/90">{userProfile?.email}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
