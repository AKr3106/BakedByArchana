import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, PartyPopper, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccessModal.css';

export default function OrderSuccessModal({ order, onClose }) {
  const navigate = useNavigate();
  const confettiRef = useRef(null);

  // Spawn CSS confetti particles on mount
  useEffect(() => {
    const container = confettiRef.current;
    if (!container) return;
    const colors = ['#e8748a', '#f5c2cc', '#f9a825', '#d4a843', '#a8d5a2', '#81c3f8'];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = `${Math.random() * 100}%`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = `${Math.random() * 0.8}s`;
      el.style.animationDuration = `${0.8 + Math.random() * 1}s`;
      el.style.width = `${6 + Math.random() * 6}px`;
      el.style.height = `${6 + Math.random() * 6}px`;
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(el);
    }
    return () => { if (container) container.innerHTML = ''; };
  }, []);

  const formatOrderId = (id) => id ? `#${id.slice(-8).toUpperCase()}` : '#—';
  const formatDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <motion.div
      className="success-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="success-modal"
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260, delay: 0.05 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Confetti container */}
        <div ref={confettiRef} className="confetti-container" aria-hidden="true" />

        {/* Checkmark */}
        <motion.div
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.15 }}
        >
          <CheckCircle size={52} strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="success-content"
        >
          <div className="success-badge">
            <PartyPopper size={14} />
            Order Confirmed!
          </div>

          <h2 className="success-title">Your cake is on its way! 🎂</h2>
          <p className="success-desc">
            Thank you for your order. Archana will personally bake it with love and care.
          </p>

          <div className="success-details">
            <div className="success-detail-row">
              <span>Order ID</span>
              <strong>{formatOrderId(order?._id)}</strong>
            </div>
            <div className="success-detail-row">
              <span>Estimated Delivery</span>
              <strong>{formatDate()}</strong>
            </div>
            <div className="success-detail-row">
              <span>Payment</span>
              <strong style={{ color: 'var(--accent)' }}>
                {order?.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '✅ Paid Online'}
              </strong>
            </div>
          </div>

          <div className="success-actions">
            <button
              className="btn-primary"
              onClick={() => { onClose(); navigate('/profile'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              id="view-order-history"
            >
              View Order History <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={onClose} id="continue-shopping-success">
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
