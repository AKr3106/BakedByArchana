import "dotenv/config";
// Fix for MongoDB Atlas DNS resolution issues (ECONNREFUSED)
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]); 

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Added cookie-parser support
import connectDB from "./db/db.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import categoryRoutes, { seedCategories } from "./routes/category.routes.js"; // Added category routes
import cartRoutes from "./routes/cart.routes.js";

// Environment variables are loaded at the very top via "dotenv/config"

// Initialize the Express app
const app = express();

// Required Middlewares
app.use(express.json());
app.use(cookieParser()); // Parsed cookies middleware active
app.use(cors());

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/files", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes); // Categories endpoint active
app.use("/api/cart", cartRoutes);

// Specify the PORT
const PORT = process.env.PORT || 3000;

// Connect to Database and start server
connectDB().then(async () => {
    await seedCategories(); // Seed categories on launch if missing
    
    // Only start the server locally. Vercel will use the exported app instead.
    if (process.env.NODE_ENV !== "production") {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
});

// Export app for serverless execution on Vercel
export default app;