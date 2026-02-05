import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import TripCard, { ComingSoonCard, TripCardSkeleton } from '../components/TripCard';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'beaches', label: 'Beaches' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'honeymoon', label: 'Honeymoon' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'heritage', label: 'Heritage' },
];

const INDIAN_STATES = [
  'Rajasthan', 'Kerala', 'Himachal Pradesh', 'Uttarakhand', 'Maharashtra', 'Goa',
  'Tamil Nadu', 'Karnataka', 'West Bengal', 'Uttar Pradesh', 'Madhya Pradesh',
  'Gujarat', 'Jammu & Kashmir', 'Delhi',
];

export default function TripsPage() {
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('budget') || '');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));

        const category = searchParams.get('category');
        const state = searchParams.get('state');
        const budget = searchParams.get('budget');

        if (category && category !== 'all') {
          q = query(q, where('category', '==', category));
        }

        const snapshot = await getDocs(q);
        let tripsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply client-side filters
        if (state) {
          tripsData = tripsData.filter(
            (trip) => trip.state?.toLowerCase() === state.toLowerCase() || trip.location?.toLowerCase() === state.toLowerCase()
          );
        }

        if (budget) {
          const max = parseInt(budget);
          tripsData = tripsData.filter((trip) => (trip.price || 0) <= max);
        }

        setTrips(tripsData);
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [searchParams]);

  // Filter trips based on search and filters
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      !searchQuery ||
      trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.state?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || trip.category === selectedCategory;
    const matchesState = !selectedState || trip.state === selectedState;
    const matchesPrice = !maxPrice || (trip.price || 0) <= parseInt(maxPrice);

    return matchesSearch && matchesCategory && matchesState && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-bg-cream">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Explore <span className="text-forest-green">Incredible India</span>
          </h1>
          <p className="text-gray-500">
            {filteredTrips.length} amazing trips waiting for you
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="w-full px-5 py-3.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-green transition-all"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filters - Horizontal Scroll */}
          <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-forest-green to-teal-500 text-white shadow-lg shadow-forest-green/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-3.5 rounded-xl bg-gray-100 border-0 text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-green appearance-none cursor-pointer"
            >
              <option value="">All States</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="px-4 py-3.5 rounded-xl bg-gray-100 border-0 text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-green appearance-none cursor-pointer"
            >
              <option value="">Any Budget</option>
              <option value="15000">Under ₹15,000</option>
              <option value="30000">Under ₹30,000</option>
              <option value="50000">Under ₹50,000</option>
              <option value="100000">Under ₹1,00,000</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedState('');
                setMaxPrice('');
                setSearchQuery('');
              }}
              className="px-4 py-3.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto pt-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="max-w-md mx-auto">
              <ComingSoonCard />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
