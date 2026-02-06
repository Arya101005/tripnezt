import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import AdminTrips from '../components/AdminTrips';
import logo from '../assets/logo.png';

export default function AdminDashboard() {
  const { userProfile, signOut } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeBookings: 0,
    totalUsers: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, trips, users

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tripsSnapshot = await getDocs(collection(db, 'trips'));
        
        // Store trips for recent trips section
        const tripsData = tripsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrips(tripsData);
        
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('status', 'in', ['Approved', 'Pending Review', 'In Discussion', 'Waitlisted'])
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        let revenue = 0;
        bookingsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.totalAmount) {
            revenue += data.totalAmount;
          }
        });
        
        const usersSnapshot = await getDocs(collection(db, 'users'));

        setStats({
          totalTrips: tripsSnapshot.size,
          activeBookings: bookingsSnapshot.size,
          totalUsers: usersSnapshot.size,
          revenue: revenue
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    if (userProfile?.role === 'admin' && userProfile?.status === 'approved') {
      fetchStats();
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  const handleApproveAdmin = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'approved' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'approved' } : u));
      showSuccess('Admin approved successfully!');
    } catch (err) {
      showError('Failed to approve admin');
    }
  };

  const handleRejectAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this admin request?')) {
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { status: 'rejected', role: 'user' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'rejected', role: 'user' } : u));
      showSuccess('Admin request rejected!');
    } catch (err) {
      showError('Failed to reject admin');
    }
  };

  // Handle edit trip from dashboard
  const handleEditTrip = (tripId) => {
    navigate(`/admin/trips?edit=${tripId}`);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      showSuccess(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully!`);
    } catch (err) {
      showError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      showSuccess('User deleted successfully!');
    } catch (err) {
      showError('Failed to delete user');
    }
  };

  // Bulk actions
  const toggleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUsers(prev => [...prev, userId]);
    }
  };

  const handleBulkBlock = async () => {
    if (selectedUsers.length === 0) {
      showError('Please select users first');
      return;
    }
    if (!window.confirm(`Block ${selectedUsers.length} user(s)?`)) {
      return;
    }
    try {
      await Promise.all(selectedUsers.map(async (userId) => {
        await updateDoc(doc(db, 'users', userId), { status: 'blocked' });
      }));
      setUsers(prev => prev.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'blocked' } : u));
      setSelectedUsers([]);
      showSuccess(`${selectedUsers.length} user(s) blocked!`);
    } catch (err) {
      showError('Failed to block users');
    }
  };

  const handleBulkUnblock = async () => {
    if (selectedUsers.length === 0) {
      showError('Please select users first');
      return;
    }
    if (!window.confirm(`Unblock ${selectedUsers.length} user(s)?`)) {
      return;
    }
    try {
      await Promise.all(selectedUsers.map(async (userId) => {
        await updateDoc(doc(db, 'users', userId), { status: 'active' });
      }));
      setUsers(prev => prev.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'active' } : u));
      setSelectedUsers([]);
      showSuccess(`${selectedUsers.length} user(s) unblocked!`);
    } catch (err) {
      showError('Failed to unblock users');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      showError('Please select users first');
      return;
    }
    if (!window.confirm(`Delete ${selectedUsers.length} user(s)? This cannot be undone.`)) {
      return;
    }
    try {
      await Promise.all(selectedUsers.map(async (userId) => {
        await deleteDoc(doc(db, 'users', userId));
      }));
      setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      showSuccess(`${selectedUsers.length} user(s) deleted!`);
    } catch (err) {
      showError('Failed to delete users');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                <span className="text-xl font-bold text-gray-900">Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-forest-green font-medium text-sm hidden sm:inline">Travel Partner</span>
              <span className="text-gray-600 text-sm hidden sm:inline">{userProfile?.email}</span>
              <div className="h-8 w-px bg-gray-200 hidden sm:block" />
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
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'overview'
                  ? 'text-forest-green border-b-2 border-forest-green'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`px-5 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'trips'
                  ? 'text-forest-green border-b-2 border-forest-green'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Trips
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-3 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'users'
                  ? 'text-forest-green border-b-2 border-forest-green'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-gray-500 mt-1">Manage your travel platform</p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
              <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Active Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
              <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => setActiveTab('trips')}
                  className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-forest-green/30 transition text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-forest-green/10 flex items-center justify-center group-hover:bg-forest-green/20 transition">
                      <svg className="w-5 h-5 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-900">Manage Trips</p>
                  </div>
                  <p className="text-gray-500 text-sm">Add, edit, or delete trips</p>
                </button>
                <button
                  onClick={() => navigate('/admin/leads')}
                  className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-forest-green/30 transition text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-forest-green/10 flex items-center justify-center group-hover:bg-forest-green/20 transition">
                      <svg className="w-5 h-5 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-900">View Leads</p>
                  </div>
                  <p className="text-gray-500 text-sm">Manage booking enquiries</p>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="rounded-xl p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-forest-green/30 transition text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-forest-green/10 flex items-center justify-center group-hover:bg-forest-green/20 transition">
                      <svg className="w-5 h-5 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-900">User Management</p>
                  </div>
                  <p className="text-gray-500 text-sm">View and manage users</p>
                </button>
              </div>
            </div>

            {/* Recent Trips with Edit Buttons */}
            {stats.totalTrips > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Trips</h3>
                  <button
                    onClick={() => setActiveTab('trips')}
                    className="text-forest-green text-sm font-medium hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {trips.slice(0, 5).map((trip) => (
                      <div key={trip.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                        <img
                          src={trip.imageUrl || 'https://via.placeholder.com/60'}
                          alt={trip.title}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{trip.title}</p>
                          <p className="text-sm text-gray-500">{trip.location}, {trip.state}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">₹{trip.price?.toLocaleString()}</span>
                          <button
                            onClick={() => {
                              setActiveTab('trips');
                              setTimeout(() => {
                                const editBtn = document.querySelector(`[data-trip-id="${trip.id}"]`);
                                if (editBtn) editBtn.click();
                              }, 100);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-forest-green text-white hover:bg-forest-green/90 transition text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-gray-900">User Management</h2>
              <p className="text-gray-500 mt-1">Manage platform users and admin requests</p>
            </div>

            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
              <div className="mb-4 p-4 bg-forest-green/10 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkBlock}
                    className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 transition"
                  >
                    Block
                  </button>
                  <button
                    onClick={handleBulkUnblock}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                  >
                    Unblock
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          {user.role !== 'admin' && (
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                              className="rounded border-gray-300 text-forest-green focus:ring-forest-green"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest-green to-teal-400 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : user.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {/* Admin Request Actions */}
                            {user.role === 'admin' && user.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleRejectAdmin(user.id)}
                                  className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 transition"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApproveAdmin(user.id)}
                                  className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-800 transition"
                                >
                                  Approve
                                </button>
                              </>
                            ) : user.role !== 'admin' ? (
                              <>
                                {user.status !== 'blocked' && (
                                  <button
                                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                                    className="px-3 py-1 text-xs font-medium text-yellow-600 hover:text-yellow-800 transition"
                                  >
                                    Block
                                  </button>
                                )}
                                {user.status === 'blocked' && (
                                  <button
                                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                                    className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-800 transition"
                                  >
                                    Unblock
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 transition"
                                >
                                  Delete
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No users found.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AdminTrips />
        )}
      </main>
    </div>
  );
}
