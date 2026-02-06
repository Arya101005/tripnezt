import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BookingModal from '../components/BookingModal';
import TripCard from '../components/TripCard';

// Default gallery images as fallback
const DEFAULT_GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800',
  'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800',
  'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=800',
  'https://images.unsplash.com/photo-1509607742256-5bc7cb0129a8?q=80&w=800',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800',
];

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [relatedTrips, setRelatedTrips] = useState([]);
  const [relatedImages, setRelatedImages] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const docRef = doc(db, 'trips', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const tripData = { id: docSnap.id, ...docSnap.data() };
          setTrip(tripData);
          
          // Fetch related trips based on category
          if (tripData.category) {
            fetchRelatedTrips(tripData.category, id);
          }
          
          // Fetch related images based on location/state
          if (!tripData.gallery || tripData.gallery.length === 0) {
            fetchRelatedImages(tripData.location || tripData.state, tripData.category);
          }
        }
      } catch (err) {
        console.error('Error fetching trip:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRelatedTrips = async (category, currentId) => {
      try {
        const q = query(
          collection(db, 'trips'),
          where('category', '==', category),
          limit(4)
        );
        const snapshot = await getDocs(q);
        const trips = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(t => t.id !== currentId)
          .slice(0, 3);
        setRelatedTrips(trips);
      } catch (err) {
        console.error('Error fetching related trips:', err);
      }
    };
    
    const fetchRelatedImages = async (location, category) => {
      // Fetch gallery images from related trips with same location/category
      try {
        let q;
        if (location) {
          q = query(
            collection(db, 'trips'),
            where('location', '==', location),
            limit(6)
          );
        } else if (category) {
          q = query(
            collection(db, 'trips'),
            where('category', '==', category),
            limit(6)
          );
        }
        
        if (q) {
          const snapshot = await getDocs(q);
          const images = snapshot.docs
            .map(doc => doc.data().imageUrl)
            .filter(img => img)
            .slice(0, 6);
          
          if (images.length > 0) {
            setRelatedImages(images);
          } else {
            setRelatedImages(DEFAULT_GALLERY_IMAGES);
          }
        } else {
          setRelatedImages(DEFAULT_GALLERY_IMAGES);
        }
      } catch (err) {
        console.error('Error fetching related images:', err);
        setRelatedImages(DEFAULT_GALLERY_IMAGES);
      }
    };
    
    const fetchUserBookings = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          where('tripId', '==', id)
        );
        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserBookings(bookings);
      } catch (err) {
        console.error('Error fetching user bookings:', err);
      }
    };
    
    fetchTrip();
    if (user) {
      fetchUserBookings();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-xl mb-8" />
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
              <div className="h-96 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Trip not found</h1>
          <button
            onClick={() => navigate('/trips')}
            className="mt-4 px-6 py-3 bg-forest-green text-white rounded-xl"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  const formattedPrice = trip.price ? `₹${trip.price.toLocaleString('en-IN')}` : 'Contact for Price';

  // Get gallery images from trip data or use related/default
  const getGalleryImages = () => {
    if (trip.gallery && trip.gallery.length > 0) {
      return trip.gallery;
    }
    if (relatedImages.length > 0) {
      return relatedImages;
    }
    return DEFAULT_GALLERY_IMAGES;
  };

  // Check if user has an approved booking for this trip
  const hasApprovedBooking = userBookings.some(booking => booking.status === 'Approved');

  // Check if user has a pending or waitlisted booking
  const hasPendingBooking = userBookings.some(booking => 
    booking.status === 'Pending Review' || booking.status === 'Waitlisted'
  );

  // Check if user has a rejected booking
  const hasRejectedBooking = userBookings.some(booking => booking.status === 'Rejected');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Image */}
      <div 
        className="relative h-[60vh] min-h-[400px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${trip.imageUrl || DEFAULT_GALLERY_IMAGES[0]})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
          <div className="max-w-7xl mx-auto">
            <p className="text-white/80 text-sm uppercase tracking-widest mb-2">
              {trip.category?.charAt(0).toUpperCase() + trip.category?.slice(1) || 'Adventure'}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-2">
              {trip.title}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg">{trip.location || trip.state}, India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Content - 66% */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {trip.description || `Experience the magic of ${trip.title} with our carefully curated travel package. 
                This journey takes you through breathtaking landscapes, authentic cultural experiences, 
                and unforgettable moments. Whether you're seeking adventure or relaxation, this trip 
                offers the perfect blend of both.`}
              </p>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Included Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Wi-Fi', icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.5-8h7.5m-7.5-4h7.5M3.351 11H18a1.994 1.994 0 001.414-.586m2.121-2.121A12.02 12.02 0 0116.5 9.75 12.025 12.025 0 0111.99 4.969 12.025 12.025 0 003.344 11M12 18a3 3 0 100-6 3 3 0 000 6z' },
                  { name: 'Breakfast', icon: 'M12 8v6m0 0v6m0-6h6m-6 0H6m8-2a2 2 0 11-4 0 2 2 0 014 0zM3.351 11H18a1.994 1.994 0 001.414-.586m2.121-2.121A12.02 12.02 0 0116.5 9.75 12.025 12.025 0 0111.99 4.969 12.025 12.025 0 003.344 11M12 18a3 3 0 100-6 3 3 0 000 6z' },
                  { name: 'AC Transport', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
                  { name: 'Guide', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                  { name: 'Accommodation', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                  { name: 'All Meals', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map((amenity) => (
                  <div key={amenity.name} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <svg className="w-6 h-6 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={amenity.icon} />
                    </svg>
                    <span className="text-gray-700 font-medium">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Itinerary</h2>
              <div className="space-y-0">
                {(trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary : [
                  { day: 1, title: 'Arrival & Welcome', description: 'Arrive at the destination and check-in to your hotel. Evening welcome dinner with cultural performances.' },
                  { day: 2, title: 'Local Exploration', description: 'Guided tour of major attractions including historical sites, local markets, and famous landmarks.' },
                  { day: 3, title: 'Adventure Activities', description: 'Full day of adventure activities such as trekking, water sports, or wildlife spotting as per the package.' },
                  { day: 4, title: 'Cultural Experience', description: 'Immerse yourself in local culture with cooking classes, village visits, and traditional ceremonies.' },
                  { day: 5, title: 'Departure', description: 'Final morning at leisure, checkout, and transfer to the airport/railway station for your journey home.' },
                ]).map((item, index) => {
                  const isLast = index === (trip.itinerary?.length || 5) - 1;
                  return (
                    <motion.div
                      key={item.day || index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6 pb-8 relative"
                    >
                      {/* Animated Vertical Line */}
                      {!isLast && (
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="absolute left-[11px] top-10 bottom-0 w-px bg-gray-200 origin-top"
                        />
                      )}
                      {/* Circle Node */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-forest-green border-4 border-white shadow-md z-10" />
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold text-forest-green">Day {item.day || index + 1}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Gallery */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {getGalleryImages().map((image, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden">
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Related Destinations */}
            {relatedTrips.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Related Destinations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedTrips.map((relatedTrip) => (
                    <TripCard key={relatedTrip.id} trip={relatedTrip} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Content - 33% Sticky Booking Card */}
          <div className="relative">
            <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm">Starting from</p>
                <div className="text-4xl font-bold text-gray-900 mt-1">{formattedPrice}</div>
                <p className="text-gray-500 text-sm mt-1">per person</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">
                    {trip.duration} {trip.durationType || 'Days'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Group Size</span>
                  <span className="font-semibold text-gray-900">Max 12 people</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Best Time</span>
                  <span className="font-semibold text-gray-900">Oct - Mar</span>
                </div>
              </div>

              {/* Hide button if user has approved booking */}
              {!hasApprovedBooking && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-forest-green to-teal-500 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:shadow-forest-green/30 transition-all duration-300"
                >
                  {hasPendingBooking ? 'Booking Under Review' : 'Reserve Your Spot'}
                </button>
              )}

              {/* Show approved status message */}
              {hasApprovedBooking && (
                <div className="w-full py-4 bg-green-50 text-green-700 font-semibold text-lg rounded-xl text-center border border-green-200">
                  Booking Confirmed ✓
                </div>
              )}

              {/* Show rejected status with option to book again */}
              {hasRejectedBooking && (
                <div className="space-y-3">
                  <div className="w-full py-4 bg-red-50 text-red-700 font-semibold text-lg rounded-xl text-center border border-red-200">
                    Booking Rejected ❌
                  </div>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-forest-green to-teal-500 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300"
                  >
                    Book Again
                  </button>
                </div>
              )}

              {hasPendingBooking && !hasApprovedBooking && !hasRejectedBooking && (
                <p className="text-center text-amber-600 text-sm mt-4">
                  Your booking is being reviewed. We'll update you soon!
                </p>
              )}

              {!hasPendingBooking && !hasApprovedBooking && !hasRejectedBooking && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  Free cancellation up to 7 days before
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          trip={trip}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}
