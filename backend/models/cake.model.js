import mongoose from "mongoose";

const cakeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            required: true
        },
        imageKitId: { type: String, required: true },
        imageUrl: { type: String, required: true },
        isAvailable: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model("Cake", cakeSchema);
