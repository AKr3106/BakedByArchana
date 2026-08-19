import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Sync cart state with logged-in user
  useEffect(() => {
    if (user) {
      // User is logged in: Load their specific cart
      const key = `cart_${user._id || user.email}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse cart JSON', e);
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } else {
      // User is logged out: Instantly reset cart state to empty
      setItems([]);
    }
  }, [user]);

  // Save cart state whenever items change (if logged in)
  useEffect(() => {
    if (user) {
      const key = `cart_${user._id || user.email}`;
      if (items.length > 0) {
        localStorage.setItem(key, JSON.stringify(items));
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [items, user]);

  const addItem = useCallback((cake) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === cake._id);
      if (existing) {
        return prev.map((i) =>
          i._id === cake._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...cake, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i._id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, qty } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const placeOrder = async (deliveryAddress) => {
    if (!user) {
      navigate('/auth');
      throw new Error('You must be logged in to place an order.');
    }

    try {
      const orderItems = items.map(item => ({
        cakeId: item._id,
        name: item.name,
        quantity: item.qty,
        price: item.price
      }));

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: orderItems, deliveryAddress })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');
      
      clearCart();
      return data;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, total, count, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart, placeOrder }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
