import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// Memoized component to prevent unnecessary re-renders
const UserDashboard = memo(() => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        // Fallback without ordering
        try {
          const q2 = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid)
          );
          const snapshot = await getDocs(q2);
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setBookings(bookingsData);
        } catch (err2) {
          console.error('Error fetching bookings (fallback):', err2);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);
  
  const getStatusDot = (status) => {
    const colors = {
      'Approved': 'bg-green-500',
      'Pending Review': 'bg-amber-500',
      'In Discussion': 'bg-blue-500',
      'Waitlisted': 'bg-orange-500',
      'Rejected': 'bg-red-500',
      'Cancelled': 'bg-gray-500',
      'Completed': 'bg-emerald-500',
    };
    return colors[status] || 'bg-gray-400';
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-forest-green to-teal-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
              {userProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {userProfile?.name || 'User'}
              </h1>
              <p className="text-gray-500 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-forest-green/10 text-forest-green text-xs font-medium rounded-full flex-shrink-0">
                  Member
                </span>
                {userProfile?.createdAt && (
                  <span className="text-gray-400 text-xs whitespace-nowrap">
                    Since {new Date(userProfile.createdAt).getFullYear()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Bookings</h2>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start exploring our amazing trips!</p>
            <Link 
              to="/trips"
              className="inline-flex items-center px-6 py-3 bg-forest-green text-white rounded-lg hover:bg-forest-green-dark transition-colors"
            >
              Explore Trips
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${getStatusDot(booking.status)}`} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {booking.tripName || 'Trip Booking'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="whitespace-nowrap">{formatDate(booking.travelDate || booking.createdAt)}</span>
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
                        </span>
                        {booking.totalAmount && (
                          <span className="text-forest-green font-medium flex-shrink-0">
                            ₹{booking.totalAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      booking.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending Review' ? 'bg-amber-100 text-amber-800' :
                      booking.status === 'In Discussion' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'Waitlisted' ? 'bg-orange-100 text-orange-800' :
                      booking.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'Pending'}
                    </span>
                    <Link
                      to={`/trip/${booking.tripId}`}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
                    >
                      View Trip
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default UserDashboard;
