import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TripCard({ trip }) {
  const {
    id,
    title,
    location,
    state,
    price,
    duration,
    durationType,
    category,
    imageUrl,
    rating,
    reviews,
  } = trip;

  const image = imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600';
  const formattedPrice = price ? `₹${price.toLocaleString('en-IN')}` : 'Contact for Price';
  const durationText = duration && durationType ? `${duration} ${durationType}` : duration || 'Flexible';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/trip/${id}`}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 block"
      >
        {/* Image Section with zoom effect */}
        <div className="relative h-56 overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Gradient overlay on hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold shadow-sm">
            {category?.charAt(0).toUpperCase() + category?.slice(1) || 'Trip'}
          </div>
          
          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-gray-800 font-semibold text-xs">{rating}</span>
              {reviews && <span className="text-gray-500 text-xs">({reviews})</span>}
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg">
            <span className="text-lg font-bold text-gray-800">{formattedPrice}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-forest-green transition-colors line-clamp-1">
            {title}
          </h3>

          {/* Location */}
          {state && (
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location || state}, {state}</span>
            </div>
          )}

          {/* Duration */}
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{durationText}</span>
          </div>

          {/* Book Button with glow */}
          <motion.button 
            className="w-full py-3 rounded-xl bg-gradient-to-r from-forest-green to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-forest-green/30 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Now
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}

// Coming Soon Card for Empty State
export function ComingSoonCard() {
  return (
    <motion.div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon!</h3>
      <p className="text-gray-500 mb-4">
        We're curating amazing trips for you. Check back soon!
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-green/10 text-forest-green font-semibold">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Stay Tuned</span>
      </div>
    </motion.div>
  );
}

// Skeleton Loading Card
export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}
