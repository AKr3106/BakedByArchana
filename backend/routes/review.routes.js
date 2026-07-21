import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import Review from "../models/review.model.js";

const router = express.Router();

// @route   GET /api/reviews/
// @desc    Get latest 6 verified global testimonials
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find({ cakeId: null }).sort({ createdAt: -1 });
        res.status(200).json({ message: "Global reviews retrieved successfully", data: reviews });
    } catch (error) {
        console.error("Error retrieving global reviews:", error);
        res.status(500).json({ message: "Failed to retrieve global reviews", error: error.message });
    }
});

// @route   GET /api/reviews/cake/:cakeId
// @desc    Get all reviews for a specific cake
router.get("/cake/:cakeId", async (req, res) => {
    try {
        const reviews = await Review.find({ cakeId: req.params.cakeId }).sort({ createdAt: -1 });
        res.status(200).json({ message: "Cake reviews retrieved successfully", data: reviews });
    } catch (error) {
        console.error("Error retrieving cake reviews:", error);
        res.status(500).json({ message: "Failed to retrieve cake reviews", error: error.message });
    }
});

// @route   POST /api/reviews/add
// @desc    Add a new customer review
router.post("/add", verifyToken, async (req, res) => {
    try {
        const { text, rating, cakeId } = req.body;

        if (!text || !rating) {
            return res.status(400).json({ message: "Review text and rating are required." });
        }

        const newReview = new Review({
            userId: req.user.id,
            cakeId: cakeId || null,
            username: req.user.username || "Customer",
            text,
            rating: Number(rating)
        });

        await newReview.save();
        res.status(201).json({ message: "Review added successfully", data: newReview });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Failed to add review", error: error.message });
    }
});

export default router;
