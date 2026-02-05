import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// GitHub SVG Icon
const GitHubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Detect scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg' 
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* GitHub Link */}
          <a
            href="https://github.com/Arya101005/tripnezt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <GitHubIcon className="h-8 w-8 text-gray-700 group-hover:text-black transition-colors" />
            <span className="text-2xl font-bold bg-gradient-to-r from-forest-green to-teal-500 bg-clip-text text-transparent hidden lg:block">
              TripNezt
            </span>
          </a>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-forest-green transition-colors font-medium">
              Home
            </Link>
            <Link to="/trips" className="text-gray-700 hover:text-forest-green transition-colors font-medium">
              Explore Trips
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-forest-green transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-forest-green transition-colors font-medium">
              Contact
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <Link
                  to="/my-bookings"
                  className="text-gray-700 hover:text-forest-green transition font-medium"
                >
                  My Bookings
                </Link>
                
                {/* User Avatar with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest-green to-teal-400 flex items-center justify-center shadow-lg shadow-forest-green/20">
                      <span className="text-white font-semibold">
                        {userProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userProfile?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Account
                        </Link>
                        <Link
                          to="/my-bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          My Bookings
                        </Link>
                      </div>
                      
                      {/* Admin Links */}
                      {userProfile?.role === 'admin' && userProfile?.status === 'approved' && (
                        <>
                          <div className="border-t border-gray-100 pt-2 mt-2">
                            <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider">Admin</p>
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                              </svg>
                              Admin Dashboard
                            </Link>
                            <Link
                              to="/admin/analytics"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Analytics
                            </Link>
                            <Link
                              to="/admin/leads"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-forest-green hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-5 h-5 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Leads
                            </Link>
                          </div>
                        </>
                      )}
                      
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-forest-green to-teal-500 text-white font-semibold hover:shadow-xl hover:shadow-forest-green/30 transition-all duration-300"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link
              to="/trips"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Trips
            </Link>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Bookings
                </Link>
                
                {userProfile?.role === 'admin' && userProfile?.status === 'approved' && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-forest-green hover:bg-gray-50 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                      </svg>
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/analytics"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-forest-green hover:bg-gray-50 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Analytics
                    </Link>
                    <Link
                      to="/admin/leads"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-forest-green hover:bg-gray-50 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Leads
                    </Link>
                  </>
                )}
                
                <div className="px-4 py-2 text-gray-500">
                  Signed in as: {userProfile?.name || user?.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block w-full px-4 py-3 rounded-xl bg-gradient-to-r from-forest-green to-teal-500 text-white text-center font-semibold"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
