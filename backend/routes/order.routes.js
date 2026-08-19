import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";
import Order from "../models/order.model.js";
import { sendAdminOrderNotification } from "../utils/emailService.js";
import { sendWhatsAppOrderConfirmation } from "../utils/whatsappService.js";

const router = express.Router();
router.use(verifyToken);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/orders/create-payment-intent
// Creates a Razorpay order and returns order_id for the frontend SDK
// ──────────────────────────────────────────────────────────────────────────────
router.post("/create-payment-intent", async (req, res) => {
    try {
        const { items, amount } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "No items in cart." });
        }

        const numericAmount = Number(amount);
        if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid order amount' });
        }

        const amountInPaise = Math.round(numericAmount * 100); // Razorpay expects paise

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        res.status(200).json({ orderId: razorpayOrder.id, amount: amountInPaise, currency: "INR" });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Failed to create payment intent.", error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/orders/verify-payment
// Verifies Razorpay signature, saves order with paymentStatus: 'Paid'
// ──────────────────────────────────────────────────────────────────────────────
router.post("/verify-payment", async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, items, shippingAddress } = req.body;

        // HMAC SHA256 signature verification
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
        }

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const newOrder = new Order({
            userId: req.user.id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: "Online",
            paymentStatus: "Paid",
            orderStatus: "Processing",
            paymentDetails: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
        });

        await newOrder.save();

        // Asynchronously trigger email and WhatsApp notifications in the background
        Promise.allSettled([
            sendAdminOrderNotification(newOrder).catch(err => console.error("Admin email notification failed:", err)),
            sendWhatsAppOrderConfirmation(newOrder.shippingAddress.phone, newOrder).catch(err => console.error("WhatsApp notification failed:", err))
        ]);

        res.status(201).json({ message: "Order confirmed!", data: newOrder });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Failed to verify payment.", error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/orders/create-cod
// Creates a Cash on Delivery order with paymentStatus: 'Pending'
// ──────────────────────────────────────────────────────────────────────────────
router.post("/create-cod", async (req, res) => {
    try {
        const { items, shippingAddress } = req.body;
        if (!items || items.length === 0 || !shippingAddress) {
            return res.status(400).json({ message: "Items and shipping address are required." });
        }

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const newOrder = new Order({
            userId: req.user.id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: "COD",
            paymentStatus: "Pending",
            orderStatus: "Processing",
        });

        await newOrder.save();

        // Asynchronously trigger email and WhatsApp notifications in the background
        Promise.allSettled([
            sendAdminOrderNotification(newOrder).catch(err => console.error("Admin email notification failed:", err)),
            sendWhatsAppOrderConfirmation(newOrder.shippingAddress.phone, newOrder).catch(err => console.error("WhatsApp notification failed:", err))
        ]);

        res.status(201).json({ message: "Order placed successfully (Cash on Delivery)!", data: newOrder });
    } catch (error) {
        console.error("Error creating COD order:", error);
        res.status(500).json({ message: "Failed to place order.", error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my-history
// Fetches all orders for the authenticated user, newest first
// ──────────────────────────────────────────────────────────────────────────────
router.get("/my-history", async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ message: "Order history retrieved.", data: orders });
    } catch (error) {
        console.error("Error retrieving order history:", error);
        res.status(500).json({ message: "Failed to retrieve order history.", error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/orders/request-cancel/:orderId
// User requests cancellation of an active order
// ──────────────────────────────────────────────────────────────────────────────
router.post("/request-cancel/:orderId", async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id });
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
            return res.status(400).json({ message: `Cannot cancel a ${order.orderStatus.toLowerCase()} order.` });
        }

        order.cancellationRequest = {
            requested: true,
            reason: req.body.reason || '',
            requestedAt: new Date(),
            status: 'Pending'
        };

        await order.save();
        res.status(200).json({ message: "Cancellation request submitted.", data: order });
    } catch (error) {
        console.error("Error requesting cancellation:", error);
        res.status(500).json({ message: "Failed to request cancellation.", error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/orders/admin/cancellations
// Fetch all pending cancellation requests for Admins
// ──────────────────────────────────────────────────────────────────────────────
router.get("/admin/cancellations", authorizeRoles("admin"), async (req, res) => {
    try {
        const cancellations = await Order.find({ "cancellationRequest.status": "Pending" })
            .populate("userId", "username email phonenumber")
            .sort({ "cancellationRequest.requestedAt": -1 });
            
        res.status(200).json({ message: "Cancellation requests retrieved.", data: cancellations });
    } catch (error) {
        console.error("Error fetching cancellations:", error);
        res.status(500).json({ message: "Failed to fetch cancellations.", error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/admin/handle-cancellation/:orderId
// Admin approves or rejects a cancellation request
// ──────────────────────────────────────────────────────────────────────────────
router.put("/admin/handle-cancellation/:orderId", authorizeRoles("admin"), async (req, res) => {
    try {
        const { action } = req.body; // 'approve' | 'reject'
        const order = await Order.findById(req.params.orderId);
        
        if (!order) return res.status(404).json({ message: "Order not found." });
        if (order.cancellationRequest.status !== 'Pending') {
            return res.status(400).json({ message: "No pending cancellation request for this order." });
        }

        if (action === 'approve') {
            order.orderStatus = 'Cancelled';
            order.cancellationRequest.status = 'Approved';
        } else if (action === 'reject') {
            order.cancellationRequest.status = 'Rejected';
        } else {
            return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'." });
        }

        await order.save();
        res.status(200).json({ message: `Cancellation request ${action}d.`, data: order });
    } catch (error) {
        console.error("Error handling cancellation:", error);
        res.status(500).json({ message: "Failed to handle cancellation.", error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/orders/admin/all
// Fetch ALL orders for Admins
// ──────────────────────────────────────────────────────────────────────────────
router.get("/admin/all", authorizeRoles("admin"), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("userId", "username email phonenumber")
            .sort({ createdAt: -1 });
            
        res.status(200).json({ message: "All orders retrieved.", data: orders });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ message: "Failed to fetch orders.", error: error.message });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/admin/status/:orderId
// Admin updates an order's status
// ──────────────────────────────────────────────────────────────────────────────
router.put("/admin/status/:orderId", authorizeRoles("admin"), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Processing', 'Baking', 'Out for Delivery', 'Delivered', 'Cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { orderStatus: status },
            { new: true }
        ).populate("userId", "username email phonenumber");
        
        if (!order) return res.status(404).json({ message: "Order not found." });

        res.status(200).json({ message: "Order status updated.", data: order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update status.", error: error.message });
    }
});

export default router;
