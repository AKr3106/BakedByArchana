import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';
import OrderSuccessModal from './OrderSuccessModal';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, total, updateQty, removeItem, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="cart-drawer__header">
              <div className="cart-drawer__title-wrap">
                <ShoppingBag size={20} />
                <h2 className="cart-drawer__title">Your Cart</h2>
                {items.length > 0 && (
                  <span className="badge">{items.reduce((s, i) => s + i.qty, 0)}</span>
                )}
              </div>
              <button
                className="cart-drawer__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close cart"
                id="close-cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="cart-drawer__body">
              {items.length === 0 ? (
                <div className="cart-drawer__empty">
                  <ShoppingBag size={56} strokeWidth={1} />
                  <p>Your cart is empty</p>
                  <button className="btn-primary" onClick={() => setIsOpen(false)} id="continue-shopping">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="cart-drawer__list">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.li
                        key={item._id || item.fileId}
                        className="cart-item"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <img
                          src={item.imageUrl || item.image || item.url || '/logo.png'}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover bg-amber-50 dark:bg-zinc-800 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/logo.png';
                          }}
                        />
                        <div className="cart-item__info">
                          <p className="cart-item__name">{item.name}</p>
                          <p className="cart-item__unit">₹{item.price?.toLocaleString('en-IN') || '1,299'}</p>
                          <div className="cart-item__qty">
                            <button
                              className="cart-item__qty-btn"
                              onClick={() => updateQty(item._id || item.fileId, item.qty - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span>{item.qty}</span>
                            <button
                              className="cart-item__qty-btn"
                              onClick={() => updateQty(item._id || item.fileId, item.qty + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="cart-item__right">
                          <p className="cart-item__subtotal">
                            ₹{((item.price || 1299) * item.qty).toLocaleString('en-IN')}
                          </p>
                          <button
                            className="cart-item__remove"
                            onClick={() => removeItem(item._id || item.fileId)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-drawer__totals">
                  <span>Subtotal</span>
                  <span className="cart-drawer__total-price">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="cart-drawer__shipping-note">
                  Shipping & delivery charges calculated at checkout.
                </p>
                <button
                  className="btn-primary cart-drawer__checkout"
                  id="proceed-to-order"
                  onClick={() => { setIsOpen(false); setShowCheckout(true); }}
                >
                  Proceed to Order
                </button>
                <button
                  className="cart-drawer__clear"
                  onClick={clearCart}
                  id="clear-cart"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            onClose={() => setShowCheckout(false)}
            onSuccess={(order) => {
              setShowCheckout(false);
              setSuccessOrder(order);
            }}
          />
        )}
      </AnimatePresence>

      {/* Order Success Modal */}
      <AnimatePresence>
        {successOrder && (
          <OrderSuccessModal
            order={successOrder}
            onClose={() => setSuccessOrder(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
