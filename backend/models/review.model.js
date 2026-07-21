import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        cakeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cake", required: false, default: null },
        username: { type: String, required: true },
        text: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 }
    },
    { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
