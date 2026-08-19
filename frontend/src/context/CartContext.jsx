import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Sync cart state with logged-in user (MongoDB)
  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        try {
          const res = await fetch('/api/cart', { credentials: 'include' });
          const data = await res.json();
          if (res.ok) {
            // Remap items if needed or just set
            setItems(data.cart || []);
          }
        } catch (e) {
          console.error('Failed to fetch cart from DB', e);
          setItems([]);
        }
      };
      fetchCart();
    } else {
      // User is logged out: Fall back to guest localStorage
      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }
  }, [user]);

  // Save guest cart state whenever items change (if logged out)
  useEffect(() => {
    if (!user) {
      if (items.length > 0) {
        localStorage.setItem('guest_cart', JSON.stringify(items));
      } else {
        localStorage.removeItem('guest_cart');
      }
    }
  }, [items, user]);

  // Helper to sync to DB for logged in users
  const syncCartToBackend = async (cartItems) => {
    if (!user) return;
    try {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cartItems })
      });
    } catch (e) {
      console.error('Failed to sync cart to backend', e);
    }
  };

  const addItem = useCallback((cake) => {
    setItems((prev) => {
      let newItems;
      const existing = prev.find((i) => i._id === cake._id || (i.cakeId && i.cakeId === cake._id));
      if (existing) {
        newItems = prev.map((i) =>
          (i._id === cake._id || i.cakeId === cake._id) ? { ...i, qty: i.qty + 1, quantity: i.qty + 1 } : i
        );
      } else {
        // Map cake properties to match schema, but keep _id for frontend compatibility
        newItems = [...prev, { ...cake, cakeId: cake._id, qty: 1, quantity: 1 }];
      }
      
      syncCartToBackend(newItems);
      return newItems;
    });
    setIsOpen(true);
  }, [user]); // Re-create when user changes so syncCartToBackend has fresh user

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i._id !== id && i.cakeId !== id);
      syncCartToBackend(newItems);
      return newItems;
    });
  }, [user]);

  const updateQty = useCallback((id, qty) => {
    setItems((prev) => {
      let newItems;
      if (qty <= 0) {
        newItems = prev.filter((i) => i._id !== id && i.cakeId !== id);
      } else {
        newItems = prev.map((i) => ((i._id === id || i.cakeId === id) ? { ...i, qty, quantity: qty } : i));
      }
      syncCartToBackend(newItems);
      return newItems;
    });
  }, [user]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      try {
        await fetch('/api/cart/clear', {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (e) {
        console.error('Failed to clear cart in backend', e);
      }
    }
  }, [user]);

  const placeOrder = async (deliveryAddress) => {
    if (!user) {
      navigate('/auth');
      throw new Error('You must be logged in to place an order.');
    }

    try {
      const orderItems = items.map(item => ({
        cakeId: item.cakeId || item._id,
        name: item.name,
        quantity: item.qty || item.quantity,
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
      
      await clearCart();
      return data;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * (i.qty || i.quantity || 1), 0);
  const count = items.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0);

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
