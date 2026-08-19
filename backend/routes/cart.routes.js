import express from 'express';
import User from '../models/auth.model.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/cart
// @desc    Get the authenticated user's cart
// @access  Private
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ cart: user.cart || [] });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error fetching cart' });
    }
});

// @route   POST /api/cart/sync
// @desc    Sync the cart items for the authenticated user
// @access  Private
router.post('/sync', verifyToken, async (req, res) => {
    try {
        const { cartItems } = req.body;
        
        if (!Array.isArray(cartItems)) {
            return res.status(400).json({ message: 'Cart items must be an array' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = cartItems;
        await user.save();

        res.status(200).json({ message: 'Cart synced successfully', cart: user.cart });
    } catch (error) {
        console.error('Error syncing cart:', error);
        res.status(500).json({ message: 'Server error syncing cart' });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear the authenticated user's cart
// @access  Private
router.delete('/clear', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = [];
        await user.save();

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Server error clearing cart' });
    }
});

export default router;
