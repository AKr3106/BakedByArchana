import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Loader, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ReviewForm.css';

export default function ReviewForm({ onReviewAdded, cakeId }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <motion.div 
        className="review-form-auth-card card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3>Sign in to leave a review</h3>
        <p>Please log in to share your experience with the community!</p>
        <Link to="/auth" className="btn-primary" style={{ display: 'inline-flex', margin: '0 auto' }}>
          Log In / Sign Up
        </Link>
      </motion.div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Client-Side Authentication Interceptor
    if (!user) {
      setError('Your session has expired. Please log in to submit a review.');
      return;
    }

    // 2. Form Validation
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (text.trim().length < 10) {
      setError('Review must be at least 10 characters long.');
      return;
    }

    setSubmitting(true);
    setError('');

    // 3. Authenticated Network Request
    try {
      const res = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        // CRITICAL: Tells the browser to attach the JWT session cookies
        credentials: 'include',
        body: JSON.stringify({ rating, text, cakeId: cakeId || undefined })
      });

      const data = await res.json();
      
      // 4. Server-Side Error Handling
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review. Please try again.');
      }

      // 5. Success Reset & UI Sync
      setRating(0);
      setText('');
      
      // Trigger the parent component to instantly append the new review to the active grid
      if (onReviewAdded) {
        onReviewAdded(data.data);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="review-form-container card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="review-form-title">Write a Review</h3>
      <p className="review-form-subtitle">Posting publicly as <strong>{user.username}</strong></p>
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="review-rating-selector">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              type="button"
              key={star}
              className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              whileTap={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Star 
                size={28} 
                fill={star <= (hoverRating || rating) ? "#d4a843" : "transparent"} 
                stroke={star <= (hoverRating || rating) ? "#d4a843" : "var(--text-muted)"} 
                strokeWidth={1.5}
              />
            </motion.button>
          ))}
        </div>

        <div className="review-input-group">
          <textarea
            className="input-field review-textarea"
            placeholder="Tell us what you loved about your order..."
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
          />
          <div className="review-char-count">
            {text.length}/300
          </div>
        </div>

        {error && <p className="review-error-text">{error}</p>}

        <button 
          type="submit" 
          className="btn-primary review-submit-btn"
          disabled={submitting}
        >
          {submitting ? (
            <><Loader size={18} className="spin-icon" /> Submitting...</>
          ) : (
            <><Send size={18} /> Submit Review</>
          )}
        </button>
      </form>
    </motion.div>
  );
}
