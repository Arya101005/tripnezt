import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

const PRICE_RANGES = [
  { value: '', label: 'Any Budget' },
  { value: '5000', label: '< ₹5,000' },
  { value: '10000', label: '< ₹10,000' },
  { value: '15000', label: '< ₹15,000' },
  { value: '25000', label: '< ₹25,000' },
  { value: '30000', label: '< ₹30,000' },
  { value: '50000', label: '< ₹50,000' },
  { value: '75000', label: '< ₹75,000' },
  { value: '100000', label: '< ₹1,00,000' },
  { value: '150000', label: '< ₹1,50,000' },
  { value: '200000', label: '< ₹2,00,000' },
];

export default function TripsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('budget') || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize selected categories from URL params
  useEffect(() => {
    const categoriesParam = searchParams.get('categories');
    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(','));
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  // Handle category selection - supports multiple categories
  const handleCategoryChange = (categoryId) => {
    let newCategories;
    
    if (categoryId === 'all') {
      // Clear all categories when "All" is selected
      newCategories = [];
    } else {
      // Toggle category
      if (selectedCategories.includes(categoryId)) {
        newCategories = selectedCategories.filter(c => c !== categoryId);
      } else {
        newCategories = [...selectedCategories, categoryId];
      }
    }
    
    setSelectedCategories(newCategories);
    
    const params = new URLSearchParams(searchParams);
    if (newCategories.length > 0) {
      params.set('categories', newCategories.join(','));
    } else {
      params.delete('categories');
    }
    setSearchParams(params);
  };

  // Check if a category is selected
  const isCategorySelected = (categoryId) => {
    if (categoryId === 'all') {
      return selectedCategories.length === 0;
    }
    return selectedCategories.includes(categoryId);
  };

  // Handle state selection - updates URL
  const handleStateChange = (state) => {
    setSelectedState(state);
    const params = new URLSearchParams(searchParams);
    if (state) {
      params.set('state', state);
    } else {
      params.delete('state');
    }
    navigate(`/trips?${params.toString()}`);
  };

  // Handle price selection - updates URL
  const handlePriceChange = (price) => {
    setMaxPrice(price);
    const params = new URLSearchParams(searchParams);
    if (price) {
      params.set('budget', price);
    } else {
      params.delete('budget');
    }
    navigate(`/trips?${params.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedState('');
    setMaxPrice('');
    setSearchQuery('');
    navigate('/trips');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCategories.length > 0 || selectedState || maxPrice || searchQuery;

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));

        const categoriesParam = searchParams.get('categories');
        const state = searchParams.get('state');
        const budget = searchParams.get('budget');

        const snapshot = await getDocs(q);
        let tripsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply category filter from URL - supports multiple categories
        if (categoriesParam) {
          const categoryList = categoriesParam.split(',');
          tripsData = tripsData.filter((trip) => {
            const tripCategories = trip.categories || (trip.category ? [trip.category] : []);
            return categoryList.some(cat => tripCategories.includes(cat));
          });
        }

        // Apply state filter from URL
        if (state) {
          tripsData = tripsData.filter(
            (trip) => 
              trip.state?.toLowerCase() === state.toLowerCase() || 
              trip.location?.toLowerCase() === state.toLowerCase()
          );
        }

        // Apply budget filter from URL
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

  // Filter trips based on search and all filters (intersected filtering)
  const filteredTrips = trips.filter((trip) => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.category?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter - case-insensitive
    const tripCategories = trip.categories || (trip.category ? [trip.category] : []);
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(cat => tripCategories.includes(cat));

    return matchesSearch && matchesCategory;
  });

  const hasTrips = filteredTrips.length > 0;
  const comingSoonTrips = filteredTrips.filter(t => t.status === 'Coming Soon');
  const availableTrips = filteredTrips.filter(t => t.status !== 'Coming Soon');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Explore Trips</h1>
            <p className="text-gray-400 max-w-xl mx-auto">Find your perfect adventure from our curated collection of unforgettable experiences</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search trips by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {/* Category Filter */}
            <div className="relative group">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="appearance-none px-5 py-3 pr-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-forest-green cursor-pointer hover:bg-white/20 transition-colors"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state} className="text-gray-900">{state}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Budget Filter */}
            <div className="relative group">
              <select
                value={maxPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="appearance-none px-5 py-3 pr-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-forest-green cursor-pointer hover:bg-white/20 transition-colors"
              >
                {PRICE_RANGES.map((range) => (
                  <option key={range.value} value={range.value} className="text-gray-900">{range.label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            )}
          </div>

          {/* Category Pills - Scrollable */}
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isCategorySelected(cat.id)
                    ? 'bg-forest-green text-white shadow-lg shadow-forest-green/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {selectedCategories.map((cat) => {
                const category = CATEGORIES.find(c => c.id === cat);
                return category ? (
                  <span key={cat} className="px-3 py-1 rounded-full bg-forest-green/10 text-forest-green text-sm flex items-center gap-1">
                    {category.label}
                    <button
                      onClick={() => handleCategoryChange(cat)}
                      className="hover:text-red-500 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
              {selectedState && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm flex items-center gap-1">
                  {selectedState}
                  <button onClick={() => handleStateChange('')} className="hover:text-red-500 ml-1">
                    ×
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm flex items-center gap-1">
                  &lt;₹{parseInt(maxPrice).toLocaleString()}
                  <button onClick={() => handlePriceChange('')} className="hover:text-red-500 ml-1">
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ) : hasTrips ? (
            <>
              {/* Coming Soon Trips */}
              {comingSoonTrips.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Coming Soon</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comingSoonTrips.map((trip) => (
                      <ComingSoonCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                </div>
              )}

              {/* Available Trips */}
              {availableTrips.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {selectedCategories.length > 0 ? `${CATEGORIES.find(c => c.id === selectedCategories[0])?.label || 'Trips'} Trips` : 'All Trips'}
                    <span className="text-gray-400 font-normal ml-2">({availableTrips.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-forest-green text-white rounded-xl hover:bg-forest-green/90 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
