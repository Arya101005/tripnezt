import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function BookingModal({ trip, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    whatsappNumber: '',
    travelDate: '',
    guests: '2',
    notes: '',
  });

  // Check availability when trip or guests change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!trip || !formData.travelDate) return;
      
      const guests = parseInt(formData.guests) || 1;
      const tripRef = doc(db, 'trips', trip.id);
      const tripSnap = await getDoc(tripRef);
      
      if (tripSnap.exists()) {
        const tripData = tripSnap.data();
        const bookedSeats = tripData.bookedSeats || 0;
        const totalSeats = tripData.totalSeats || 999; // Default to unlimited if not set
        const availableSeats = totalSeats - bookedSeats;
        
        setAvailability({
          available: availableSeats >= guests,
          availableSeats,
          totalSeats,
          bookedSeats,
          guestsRequested: guests
        });
      }
    };
    
    checkAvailability();
  }, [trip, formData.travelDate, formData.guests]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const guests = parseInt(formData.guests) || 1;
      
      // Check availability one more time
      const tripRef = doc(db, 'trips', trip.id);
      const tripSnap = await getDoc(tripRef);
      
      if (tripSnap.exists()) {
        const tripData = tripSnap.data();
        const bookedSeats = tripData.bookedSeats || 0;
        const totalSeats = tripData.totalSeats || 999;
        const autoApprove = tripData.autoApprove || false;
        const waitlistThreshold = tripData.waitlistThreshold || 2;
        
        const availableSeats = totalSeats - bookedSeats;
        
        // Determine status based on availability
        let status;
        if (availableSeats >= guests) {
          status = autoApprove ? 'Approved' : 'Pending Review';
        } else if (availableSeats >= waitlistThreshold) {
          status = 'Waitlisted';
        } else {
          status = 'Rejected';
        }
        
        // Save booking to Firestore
        await addDoc(collection(db, 'bookings'), {
          tripId: trip.id,
          tripName: trip.title,
          tripPrice: trip.price,
          tripDate: trip.date || formData.travelDate,
          userId: user?.uid || 'guest',
          userEmail: user?.email || '',
          userName: formData.fullName,
          ...formData,
          whatsappNumber: '+91' + formData.whatsappNumber,
          status,
          guests,
          totalAmount: trip.price ? trip.price * guests : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // If approved, decrement available seats
        if (status === 'Approved') {
          await updateDoc(tripRef, {
            bookedSeats: increment(guests)
          });
        }

        // Log audit trail - skip for regular users
        // await addDoc(collection(db, 'auditLogs'), {
        //   action: 'booking_created',
        //   bookingId: trip.id,
        //   userId: user?.uid || 'guest',
        //   details: {
        //     tripName: trip.title,
        //     guests,
        //     status,
        //     travelDate: formData.travelDate
        //   },
        //   createdAt: serverTimestamp()
        // });
      }

      showToast({
        type: 'success',
        title: 'Booking Requested!',
        message: 'We will review and get back to you shortly.',
      });

      onClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to submit booking. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">Book Your Trip</h2>
              <p className="text-gray-500 text-sm mt-1">{trip.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-600">
                  +91
                </span>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  required
                  placeholder="WhatsApp number"
                  maxLength={10}
                  className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Date
              </label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all"
              />
            </div>

            {/* Number of Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <select
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requirements or queries..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Availability Info */}
            {availability && (
              <div className={`p-4 rounded-xl border ${availability.available ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-3">
                  {availability.available ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <div>
                    <p className={`font-medium ${availability.available ? 'text-green-800' : 'text-amber-800'}`}>
                      {availability.available 
                        ? `${availability.availableSeats} seats available!`
                        : `Only ${availability.availableSeats} seats left - you'll be waitlisted`
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      Total seats: {availability.totalSeats} | Booked: {availability.bookedSeats}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-forest-green to-teal-500 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:shadow-forest-green/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Booking Request'
              )}
            </button>

            <p className="text-center text-gray-500 text-sm">
              We will contact you within 2 hours on WhatsApp
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
