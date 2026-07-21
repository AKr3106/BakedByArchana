import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    cakeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cake", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageUrl: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: [orderItemSchema],
        totalAmount: { type: Number, required: true },

        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
        },

        paymentMethod: {
            type: String,
            enum: ['Online', 'COD'],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending'
        },
        orderStatus: {
            type: String,
            enum: ['Processing', 'Baking', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Processing'
        },
        paymentDetails: {
            razorpayOrderId: { type: String },
            razorpayPaymentId: { type: String },
            razorpaySignature: { type: String }
        },
        cancellationRequest: {
            requested: { type: Boolean, default: false },
            reason: { type: String, default: '' },
            requestedAt: { type: Date },
            status: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' }
        }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
