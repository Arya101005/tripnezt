import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import logo from '../assets/logo.png';

// Form input with floating label
const FloatingLabelInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  required = false,
  multiline = false,
  rows = 4
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  
  const inputClassName = `w-full px-4 py-3 bg-gray-50 border rounded-lg outline-none transition-all duration-300 ${
    focused 
      ? 'border-forest-green bg-white shadow-sm' 
      : 'border-gray-200 hover:border-gray-300'
  }`;
  
  return (
    <div className="relative">
      <label 
        className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
          focused || hasValue 
            ? '-top-2.5 text-xs bg-white px-2 text-forest-green font-medium' 
            : 'top-3 text-gray-500'
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={rows}
          className={`${inputClassName} resize-none pt-4`}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${inputClassName} pt-4`}
          required={required}
        />
      )}
    </div>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Create mailto link with form data - sends to both admin@tripnezt.in and Muralitharan0826@gmail.com
    const subject = encodeURIComponent(formData.subject || 'Contact Form Submission');
    const body = encodeURIComponent(
      `Name: ${formData.name}\n\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    
    // Open default email client with pre-filled data - send to both recipients
    window.location.href = `mailto:admin@tripnezt.in,Muralitharan0826@gmail.com?subject=${subject}&body=${body}`;
    
    // Show success message
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };
  
  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <img src={logo} alt="TripNezt" className="h-16 w-auto mx-auto mb-6" />
          <motion.span 
            className="text-forest-green font-medium tracking-[0.15em] uppercase text-sm"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Get in Touch
          </motion.span>
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mt-4 mb-6"
            initial="hidden"
            animate="visible"
            variants={{ ...fadeInUp, transition: { delay: 0.1 } }}
          >
            Let's Plan Your <span className="italic text-forest-green">Adventure</span>
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{ ...fadeInUp, transition: { delay: 0.2 } }}
          >
            Have questions about our trips? Want to customize your journey? 
            We'd love to hear from you.
          </motion.p>
        </div>
      </section>
      
      {/* Contact Section - 2 Column Layout */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Left Column - Contact Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8"
                variants={fadeInUp}
              >
                Contact Information
              </motion.h2>
              
              <motion.div className="space-y-6" variants={staggerContainer}>
                {/* Main Office */}
                <motion.div 
                  className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  variants={fadeInUp}
                >
                  <div className="w-12 h-12 bg-forest-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Bangalore Office</h3>
                    <p className="text-gray-600 mt-1">E1 Royal Tower, Ejipura<br/>Bangalore - 560046, India</p>
                  </div>
                </motion.div>
                
                {/* Phone */}
                <motion.div 
                  className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  variants={fadeInUp}
                >
                  <div className="w-12 h-12 bg-forest-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600 mt-1">+91 8610414032<br/>Mon - Sat: 9AM - 7PM</p>
                  </div>
                </motion.div>
                
                {/* Email */}
                <motion.div 
                  className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  variants={fadeInUp}
                >
                  <div className="w-12 h-12 bg-forest-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-forest-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600 mt-1">Admin@tripnezt.in</p>
                  </div>
                </motion.div>
              </motion.div>
              
              {/* WhatsApp Button */}
              <motion.div 
                className="mt-8"
                variants={fadeInUp}
              >
                <motion.a
                  href="https://wa.me/918610414032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#20BD5A] transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </motion.a>
              </motion.div>
              
              {/* Map */}
              <motion.div 
                className="mt-10 rounded-2xl overflow-hidden shadow-lg h-64"
                variants={fadeInUp}
              >
                <iframe
                  title="TripNezt Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0123456789!2d77.6097!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE4LjYiTiA3N8KwMzYuNDglRW5oZWxsaQ!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(100%)' }}
                  allowFullScreen
                  loading="lazy"
                />
              </motion.div>
            </motion.div>
            
            {/* Right Column - Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8"
                variants={fadeInUp}
              >
                Send Us a Message
              </motion.h2>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
                variants={fadeInUp}
              >
                {submitted ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">Your message has been sent to admin@tripnezt.in and Muralitharan0826@gmail.com. We'll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <FloatingLabelInput
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    
                    <FloatingLabelInput
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    
                    <FloatingLabelInput
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                    
                    <FloatingLabelInput
                      label="Your Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      multiline
                      rows={5}
                      required
                    />
                    
                    <motion.button
                      type="submit"
                      className="w-full py-4 px-8 bg-gradient-to-r from-forest-green to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-forest-green/30 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Message
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="text-forest-green font-medium tracking-[0.15em] uppercase text-sm">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">Common Questions</h2>
          </motion.div>
          
          <motion.div 
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                q: 'How far in advance should I book my trip?',
                a: 'We recommend booking at least 30-60 days in advance for peak season trips. For off-season, 15-30 days is usually sufficient.'
              },
              {
                q: 'Can I customize my itinerary?',
                a: 'Absolutely! All our trips can be customized to match your preferences, timeline, and budget. Contact us to discuss your dream journey.'
              },
              {
                q: 'What is your cancellation policy?',
                a: 'We offer a full refund if cancelled 30+ days before departure, 50% refund within 15-30 days, and no refund within 14 days.'
              },
              {
                q: 'Do you provide travel insurance?',
                a: 'Yes, comprehensive travel insurance is included with all our trip packages, covering medical emergencies and trip cancellation.'
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm"
                variants={fadeInUp}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;
