import mongoose from "mongoose";
import {env} from "./env.js";

let connectionPromise;

export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(env.MONGODB_URI)
            .then(() => {
                console.log("✅ Connected to MongoDB");
                return mongoose.connection;
            })
            .catch((error) => {
                connectionPromise = undefined;
                console.error("❌ Error connecting to MongoDB:", error.message);
                throw error;
            });
    }

    return connectionPromise;
}