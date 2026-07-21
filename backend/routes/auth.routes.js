import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, phonenumber, role } = req.body;

        // Validation
        if (!username || !email || !password || !phonenumber) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Check if user exists (by email or username)
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const message = existingUser.email === email 
                ? "User already exists with this email" 
                : "User already exists with this username";
            return res.status(400).json({ message });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create user
        const newUser = new User({
            username,
            email,
            phonenumber,
            password: hashedPassword,
            role: role || 'user'
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// @route   POST /api/auth/login
// @desc    Login user and get token
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create JWT Payload
        const payload = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        // Sign token
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET || "fallback_secret_key", 
            { expiresIn: "1d" }
        );

        // Exclude password from the returned user object
        const userResponse = user.toObject();
        delete userResponse.password;

        // Set token in HTTP-only cookie securely as requested
        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        });

        res.status(200).json({
            message: "Logged in successfully",
            user: userResponse
        });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

// @route   DELETE /api/auth/delete
// @desc    Delete user account
router.delete("/delete", verifyToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        
        res.clearCookie("token");
        
        res.status(200).json({ message: "Account successfully deleted" });
    } catch (error) {
        console.error("Error in delete account:", error);
        res.status(500).json({ message: "Server error during account deletion" });
    }
});

export default router;
