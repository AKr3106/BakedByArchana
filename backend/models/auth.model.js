import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please provide a username"],
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
        },
        phonenumber:{
            type: String,
            required: [true, "Please provide a phone number"],
            trim: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        cart: [
            {
                cakeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cake' },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                imageUrl: { type: String },
                quantity: { type: Number, default: 1 }
            }
        ]
    },
    { 
        timestamps: true 
    }
);

const User = mongoose.model("User", userSchema);

export default User;
