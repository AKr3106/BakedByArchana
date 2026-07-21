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
        }
    },
    { 
        timestamps: true 
    }
);

const User = mongoose.model("User", userSchema);

export default User;
