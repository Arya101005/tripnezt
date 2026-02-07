import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import logo from '../assets/logo.png';

const AUTH_IMAGE_URL = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1920';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [signupType, setSignupType] = useState('user'); // 'user' or 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const { signIn, signUp, signOut } = useAuth();
  const { showError, showSuccess } = useToast();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phoneNumber } = form;
    if (!email?.trim() || !password?.trim()) {
      showError('Please enter email and password.');
      return;
    }
    if (!isLogin && !name?.trim()) {
      showError('Please enter your name.');
      return;
    }

    try {
      if (isLogin) {
        await signIn(email.trim(), password);
        showSuccess('Welcome back!');
      } else {
        const applyAsAdmin = signupType === 'admin';
        await signUp(email.trim(), password, {
          name: name.trim(),
          phoneNumber: phoneNumber?.trim() || '',
          applyAsAdmin,
        });
        
        // Sign out after signup so user can login properly
        await signOut();
        
        // Switch to login mode and show success message
        setIsLogin(true);
        if (applyAsAdmin) {
          showSuccess('Application submitted! Please login after admin approval.');
        } else {
          showSuccess('Account created! Please login.');
        }
      }
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : err.code === 'auth/weak-password'
            ? 'Password should be at least 6 characters.'
            : err.code === 'auth/user-not-found'
              ? 'No account found with this email.'
              : err.code === 'auth/admin-not-approved'
                ? err.message || 'Your admin account is pending approval.'
                : err.message || 'Something went wrong.';
      showError(msg);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail?.trim()) {
      showError('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSent(true);
      showSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      const msg = err.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : err.message || 'Failed to send reset email.';
      showError(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Cultural image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${AUTH_IMAGE_URL})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <img src={logo} alt="TripNezt" className="h-12 w-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold mb-2">Discover India</h2>
          <p className="text-white/90 max-w-sm">Your journey to heritage, backwaters, and adventure starts here.</p>
        </div>
      </div>

      {/* Right: Auth card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img src={logo} alt="TripNezt" className="h-10 w-auto" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">TripNezt</h1>
            <p className="text-gray-500 mt-1 text-sm">Indian Travel Booking</p>
          </div>

          {/* Tab Switch */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign up
            </button>
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">I want to sign up as:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSignupType('user')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    signupType === 'user'
                      ? 'border-forest-green bg-forest-green/5 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">Regular User</p>
                  <p className="text-xs text-gray-500 mt-1">Book trips & experiences</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSignupType('admin')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    signupType === 'admin'
                      ? 'border-forest-green bg-forest-green/5 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">Travel Partner</p>
                  <p className="text-xs text-gray-500 mt-1">Manage trips & bookings</p>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition"
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {signupType === 'admin' && !isLogin && (
              <div className="p-3 rounded-lg bg-forest-green/5 border border-forest-green/20">
                <p className="text-xs text-gray-600">
                  <strong>Travel Partner Note:</strong> Your account will be reviewed by the primary admin before you can access the admin dashboard.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-forest-green to-teal-500 hover:shadow-lg hover:shadow-forest-green/30 transition-all duration-300"
            >
              {isLogin ? 'Login' : `Create ${signupType === 'admin' ? 'Partner' : 'User'} Account`}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm">
            {isLogin && !showForgotPassword && (
              <>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-forest-green font-medium hover:underline"
                >
                  Forgot password?
                </button>
                <span className="mx-2">|</span>
              </>
            )}
            {showForgotPassword ? (
              <span
                onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(''); }}
                className="text-forest-green font-medium hover:underline cursor-pointer"
              >
                Back to Login
              </span>
            ) : (
              <>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-forest-green font-medium hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Login'}
                </button>
              </>
            )}
          </p>

          {/* Forgot Password Form */}
          {showForgotPassword && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Reset Password</h3>
              {resetSent ? (
                <div className="text-center py-4">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">Check your email for reset instructions.</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition mb-3"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-forest-green to-teal-500 hover:shadow-lg transition-all duration-300"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
