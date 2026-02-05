import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TripCard from '../components/TripCard';
import Footer from '../components/Footer';
import spiritualImg from '../assets/spiritual.jpg';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
};

const CATEGORIES = [
  { id: 'mountains', label: 'Mountains', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400' },
  { id: 'beaches', label: 'Beaches', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400' },
  { id: 'spiritual', label: 'Spiritual', image: spiritualImg },
  { id: 'wildlife', label: 'Wildlife', image: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=400' },
  { id: 'honeymoon', label: 'Honeymoon', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400' },
  { id: 'heritage', label: 'Heritage', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=400' },
];

const WHY_CHOOSE = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Authentic India',
    description: 'Experience the real India with local experts who know every corner'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Best Prices',
    description: 'Unbeatable deals on all travel packages with no hidden costs'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Local Partners',
    description: 'Verified travel partners across India for authentic experiences'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Round-the-clock assistance for a worry-free journey'
  },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Redirect to login if not authenticated - only on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authLoading && !user) {
        navigate('/auth', { replace: true });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, authLoading, navigate]);

  // Fetch featured trips
  useEffect(() => {
    const fetchFeaturedTrips = async () => {
      try {
        const q = query(
          collection(db, 'trips'),
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        const snapshot = await getDocs(q);
        const trips = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFeaturedTrips(trips);
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTrips();
  }, []);

  // Search trips function
  const searchTrips = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const searchLower = searchTerm.toLowerCase();
      
      const q = query(
        collection(db, 'trips'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filtered = trips.filter(trip => {
        const titleMatch = trip.title?.toLowerCase().includes(searchLower);
        const locationMatch = trip.location?.toLowerCase().includes(searchLower);
        const stateMatch = trip.state?.toLowerCase().includes(searchLower);
        const categoryMatch = trip.category?.toLowerCase().includes(searchLower);
        return titleMatch || locationMatch || stateMatch || categoryMatch;
      });

      setSearchResults(filtered.slice(0, 6));
    } catch (err) {
      console.error('Error searching trips:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchTrips(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/trips?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/trips?category=${categoryId}`);
  };

  // Show loading or redirecting state
  if (authLoading || (!user && !loading)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-forest-green border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Search Bar */}
      <motion.div 
        className="max-w-3xl mx-auto px-4 -mt-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center">
            <div className="flex-1 flex items-center px-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search destinations like 'Kerala', 'Himachal', 'Rajasthan'..."
                className="w-full px-4 py-3 text-gray-700 outline-none"
              />
              {searching && (
                <svg className="animate-spin w-5 h-5 text-forest-green" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
            </div>
            <motion.button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-forest-green to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-forest-green/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Search
            </motion.button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
            >
              {searchResults.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => {
                    navigate(`/trip/${trip.id}`);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <img
                    src={trip.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=100'}
                    alt={trip.title}
                    className="w-16 h-16 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{trip.title}</p>
                    <p className="text-sm text-gray-500">{trip.location || trip.state}, India</p>
                    <p className="text-sm text-forest-green font-medium">₹{trip.price?.toLocaleString()}</p>
                  </div>
                </button>
              ))}
              <button
                onClick={handleSearchSubmit}
                className="w-full px-4 py-3 text-center text-forest-green font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                View all results
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">Explore by Category</h2>
          <p className="text-gray-500 mt-2">Find your perfect adventure</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {CATEGORIES.map((category) => (
            <motion.a
              key={category.id}
              href={`/trips?category=${category.id}`}
              className="group relative rounded-xl overflow-hidden cursor-pointer block"
              variants={fadeInUp}
            >
              <div className="aspect-[4/3] sm:aspect-square">
                <motion.img
                  src={category.image}
                  alt={category.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-forest-green/0 group-hover:bg-forest-green/10 transition-colors duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <p className="text-white font-semibold text-sm sm:text-base">{category.label}</p>
              </div>
              {/* Touch feedback overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 active:opacity-100 transition-opacity duration-150" />
            </motion.a>
          ))}
        </motion.div>
        
        {/* View All Categories Link */}
        <motion.div 
          className="text-center mt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <a 
            href="/trips"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-forest-green hover:text-white transition-all duration-300 font-medium"
          >
            View All Categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </section>

      {/* Featured Trips Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Featured Trips</h2>
            <p className="text-gray-500 mt-2">Popular destinations booked by travelers</p>
          </div>
          <motion.button
            onClick={() => navigate('/trips')}
            className="px-6 py-3 border border-forest-green text-forest-green rounded-xl hover:bg-forest-green hover:text-white transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Trips
          </motion.button>
        </motion.div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredTrips.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {featuredTrips.map((trip) => (
              <motion.div key={trip.id} variants={fadeInUp}>
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-500 mb-4">No trips available yet</p>
            <p className="text-sm text-gray-400">Add trips from the admin dashboard</p>
          </motion.div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-serif font-bold text-gray-900">Why Choose TripNezt</h2>
          <p className="text-gray-500 mt-2">Your trusted travel partner in India</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {WHY_CHOOSE.map((item, index) => (
            <motion.div 
              key={index} 
              className="text-center"
              variants={fadeInUp}
            >
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-forest-green/10 flex items-center justify-center text-forest-green"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {item.icon}
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Brand Partners Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-serif font-bold text-gray-900">Our Brand Partners</h2>
          <p className="text-gray-500 mt-2">Trusted partners in your travel journey</p>
        </motion.div>
        
        <motion.div 
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {[
            { name: 'Make my trip', initial: 'M' },
            { name: 'Riya connect', initial: 'R' },
            { name: 'Rizlive', initial: 'R' },
          ].map((partner, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp}
              className="bg-white px-8 py-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-forest-green">{partner.initial}</span>
              <span className="ml-3 text-lg font-semibold text-gray-700">{partner.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="bg-gradient-to-r from-forest-green to-teal-500 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-white/90 mb-8">Discover amazing destinations across India with our curated travel packages</p>
          <motion.button
            onClick={() => navigate('/trips')}
            className="px-8 py-4 bg-white text-forest-green font-semibold rounded-xl hover:shadow-xl hover:shadow-black/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Trips
          </motion.button>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
