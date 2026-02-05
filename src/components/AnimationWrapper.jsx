import { motion } from 'framer-motion';

// Staggered reveal animation for containers with children
export const StaggerContainer = ({ 
  children, 
  className = '',
  delay = 0,
  staggerChildren = 0.1,
  initial = 'hidden',
  animate = 'visible'
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren: delay
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial={initial}
      animate={animate}
    >
      {children}
    </motion.div>
  );
};

// Individual fade-in up animation
export const FadeInUp = ({ 
  children, 
  className = '',
  delay = 0,
  duration = 0.6,
  y = 30 
}) => {
  const variants = {
    hidden: { 
      opacity: 0, 
      y 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {children}
    </motion.div>
  );
};

// Scale and fade animation
export const ScaleIn = ({ 
  children, 
  className = '',
  delay = 0,
  duration = 0.5,
  scale = 0.95
}) => {
  const variants = {
    hidden: { 
      opacity: 0, 
      scale 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

// Word reveal animation for hero titles
export const WordReveal = ({ text, className = '', delay = 0 }) => {
  const words = text.split(' ');
  
  const variants = {
    hidden: { 
      opacity: 0, 
      y: 40 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ 
            display: 'inline-block',
            marginRight: words.length > 1 ? '0.3em' : 0,
            whiteSpace: 'pre'
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Image zoom on hover wrapper
export const ImageZoom = ({ 
  children, 
  className = '',
  zoomScale = 1.1,
  duration = 0.6 
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        scale: zoomScale,
        transition: { duration }
      }}
    >
      {children}
    </motion.div>
  );
};

// Card lift with shadow on hover
export const CardLift = ({ 
  children, 
  className = '',
  liftY = -8,
  duration = 0.3 
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        y: liftY,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        transition: { duration }
      }}
    >
      {children}
    </motion.div>
  );
};

// Button with glow animation
export const GlowButton = ({ 
  children, 
  className = '',
  glowColor = 'rgba(34, 197, 94, 0.5)', // forest-green
  ...props 
}) => {
  return (
    <motion.button
      className={className}
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 0 25px ${glowColor}`
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Grayscale to color image on hover
export const ColorOnHover = ({ 
  children, 
  className = '',
  duration = 0.4 
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        filter: 'grayscale(0%)',
        transition: { duration }
      }}
      style={{ filter: 'grayscale(100%)' }}
    >
      {children}
    </motion.div>
  );
};

// Glassmorphism container
export const GlassCard = ({ 
  children, 
  className = '',
  blur = '12px',
  opacity = '0.1'
}) => {
  return (
    <motion.div
      className={className}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur})`,
        WebkitBackdropFilter: `blur(${blur})`,
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

// Progress bar animation
export const ScrollProgress = ({ color = '#ea580c' }) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50"
      style={{ 
        background: 'transparent',
        transformOrigin: '0%'
      }}
      animate={{
        background: [
          'linear-gradient(90deg, transparent, #ea580c)',
          'linear-gradient(90deg, #ea580c, #ea580c)',
          'linear-gradient(90deg, #ea580c, transparent)'
        ]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <motion.div
        style={{
          height: '100%',
          background: color,
          boxShadow: '0 0 10px #ea580c'
        }}
        animate={{
          width: ['0%', '100%', '0%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
};

// Text split animation (slide up individually)
export const SplitText = ({ text, className = '', delay = 0 }) => {
  const words = text.split(' ');
  
  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: delay + (i * 0.1),
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Section reveal animation
export const SectionReveal = ({ 
  children, 
  className = '',
  delay = 0 
}) => {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.section>
  );
};
