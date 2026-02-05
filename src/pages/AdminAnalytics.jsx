import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import logo from '../assets/logo.png';

// Simple bar chart component
const SimpleBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end justify-between h-40 gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div 
            className="w-full bg-gradient-to-t from-forest-green to-teal-400 rounded-t-md transition-all duration-500"
            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: item.value > 0 ? '4px' : '0' }}
          />
          <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Memoized component
const AdminAnalytics = () => {
  const { userProfile, signOut } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEnquiries: 0,
    conversionRate: 0,
    revenue: 0,
    pendingAdmins: []
  });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, users
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile || userProfile.role !== 'admin' || userProfile.status !== 'approved') {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;
        
        // Fetch all bookings
        const bookingsQuery = query(collection(db, 'bookings'));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const allBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate current month enquiries
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentMonthEnquiries = allBookings.filter(b => {
          const createdAt = b.createdAt?.toDate?.();
          return createdAt && createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        }).length;
        
        // Calculate conversion rate
        const approvedBookings = allBookings.filter(b => b.status === 'Approved').length;
        const conversionRate = currentMonthEnquiries > 0 ? Math.round((approvedBookings / currentMonthEnquiries) * 100) : 0;
        
        // Calculate revenue from approved bookings
        const revenue = allBookings
          .filter(b => b.status === 'Approved' && b.totalAmount)
          .reduce((sum, b) => sum + b.totalAmount, 0);
        
        // Fetch pending admin requests
        const pendingAdminsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'admin'),
          where('status', '==', 'pending')
        );
        const pendingAdminsSnapshot = await getDocs(pendingAdminsQuery);
        const pendingAdmins = pendingAdminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setStats({
          totalUsers,
          totalEnquiries: currentMonthEnquiries,
          conversionRate,
          revenue,
          pendingAdmins
        });
        
        setBookings(allBookings);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userProfile]);
  
  // Calculate booking trends (last 7 days)
  const getBookingTrends = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const trends = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = bookings.filter(b => {
        const createdAt = b.createdAt?.toDate?.();
        return createdAt && createdAt.toISOString().split('T')[0] === dateStr;
      }).length;
      
      trends.push({
        label: days[date.getDay()],
        value: count
      });
    }
    
    return trends;
  };
  
  const handleApproveAdmin = async (adminId) => {
    try {
      await updateDoc(doc(db, 'users', adminId), { status: 'approved' });
      setStats(prev => ({
        ...prev,
        pendingAdmins: prev.pendingAdmins.filter(a => a.id !== adminId)
      }));
      showSuccess('Admin approved successfully!');
    } catch (err) {
      showError('Failed to approve admin');
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-forest-green border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-forest-green transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <img src={logo} alt="TripNezt" className="h-8 w-auto" />
                <span className="text-xl font-bold text-gray-900">Analytics</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm hidden sm:inline">{userProfile?.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-forest-green hover:text-forest-green transition text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'analytics'
                  ? 'text-forest-green border-b-2 border-forest-green'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'users'
                  ? 'text-forest-green border-b-2 border-forest-green'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User Management
            </button>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analytics' ? (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Enquiries (This Month)</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnquiries}</p>
              </div>
              <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
              <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Booking Trends Chart */}
            <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends (Last 7 Days)</h3>
              <SimpleBarChart data={getBookingTrends()} />
            </div>
            
            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => navigate('/admin/leads')}
                className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-forest-green/30 transition text-left"
              >
                <p className="font-semibold text-gray-900">Manage Leads</p>
                <p className="text-gray-500 text-sm mt-1">View and update booking enquiries</p>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-forest-green/30 transition text-left"
              >
                <p className="font-semibold text-gray-900">User Management</p>
                <p className="text-gray-500 text-sm mt-1">Approve admin requests</p>
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-forest-green/30 transition text-left"
              >
                <p className="font-semibold text-gray-900">Manage Trips</p>
                <p className="text-gray-500 text-sm mt-1">Add, edit, or delete trips</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            
            {/* Pending Admin Requests */}
            {stats.pendingAdmins.length > 0 && (
              <div className="rounded-xl p-6 bg-amber-50 border border-amber-100">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">Pending Admin Approvals</h3>
                <div className="space-y-4">
                  {stats.pendingAdmins.map(admin => (
                    <div key={admin.id} className="flex items-center justify-between bg-white rounded-lg p-4">
                      <div>
                        <p className="font-medium text-gray-900">{admin.name || 'No name'}</p>
                        <p className="text-gray-500 text-sm">{admin.email}</p>
                      </div>
                      <button
                        onClick={() => handleApproveAdmin(admin.id)}
                        className="px-4 py-2 bg-forest-green text-white rounded-lg hover:bg-forest-green-dark transition text-sm font-medium"
                      >
                        Verify
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Users Table */}
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Users would be listed here - for now showing placeholder */}
                  <tr className="border-t border-gray-100">
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Full user list would appear here
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default memo(AdminAnalytics);
