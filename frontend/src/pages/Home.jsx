import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ChefHat, Award, Clock } from 'lucide-react';
import CakeCard from '../components/CakeCard';
import ReviewForm from '../components/ReviewForm';
import './Home.css';

// Dynamic data loaded from backend
// const STATS = [
//   { icon: <Star size={22} fill="currentColor" />, value: '500+', label: 'Happy Customers' },
//   { icon: <Award size={22} />, value: '5★', label: 'Average Rating' },
//   { icon: <Clock size={22} />, value: '8+', label: 'Years Experience' },
//   { icon: <ChefHat size={22} />, value: '120+', label: 'Cake Designs' },
// ];

const SPECIALTIES = [
  { emoji: '🎂', title: 'Birthday Cakes', desc: 'Custom designs for every age and theme.' },
  { emoji: '💍', title: 'Wedding Cakes', desc: 'Elegant multi-tier creations for your big day.' },
  { emoji: '🧁', title: 'Cupcake Towers', desc: 'Gorgeous towers for parties and events.' },
  { emoji: '✨', title: 'Custom Orders', desc: 'Tell us your vision, we bring it to life.' },
];



export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All');

  const [cakes, setCakes] = useState([]);
  const [loadingCakes, setLoadingCakes] = useState(true);
  const [cakeError, setCakeError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const res = await fetch('/api/files/all');
        const data = await res.json();
        if (res.ok && data.data) {
          const premiumCakes = data.data.filter(c => c.category === 'Bestsellers' || c.category === 'Premium');
          const topCakes = premiumCakes.length >= 3 ? premiumCakes.slice(0, 4) : data.data.slice(0, 4);
          setCakes(topCakes);
        }
      } catch (err) {
        setCakeError('Failed to load featured creations.');
        console.error(err);
      } finally {
        setLoadingCakes(false);
      }
    };
    fetchCakes();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews/', {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.data && data.data.length > 0) {
          setReviews(data.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  const filteredCakes = activeFilter === 'All'
    ? cakes
    : cakes.filter(c => c.category === activeFilter);

  return (
    <div className="home-page page-enter">
      {/* ========== HERO ========== */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="container hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <span className="hero-eyebrow">✨ Artisan Bakery · Kolkata</span>
            <h1 className="hero-title">
              Cakes Baked with <em>Love</em> &amp; Crafted for <em>Your</em> Moments
            </h1>
            <p className="hero-desc">
              Every cake tells a story. Handcrafted by Archana Karmakar using premium ingredients,
              designed to make your celebrations unforgettable.
            </p>
            <div className="hero-actions">
              <Link to="/menu" className="btn-primary hero-cta" id="hero-explore-menu">
                Explore Menu <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-secondary hero-cta-secondary" id="hero-custom-order">
                Custom Order
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          >
            <div className="hero-cake-frame">
              <img src="/logo.png" alt="Baked By Archana signature cake" className="hero-cake-img" />
              <div className="hero-cake-glow" />
            </div>
            <div className="hero-float-badge hero-float-badge--1">
              <Star size={14} fill="#d4a843" stroke="#d4a843" />
              <span>Premium Quality</span>
            </div>
            <div className="hero-float-badge hero-float-badge--2">
              <span>🎂</span>
              <span>Fresh Daily</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      {/* 
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <span className="stat-card__icon">{stat.icon}</span>
                <span className="stat-card__value">{stat.value}</span>
                <span className="stat-card__label">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* ========== SPECIALTIES ========== */}
      <section className="section specialties-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-subtitle">What we offer</span>
          <h2 className="section-title">Our Specialties</h2>
          <p className="section-desc">
            From intimate birthday celebrations to grand weddings, we craft cakes that become the centrepiece of your memories.
          </p>
          <div className="specialties-grid">
            {SPECIALTIES.map((s, i) => (
              <motion.div
                key={s.title}
                className="specialty-card card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <span className="specialty-card__emoji">{s.emoji}</span>
                <h3 className="specialty-card__title">{s.title}</h3>
                <p className="specialty-card__desc">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED CREATIONS ========== */}
      <section className="section featured-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-subtitle">From Our Oven</span>
          <h2 className="section-title">Featured Creations</h2>
          <p className="section-desc">
            Explore our most loved handcrafted cakes, made fresh daily with premium ingredients.
          </p>


          {loadingCakes ? (
            <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>Loading our finest creations...</p>
          ) : cakeError ? (
            <p style={{ marginTop: '2rem', color: 'red' }}>{cakeError}</p>
          ) : filteredCakes.length === 0 ? (
            <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>No creations found for this category.</p>
          ) : (
            <motion.div layout className="featured-grid">
              <AnimatePresence mode="popLayout">
                {filteredCakes.map((cake, i) => (
                  <motion.div
                    key={cake._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%' }}
                  >
                    <CakeCard cake={cake} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          <div style={{ marginTop: '3rem' }}>
            <Link to="/menu" className="btn-secondary">
              View Full Menu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== CHEF / ABOUT ========== */}
      <section className="chef-section section">
        <div className="container chef-container">
          <motion.div
            className="chef-img-wrap"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="chef-img-frame">
              <img src="/logo.png" alt="Archana Karmakar" className="chef-img" />
            </div>
            <div className="chef-badge">
              <Award size={16} />
              <span>Master Baker</span>
            </div>
          </motion.div>
          <motion.div
            className="chef-content"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <span className="section-subtitle">Meet your baker</span>
            <h2 className="section-title" style={{ textAlign: 'left' }}>Archana Karmakar</h2>
            <p style={{ marginBottom: '1rem' }}>
              With over 8 years of baking experience, Archana has mastered the art of turning simple ingredients into edible works of art. Her passion for perfection and flair for creativity make every cake a one-of-a-kind masterpiece.
            </p>
            <p style={{ marginBottom: '1.75rem' }}>
              Trained in classical French pâtisserie and inspired by the vibrant flavours of Bengal, Archana brings a unique east-meets-west philosophy to every creation.
            </p>
            <Link to="/menu" className="btn-primary" id="chef-see-menu">
              See the Menu <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="section testimonials-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-subtitle">What people say</span>
          <h2 className="section-title">Customer Love</h2>

          {loadingReviews ? (
            <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>No reviews yet. Be the first to leave one!</p>
          ) : (
            <div className="testimonials-scroll-wrapper">
              <div className="testimonials-scroll-container">
                <div className="testimonials-grid">
                  {reviews.map((t, i) => (
                    <motion.div
                      key={t._id || t.name}
                      className="testimonial-card card"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                      <div className="testimonial-stars">
                        {[...Array(t.rating || 5)].map((_, j) => (
                          <Star key={j} size={14} fill="#d4a843" stroke="#d4a843" />
                        ))}
                      </div>
                      <p className="testimonial-text">"{t.text}"</p>
                      <div className="testimonial-author">
                        <div className="testimonial-avatar">
                          {(t.username || t.name || 'U')[0]}
                        </div>
                        <span className="testimonial-name">{t.username || t.name}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="testimonials-scroll-mask-bottom" />
            </div>
          )}

          <div style={{ marginTop: '4rem' }}>
            <ReviewForm onReviewAdded={handleReviewAdded} />
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2 className="cta-banner__title">Ready to order your dream cake?</h2>
            <p className="cta-banner__desc">Contact us today to discuss your custom cake or browse our collection.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/menu" className="btn-primary" id="cta-menu-link">
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }} id="cta-contact-link">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
