import { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, addDoc, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import AdminRoute from '../components/AdminRoute';
import { sendLeadMessage, MESSAGE_TEMPLATES } from '../utils/whatsapp';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = [
  { value: 'Pending Review', label: 'Pending Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'In Discussion', label: 'In Discussion', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'Waitlisted', label: 'Waitlisted', color: 'bg-amber-100 text-amber-800' },
  { value: 'Rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
];

export default function AdminLeads() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [customMessage, setCustomMessage] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    // Fetch without ordering to avoid index error
    const fetchBookings = async () => {
      try {
        const q = query(collection(db, 'bookings'));
        const snapshot = await getDocs(q);
        let bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort client-side by createdAt
        bookingsData.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return bDate - aDate;
        });
        
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus, booking) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const oldStatus = booking.status;
      
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Update local state immediately
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));

      // Update trip seat count
      if (booking.tripId) {
        const tripRef = doc(db, 'trips', booking.tripId);
        const tripSnap = await getDoc(tripRef);
        
        if (tripSnap.exists()) {
          // If moving to Approved from non-approved, increment seats
          if (newStatus === 'Approved' && oldStatus !== 'Approved') {
            await updateDoc(tripRef, {
              bookedSeats: increment(booking.guests || 1)
            });
          }
          // If moving from Approved to non-approved, decrement seats
          else if (oldStatus === 'Approved' && newStatus !== 'Approved') {
            await updateDoc(tripRef, {
              bookedSeats: increment(-(booking.guests || 1))
            });
          }
        }
      }

      // Log audit trail
      await addDoc(collection(db, 'auditLogs'), {
        action: 'status_changed',
        bookingId,
        details: {
          oldStatus,
          newStatus,
          tripName: booking.tripName,
          guests: booking.guests
        },
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openMessageModal = (booking) => {
    setSelectedLead(booking);
    setSelectedTemplate('welcome');
    setCustomMessage('');
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!selectedLead) return;
    
    setSendingMessage(selectedLead.id);
    try {
      const message = selectedTemplate === 'custom' 
        ? customMessage 
        : null; // Use template default
      
      await sendLeadMessage(selectedLead, selectedTemplate, {
        name: selectedLead.fullName,
        tripName: selectedLead.tripName,
        date: selectedLead.travelDate ? new Date(selectedLead.travelDate).toLocaleDateString('en-IN') : '',
        guests: selectedLead.guests || 1,
        amount: selectedLead.totalPrice || 'TBD',
        location: selectedLead.pickupLocation || 'TBD'
      });
      
      showToast('WhatsApp message sent successfully!', 'success');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send WhatsApp message: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setSendingMessage(null);
    }
  };



  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Lead Management</h1>
            <p className="text-gray-500 mt-1">Manage all booking enquiries</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {bookings.filter(b => b.status === 'Pending Review').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">In Discussion</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {bookings.filter(b => b.status === 'In Discussion').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {bookings.filter(b => b.status === 'Approved').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Waitlisted</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {bookings.filter(b => b.status === 'Waitlisted').length}
              </p>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-forest-green border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-500 mt-4">Loading leads...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Trip</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Contact</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{formatDate(booking.createdAt)}</p>
                          <p className="text-xs text-gray-500">
                            {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-medium text-gray-900">{booking.fullName}</p>
                          <p className="text-xs text-gray-500">{booking.userEmail || 'Guest'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900 max-w-xs truncate">{booking.tripName}</p>
                          <p className="text-xs text-gray-500">
                            {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-IN') : '-'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{booking.whatsappNumber}</p>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value, booking)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-forest-green ${
                              STATUS_OPTIONS.find(s => s.value === booking.status)?.color || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            {/* WhatsApp API Button */}
                            <button
                              onClick={() => openMessageModal(booking)}
                              disabled={sendingMessage === booking.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              title="Send message via WhatsApp API"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              {sendingMessage === booking.id ? 'Sending...' : 'API'}
                            </button>
                            
                            {/* WhatsApp Web Button */}
                            <a
                              href={`https://wa.me/${booking.whatsappNumber?.replace(/\D/g, '')}?text=Namaste%20${encodeURIComponent(booking.fullName)}!%20%F0%9F%99%82%0A%0AGreetings%20from%20Tripnezt%20-%20Your%20Trusted%20Travel%20Partner!%0A%0AThank%20you%20for%20your%20interest%20in%20${encodeURIComponent(booking.tripName)}.%0A%0AHow%20can%20I%20assist%20you%20today%3F`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#20BD5A] transition-colors"
                              title="Open WhatsApp Web"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              Web
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Message Modal */}
        {showMessageModal && selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Send WhatsApp Message to {selectedLead.fullName}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplate === 'custom' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your message..."
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {selectedLead.whatsappNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Trip:</strong> {selectedLead.tripName}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
