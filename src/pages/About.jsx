import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import muralitharan from '../assets/muralitharan.jpeg';

// Animations
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
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const imageZoom = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 1.2, ease: 'easeOut' }
  }
};

const TeamMember = ({ name, role, image }) => (
  <motion.div 
    className="text-center group"
    variants={fadeInUp}
  >
    <div className="relative overflow-hidden rounded-2xl mb-4 mx-auto w-48 h-48 sm:w-56 sm:h-56">
      {/* Image */}
      <motion.div
        className="w-full h-full bg-gray-200"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        whileHover={{ 
          scale: 1.05
        }}
        transition={{ duration: 0.5 }}
      />
      {/* Overlay on hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-forest-green/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
    <p className="text-forest-green font-medium">{role}</p>
  </motion.div>
);

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
      }
    }}
  >
    <div className="w-14 h-14 bg-forest-green/10 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0"
          initial="hidden"
          animate="visible"
          variants={imageZoom}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </motion.div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <motion.div 
            className="text-center max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span 
              className="inline-block text-white/90 text-sm font-medium tracking-[0.2em] uppercase mb-6"
              variants={fadeInUp}
            >
              Our Story
            </motion.span>
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8"
              variants={fadeInUp}
            >
              <span className="block">Discover the Soul</span>
              <span className="block italic font-light">of Bharat</span>
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              We're not just travel experts — we're storytellers who craft journeys 
              that connect you with the heart and soul of India.
            </motion.p>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>
      
      {/* Our Philosophy Section */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <span className="text-forest-green font-medium tracking-[0.15em] uppercase text-sm">Our Philosophy</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-8 leading-tight">
                Travel That <br/>
                <span className="text-forest-green italic">Transforms</span> You
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                At TripNezt, we believe travel is not about visiting places — it's about 
                experiencing moments that stay with you forever. Every journey we design 
                is a carefully crafted narrative, weaving together culture, adventure, 
                and authentic experiences.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From the snow-capped peaks of Ladakh to the serene backwaters of Kerala, 
                we take you beyond the tourist trail to discover India's hidden gems 
                and timeless traditions.
              </p>
            </motion.div>
            
            <motion.div 
              className="relative"
              variants={fadeInUp}
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <motion.div 
                  className="w-full h-full bg-cover bg-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80')`
                  }}
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-forest-green/10 rounded-full -z-10" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-100 rounded-full -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* The TripNezt Edge Section */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-forest-green font-medium tracking-[0.15em] uppercase text-sm">
              Why Choose Us
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-4">
              The TripNezt Edge
            </motion.h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <FeatureCard 
              icon={
                <svg className="w-8 h-8 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
              title="Expertise"
              description="Over a decade of experience curating bespoke journeys across India's most remarkable destinations. Our travel designers know every hidden gem."
              delay={0}
            />
            <FeatureCard 
              icon={
                <svg className="w-8 h-8 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Safety First"
              description="Your security is our priority. All trips include certified guides, emergency protocols, and comprehensive travel insurance coverage."
              delay={0.15}
            />
            <FeatureCard 
              icon={
                <svg className="w-8 h-8 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              }
              title="Authentic Experiences"
              description="We connect you with local communities, traditional artisans, and off-beat locations that most travelers never get to experience."
              delay={0.3}
            />
          </motion.div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-forest-green overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { number: '500+', label: 'Trips Curated' },
              { number: '10K+', label: 'Happy Travelers' },
              { number: '50+', label: 'Destinations' },
              { number: '98%', label: 'Satisfaction' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                variants={fadeInUp}
              >
                <motion.span 
                  className="text-4xl sm:text-5xl font-bold text-white block"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {stat.number}
                </motion.span>
                <span className="text-white/80 mt-2 block">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-forest-green font-medium tracking-[0.15em] uppercase text-sm">
              Our Team
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mt-4">
              Meet the Explorers
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
              A passionate team of travel enthusiasts, storytellers, and adventure seekers 
              dedicated to crafting your perfect journey.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-1 lg:grid-cols-1 gap-8 justify-items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <TeamMember 
              name="Muralitharan" 
              role="Founder & CEO" 
              image={muralitharan}
            />
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-4 bg-gray-900 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80')`
            }}
          />
        </motion.div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            Ready to Start Your <span className="italic text-forest-green">Journey?</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ ...fadeInUp, transition: { delay: 0.2 } }}
          >
            Let's create an unforgettable adventure tailored just for you.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ ...fadeInUp, transition: { delay: 0.4 } }}
          >
            <motion.a
              href="/contact"
              className="inline-block px-10 py-4 bg-forest-green text-white font-semibold rounded-full hover:bg-forest-green-dark transition-colors shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              Get in Touch
            </motion.a>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;
