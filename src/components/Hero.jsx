import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HERO_IMAGES = [
  // Taj Mahal, Agra - Iconic Indian heritage
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1920',
  // Kerala Backwaters
  'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1920',
  // Himalayas, Himachal Pradesh
  'https://images.unsplash.com/photo-1509607742256-5bc7cb0129a8?q=80&w=1920',
  // Jaipur Palace, Rajasthan
  'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1920',
  // Varanasi Ghats
  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1920',
  // Goa Beaches
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1920',
];

const STATES = [
  'Rajasthan', 'Kerala', 'Himachal Pradesh', 'Uttarakhand', 
  'Maharashtra', 'Goa', 'Tamil Nadu', 'Karnataka', 'West Bengal',
  'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Jammu & Kashmir'
];

const BUDGET_OPTIONS = [
  { label: 'Budget', max: 15000 },
  { label: 'Mid-Range', max: 50000 },
  { label: 'Luxury', max: Infinity },
];

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

// Word reveal animation component
const WordReveal = ({ text, delay = 0 }) => {
  const words = text.split(' ');
  
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: delay + (i * 0.1),
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export default function Hero() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [search, setSearch] = useState({
    state: '',
    budget: '',
    categories: [],
  });

  // Preload all images
  useEffect(() => {
    HERO_IMAGES.forEach((url) => {
      const image = new Image();
      image.src = url;
    });
  }, []);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.state) params.set('state', search.state);
    if (search.budget) params.set('budget', search.budget);
    if (search.categories.length > 0) params.set('categories', search.categories.join(','));
    navigate(`/trips?${params.toString()}`);
  };

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSearch(prev => {
      if (categoryId === 'all') {
        return { ...prev, categories: [] };
      }
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories: newCategories };
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Single Background Image with zoom effect */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${HERO_IMAGES[currentSlide]})`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Soft modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/30 to-gray-900/50" />
      </motion.div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_IMAGES.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headlines with split-text reveal */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.span variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}>
              <WordReveal text="Discover the Magic" delay={0} />
            </motion.span>
            <br className="hidden sm:block" />
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300"
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              <WordReveal text="of Incredible India" delay={0.3} />
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            From snow-capped mountains to serene backwaters — create unforgettable memories
          </motion.p>
        </div>

        {/* Floating Search Card with stagger reveal */}
        <motion.div 
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-900/20 p-4 sm:p-6"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Location */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Where to?
                </label>
                <select
                  value={search.state}
                  onChange={(e) => setSearch({ ...search, state: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-0 text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-green cursor-pointer"
                >
                  <option value="">All of India</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Budget
                </label>
                <select
                  value={search.budget}
                  onChange={(e) => setSearch({ ...search, budget: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-0 text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-green cursor-pointer"
                >
                  <option value="">Any Budget</option>
                  {BUDGET_OPTIONS.map((budget) => (
                    <option key={budget.label} value={budget.max}>{budget.label}</option>
                  ))}
                </select>
              </div>

              {/* Search Button with glow animation */}
              <div className="sm:col-span-5 flex items-end">
                <motion.button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-forest-green to-teal-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-forest-green/30 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Trips
                </motion.button>
              </div>
            </div>

            {/* Category Chips with stagger */}
            <motion.div 
              className="mt-4 pt-4 border-t border-gray-100"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
            >
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {/* All button */}
                <motion.button
                  key="all"
                  type="button"
                  onClick={() => toggleCategory('all')}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    search.categories.length === 0
                      ? 'bg-gradient-to-r from-forest-green to-teal-500 text-white shadow-lg shadow-forest-green/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  All
                </motion.button>
                {CATEGORIES.filter(c => c.id !== 'all').map((cat, index) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      search.categories.includes(cat.id)
                        ? 'bg-gradient-to-r from-forest-green to-teal-500 text-white shadow-lg shadow-forest-green/25'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
