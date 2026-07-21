import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, MapPin, CreditCard, Banknote, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CheckoutModal.css';

const STEPS = ['Delivery Info', 'Payment', 'Summary'];

const INITIAL_ADDRESS = { fullName: '', phone: '', street: '', city: '', postalCode: '' };

export default function CheckoutModal({ onClose, onSuccess }) {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const orderItems = items.map(item => ({
    cakeId: item._id,
    name: item.name,
    price: item.price,
    quantity: item.qty,
    imageUrl: item.imageUrl || item.image || item.url || '',
  }));

  const handleAddressChange = (e) => {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isAddressValid = () =>
    address.fullName.trim() && address.phone.trim() && address.street.trim() &&
    address.city.trim() && address.postalCode.trim();

  // ── Online Payment via Razorpay ──
  const handleOnlinePayment = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Create payment intent on server
      const intentRes = await fetch('/api/orders/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: orderItems }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.message || 'Could not initiate payment.');

      // 2. Open Razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: intentData.amount,
        currency: intentData.currency,
        name: 'Baked By Archana',
        description: 'Custom Cake Order',
        image: '/logo.png',
        order_id: intentData.orderId,
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: '#e8748a' },
        handler: async (response) => {
          // 3. Verify signature on server
          const verifyRes = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: orderItems,
              shippingAddress: address,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.message || 'Payment verification failed.');

          clearCart();
          onSuccess(verifyData.data);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(`Payment failed: ${resp.error.description}`);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Cash on Delivery ──
  const handleCOD = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/create-cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: orderItems, shippingAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order.');
      clearCart();
      onSuccess(data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === 'Online') handleOnlinePayment();
    else handleCOD();
  };

  return (
    <motion.div
      className="checkout-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="checkout-modal"
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="checkout-modal__header">
          <h2 className="checkout-modal__title">Checkout</h2>
          <button className="checkout-modal__close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        {/* Step Indicator */}
        <div className="checkout-steps">
          {STEPS.map((label, i) => (
            <div key={label} className={`checkout-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <span className="checkout-step__dot">{i < step ? '✓' : i + 1}</span>
              <span className="checkout-step__label">{label}</span>
              {i < STEPS.length - 1 && <span className="checkout-step__line" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="checkout-modal__body">
          <AnimatePresence mode="wait">

            {/* ── STEP 0: Delivery Info ── */}
            {step === 0 && (
              <motion.div key="step-0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="checkout-form">
                <div className="checkout-form__icon"><MapPin size={22} /></div>
                <h3>Delivery Information</h3>

                <div className="checkout-form__row">
                  <div className="input-group">
                    <label htmlFor="co-fullName">Full Name</label>
                    <input id="co-fullName" name="fullName" className="input-field" placeholder="e.g., Priya Sharma" value={address.fullName} onChange={handleAddressChange} required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="co-phone">Phone Number</label>
                    <input id="co-phone" name="phone" type="tel" className="input-field" placeholder="+91 98765 43210" value={address.phone} onChange={handleAddressChange} required />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="co-street">Street Address</label>
                  <input id="co-street" name="street" className="input-field" placeholder="House No., Street, Area" value={address.street} onChange={handleAddressChange} required />
                </div>

                <div className="checkout-form__row">
                  <div className="input-group">
                    <label htmlFor="co-city">City</label>
                    <input id="co-city" name="city" className="input-field" placeholder="Kolkata" value={address.city} onChange={handleAddressChange} required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="co-postalCode">Pincode</label>
                    <input id="co-postalCode" name="postalCode" type="text" maxLength={6} className="input-field" placeholder="700 001" value={address.postalCode} onChange={handleAddressChange} required />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Payment ── */}
            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="checkout-payment">
                <div className="checkout-form__icon"><CreditCard size={22} /></div>
                <h3>Select Payment Method</h3>

                <div className="payment-options">
                  <button
                    className={`payment-option ${paymentMethod === 'Online' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('Online')}
                    id="payment-online"
                  >
                    <CreditCard size={24} />
                    <div>
                      <strong>Online Payment</strong>
                      <span>UPI, Cards, Net Banking via Razorpay</span>
                    </div>
                    <span className="payment-option__check" />
                  </button>

                  <button
                    className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                    id="payment-cod"
                  >
                    <Banknote size={24} />
                    <div>
                      <strong>Cash on Delivery</strong>
                      <span>Pay when your order arrives</span>
                    </div>
                    <span className="payment-option__check" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Summary ── */}
            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="checkout-summary">
                <div className="checkout-form__icon"><ShoppingBag size={22} /></div>
                <h3>Order Summary</h3>

                <ul className="checkout-summary__items">
                  {items.map(item => (
                    <li key={item._id} className="checkout-summary__item">
                      <img src={item.imageUrl || item.url || '/logo.png'} alt={item.name} onError={e => { e.target.src = '/logo.png'; }} />
                      <div>
                        <span className="checkout-summary__name">{item.name}</span>
                        <span className="checkout-summary__qty">× {item.qty}</span>
                      </div>
                      <span className="checkout-summary__price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </li>
                  ))}
                </ul>

                <div className="checkout-summary__address">
                  <MapPin size={14} />
                  <span>{address.fullName}, {address.street}, {address.city} – {address.postalCode}</span>
                </div>

                <div className="checkout-summary__totals">
                  <div><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                  <div><span>Delivery</span><span className="checkout-summary__free">Free</span></div>
                  <div className="checkout-summary__grand"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                </div>

                <div className="checkout-summary__method">
                  {paymentMethod === 'Online' ? <CreditCard size={14} /> : <Banknote size={14} />}
                  <span>{paymentMethod === 'Online' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}</span>
                </div>

                {error && <p className="checkout-error">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="checkout-modal__footer">
          {step > 0 && (
            <button className="btn-secondary checkout-btn-back" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {step < 2 ? (
            <button
              className="btn-primary checkout-btn-next"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !isAddressValid()}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <motion.button
              className="btn-primary checkout-btn-next"
              onClick={handleSubmit}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : null}
              {loading ? 'Processing…' : paymentMethod === 'Online' ? 'Pay Now' : 'Place Order (COD)'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
