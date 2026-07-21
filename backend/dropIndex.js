import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]); 
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        // Attempt to drop the old unique index on phonenumber
        await mongoose.connection.collection('users').dropIndex('phonenumber_1');
        console.log("Successfully dropped the unique index on phonenumber!");
    } catch (e) {
        console.log("Note: " + e.message);
    }
    process.exit(0);
});
