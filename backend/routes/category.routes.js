import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import Category from "../models/category.model.js";

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories, sorted alphabetically
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({ data: categories });
    } catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ message: "Failed to retrieve categories", error: error.message });
    }
});

// @route   POST /api/categories/add
// @desc    Add a new category string (Protected)
router.post("/add", verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Category name is required." });
        }

        const trimmedName = name.trim();
        
        // Check if exists (case insensitive)
        const existing = await Category.findOne({ name: { $regex: new RegExp('^' + trimmedName + '$', 'i') } });
        if (existing) {
            return res.status(400).json({ message: "Category already exists." });
        }

        const newCategory = new Category({ name: trimmedName });
        await newCategory.save();
        
        res.status(201).json({ message: "Category added successfully", data: newCategory });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Failed to add category", error: error.message });
    }
});

// Helper to seed defaults if empty (called during server startup)
export const seedCategories = async () => {
    try {
        const count = await Category.countDocuments();
        if (count === 0) {
            const defaults = [
                { name: 'Classic' },
                { name: 'Chocolate' },
                { name: 'Fruit' },
                { name: 'Premium' },
                { name: 'Wedding' },
                { name: 'Bestsellers' }
            ];
            await Category.insertMany(defaults);
            console.log("Database seeded with default categories.");
        }
    } catch (error) {
        console.error("Error seeding categories:", error);
    }
};

export default router;
