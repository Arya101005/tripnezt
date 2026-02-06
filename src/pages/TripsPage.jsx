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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('budget') || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize on selected categories from URL mount
  useEffect(() => {
    // Support both 'categories' (new) and 'category' (old from HomePage) params
    const categoriesParam = searchParams.get('categories') || searchParams.get('category');
    if (categoriesParam) {
      const cats = categoriesParam.split(',').filter(c => c);
      setSelectedCategories(cats);
    } else {
      setSelectedCategories([]);
    }
    const stateParam = searchParams.get('state');
    if (stateParam) setSelectedState(stateParam);
    const budgetParam = searchParams.get('budget');
    if (budgetParam) setMaxPrice(budgetParam);
  }, []);

  // Handle category selection - toggle categories
  const handleCategoryToggle = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategories([]);
      updateUrlParams([], selectedState, maxPrice);
      return;
    }

    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(c => c !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
    updateUrlParams(newCategories, selectedState, maxPrice);
  };

  // Update URL with filter params
  const updateUrlParams = (categories, state, budget) => {
    const params = new URLSearchParams();
    
    if (categories.length > 0) {
      params.set('categories', categories.join(','));
    }
    if (state) {
      params.set('state', state);
    }
    if (budget) {
      params.set('budget', budget);
    }
    
    navigate(`/trips?${params.toString()}`);
  };

  // Handle state selection - updates URL
  const handleStateChange = (state) => {
    setSelectedState(state);
    updateUrlParams(selectedCategories, state, maxPrice);
  };

  // Handle price selection - updates URL
  const handlePriceChange = (price) => {
    setMaxPrice(price);
    updateUrlParams(selectedCategories, selectedState, price);
  };

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));

        const state = searchParams.get('state');
        const budget = searchParams.get('budget');

        const snapshot = await getDocs(q);
        let tripsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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
    // Get trip categories as array (support both old single category and new array format)
    const tripCategories = Array.isArray(trip.categories) 
      ? trip.categories.map(c => c.toLowerCase()) 
      : trip.category 
        ? [trip.category.toLowerCase()] 
        : [];

    // Search query filter - check if any field matches
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      trip.title?.toLowerCase().includes(searchLower) ||
      trip.location?.toLowerCase().includes(searchLower) ||
      trip.state?.toLowerCase().includes(searchLower) ||
      tripCategories.some(cat => cat.includes(searchLower));

    // Category filter - intersection (trip must match ALL selected categories)
    // If no categories selected, show all
    // Check if any of the trip's categories match any selected category (case-insensitive)
    const matchesCategories = selectedCategories.length === 0 || 
      selectedCategories.some(catId => 
        tripCategories.some(tripCat => 
          tripCat === catId.toLowerCase() || 
          tripCat.includes(catId.toLowerCase())
        )
      );

    // State filter
    const matchesState = !selectedState || 
      trip.state === selectedState || 
      trip.location === selectedState;

    // Price filter
    const matchesPrice = !maxPrice || (trip.price || 0) <= parseInt(maxPrice);

    // Return true only if ALL filters match (intersected)
    return matchesSearch && matchesCategories && matchesState && matchesPrice;
  });

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedState('');
    setMaxPrice('');
    setSearchQuery('');
    navigate('/trips');
  };

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
                placeholder="Search destinations, states, or categories..."
                className="w-full px-5 py-3.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-green transition-all"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filters - Multi-select */}
          <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {/* All button */}
              <button
                onClick={() => handleCategoryToggle('all')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategories.length === 0
                    ? 'bg-gradient-to-r from-forest-green to-teal-500 text-white shadow-lg shadow-forest-green/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategories.includes(cat.id)
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
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-0 text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-green appearance-none cursor-pointer pr-10"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <select
                value={maxPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-0 text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-green appearance-none cursor-pointer pr-10"
              >
                {PRICE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-3.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategories.length > 0 || selectedState || maxPrice || searchQuery) && (
        <div className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 mr-2">Active Filters:</span>
              {/* Selected Categories */}
              {selectedCategories.map(catId => {
                const cat = CATEGORIES.find(c => c.id === catId);
                return cat ? (
                  <span key={catId} className="px-3 py-1 bg-forest-green/10 text-forest-green text-sm rounded-full flex items-center gap-2">
                    {cat.label}
                    <button onClick={() => handleCategoryToggle(catId)} className="hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ) : null;
              })}
              {selectedCategories.length > 0 && (
                <button 
                  onClick={() => handleCategoryToggle('all')}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all categories
                </button>
              )}
              {selectedState && (
                <span className="px-3 py-1 bg-forest-green/10 text-forest-green text-sm rounded-full flex items-center gap-2">
                  State: {selectedState}
                  <button onClick={() => handleStateChange('')} className="hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="px-3 py-1 bg-forest-green/10 text-forest-green text-sm rounded-full flex items-center gap-2">
                  Max Price: ₹{parseInt(maxPrice).toLocaleString()}
                  <button onClick={() => handlePriceChange('')} className="hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-forest-green/10 text-forest-green text-sm rounded-full flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

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
