import express from "express";
import multer from "multer";
import imagekit from "../services/storage.service.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";
import Cake from "../models/cake.model.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/files/upload
router.post("/upload", verifyToken, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }
        const { name, price, description, category } = req.body;
        if (!name || !price || !description || !category) {
            return res.status(400).json({ message: "Please provide all required cake details" });
        }

        const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: "/BakedByArchana"
        });

        const newCake = new Cake({
            name,
            price: Number(price),
            description,
            category,
            imageKitId: uploadResponse.fileId,
            imageUrl: uploadResponse.url
        });
        await newCake.save();

        res.status(201).json({
            message: "Cake uploaded and saved successfully",
            data: newCake
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Failed to upload file", error: error.message });
    }
});

// @route   GET /api/files/all
router.get("/all", async (req, res) => {
    try {
        const cakes = await Cake.find({ isAvailable: true }).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Cakes retrieved successfully",
            data: cakes
        });
    } catch (error) {
        console.error("Error retrieving cakes:", error);
        res.status(500).json({ message: "Failed to retrieve cakes", error: error.message });
    }
});

router.get("/view/:fileId", verifyToken, authorizeRoles("admin", "user"), async (req, res) => {
    try {
        const fileDetails = await imagekit.getFileDetails(req.params.fileId);
        res.status(200).json({ data: fileDetails });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve file details", error: error.message });
    }
});

// @route   PUT /api/files/edit/:cakeId
router.put("/edit/:cakeId", verifyToken, authorizeRoles("admin"), upload.single("image"), async (req, res) => {
    try {
        const cake = await Cake.findById(req.params.cakeId);
        if (!cake) {
            return res.status(404).json({ message: "Cake not found." });
        }

        // If a new image was uploaded, push it to ImageKit and replace the stored URL
        if (req.file) {
            const uploadResponse = await imagekit.upload({
                file: req.file.buffer,
                fileName: req.file.originalname,
                folder: "/BakedByArchana"
            });
            cake.imageKitId = uploadResponse.fileId;
            cake.imageUrl = uploadResponse.url;
        }

        // Update text fields if provided
        const { name, price, description, category } = req.body;
        if (name)        cake.name        = name;
        if (price)       cake.price       = Number(price);
        if (description) cake.description = description;
        if (category)    cake.category    = category;

        await cake.save();

        res.status(200).json({
            message: "Cake updated successfully.",
            data: cake
        });
    } catch (error) {
        console.error("Error editing cake:", error);
        res.status(500).json({ message: "Failed to update cake.", error: error.message });
    }
});

export default router;
