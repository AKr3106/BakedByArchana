import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, X, Pencil } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import ReviewForm from './ReviewForm';
import EditCakeModal from './EditCakeModal';
import './CakeCard.css';

export default function CakeCard({ cake, index = 0, onCakeUpdated }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const isAdmin = user?.role === 'admin';
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cakeReviews, setCakeReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [categoriesList, setCategoriesList] = useState([cake.category || '']);

  useEffect(() => {
    if (showModal && cake._id) {
      setLoadingReviews(true);
      fetch(`/api/reviews/cake/${cake._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) setCakeReviews(data.data);
        })
        .catch(console.error)
        .finally(() => setLoadingReviews(false));
    }
  }, [showModal, cake._id]);

  // Fetch categories once for the edit modal dropdown
  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.data) setCategoriesList(d.data.map(c => c.name));
      })
      .catch(() => {});
  }, [isAdmin]);

  const handleReviewAdded = (newReview) => {
    setCakeReviews(prev => [newReview, ...prev]);
  };

  const description = cake.description || 'A delightful handcrafted creation by Archana Karmakar.';

  return (
    <>
      <motion.div
        className="cake-card card"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.07, duration: 0.45, ease: 'easeOut' }}
        whileHover={{ y: -6 }}
      >
        {/* Image */}
        <div className="cake-card__img-wrap" onClick={() => setShowModal(true)}>
          <img
            src={cake.imageUrl || cake.url || '/logo.png'}
            alt={cake.name}
            className="cake-card__img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/logo.png';
            }}
          />
          {cake.badge && (
            <span className="cake-card__badge">{cake.badge}</span>
          )}
          {/* Admin edit trigger */}
          {isAdmin && (
            <button
              className="cake-card__edit-btn"
              onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}
              aria-label={`Edit ${cake.name}`}
              id={`edit-cake-${cake._id}`}
            >
              <Pencil size={13} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="cake-card__body">
          <div className="cake-card__rating">
            {/* {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < (cake.rating || 5) ? '#d4a843' : 'none'}
                stroke={i < (cake.rating || 5) ? '#d4a843' : '#d4b896'}
              />
            ))} */}
            
          </div>

          <h3 className="cake-card__name">{cake.name}</h3>

          {/* Description with line-clamp + Read More toggle */}
          <div className="cake-card__desc-wrap">
            <p className={`cake-card__desc ${isExpanded ? 'cake-card__desc--expanded' : ''}`}>
              {description}
            </p>
            {description.length > 100 && (
              <button
                className="cake-card__read-more"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(v => !v); }}
              >
                {isExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* Footer: price on top, full-width button below — always stacked */}
          <div className="cake-card__footer">
            <span className="cake-card__price">
              ₹{cake.price?.toLocaleString('en-IN') || '1,299'}
              <span className="cake-card__price-unit">/ lb</span>
            </span>
            <motion.button
              className="cake-card__add-btn"
              whileTap={{ scale: 0.96 }}
              onClick={() => requireAuth(() => addItem(cake))}
              id={`add-to-cart-${cake._id || cake.fileId}`}
              aria-label={`Add ${cake.name} to cart`}
            >
              <ShoppingCart size={14} />
              Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="cake-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="cake-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card
            >
              <button
                className="cake-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <img
                src={cake.imageUrl || cake.url || '/logo.png'}
                alt={cake.name}
                className="cake-modal-img"
                onError={(e) => { e.currentTarget.src = '/logo.png'; }}
              />

              <div className="cake-modal-body">
                {cake.category && (
                  <span className="cake-modal-badge">{cake.category}</span>
                )}
                <h2 className="cake-modal-title">{cake.name}</h2>
                <p className="cake-modal-desc">{description}</p>

                <div className="cake-modal-footer">
                  <span className="cake-modal-price">
                    ₹{cake.price?.toLocaleString('en-IN') || '1,299'}
                    <span className="cake-card__price-unit">/ lb</span>
                  </span>
                  <motion.button
                    className="btn-primary"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => requireAuth(() => {
                      addItem(cake);
                      setShowModal(false);
                    })}
                    style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }}
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </motion.button>
                </div>

                {/* PRODUCT REVIEWS */}
                <div className="cake-modal-reviews" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1rem' }}>Product Reviews</h3>
                  {loadingReviews ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
                  ) : cakeReviews.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No reviews for this cake yet.</p>
                  ) : (
                    <div className="cake-reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {cakeReviews.map(r => (
                        <div key={r._id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} size={12} fill={j < r.rating ? "#d4a843" : "none"} stroke={j < r.rating ? "#d4a843" : "#d4b896"} />
                            ))}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>"{r.text}"</p>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>- {r.username}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '1.5rem' }}>
                    <ReviewForm cakeId={cake._id} onReviewAdded={handleReviewAdded} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Cake Modal — admin only */}
      {showEditModal && (
        <EditCakeModal
          cake={cake}
          categoriesList={categoriesList}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updatedCake) => {
            setShowEditModal(false);
            if (onCakeUpdated) onCakeUpdated(updatedCake);
          }}
        />
      )}
    </>
  );
}
